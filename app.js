var devMode = false;//or if Admin in code
var noCollision = false;

const baseTiles = require('./server_base_tiles.js');
const fs = require('fs');
var map = { 
  Map: require('./blank_map.json'),
  Fxn: require('./map_fxns.js')
};
//temporary to remove old mob sprites
for (i in map.Map){
  for (j in map.Map[i]){
    delete map.Map[i][j].mob;
  }
}
const { createMob } = require("./mobs");

require('dotenv').config();
const express = require('express');
const session = require('express-session');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//Session middleware FIRST (move this above all routes)
const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
});

app.use(sessionMiddleware);

const server = http.createServer(app);
const io = new Server(server);

app.use(express.urlencoded({ extended: true }));

const db = require('./db.js');
const querystring = require('querystring');

var players = {};
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.use('/game', (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/?error=403GET_OUT_OF_HERE');
  }
  next();
}, express.static(path.join(__dirname, 'game')));

app.post('/login', async (req, res) => {
  const { name, pass } = req.body;
  if (name.length>30 || pass.length>99){
    res.redirect('/?please_dont_do_that');
    return;
  }
  try {
    await queryPassword(name, pass);
    await setActive(name, 1);
    req.session.user = name;
    res.redirect('/game/game.html');
  } catch (err) {
    console.error("Login failed:", err.message);
    res.redirect('/?error=401incorrect_password');
  }
});

function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
}

async function queryPassword(name, pass) {
  if (name.length>30 || pass.length > 99) return;
  const sql = "SELECT * FROM players WHERE player_name = ?";
  const result = await query(sql, [name]);
  if (!result || result.length === 0) {
    console.log("New player!");
    await initPlayer(name);
    await addPlayer(name, pass);
    await setActive(name, 1);
    return { created: true };
  }
  const actual_pass = result[0].pass;
  if (!checkPassword(pass, actual_pass)) {
    console.log("Wrong password!");
    throw new Error("incorrect_password");
  }
  return { created: false };
}

function setActive(name, active) {//this really aint doin anything
  return query(
    "UPDATE players SET active = ? WHERE player_name = ?",
    [active, name]
  );
}

async function getPlayerXp(playerName, xpType) {
  if (!['hpXp', 'swordXp', 'craftXp', 'woodcuttingXp', 'miningXp'].includes(xpType)) {
    throw new Error(`Invalid xpType: ${xpType}`);
  }

  const rows = await query(
    `SELECT ${xpType} FROM players WHERE player_name = ?`,
    [playerName]
  );

  if (!rows.length) return 0;
  return rows[0][xpType] ?? 0;
}

async function addPlayerXp(playerName, xpType, amount) {
  if (amount <= 0) return;
  if (!['hpXp', 'swordXp', 'craftXp', 'woodcuttingXp', 'miningXp'].includes(xpType)) {
    throw new Error(`Invalid xpType: ${xpType}`);
  }

  await query(
    `
    UPDATE players
    SET ${xpType} = ${xpType} + ?
    WHERE player_name = ?
    `,
    [amount, playerName]
  );
}

async function initPlayer(name) {
  /*
  const sql = "SELECT JSON_ARRAY(x, y) AS coords FROM players WHERE player_name = ?";
  const params = [name];
  const result = await query(sql, params);
  */
  const sql = `
    SELECT
      JSON_ARRAY(x, y) AS coords,
      hp,
      swordXp,
      hpXp,
      woodcuttingXp,
      miningXp,
      craftXp
    FROM players
    WHERE player_name = ?
  `;
  const params = [name];
  const result = await query(sql, params);
  let p_coords;
  if (!result.length || !result[0].coords) {
    p_coords = [49, 49];//or default start point of game
  } else {
    p_coords = JSON.parse(result[0].coords);
  }
  console.log("Player coords:", p_coords);
  let currHp = result[0].hp;
  let hpXp = result[0].hpXp;
  let swordXp = result[0].swordXp;
  let craftXp = result[0].craftXp;
  let miningXp = result[0].miningXp;
  let woodcuttingXp=result[0].woodcuttingXp;
  let hpLvl = await levelFromXp(hpXp);
  let swordLvl = await levelFromXp(swordXp);
  let craftLvl = await levelFromXp(craftXp);
  let woodcuttingLvl = await levelFromXp(woodcuttingXp);
  let miningLvl = await levelFromXp(miningXp);

  console.log(`hp: ${currHp}`);
  players[name] = {// Initialize player object
    coords: p_coords,
    lastCoords: p_coords,//gets set in compartChunks
    sock_id: null, //to be set in io.connection
    sprite: "ghostR",
    facing: 'right',
    lastInput: Date.now(),
    lastMove: Date.now(),
    lastDir: "right",//not using yet
    step: 'stepR',
    typing: { state: false, lastSpot: { x: 0, y: 0 } },
    lastChunk: null,
    lastChunkSum: null,
    lastChunkKey: null,
    activeInventory: 0,
    inventory: [],//activeInventory used for position here
    hand: null,
    head: null,
    lastGather: Date.now(),
    hp:currHp,//change to null, get hp from db
    maxHp: 100+Math.floor(hpLvl*2),//300hp at lvl 100
    lastMelee: Date.now(),
    name: name,
    swordXpTotal: swordXp,
    hpXpTotal: hpXp,
    swordXp: 0,//these get written to the db every so often
    hpXp: 0,   //then set back to 0
    craftXpTotal: craftXp,
    woodcuttingXpTotal: woodcuttingXp,
    miningXpTotal: miningXp,
    swordLvl: swordLvl,
    hpLvl: hpLvl,
    craftLvl: craftLvl,
    woodcuttingLvl: woodcuttingLvl,
    miningLvl: miningLvl,
    lastState: null
  };
  let player = players[name];
  addPlayerToTile(name, p_coords[0], p_coords[1]);
  markTileChanged(p_coords[0], p_coords[1]);
  syncInventory(name);
}

async function cleanupPlayer(name){
  console.log("cleaning up disc'd player");
  delete map.Map[players[name].coords[1]][players[name].coords[0]].players[name];
  markTileChanged(players[name].coords[0], players[name].coords[1]);
  await dbPlayerCoords(name);
  delete players[name];
}

async function levelFromXp(xp) {
  return Math.floor(Math.sqrt(xp / 10)) + 1;
}

async function dbPlayerCoords(name) {
  const sql = `
    UPDATE players SET 
    x = ?, y = ?, 
    hp = ?,
    swordXp = ?,
    hpXp = ?,
    craftXp = ?,
    woodcuttingXp = ?,
    miningXp = ?
    WHERE player_name = ?`;
  const params = [
    players[name].coords[0], players[name].coords[1], 
    players[name].hp,
    players[name].swordXpTotal,
    players[name].hpXpTotal,
    players[name].craftXpTotal,
    players[name].woodcuttingXpTotal,
    players[name].miningXpTotal,
    name];
  await query(sql, params);
  await setTempXpToZero(name);
}

async function setTempXpToZero(name){//prob don't need this
  const player = players[name];
  player.swordXp=0;
  player.hpXp=0;
  player.craftXp=0;
  player.woodcuttingXp=0;
  player.miningXp=0;
}

async function getInventory(playerName) {
  const sql = `
    SELECT id, amount
    FROM inventories
    WHERE player_name = ?
  `;
  return await query(sql, [playerName]);
}

async function getItemAmount(playerName, itemId) {
  const sql = `
    SELECT amount
    FROM inventories
    WHERE player_name = ? AND id = ?
    LIMIT 1
  `;
  const rows = await query(sql, [playerName, itemId]);
  return rows.length ? rows[0].amount : 0;
}

const MAX_SLOTS = 32;

async function addItem(playerName, itemId, amount) {
  // 1. Check if item already exists
  const existing = await query(
    `
    SELECT amount
    FROM inventories
    WHERE player_name = ? AND id = ?
    `,
    [playerName, itemId]
  );

  // 2. If item exists, stack freely
  if (existing.length > 0) {
    await query(
      `
      UPDATE inventories
      SET amount = amount + ?
      WHERE player_name = ? AND id = ?
      `,
      [amount, playerName, itemId]
    );
    return amount;
  }

  // 3. Item is new → check slot count
  const slotsUsed = await getInventoryCount(playerName);

  if (slotsUsed >= MAX_SLOTS) {
    return 0; // inventory full
  }

  // 4. Insert new slot
  await query(
    `
    INSERT INTO inventories (player_name, id, amount)
    VALUES (?, ?, ?)
    `,
    [playerName, itemId, amount]
  );

  return amount;
}

async function getInventoryCount(playerName) {
  const rows = await query(
    `
    SELECT COUNT(*) AS total
    FROM inventories
    WHERE player_name = ?
      AND amount > 0
    `,
    [playerName]
  );
  return rows[0].total;
}

async function removeItem(playerName, itemId, amount) {
  const sql = `
    UPDATE inventories
    SET amount = amount - ?
    WHERE player_name = ?
    AND id = ?
  `;
  await query(sql, [amount, playerName, itemId]);
  const cleanup = `
    DELETE FROM inventories
    WHERE player_name = ?
    AND id = ?
    AND amount <= 0
  `;
  await query(cleanup, [playerName, itemId]);
}

async function addBankItem(playerName, itemId, amount) {
  if (amount <= 0) return; // ignore 0 or negative amounts
  const sql = `
    INSERT INTO bank (player_name, id, amount)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE amount = amount + VALUES(amount)
  `;
  await query(sql, [playerName, itemId, amount]);
}

async function removeBankItem(playerName, itemId, amount = 1) {
  if (amount <= 0) return;
  const sql = `
    UPDATE bank
    SET amount = amount - ?
    WHERE player_name = ? AND id = ?
  `;
  await query(sql, [amount, playerName, itemId]);

  // Delete rows that reach 0
  await query(`
    DELETE FROM bank
    WHERE player_name = ? AND id = ? AND amount <= 0
  `, [playerName, itemId]);
}

async function syncInventory(playerName) {
  const inventory = await getInventory(playerName);
  players[playerName].inventory = inventory;
  io.to(players[playerName].sock_id).emit("invData", inventory);
}

async function addPlayerToDb(name, pass){
  console.log("trying to addPlayerToDb");
  const sql = "INSERT INTO players (player_name, pass, x, y) VALUES (?, ?, ?, ?)";
  const params = [name, pass, 49, 49];
  await query(sql, params);
}

async function getPlayerStat(name, stat){
  //query player stats. hp, swordsmanship, archery, mage, and exp of those etc
  //
}

async function setPlayerStat(name, stat, amount){
  //really only used for hp for now
  //later on -- stamina, mana, etc. 
  //max hp/mana/stamina +10 per level?
  //stat levels derived from xp, then can be stored in players[name]
}

async function addPlayerExp(name, stat, amount){
  //
}

async function addPlayer(name, pass) {
  await addPlayerToDb(name, pass);
  await addItem(name, 1, 1);
  await syncInventory(name);
  console.log("Player added:", name);
}

function checkPassword(input, actual) {//replace with hashing
  return input === actual;
}

function mapPersist(){
  map.Fxn.persist(map.Map);
  for (p in players){
    addPlayerToTile(p)//cause they got took off lol
    dbPlayerCoords(p);
  }
}

function addPlayerToTile(name, x=null, y=null){//x and y for mod coords etc
  if (x===null){
    x = players[name].coords[0];
  }
  if (y===null){
    y = players[name].coords[1];
  }
  map.Map[y][x].players[name] = {
    sprite: players[name].sprite,
    facing: players[name].facing,
    hand: players[name].hand,//then everything else
    head: players[name].head
  }
  markTileChanged(x, y);
}

async function markTileChanged(x, y){
  map.Map[y][x].data.version++;
}

 function addToMap(name, x, y) {
  const tile = map.Map[y]?.[x];
  if (!tile) {
    console.error(`Tile at (${x},${y}) does not exist`);
    return;
  }

  tile.data ??= {};

  const tileData = baseTiles[name];
  if (!tileData || !tileData.container) {
    console.error(`Tile ${name} does not have a container`);
    return;
  }

  // 1️⃣ Replace base-tile if applicable
  if (tileData.container === "base-tile") {
    tile.data["base-tile"] = name;
  }

  // 2️⃣ Add to normal container (objects, resources, etc.) if not base-tile
  if (tileData.container !== "base-tile") {
    const type = tileData.container;
    tile.data[type] ??= {};
    tile.data[type][name] = { name };
  }

  // 3️⃣ Add to roof if flagged
  if (tileData.roof === true) {
    tile.data["roof"] ??= {};
    tile.data["roof"][name] = { name };
  }

  console.log(`Placed ${name} in: base-tile=${tileData.container==='base-tile'?name:'-'} container=${tileData.container} roof=${tileData.roof}`);
  markTileChanged(x, y);
}

async function removeObjFromMap(coords){
  map.Map[coords[1]][coords[0]].data.objects = {}
}

function clearTile(x, y){
  console.log("cleared tile");
  map.Map[y][x].data['base-tile']="grass";
  map.Map[y][x].data['collision']=false;
  map.Map[y][x].data.objects = {};
  map.Map[y][x].data.floor={};
  map.Map[y][x].data.roof={};
  const data = map.Map[y][x].data;
  if (data && data.safeTile !== undefined) {
    data.safeTile = {};
  }
  markTileChanged(x, y);
  console.log(map.Map[y][x].data.objects);
}

//this function to prevent certain actions if safe tile
//use like
//if (isSafeActive(tile)) return; blocks interaction
const isSafeActive = tile => !!tile?.data?.safeTile && Object.keys(tile.data.safeTile).length > 0;

async function emitPlayerState(player){
  console.log("emitting player state");
  if (player.hp<=0){
    //player.coords[0]=26;
    //player.coords[1]=54;
    player.hp=player.maxHp;//change to player level max hp
    await dropPlayerLootbag(player.name, player.coords[0], player.coords[1]);
    respawnPlayer(player.name);
  }
  io.to(player.sock_id).emit('playerState', {//might remove this/put somewhere else
    x: player.coords[0],
    y: player.coords[1],
    hand: player.hand,
    head: player.head,
    facing: player.facing,
    hp: player.hp,
    hpLvl: player.hpLvl,
    hpXpTotal: player.hpXpTotal,
    swordLvl: player.swordLvl,
    swordXpTotal: player.swordXpTotal,
    craftLvl: player.craftLvl,
    craftXpTotal: player.craftXpTotal,
    woodcuttingLvl: player.woodcuttingLvl,
    woodcuttingXpTotal: player.woodcuttingXpTotal,
    miningLvl: player.miningLvl,
    miningXpTotal: player.miningXpTotal
  });
}//need player last state

function getTilesInRadius(x, y, radius) {
  const tiles = [];
  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      const nx = x + dx;
      const ny = y + dy;
      const dist = Math.abs(dx) + Math.abs(dy); // Manhattan distance
      tiles.push({ nx, ny, dist });
    }
  }
  // Sort by distance so closest tiles come first
  tiles.sort((a, b) => a.dist - b.dist);
  return tiles;
}

/*
async function dropPlayerLootbag(playerName) {
  const player = players[playerName];
  const inv = await getPlayerInventory(playerName);
  if (!inv || !inv.length) return;

  const lootbag = {
    name: "lootbag",
    items: {},
    locked: false
  };

  for (const item of inv) {
    lootbag.items[item.id] = { id: item.id, amt: item.amt };
  }

  await clearPlayerInventory(playerName);

  const tilesToCheck = getTilesInRadius(player.coords[0], player.coords[1], 3);

  for (const { nx, ny } of tilesToCheck) {
    const nTile = map.Map[ny]?.[nx];
    if (!nTile) continue;
    if (!nTile.data.objects || Object.keys(nTile.data.objects).length === 0) {
      nTile.data.objects = { lootbag };
      markTileChanged(nx, ny);
      break; // dropped successfully
    }
  }
}
  */

async function dropPlayerLootbag(playerName) {
  const player = players[playerName];
  const inv = await getInventory(playerName);
  if (!inv || !inv.length) return;

  const lootbag = {
    name: "lootbag",
    items: {},
    locked: false
  };

  // move items from inventory into lootbag keyed by name
  for (const item of inv) {
    const name = Object.keys(baseTiles).find(key => baseTiles[key].id === item.id);
    if (!name) continue; // skip invalid items
    lootbag.items[name] = { id: item.id, amt: item.amount };
  }

  // remove items from player inventory
  for (const item of inv) {
    await query(
      `DELETE FROM inventories WHERE player_name = ? AND id = ?`,
      [playerName, item.id]
    );
  }

  // drop lootbag on first empty tile within 3 tiles
  const tilesToCheck = getTilesInRadius(player.coords[0], player.coords[1], 3);

  for (const { nx, ny } of tilesToCheck) {
    const nTile = map.Map[ny]?.[nx];
    if (!nTile) continue;
    if (!nTile.data.objects || Object.keys(nTile.data.objects).length === 0) {
      nTile.data.objects = { lootbag };
      markTileChanged(nx, ny);
      break; // dropped successfully
    }
  }
}

async function respawnPlayer(name){
  const playerX = players[name].coords[0];
  const playerY = players[name].coords[1];
  const tile = map.Map[playerY][playerX];
  delete tile.players[name];
  markTileChanged(playerX, playerY);
  players[name].hand=null;
  players[name].head=null;
  players[name].coords[0]=26;
  players[name].coords[1]=54;
  addPlayerToTile(name, 26, 54);
  markTileChanged(26, 54);
  await addItem(name, 1, 1);
  await syncInventory(name);
}

async function updatePlayerState(player) {
  player.hpLvl = await levelFromXp(player.hpXpTotal);
  player.swordLvl = await levelFromXp(player.swordXpTotal);
  player.craftLvl = await levelFromXp(player.craftXpTotal);
  player.woodcuttingLvl = await levelFromXp(player.woodcuttingXpTotal);
  player.miningLvl = await levelFromXp(player.miningXpTotal);

  const currState = {
    x: player.coords[0],
    y: player.coords[1],
    hand: player.hand,
    head: player.head,
    facing: player.facing,
    hp: player.hp,

    hpLvl: player.hpLvl,
    hpXpTotal: player.hpXpTotal,
    swordLvl: player.swordLvl,
    swordXpTotal: player.swordXpTotal,
    craftLvl: player.craftLvl,
    craftXpTotal: player.craftXpTotal,
    woodcuttingLvl: player.woodcuttingLvl,
    woodcuttingXpTotal: player.woodcuttingXpTotal,
    miningLvl: player.miningLvl,
    miningXpTotal: player.miningXpTotal
  };

  const last = player.lastState || {};

  const changed = Object.keys(currState).some(
    key => currState[key] !== last[key]
  );

  if (changed) {
    emitPlayerState(player); // now player actually has new levels
    player.lastState = { ...currState };
  }
}

function mapUpdate() {
  if (Object.keys(players).length === 0) return;

  for (const p in players) {
    const player = players[p];
    if (!player.sock_id) continue;
    //emitPlayerState(player);
    updatePlayerState(player);
    const chunk = map.Fxn.chunk(player.coords);//generates a chunk of coords only
    let newSum = 0;
    for (const row of chunk) {
      for (const [x, y] of row) {
        if (map.Map[y] && map.Map[y][x]) {
          newSum += map.Map[y][x].data.version;
        }
      }
    }
    const chunkKey = `${player.coords[0]},${player.coords[1]}`;
    if (player.lastChunkSum === newSum && player.lastChunkKey === chunkKey
    ) {
      continue;
    }
    player.lastChunkSum = newSum;
    player.lastChunkKey = chunkKey;
    io.to(player.sock_id).emit('updateChunk', generateLiveChunk(p, chunk));
  }
}

function generateLiveChunk(name, player_chunk){
  const chunkObjects = [];

  for (let row of player_chunk) {
    const objectRow = [];
    for (let [x, y] of row) {
      if (map.Map[y] && map.Map[y][x]) {
        objectRow.push(map.Map[y][x]);
      } else {
        objectRow.push(null);
      }
    }
    chunkObjects.push(objectRow);
  }
  if (!players[name].lastChunk){//only runs once
    players[name].lastChunk=chunkObjects;
    return chunkObjects;
  }
  return chunkObjects;
}

io.use((socket, next) => {
  sessionMiddleware(socket.request, {}, next);
});
io.use((socket, next) => {
  const session = socket.request.session;

  if (!session || !session.user) {
    return next(new Error("Unauthorized"));
  }

  socket.user = session.user;//attach user to socket
  next();
});

io.on('connection', async (socket) => {
  console.log(`connecting ${socket.user} with socket id: ${socket.id}...`);
  await initPlayer(socket.user);
  console.log(`User connected: ${socket.user}`);
  players[socket.user].sock_id = socket.id;
  console.log(`Added id: ${socket.user} : ${players[socket.user].sock_id}`);
  Object.entries(players).forEach(([playerName, playerData]) => {
    console.log('Player:', playerName, 'ID:', playerData.sock_id);
  });

  io.emit('server message', {//global chat, user needs toggle for wanting privacy
    message: `${socket.user} logged in...`
  });

  socket.on('chat message', (msg) => {
    console.log(`${socket.user}: ${msg}`)
    io.emit('chat message', {
      user: socket.user,
      message: msg
    });
  });

  socket.on("player input", data => {
    handlePlayerInput(socket.user, data);
  });

  socket.on('typing', () => {
    if (players[socket.user].typing===false){
      console.log(`${socket.user} is typing...`);//wut?
    }
    players[socket.user].typing.state=true;
    players[socket.user].typing.lastSpot.y=players[socket.user].coords[1];
    players[socket.user].typing.lastSpot.x=players[socket.user].coords[0];
    map.Map[players[socket.user].coords[1]][players[socket.user].coords[0]].data.typing=true;
    markTileChanged(players[socket.user].coords[0],players[socket.user].coords[1]);
  });

  socket.on('stopTyping', () => {
    players[socket.user].typing.state=false;
    console.log(`${socket.user} stopped typing.`);
    map.Map[players[socket.user].typing.lastSpot.y][players[socket.user].typing.lastSpot.x].data.typing=false;
    markTileChanged(players[socket.user].coords[0],players[socket.user].coords[1]);
  })

  socket.on('paint', data => {//client side needs to queue paint instead of sending every pixel
                              //user clicks, code waits a moment to see if another click
                              //then sends list of pixels to be painted
    //x, y, subX, subY, c (color)
    if (data.y<0 || data.y>499 || data.x <0 || data.x>499) return;
    if (data.btn === "right"){
      map.Map[data.y][data.x].data.pixels[data.subY][data.subX]=-1;
    } else {
      map.Map[data.y][data.x].data.pixels[data.subY][data.subX]=data.c;
    }
    markTileChanged(data.x, data.y);
  });

  socket.on("layTile", data => {
    console.log(socket.user);
    if (!devMode && socket.user!=="Admin"){
      console.log("not Admin or devmode");
      return;
    } 
    console.log(data);
    let x = players[socket.user].coords[0];
    let y = players[socket.user].coords[1]
    addToMap(data, x, y);
  });

  socket.on("clearTile", data => {
    console.log(socket.user);
    if (!devMode && socket.user!=="Admin") return;
    console.log("clearing tile");
    console.log(data);
    let x = players[socket.user].coords[0];
    let y = players[socket.user].coords[1]
    clearTile(x, y);
  });

  socket.on('saveMap', () => {
    if (!devMode || socket.user!=="Admin") return;
    map.Fxn.save(map.Map);
  });

  socket.on("getInventory", async () => {
    console.log("playerName on socket:", socket.user);
    const name = socket.user;
    await syncInventory(name);
  });

  socket.on('adminMove', (data) => {
    //data = [x,y]
    if (!devMode && socket.user!=='Admin') return;
    console.log('teleporting Admin');
    players[socket.user].coords[0]=data[0];
    players[socket.user].coords[1]=data[1];
  });

  socket.on('setSign', (data) => {
    if (!devMode && socket.user!=='Admin') return;
    let coords = players[socket.user].coords;
    let tile = map.Map[coords[1]][coords[0]];
    tile.data.objects['sign'].text=data;
  })

  socket.on("downloadMap", () => {
    if (!devMode || socket.user!=="Admin") return;
    for (y in map.Map){
      io.to(socket.id).emit("mapDownload", map.Map[y]);
    }
  });

  socket.on('activeInvItem', async (data) => {
    if (data>=0 || data<=31){
      players[socket.user].activeInventory=data;
    }
    await syncInventory(socket.user);
  });

  socket.on('dropItem', async (data) => {
    await dropItem(socket.user, data);
    await syncInventory(socket.user);
  });

  socket.on('action', () => {
    interactTile(socket.user);
  });

  socket.on('craftItem', async (data) => {
    await craftItem(socket.user, data);
    await syncInventory(socket.user);
  })

  socket.on('disconnect', () => {
    console.log(`User logged out: ${socket.user}`);
    setActive(socket.user, 0);
    cleanupPlayer(socket.user);
    socket.request.session.destroy();
    io.emit('server message', {
      message: `${socket.user} logged out...`
    });
  });
});

const ITEMS = Object.fromEntries(
  Object.entries(baseTiles)
    .filter(([_, v]) => v.kind === "item")
    .map(([k, v]) => [k, { id: v.id }])
);

const itemById = Object.fromEntries(
  Object.entries(ITEMS).map(([name, data]) => [data.id, name])
);

const idByItem = name => ITEMS[name]?.id;

function handlePlayerInput(name, data){
  const directions = ['up', 'down', 'left', 'right'];
  if (Date.now()>players[name].lastInput+25){
    players[name].lastInput=Date.now();
    if (data['up'] || data['down'] || data['left'] || data['right']){//jesus christ
      movePlayer(name, data);
    }
    if (data===' '){
      useItem(name);
    }
  }
}

function movePlayer(name, data){
  if (Date.now() < players[name].lastMove+150){
    return;//since this calls checkCollision, might have to add a lastHit
           //as well, that number might be different? idk
  }
  players[name].lastMove = Date.now();
  const directions = ['up', 'down', 'left', 'right'];
  directions.forEach(dir => {
    if (data[dir]) {
      let coordCheck;
      let pCoords = [players[name].coords[0], players[name].coords[1]];
      let modCoords;
      const dirOffsets = {
        up: [0, -1],
        down: [0, 1],
        left: [-1, 0],
        right: [1, 0]
      };

      const spriteMap = {
        left: "ghostL",
        right: "ghostR"
      };
      const [dx, dy] = dirOffsets[dir];
      modCoords = [pCoords[0] + dx, pCoords[1] + dy];
      if (checkCollision(name, modCoords)) return;//tile/obj/player interaction here?
      players[name].lastDir = dir;//for use by generateLiveChunk/compareChunks
      if (spriteMap[dir]){
        players[name].sprite = spriteMap[dir];
        players[name].facing = dir;
      }
      delete map.Map[players[name].coords[1]][players[name].coords[0]].players[name];
      markTileChanged(players[name].coords[0], players[name].coords[1]);
      io.to(players[name].sock_id).emit('playSound', players[name].step);
      if (players[name].step==="stepR"){
        players[name].step="stepL";
      } else {
        players[name].step="stepR";
      }
      players[name].coords = modCoords;
      addPlayerToTile(name, modCoords[0], modCoords[1]);
      markTileChanged(players[name].coords[0], players[name].coords[1]);
    }
  });
}

const tileMax = map.Map[0].length;
function checkCollision(name, coords){
  console.log(tileMax);
  if (coords[0]< 0 || coords[0]>499){  //need next map on collision with edge
    return true;
  }
  if (coords[1]<0 || coords[1]>499){
    return true;
  }
  if (noCollision || name==='Admin'){
    markTileChanged(coords[0], coords[1]);
    return false;
  }
  if (map.Map[coords[1]][coords[0]].data.collision){//is this necessary?
    return true;//don't think data.collision ever even gets used, take out of map?
  }
  if (baseTiles[map.Map[coords[1]][coords[0]].data['base-tile']].collision===true){
    return true;
  }
  //player melee here??
  if (checkMelee(name, coords)){//basically stay in place if hitting somebody
    console.log("skipped rest of checkCollision");
    return true;
  }
  

  const objects = map.Map[coords[1]][coords[0]].data.objects ?? {};
  for (const objKey in objects) {
    const obj = objects[objKey];
    const def = baseTiles[obj.name];

    if (!def || def.collision !== true) continue;

    if (obj.name==="door" && obj.locked===false) continue;
    // Special: allow owners to walk through their own doors
    if (obj.name === "door" && obj.owner === name) {
      continue; // skip collision for this object
    }

    // Normal collision otherwise
    checkObjectCollision(name, coords, obj.name);
    return true;
  }
  return false; 
}

function checkMelee(name, coords) {
    console.log("checkMelee");

    if (players[name].hand === null) {
        console.log("not holding anything");
        return false;
    }

    const tile = map.Map[coords[1]][coords[0]];
    const isSafe = isSafeActive(tile);

    // 1️⃣ Players first
    const tilePlayerNames = Object.keys(tile.players || {});
    if (tilePlayerNames.length > 0 && !isSafe) {
        const playerTarget = tilePlayerNames[0];
        meleeAttack(name, playerTarget);
        console.log("player on tile, attacked");
        return true;
    }

    // 2️⃣ Then mobs
    if (tile.mob) {
        const mob = mobs.get(tile.mob.id);
        if (mob) {
            meleeAttackMob(name, mob.id);
            return true;
        }
    }

    return false;
}

async function meleeAttack(name, targetName){
  if (Date.now()<players[name].lastMelee+1000){//change to -level?
    return;
  }
  players[name].lastMelee=Date.now();
  let damage = 0;
  let weaponName = itemById[players[name].hand];
  let weaponDmg = baseTiles[weaponName].attack;
  if (weaponDmg!==0){
    damage += Math.floor(Math.random() * weaponDmg);
    damage += Math.floor(Math.random() * players[name].swordLvl);
  }
  players[targetName].hp-=damage;//change to playerattack-targetdefense etc
  console.log(`Attacked ${targetName}!`);
  if (damage>0){
    io.to(players[name].sock_id).emit('playSound', 'hit');
    io.to(players[targetName].sock_id).emit('playSound', 'hit');
    io.to(players[targetName].sock_id).emit('playSound', 'damage');
  }
  else {
    io.to(players[name].sock_id).emit('playSound', 'miss');
    io.to(players[targetName].sock_id).emit('playSound', 'miss');
  }
}

function meleeAttackMob(playerName, mobId) {
    const mob = mobs.get(mobId);
    if (!mob) return;

    if (Date.now() < players[playerName].lastMelee + 1000) return;
    players[playerName].lastMelee = Date.now();

    const weaponName = itemById[players[playerName].hand];
    const weaponDmg = baseTiles[weaponName].attack || 0;
    let damage = 0;
    if (weaponDmg !== 0) {
      damage += Math.floor(Math.random() * weaponDmg);
      damage += Math.floor(Math.random() * players[playerName].swordLvl);
    }
    console.log(`reg damage: ${damage}`);
    console.log(`floor damage: ${Math.floor(damage)}`)
    if (damage!==0){
      let giveXp = Math.floor(damage)/10;
      if (giveXp<1){
        giveXp=1;
      }
      players[playerName].swordXpTotal+=giveXp;//xp 10% of damage, can change
      players[playerName].hpXpTotal+=giveXp;
      mob.hp -= damage;
      io.to(players[playerName].sock_id).emit('playSound', 'hit');
    } else {
      io.to(players[playerName.sock_id]).emit('playSound', 'miss');
    }
    console.log(`Player ${playerName} hit mob ${mob.type} for ${damage}`);

    if (mob.hp <= 0) {
        killMob(mob);
    }
}

async function killMob(mob) {
    const tile = map.Map[mob.y][mob.x];
    delete tile.mob;
    //addToMap(mob.drop, mob.x, mob.y);
    await dropMobLoot(mob.drop, mob.x, mob.y);//random bag o loot
    mobs.delete(mob.id);
    markTileChanged(mob.x, mob.y);

    // ♻️ respawn
    const spawn = mob.spawnRef;
    if (spawn) {
        setTimeout(() => {
            spawnMob(spawn);
        }, spawn.respawnTime);
    }
}

async function dropMobLoot(drops, x, y) {
  if (!drops || !drops.length) return;

  const lootbag = {
    name: "lootbag",
    items: {},
    locked: false
  };

  const first = drops[0];
  lootbag.items[first.name] = {
    id: first.id,
    amt: Math.floor(Math.random() * (first.max - first.min + 1)) + first.min
  };

  for (let i = 1; i < drops.length; i++) {
    const drop = drops[i];
    const chance = drop.weight / 100;
    if (Math.random() < chance) {
      lootbag.items[drop.name] = {
        id: drop.id,
        amt: Math.floor(Math.random() * (drop.max - drop.min + 1)) + drop.min
      };
    }
  }

  const tilesToCheck = getTilesInRadius(x, y, 3);

  for (const { nx, ny } of tilesToCheck) {
    const nTile = map.Map[ny]?.[nx];
    if (!nTile) continue;
    if (!nTile.data.objects || Object.keys(nTile.data.objects).length === 0) {
      nTile.data.objects = { lootbag };
      markTileChanged(nx, ny);
      break; // dropped successfully
    }
  }
}

function rollWeighted(weight) {
  return Math.random() * 100 < weight;
}

function placeOrMergeLootbag(x, y, newItems) {
  const tile = map.Map[y][x];
  tile.data ??= {};
  tile.data.objects ??= {};

  let lootbag = tile.data.objects.lootbag;

  // 🔒 lock starts here
  if (lootbag?.locked) return;

  if (!lootbag) {
    // create new lootbag
    tile.data.objects.lootbag = {
      name: "lootbag",
      items: { ...newItems },
      locked: false
    };
    markTileChanged(x, y);
    return;
  }

  lootbag.locked = true;

  try {
    // merge into existing lootbag
    for (const key in newItems) {
      if (!lootbag.items[key]) {
        lootbag.items[key] = newItems[key];
      } else {
        lootbag.items[key].amt += newItems[key].amt;
      }
    }
  } finally {
    lootbag.locked = false;
  }

  markTileChanged(x, y);
}

async function checkObjectCollision(playerName, coords, objName) {
  const player = players[playerName];

  // what item is the player holding?
  const heldItemName = itemById[player.hand];
  if (!heldItemName) return;

  const heldDef = baseTiles[heldItemName];
  const objDef  = baseTiles[objName];

  if (!heldDef || !objDef) return;

  // only world resources can be interacted with this way
  if (objDef.kind !== "resource") return;

  // resource requires a specific tool
  if (
    objDef.requiresTool &&
    objDef.requiresTool !== heldItemName
  ) return;
  //check if safe tile first!
  if (isSafeActive(map.Map[coords[1]][coords[0]])){
    return;
  } 
  await resourceInteract(playerName, coords, objName);
}


async function interactTile(playerName) {
  const player = players[playerName];
  const tile = map.Map[player.coords[1]][player.coords[0]];
  const mapObjects = tile.data.objects ?? {};

  const objNames = Object.keys(mapObjects);
  if (objNames.length === 0) return;

  const objName = objNames[0]; // interact with the first object
  const objDef = baseTiles[objName];
  if (!objDef) return;
  // ---------- auto-drop items ----------
  if (checkInteract(playerName, objName)) return;//was a thing in checkInteract...
  if (objDef.kind === "item" && objDef.container === "objects") {
    await removeObjFromMap(player.coords); // remove object from map
    markTileChanged(player.coords[0], player.coords[1]);

    const itemId = objDef.id;
    if (itemId) {
      await addItem(playerName, itemId, 1);
      await syncInventory(playerName);
    }
    return;
  }
  if (objDef.kind === 'lootbag' && objDef.container === "objects"){
    await openLootbag(playerName, tile.data.objects['lootbag'], player.coords[0], player.coords[1]);//lootbag should have .items
    await syncInventory(playerName);
  }
}
  

async function openLootbag(playerName, lootbagObject, x, y) {
  if (!lootbagObject || !lootbagObject.items) return;

  if (lootbagObject.locked) return;
  lootbagObject.locked = true;

  try {
    for (const name of Object.keys(lootbagObject.items)) {
      const item = lootbagObject.items[name];
      const itemId = baseTiles[name]?.id;
      if (!itemId) continue;

      const added = await addItem(playerName, itemId, item.amt);
      item.amt -= added;

      if (item.amt <= 0) delete lootbagObject.items[name];
    }

    // remove lootbag only if empty
    if (Object.keys(lootbagObject.items).length === 0) {
      const tile = map.Map[y][x];
      delete tile.data.objects.lootbag;
      markTileChanged(x, y);
    }
  } finally {
    lootbagObject.locked = false;
  }
}

function checkInteract(name, objName){
  if (objName==='craftTable'){
    io.to(players[name].sock_id).emit('crafting');//opens up crafting for player
    return true;
  }
  if (objName==='forge'){
    smeltOre(name);//tries to smelt whatever player has selected in inventory
    return true;
  }
  if (objName==='bankchest'){
    playerBank(name);
    return true;
  }
  if (objName==='door'){
    useDoor(name);
    return true;
  }
  if (objName==='sign'){
    readSign(name);
  }
  return false;
}

function readSign(name){
  let player = players[name];
  let coords = players[name].coords;
  let tile = map.Map[coords[1]][coords[0]];
  let text = tile.data.objects['sign'].text;
  console.log(tile.data.objects['sign'].text);
  io.to(players[name].sock_id).emit('readSign', text);
}

async function useDoor(name) {
  const player = players[name];
  const x = player.coords[0];
  const y = player.coords[1];
  const tile = map.Map[y]?.[x];
  if (!tile) return;

  const objects = tile.data?.objects;
  if (!objects) return;

  const door = objects["door"];
  if (!door) return; // no door here

  // If holding pickaxe, pick up the door (ignore ownership)
  if (player.hand === 3) {
    delete objects["door"];

    // give door back to inventory
    await addItem(name, baseTiles.door.id, 1);

    markTileChanged(x, y);
    await syncInventory(name);
    return;
  }

  // Only owner can lock/unlock
  if (door.owner !== name) {
    return; // not your door
  }

  // Toggle lock state
  door.locked = !door.locked;
  let lockMsg;
  if (door.locked){
    lockMsg='locked';
  } else {
    lockMsg='unlocked';
  }
  io.to(players[name].sock_id).emit('server message',
    {
      message: `Door ${lockMsg}!`
    }
  )
  markTileChanged(x, y);
}

async function resourceInteract(playerName, coords, objName) {
  const player = players[playerName];

  // gather cooldown
  if (Date.now() < player.lastGather + 1000) return;
  player.lastGather = Date.now();

  const objDef = baseTiles[objName];
  if (!objDef || objDef.kind !== "resource") return;
  let lvlBonus = 0;
  if (itemById[player.hand]==='axe'){
    io.to(player.sock_id).emit('playSound', 'chop');
    player.woodcuttingXpTotal+=1;
    lvlBonus=Math.floor(player.woodcuttingLvl/10);
  }
  if (itemById[player.hand]==='pickaxe'){
    io.to(player.sock_id).emit('playSound', 'pickaxe');
    player.miningXpTotal+=1;
    lvlBonus=Math.floor(player.miningLvl/10);
  }
  /* ---------- drops ---------- */
  if (objDef.drops) {
    for (const [itemName, amount] of Object.entries(objDef.drops)) {
      const itemId = idByItem(itemName);
      if (itemId) await addItem(playerName, itemId, amount);
    }
    await syncInventory(playerName);
  }
  //rare drop
  if (objDef.rareDrop) {//implies also has .rarity
    if (Math.floor(Math.random() * 1000) < objDef.rarity){
      for (const [itemName, amount] of Object.entries(objDef.rareDrop)) {
        const itemId = idByItem(itemName);
        if (itemId) await addItem(playerName, itemId, amount);
      }
      await syncInventory(playerName);
    }
  }

  /* ---------- depletion ---------- */
  const tileData = map.Map[coords[1]][coords[0]].data;

  // remove current object
  delete tileData.objects?.[objName];

  if (objDef.depletesTo) {
  const nextName = objDef.depletesTo;
  const nextDef = baseTiles[nextName];

  if (nextDef?.container === "depletedResource") {
    // ✅ write to the map's depletedResources container
    tileData.depletedResources ??= {};
    tileData.depletedResources[nextName] = { name: nextName };
  } else {
    tileData.objects ??= {};
    tileData.objects[nextName] = { name: nextName };
  }
}

  await markTileChanged(coords[0], coords[1]);
}

function useItem(playerName) {
  const player = players[playerName];

  const idx = player.activeInventory;
  if (idx < 0 || idx >= player.inventory.length) return;

  const invEntry = player.inventory[idx];
  if (!invEntry) return;

  const itemName = itemById[invEntry.id];
  if (!itemName) return;

  const itemDef = baseTiles[itemName];
  if (!itemDef) return;

  // only items can be used
  if (itemDef.kind !== "item") return;

  // equippable item
  if (itemDef.equip) {
    equip(playerName, invEntry.id);
    return;
  }

  if (itemDef.consume) {
    consume(playerName, invEntry.id);
    return;
  }
  // future: consumables, activatables, etc
  // if (itemDef.consume) consumeItem(playerName, itemName);
}

function equip(playerName, id) {
  const player = players[playerName];

  const itemName = itemById[id];
  if (!itemName) return;

  const itemDef = baseTiles[itemName];
  if (!itemDef || !itemDef.equip) return;

  const slot = itemDef.equip.slot;

  const isEquipped = player[slot] === id;

  if (isEquipped) {
    player[slot] = null;
    map.Map[player.coords[1]][player.coords[0]]
      .players[playerName][slot] = null;
  } else {
    player[slot] = id;
    map.Map[player.coords[1]][player.coords[0]]
      .players[playerName][slot] = id;
  }

  emitPlayerState(player);
  markTileChanged(player.coords[0], player.coords[1]);
}

async function consume(playerName, id){
  const player = players[playerName];

  const itemName = itemById[id];
  if (!itemName) return;

  const itemDef = baseTiles[itemName];
  if (!itemDef || !itemDef.consume) return;
  if (itemDef.hp){
    player.hp+=itemDef.hp;
    if (player.hp>player.maxHp){
      player.hp=player.maxHp;//change this to maxhp, need in db and in memory
    }
    await removeItem(playerName, itemDef.id, 1);
    await syncInventory(playerName);
  }
}

async function dropItem(name, item){
  let player = players[name];
  try {
    if (itemById[player.inventory[item].id]==="axe"){
      return;//take this out when get axe on death or whatever
    }
  } catch(err){
    return;
  }
  if (itemById[player.inventory[item].id]==="axe"){
    return;//take this out when get axe on death or whatever
  }
  if (Object.keys(map.Map[player.coords[1]][player.coords[0]].data.objects).length!==0){
    return;//only one object on tile, need to change this
  }
  const invItem = player.inventory[item]; // current inventory slot
  const baseName = itemById[invItem.id];  // normal name from ID
  const dropName = baseTiles[baseName]?.dropChange ?? baseName;

  const tile = map.Map[player.coords[1]][player.coords[0]];
  const container = baseTiles[dropName]?.container ?? "objects";

  tile.data ??= {};
  tile.data[container] ??= {};

  //tile.data[container][dropName] = { name: dropName };
  const tileItem = { name: dropName };

  // only set owner if the base tile defines it
  if ("owner" in baseTiles[dropName]) {
    tileItem.owner = name; // player name
    console.log(`name: ${baseName}`);
    if (baseName==='door'){
      tileItem.locked=true;
    }
  }

  tile.data[container][dropName] = tileItem;

  //markTileChanged(player.coords[0], player.coords[1]);
  //map.Map[player.coords[1]][player.coords[0]].data.objects[itemById[player.inventory[item].id]] = {"name": itemById[player.inventory[item].id]};
  await removeItem(name, players[name].inventory[item].id, 1);
  markTileChanged(player.coords[0], player.coords[1]);
  await syncInventory(name);
}

async function craftItem(playerName, itemName, smelt = false) {
  if (!itemName) return;

  const player = players[playerName];
  const coords = player.coords;
  const tileObjects = map.Map[coords[1]][coords[0]].data.objects;

  // normal crafting requires craft table; smelting bypasses table check
  if (!smelt && !tileObjects?.craftTable) return;

  const itemDef = baseTiles[itemName];
  if (!itemDef?.craft) return; // not craftable

  // ---------- check materials ----------
  for (const [materialName, requiredAmount] of Object.entries(itemDef.craft)) {
    const materialId = idByItem(materialName);
    const playerAmount = await getItemAmount(playerName, materialId);
    if (playerAmount < requiredAmount) return; // not enough
  }

  // ---------- remove materials ----------
  for (const [materialName, requiredAmount] of Object.entries(itemDef.craft)) {
    const materialId = idByItem(materialName);
    await removeItem(playerName, materialId, requiredAmount);
    console.log(`req'd amount: ${requiredAmount}`);
    players[playerName].craftXpTotal+=requiredAmount;
  }

  // ---------- add crafted item ----------
  const craftedId = idByItem(itemName);
  if (craftedId) await addItem(playerName, craftedId, 1);

  await syncInventory(playerName);
}

async function smeltOre(playerName) {
  const player = players[playerName];
  const coords = player.coords;
  const tileObjects = map.Map[coords[1]][coords[0]].data.objects;

  // must be on a forge to smelt
  if (!tileObjects?.forge) return;

  const slot = player.activeInventory;
  const invItem = player.inventory[slot];
  if (!invItem) return;

  // get the item name from the inventory ID
  const itemName = itemById[invItem.id];
  if (!itemName) return;

  const itemDef = baseTiles[itemName];
  if (!itemDef?.smelt) return; // not smeltable

  // smelt output item is defined in baseTiles
  const smeltItem = itemDef.smelt;

  // delegate to craftItem
  await craftItem(playerName, smeltItem, true);
}

function pickWeighted(list) {
  let total = 0;
  for (const e of list) total += e.weight;

  let r = Math.random() * total;
  for (const e of list) {
    r -= e.weight;
    if (r <= 0) return e.name;
  }
}

let test = {
  "x": 0, "y": 0,
  "data": {
    "base-tile": "grass",
    "collision": false,
    "objects": {},
    "typing": false,
    "version": 0,
    "pixels": [
      [-1, -1, -1, -1],
      [-1, -1, -1, -1],
      [-1, -1, -1, -1],
      [-1, -1, -1, -1]],
    "roof": {}
  }, "players": {

  }
}

async function playerBank(playerName) {
  console.log("player opened bank");
  const rows = await query(`
    SELECT id, amount
    FROM bank
    WHERE player_name = ? AND amount > 0
  `, [playerName]);

  const bankItems = {};
  for (const row of rows) {
    bankItems[row.id] = { id: row.id, amt: row.amount };
  }

  const player = players[playerName];
  io.to(players[playerName].sock_id).emit('openBank', bankItems);

  return bankItems;
}

function replenishResources() {
  for (let y = 0; y < map.Map.length; y++) {
    for (let x = 0; x < map.Map[y].length; x++) {
      const tile = map.Map[y][x];
      const isEmpty = obj => !obj || Object.keys(obj).length === 0;
      //delete all flowers first
      //plant regens like this need separate fxns
      Object.keys(tile.data?.objects ?? {}).forEach(k => k.startsWith("flower") && delete tile.data.objects[k]);
      if (
        isEmpty(tile.data?.objects) &&
        isEmpty(tile.data?.floor) &&
        isEmpty(tile.data?.roof) &&
        isEmpty(tile.data?.depletedResources) &&
        tile.data['base-tile']==='grass'
        ) 
      {
        //random chance to grow a flower!
        const flowers = ['flowerred', 'floweryellow', 'flowerwhite'];
        let randFlower = Math.floor(Math.random()*1000);
        if (randFlower<flowers.length){
          addToMap(flowers[randFlower], x, y);
        }
      }
      // Loop over both containers so all stages are eligible
      for (const containerName of ["objects", "depletedResources"]) {
        const container = tile.data[containerName];
        if (!container) continue;

        for (const objName in { ...container }) { // spread to avoid mutation issues
          const def = baseTiles[objName];
          if (!def?.regrowsTo) continue;

          // Optional throttle
          if (def.regrowChance && Math.random() > def.regrowChance) continue;

          // Pick weighted
          const nextName = Array.isArray(def.regrowsTo)
            ? pickWeighted(def.regrowsTo)
            : def.regrowsTo;
          if (!nextName) continue;

          // Remove old stage
          delete container[objName];

          // Add new stage into objects container
          tile.data.objects ??= {};
          tile.data.objects[nextName] = { name: nextName };

          markTileChanged(x, y);
        }
      }
    }
  }
}
replenishResources();//run at server start to add random ores n shit
setInterval(replenishResources, 60000*30);//every 30 minutes
setInterval(mapUpdate, 200);
setInterval(mapPersist, 60000);//save map every minute

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
replenishResources();

//mob testing
//create mob registry
const mobs = new Map();
//create a rat
/*
const rat1 = createMob('rat', 50, 50);
//put rat1 in registry
mobs.set(rat1.id, rat1);
//put rat on tile
map.Map[50][50].mob = {
    id: rat1.id,
    sprite: "ratL"
};
*/

const mobSpawns = [
    {//rats south of Old Haven
        type: "rat",
        x: 35,//remember client coord abstraction is backwards lol
        y: 76,
        count: 5,
        respawnTime: 12000 // ms
    },
    {
      type: "skeleton",
      x:40, y:35,
      count: 1,
      respawnTime: 10000
    },
    {
      type: "skeleton",
      x:44, y:35,
      count: 1,
      respawnTime: 10000
    },
    {
      type: "skeleton",
      x:40, y:33,
      count: 1,
      respawnTime: 10000
    },
    {
      type: "skeleton",
      x:44, y:33,
      count: 1,
      respawnTime: 10000
    },
    {
      type: "goblin",
      x:77, y:17,
      count: 1,
      respawnTime: 10000
    },
    {
      type: "goblin",
      x:121, y:46,
      count: 1,
      respawnTime: 10000
    },
    {
      type: "goblin",
      x:70, y:36,
      count: 1,
      respawnTime: 10000
    },
    {
      type: "goblin",
      x:98, y:9,
      count: 1,
      respawnTime: 10000
    }
      
];

function spawnMob(spawn) {
    const mob = createMob(spawn.type, spawn.x, spawn.y);
    mobs.set(mob.id, mob);

    map.Map[mob.y][mob.x].mob = {
        id: mob.id,
        sprite: mob.type + "L"
    };

    mob.spawnRef = spawn; // 🔑 link back to spawn
}

for (const spawn of mobSpawns) {
    for (let i = 0; i < spawn.count; i++) {
        spawnMob(spawn);
    }
}

function updateMob(mob, now) {
  if (now < mob.nextThink) return;
  mob.nextThink = now + 500;

  if (mob.state === "return") {
    if (mob.x === mob.spawnX && mob.y === mob.spawnY) {
      mob.state = "idle";
      return;
    }
    returnToSpawn(mob);
    return;
  }

  const player = findPlayerInRange(mob);

  if (player) {

    // 🧷 leash check
    if (distFromSpawn(mob) > mob.leashRadius) {
      mob.state = "return";
      mob.target = null;
      return;
    }

    if (inAttackRange(mob, player)) {
      attackPlayer(mob, player);
      return;
    }

    moveToward(mob, player);
    return;
  }

  wander(mob);
}

function findPlayerInRange(mob) {
    for (const name in players) {
        const player = players[name];
        const px = player.coords[0];
        const py = player.coords[1];
        const dist = Math.abs(mob.x - px) + Math.abs(mob.y - py);
        if (dist <= mob.aggroRadius) {
            console.log(`Player ${name} detected by mob ${mob.id}`);
            return player;
        }
    }
    return null;
}


function tryMove(mob, newX, newY) {
    const oldTile = map.Map[mob.y]?.[mob.x];
    const newTile = map.Map[newY]?.[newX];

    if (!newTile) return false;
    if (newTile.mob) return false;
    if (mobCollision(newTile)) return false;

    // update facing
    mob.facing = newX > mob.x ? "right" : "left";

    // clear old tile
    if (oldTile) delete oldTile.mob;

    // update mob position
    mob.x = newX;
    mob.y = newY;

    // set new tile
    newTile.mob = {
        id: mob.id,
        sprite: mob.type + (mob.facing === "left" ? "L" : "R")
    };

    markTileChanged(mob.x, mob.y);
    return true;
}

function mobCollision(tile){
  for (obj in tile.data.objects){
    if (baseTiles[tile.data.objects[obj].name].collision) return true;
  }
  if (baseTiles[tile.data['base-tile']].collision) return true;
  return false;
}

function distance(a, b){
    const ax = a.x ?? a.coords[0];
    const ay = a.y ?? a.coords[1];

    const bx = b.x ?? b.coords[0];
    const by = b.y ?? b.coords[1];

    return Math.abs(ax - bx) + Math.abs(ay - by);
}

function canSeePlayer(mob, player){
    return distance(mob, player) <= mob.vision;
}

function distFromSpawn(mob) {
    return Math.abs(mob.x - mob.spawnX) + Math.abs(mob.y - mob.spawnY);
}

function wander(mob) {

    // 🚫 too far → go home instead
    if (distFromSpawn(mob) >= mob.leashRadius) {
        moveToward(mob, { coords: [mob.spawnX, mob.spawnY] });
        return;
    }

    const dirs = [
        { x: 0, y: -1 },
        { x: 0, y: 1 },
        { x: -1, y: 0 },
        { x: 1, y: 0 }
    ];

    const choice = dirs[Math.floor(Math.random() * dirs.length)];
    tryMove(mob, mob.x + choice.x, mob.y + choice.y);
}

function moveToward(mob, target) {
    const px = target.coords[0];
    const py = target.coords[1];

    const dx = Math.sign(px - mob.x);
    const dy = Math.sign(py - mob.y);

    // try x first if farther away horizontally
    if (Math.abs(px - mob.x) > Math.abs(py - mob.y)) {
        if (dx !== 0 && tryMove(mob, mob.x + dx, mob.y)) return;
        if (dy !== 0 && tryMove(mob, mob.x, mob.y + dy)) return;
    } 
    // otherwise try y first
    else {
        if (dy !== 0 && tryMove(mob, mob.x, mob.y + dy)) return;
        if (dx !== 0 && tryMove(mob, mob.x + dx, mob.y)) return;
    }

    // if blocked → do nothing (NO wandering here)
}

function returnToSpawn(mob) {
    moveToward(mob, { coords: [mob.spawnX, mob.spawnY] });
}

function inAttackRange(mob, player) {
    const px = player.coords[0];
    const py = player.coords[1];

    const dist = Math.abs(mob.x - px) + Math.abs(mob.y - py);
    return dist === 1; // adjacent tile
}

function attackPlayer(mob, player) {
    //console.log(`Rat ${mob.id} attacks ${player.name || "player"}`);
    // later:
    if (Date.now()>mob.lastAttack+1000){
      mob.lastAttack=Date.now();
      player.hp -= mob.attack;
      io.to(player.sock_id).emit('playSound', 'hit');
      io.to(player.sock_id).emit('playSound', 'damage');
    }
}

function updateMobs() {
    const now = Date.now();
    for (const mob of mobs.values()) {
        updateMob(mob, now);
    }
}

setInterval(updateMobs, 250);

/*
setInterval(() => {
  if (players['Theunorg']){
    players['Theunorg'].hp=100;
  }
}, 1000)
*/