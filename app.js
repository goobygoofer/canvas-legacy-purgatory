var devMode = false;//or if Admin in code
var noCollision = false;

const baseTiles = require('./server_base_tiles.js');
const fs = require('fs');
var map = { 
  Map: require('./blank_map.json'),
  Fxn: require('./map_fxns.js')
};

function flattenTileData() {
  for (let y = 0; y < map.Map.length; y++) {
    for (let x = 0; x < map.Map[y].length; x++) {
      const tile = map.Map[y][x];
      if (!tile || !tile.data) continue;

      // Move every property from data onto the tile
      Object.assign(tile, tile.data);

      // Remove the old container
      delete tile.data;
    }
  }
}

//cleanup empty pixel tiles
for (let y = 0; y < map.Map.length; y++) {
  for (let x = 0; x < map.Map[y].length; x++) {
    //map.Map[y][x]['b-t']=map.Map[y][x]['base-tile'];
    //delete map.Map[y][x]['base-tile'];
    const tile = map.Map[y][x];
    if (!tile.pixels) continue;

    let allMinusOne = true;

    for (const p in tile.pixels) {
      for (const q in tile.pixels[p]) {
        if (tile.pixels[p][q] !== -1) {
          allMinusOne = false;
          break;
        }
      }
      if (!allMinusOne) break;
    }

    if (allMinusOne) {
      delete tile.pixels;
    }
  }
}
//cleanup empty player containers
for (let y = 0; y < map.Map.length; y++) {
  for (let x = 0; x < map.Map[y].length; x++) {
    if (map.Map?.players){
      if (Object.keys(map.Map?.players).length===0){
        delete map.Map.players;
      }
    }
  }
}

//remove mob sprites if server reset
for (i in map.Map){
  for (j in map.Map[i]){
    let tile = map.Map[i][j];
    delete map.Map[i][j].mob;
  }
}
//remove empty object containers on tiles
for (const row of map.Map) {
  for (const tile of row) {
    const objects = tile.objects;
    if (objects && Object.keys(objects).length === 0) {
      delete tile.objects;
    }
    const roof = tile.roof;
    if (roof && Object.keys(roof).length === 0 ){
      delete tile.roof;
    }
  }
}

//reset tile versions so they don't build up to ridiculous numbers
setInterval(async () => {
  for (i in map.Map){
    for (j in map.Map[i]){
      map.Map[i][j].version=0;
  }
}
}, 60*60*1000);

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
    await addPlayer(name, pass);
    await initPlayer(name);
    await addItem(name, 1, 1);
    await syncInventory(name);
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

async function getLeaderboard() {
  const sql = `
    SELECT 'HP' AS skill, player_name, hpXp AS xp
    FROM (
      SELECT player_name, hpXp
      FROM players
      ORDER BY hpXp DESC
      LIMIT 1
    ) AS t

    UNION ALL

    SELECT 'Swordsmanship' AS skill, player_name, swordXp AS xp
    FROM (
      SELECT player_name, swordXp
      FROM players
      ORDER BY swordXp DESC
      LIMIT 1
    ) AS t

    UNION ALL

    SELECT 'Crafting' AS skill, player_name, craftXp AS xp
    FROM (
      SELECT player_name, craftXp
      FROM players
      ORDER BY craftXp DESC
      LIMIT 1
    ) AS t

    UNION ALL

    SELECT 'Woodcutting' AS skill, player_name, woodcuttingXp AS xp
    FROM (
      SELECT player_name, woodcuttingXp
      FROM players
      ORDER BY woodcuttingXp DESC
      LIMIT 1
    ) AS t

    UNION ALL

    SELECT 'Mining' AS skill, player_name, miningXp AS xp
    FROM (
      SELECT player_name, miningXp
      FROM players
      ORDER BY miningXp DESC
      LIMIT 1
    ) AS t;
  `;

  // Pass an empty array because there are no ? placeholders
  const rows = await query(sql, []);
  return rows; // array of { skill, player_name, xp }
}

async function initPlayer(name) {
  const sql = `
    SELECT
      JSON_ARRAY(x, y) AS coords,
      hp,
      swordXp,
      hpXp,
      woodcuttingXp,
      miningXp,
      craftXp,
      murderer
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
  let currHp = result[0].hp;
  let hpXp = result[0].hpXp;
  let swordXp = result[0].swordXp;
  let craftXp = result[0].craftXp;
  let miningXp = result[0].miningXp;
  let woodcuttingXp=result[0].woodcuttingXp;
  let murdererStatus = result[0].murderer;
  let hpLvl = await levelFromXp(hpXp);
  let swordLvl = await levelFromXp(swordXp);
  let craftLvl = await levelFromXp(craftXp);
  let woodcuttingLvl = await levelFromXp(woodcuttingXp);
  let miningLvl = await levelFromXp(miningXp);
  players[name] = {// Initialize player object
    coords: p_coords,
    lastCoords: p_coords,//gets set in compartChunks
    sock_id: null, //to be set in io.connection
    sprite: "ghostR",
    murderSprite: null,//not murderer
    facing: 'right',
    lastInput: Date.now(),
    keystate : { up: false, down: false, left: false, right: false },
    baseMovementSpeed: 175,
    movementSpeed: 175,//speed boots>>115, back to normal >> baseMovementSpeed
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
    body: null,
    feet: null,
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
    lastState: null,
    isCrafting: false,
    lastHitBy: null,
    lastPlayerHit: null,
    murderer: murdererStatus//by default
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
  await dbPlayer(name);
  delete players[name];
}

async function levelFromXp(xp) {
  return Math.floor(Math.sqrt(xp / 10)) + 1;
}

async function dbPlayer(name) {
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
  // 1. Try stacking first (no slot cost)
  const stackResult = await query(
    `
    UPDATE inventories
    SET amount = amount + ?
    WHERE player_name = ? AND id = ?
    `,
    [amount, playerName, itemId]
  );

  if (stackResult.affectedRows > 0) {
    return amount;
  }

  // 2. Item does not exist → check slots
  const slotsUsed = await getInventoryCount(playerName);
  if (slotsUsed >= MAX_SLOTS) {
    return 0;
  }

  // 3. Insert new slot (single winner under concurrency)
  try {
    await query(
      `
      INSERT INTO inventories (player_name, id, amount)
      VALUES (?, ?, ?)
      `,
      [playerName, itemId, amount]
    );
    return amount;
  } catch (err) {
    // Another concurrent insert won — stack instead
    if (err.code === 'ER_DUP_ENTRY') {
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
    throw err;
  }
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
  await ifEquippedRemove(playerName, itemId);
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
  const sql = "INSERT INTO players (player_name, pass, x, y, hp, hpXp, swordXp, craftXp, woodcuttingXp, miningXp, murderer, murderTimer) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
  const params = [name, pass, 49, 49, 100, 0, 0, 0, 0, 0, false, 0];
  await query(sql, params);
}

async function setMurdererStatus(playerName, isMurderer, timerMs = null) {
  // Build query and params dynamically
  let sql = `UPDATE players SET murderer = ?`;
  const params = [isMurderer ? 1 : 0];

  if (timerMs !== null) {
    sql += `, murderTimer = ?`;
    params.push(timerMs);
  }

  sql += ` WHERE player_name = ?`;
  params.push(playerName);

  await query(sql, params);
  players[playerName].murderer=isMurderer;
}

async function incrementMurderTimer(playerName, ms) {
  await query(
    `
    UPDATE players
    SET murderTimer = murderTimer + ?
    WHERE player_name = ?
    `,
    [ms, playerName]
  );
}

async function addPlayer(name, pass) {
  await addPlayerToDb(name, pass);
  console.log("Player added:", name);
}

function checkPassword(input, actual) {//replace with hashing
  return input === actual;
}

function mapPersist(){
  map.Fxn.persist(map.Map);
  for (p in players){
    addPlayerToTile(p)//cause they got took off lol
    dbPlayer(p);
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
    head: players[name].head,
    body: players[name].body,
    feet: players[name].feet,
    murderSprite: players[name].murderSprite
  }
  markTileChanged(x, y);
}

async function markTileChanged(x, y){
  map.Map[y][x].version++;
}

 function addToMap(name, x, y) {
  const tile = map.Map[y]?.[x];
  if (!tile) {
    console.error(`Tile at (${x},${y}) does not exist`);
    return;
  }

  tile ??= {};

  const tileData = baseTiles[name];
  if (!tileData || !tileData.container) {
    console.error(`Tile ${name} does not have a container`);
    return;
  }

  // 1️⃣ Replace b-t if applicable
  if (tileData.container === "b-t") {
    tile["b-t"] = name;
  }

  // 2️⃣ Add to normal container (objects, resources, etc.) if not b-t
  if (tileData.container !== "b-t") {
    const type = tileData.container;
    tile[type] ??= {};
    tile[type][name] = { name };
  }

  // 3️⃣ Add to roof if flagged
  if (tileData.roof === true) {
    tile["roof"] ??= {};
    tile["roof"][name] = { name };
  }

  console.log(`Placed ${name} in: b-t=${tileData.container==='b-t'?name:'-'} container=${tileData.container} roof=${tileData.roof}`);
  markTileChanged(x, y);
}

async function removeObjFromMap(coords){
  delete map.Map[coords[1]][coords[0]].objects;// = {}
}

function clearTile(x, y){
  console.log("cleared tile");
  map.Map[y][x]['b-t']="grass";
  map.Map[y][x]['collision']=false;
  delete map.Map[y][x].objects;// = {};
  map.Map[y][x].floor={};
  map.Map[y][x].roof={};
  const data = map.Map[y][x];
  if (data && data.safeTile !== undefined) {
    data.safeTile = {};
  }
  markTileChanged(x, y);
}

//this function to prevent certain actions if safe tile
//use like
//if (isSafeActive(tile)) return; blocks interaction
const isSafeActive = tile => !!tile?.safeTile && Object.keys(tile.safeTile).length > 0;

async function emitPlayerState(player){
  //console.log("emitting player state");
  if (player.hp<=0){
    if (player.lastHitBy!==null){
      
      io.emit('pk message', {//global chat, user needs toggle for wanting privacy
        message: `${player.name} was defeated by ${player.lastHitBy}!`
      });
      if (!player.murderer){
        io.emit('pk message', {//global chat, user needs toggle for wanting privacy
          message: `${player.lastHitBy} is now a murderer!`
        });
        await startCriminalTimer(player.lastHitBy);
      }
    }
    //player.coords[0]=26;
    //player.coords[1]=54;
    player.hp=player.maxHp;//change to player level max hp
    await dropPlayerLootbag(player.name, player.coords[0], player.coords[1]);
    respawnPlayer(player.name);
  }
  if (player.sock_id!==null){
    io.to(player.sock_id).emit('playerState', {//might remove this/put somewhere else
      x: player.coords[0],
      y: player.coords[1],
      hand: player.hand,
      head: player.head,
      body: player.body,
      feet: player.feet,
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
  }
}//need player last state

async function startCriminalTimer(name){
  if (!players[name].murderer){
    setMurdererStatus(name, true, 60*60*1000);//to start, make 1 hour in milliseconds 60*60*1000    
  } else {
    incrementMurderTimer(name, 60*60*1000);
  }
}

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
    if (!nTile.objects || Object.keys(nTile.objects).length === 0) {
      nTile.objects = { lootbag };
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
  players[name].body=null;
  players[name].feet=null;
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
    body: player.body,
    feet: player.feet,
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
    //if (!player.sock_id) continue;
    //emitPlayerState(player);
    updatePlayerState(player);
    const chunk = map.Fxn.chunk(player.coords);//generates a chunk of coords only
    let newSum = 0;
    for (const row of chunk) {
      for (const [x, y] of row) {
        if (map.Map[y] && map.Map[y][x]) {
          newSum += map.Map[y][x].version;
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

  // Check if the player object already exists in memory
  if (players[socket.user]) {
    console.log(`${socket.user} is reconnecting to existing player object.`);
    players[socket.user].sock_id = socket.id; // reconnect socket
    let p = players[socket.user];
    markTileChanged(p.coords[0], p.coords[1]);
    syncInventory(socket.user);
    emitPlayerState(p);
  } else {
    // Player does not exist → initialize normally
    await initPlayer(socket.user);
    console.log(`User connected: ${socket.user}`);
    players[socket.user].sock_id = socket.id;
    console.log(`Added id: ${socket.user} : ${players[socket.user].sock_id}`);
  }
  Object.entries(players).forEach(([playerName, playerData]) => {
    console.log('Player:', playerName, 'ID:', playerData.sock_id);
  });

  io.emit('server message', {//global chat, user needs toggle for wanting privacy
    message: `${socket.user} logged in...`
  });

  socket.on('chat message', (msg) => {
    console.log(`${socket.user}: ${msg}`)
    if (msg[0]==="/"){
      console.log("command message");
      parseCmdMsg(socket.user, msg);
    } else {
      io.emit('chat message', {
        user: socket.user,
        message: msg
      });
    }

  });
/*
  socket.on("player input", data => {
    handlePlayerInput(socket.user, data);
  });
*/
  socket.on("acceptTrade", data => {
    console.log(`Accepted ${data}'s trade...`);
  });
  socket.on("declineTrade", data => {
    console.log(`Declined ${data}'s trade...`);
  })
  socket.on("player input", data => {
    const player = players[socket.user];
    if (!player.keystate) player.keystate = { up: false, down: false, left: false, right: false };

    // If data is a single key change
    if (typeof data === 'object' && data.key) {
      player.keystate[data.key] = data.state;
      return;
    }

    // If data is a space (existing behavior)
    if (data === ' ') useItem(socket.user);
  });

  socket.on('typing', () => {
    if (players[socket.user].typing===false){
      console.log(`${socket.user} is typing...`);//wut?
    }
    players[socket.user].typing.state=true;
    players[socket.user].typing.lastSpot.y=players[socket.user].coords[1];
    players[socket.user].typing.lastSpot.x=players[socket.user].coords[0];
    map.Map[players[socket.user].coords[1]][players[socket.user].coords[0]].typing=true;
    markTileChanged(players[socket.user].coords[0],players[socket.user].coords[1]);
  });

  socket.on('stopTyping', () => {
    players[socket.user].typing.state=false;
    console.log(`${socket.user} stopped typing.`);
    map.Map[players[socket.user].typing.lastSpot.y][players[socket.user].typing.lastSpot.x].typing=false;
    markTileChanged(players[socket.user].coords[0],players[socket.user].coords[1]);
  })

  socket.on('paint', data => {//client side needs to queue paint instead of sending every pixel
                              //user clicks, code waits a moment to see if another click
                              //then sends list of pixels to be painted
    //x, y, subX, subY, c (color)
    if (data.y<0 || data.y>499 || data.x <0 || data.x>499) return;
    if (data.btn === "right"){
      if (map.Map[data.y][data.x]?.pixels){
        map.Map[data.y][data.x].pixels[data.subY][data.subX]=-1;
      }
    } else {
      if (map.Map[data.y][data.x]?.pixels){
        map.Map[data.y][data.x].pixels[data.subY][data.subX]=data.c;
      } else {
        map.Map[data.y][data.x].pixels ??= 
          [     
            [-1, -1, -1, -1],
            [-1, -1, -1, -1],
            [-1, -1, -1, -1],
            [-1, -1, -1, -1]
          ];
        map.Map[data.y][data.x].pixels[data.subY][data.subX]=data.c;
      }
      
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
    tile.objects['sign'].text=data;
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
  });

// Player withdraws from bank → goes into inventory
socket.on('bankWithdraw', async (data) => {
  let player = players[socket.user];
  let tile = map.Map[player.coords[1]][player.coords[0]];
  if (!tile.objects['bankchest']) return;
  try {
    const { id, amt } = data;
    console.log(`player withdrawing ${id} x${amt}`);

    // 1. Check how much is in the bank
    const bankItems = await query(
      `SELECT amount FROM bank WHERE player_name = ? AND id = ?`,
      [player.name, id]
    );

    if (bankItems.length === 0) return; // nothing to withdraw

    const bankAmount = bankItems[0].amount;
    const toWithdraw = Math.min(amt, bankAmount);

    if (toWithdraw <= 0) return;

    // 2. Try to add to inventory
    const added = await addItem(player.name, id, toWithdraw);

    if (added > 0) {
      // 3. Remove from bank only the amount actually added
      await removeBankItem(player.name, id, added);
      console.log(`Successfully withdrew ${added} of ID ${id}`);
      playerBank(player.name);
      syncInventory(player.name);
    } else {
      console.log(`Inventory full, cannot withdraw ${id}`);
    }
  } catch (err) {
    console.error('Error handling bankWithdraw:', err);
  }
});

// Player deposits into bank → removes from inventory
socket.on('bankDeposit', async (data) => {
  let player = players[socket.user];
  let tile = map.Map[player.coords[1]][player.coords[0]];
  if (!tile.objects['bankchest']) return;
  try {
    const { id, amt } = data;
    console.log(`player depositing ${id} x${amt}`);

    // 1. Check how much is in inventory
    const invItems = await query(
      `SELECT amount FROM inventories WHERE player_name = ? AND id = ?`,
      [player.name, id]
    );

    if (invItems.length === 0) return; // nothing to deposit

    const invAmount = invItems[0].amount;
    const toDeposit = Math.min(amt, invAmount);

    if (toDeposit <= 0) return;

    // 2. Add to bank
    await addBankItem(player.name, id, toDeposit);

    // 3. Remove from inventory
    await removeItem(player.name, id, toDeposit);

    console.log(`Successfully deposited ${toDeposit} of ID ${id}`);
    playerBank(player.name);
    syncInventory(player.name);
  } catch (err) {
    console.error('Error handling bankDeposit:', err);
  }
});

  socket.on('getLeaderboard', async () => {
    try {
      const leaderboard = await getLeaderboard();

      // send it back to the same client
      socket.emit('leaderboardData', leaderboard);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      // optional: notify client of error
      socket.emit('leaderboardError', { message: 'Could not load leaderboard' });
    }
  });
  socket.on('disconnect', () => {
    if (players[socket.user].murderer){
      io.emit('server message', {
        message: `${socket.user} is afk as a murderer!`
      });
      //don't cleanup, keep active on server
    } else {
      console.log(`User logged out: ${socket.user}`);
      setActive(socket.user, 0);
      cleanupPlayer(socket.user);
      socket.request.session.destroy();
      io.emit('server message', {
        message: `${socket.user} logged out...`
      });
    }
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

async function parseCmdMsg(name, cmd){
  const words = cmd.slice(1).trim().split(/\s+/);
  console.log(`words: ${words}`);
  if (words[0]==="tell"){
    if (players[words[1]]){
      let recipient = words[1];
      let msg = words.slice(2);
      io.to(players[words[1]]?.sock_id).emit('chat message', {
        user: name,
        message: msg
      })
    } else {
      io.to(players[name].sock_id).emit('pk message', {
        message: `${words[1]} is not online...`
      })
    }
  }
  if (words[0]==="trade"){
    let targetName = words[1];
    if (targetName===name){
      io.to(players[name].sock_id).emit('pk message', {
        message: `You must be high af...`
      })
    }
    if (players[targetName]?.sock_id){
      sendTradeRequest(name, targetName);
    } else{
      io.to(players[name].sock_id).emit('pk message', {
        message: `${targetName} is not online...`
      })
    }
  }
}

async function sendTradeRequest(fromName, toName) {
  console.log(`${fromName} attempting to trade ${toName}`);

  if (!players[toName] || players[toName].sock_id === null) {
    io.to(players[fromName].sock_id).emit("pk message", {
      message: `${toName} is not online...`
    });
    return;
  }

  // sender sees confirmation
  io.to(players[fromName].sock_id).emit("server message", 
    {
      message: `Trade request sent to ${toName}`
    }
  );

  // receiver gets the request
  io.to(players[toName].sock_id).emit("chatEvent", {
    type: "tradeRequest",
    from: fromName
  });
}

function handlePlayerInput(name, keystate){
  if (!players[name]) return;

  if (keystate.up || keystate.down || keystate.left || keystate.right) {
    movePlayer(name, keystate);
  }
}

function movePlayer(name, data){
  if (pendingTeleports[name]) {
    clearTimeout(pendingTeleports[name]);
    delete pendingTeleports[name];
    console.log("Teleport canceled due to movement");
  }
  const channel = activeChannels[name];

  if (channel && channel.cancelOnMove) {
    clearTimeout(channel.timer);
    delete activeChannels[name];

    channel.onCancel?.();
    io.to(players[name].sock_id).emit('channelCancel');
  }
  if (Date.now() < players[name].lastMove+players[name].movementSpeed){
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

      if (checkCollision(name, modCoords)) return; // tile/obj/player interaction here?

      //if (players[name].murderer )

      // update facing
      players[name].lastDir = dir;

      // normal sprite
      if (spriteMap[dir]) {
        players[name].sprite = spriteMap[dir];
        players[name].facing = dir;

        // murderer sprite override if player is a murderer
        if (players[name].murderer) {
          const murderSpriteMap = {
            left: "murderL",
            right: "murderR"
          };
          players[name].murderSprite = murderSpriteMap[dir];
        } else {
          players[name].murderSprite = null;
        }
      }
      delete map.Map[players[name].coords[1]][players[name].coords[0]].players[name];
      markTileChanged(players[name].coords[0], players[name].coords[1]);
      io.to(players[name].sock_id).emit('playSound', [players[name].step]);
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
  if (map.Map[coords[1]][coords[0]].collision){//is this necessary?
    return true;//don't think data.collision ever even gets used, take out of map?
  }
  if (baseTiles[map.Map[coords[1]][coords[0]]['b-t']].collision===true){
    return true;
  }
  //player melee here??
  if (checkMelee(name, coords)){//stay in place if hitting somebody
    return true;
  }

  const objects = map.Map[coords[1]][coords[0]].objects ?? {};
  for (const objKey in objects) {
    const obj = objects[objKey];
    const def = baseTiles[obj.name];

    if (!def || def.collision !== true) continue;

    if (obj.name==="door" && obj.locked===false) continue;
    // Special: allow owners to walk through their own doors
    if (obj.name === "door" && obj.owner === name) {
      if (players[name].murderer){
        io.to(players[name].sock_id).emit('pk message',
          {
            message: `As a murderer,  you cannot hide...`
          }
        );
        return true;
      } else {
        continue; // skip collision for this object
      }
    }

    // Normal collision otherwise
    checkObjectCollision(name, coords, obj.name);
    return true;
  }
  if (players[name].murderer && map.Map[coords[1]][coords[0]].safeTile){
    io.to(players[name].sock_id).emit('pk message',
      {
        message: `As a murderer,  you cannot enter safe places...`
      }
    );
    return true;//lol they can't go to safe area!
  }
  return false; 
}

function checkMelee(name, coords) {
    if (players[name].hand === null) {
        return false;
    }
    const tile = map.Map[coords[1]][coords[0]];
    const isSafe = isSafeActive(tile);

    // 1️⃣ Players first
    const tilePlayerNames = Object.keys(tile.players || {});
    if (tilePlayerNames.length > 0) {
      const playerTarget = tilePlayerNames[0];

      // allow attack if tile is not safe OR target is a murderer
      if (!isSafe || (players[playerTarget] && players[playerTarget].murderer)) {
        meleeAttack(name, playerTarget);
        console.log("player on tile, attacked");
        return true;
      }
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
  let targetPlayer = players[targetName];
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
    if (targetPlayer.head!==null){
      let headName = itemById[targetPlayer.head];
      damage-=Math.floor(Math.random() * baseTiles[headName].defense);
    }
    if (players[targetName].body!==null){
      let bodyName = itemById[targetPlayer.body];
      damage-=Math.floor(Math.random() * baseTiles[bodyName].defense);
    }
    if (players[targetName].feet!==null){
      let feetName = itemById[targetPlayer.feet];
      damage-=Math.floor(Math.random() * baseTiles[feetName].defense);
    }
  }
  if (damage<0){
    damage=0;
  }
  players[targetName].hp-=damage;//change to playerattack-targetdefense etc
  console.log(`Attacked ${targetName}!`);
  players[targetName].lastHitBy = name;
  players[name].lastPlayerHit = targetName;
  if (damage>0){
    io.to(players[name].sock_id).emit('playSound', ['hit']);
    //io.to(players[targetName].sock_id).emit('playSound', 'hit');
    io.to(players[targetName].sock_id).emit('playSound', ['hit', 'damage']);
    io.to(players[targetName].sock_id).emit('pk message', 
      {message: `${name} hit you for ${damage} damage!`}
    )
    io.to(players[name].sock_id).emit('pk message', 
      {message: `You hit ${targetName} for ${damage} damage!`}
    )
  }
  else {
    io.to(players[name].sock_id).emit('playSound', ['miss']);
    io.to(players[targetName].sock_id).emit('playSound', ['miss']);
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
      let giveXp = Math.floor(damage/10);
      if (mob.hp-damage<0){
        giveXp=Math.floor(Math.floor(mob.hp/10));
      }
      if (giveXp<1){
        giveXp=1;
      }
      players[playerName].swordXpTotal+=giveXp;//xp 10% of damage, can change
      players[playerName].hpXpTotal+=giveXp;
      if (damage<0){
        damage=0;//just a safeguard, might not need here
      }
      mob.hp -= damage;
      io.to(players[playerName].sock_id).emit('playSound', ['hit']);
      io.to(players[playerName].sock_id).emit('pk message',
        {message: `You hit the ${mob.type} for ${damage} damage!`}
      )
    } else {
      io.to(players[playerName].sock_id).emit('playSound', ['miss']);
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
    if (!nTile.objects || Object.keys(nTile.objects).length === 0) {
      nTile.objects = { lootbag };
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
  tile ??= {};
  tile.objects ??= {};

  let lootbag = tile.objects.lootbag;

  // 🔒 lock starts here
  if (lootbag?.locked) return;

  if (!lootbag) {
    // create new lootbag
    tile.objects.lootbag = {
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
  const mapObjects = tile.objects ?? {};

  const objNames = Object.keys(mapObjects);
  if (objNames.length === 0) return;

  const objName = objNames[0]; // interact with the first object
  const objDef = baseTiles[objName];
  if (!objDef) return;
  // ---------- auto-drop items ----------
  if (checkInteract(playerName, objName)) return;//was a thing in checkInteract...
  if (objDef.kind === "item" && objDef.container === "objects") {
    const itemId = objDef.id;
    if (!itemId) return;

    // 1. REMOVE OBJECT FIRST (atomic, synchronous)
    const removed = removeObjFromMapSync(player.coords);
    if (!removed) return; // someone else already took it

    markTileChanged(player.coords[0], player.coords[1]);

    // 2. TRY TO ADD TO INVENTORY
    const added = await addItem(playerName, itemId, 1);

    // 3. INVENTORY FULL → PUT IT BACK
    if (added === 0) {
      restoreObjToMap(player.coords, removed);
      markTileChanged(player.coords[0], player.coords[1]);
      return;
    }

    // 4. SUCCESS
    await syncInventory(playerName);
    return;
  }
  if (objDef.kind === 'lootbag' && objDef.container === "objects"){
    await openLootbag(playerName, tile.objects['lootbag'], player.coords[0], player.coords[1]);//lootbag should have .items
    await syncInventory(playerName);
  }
}

function removeObjFromMapSync(coords) {
  const tile = map.Map[coords[1]][coords[0]];
  const objects = tile.objects;
  if (!objects) return null;

  const keys = Object.keys(objects);
  if (keys.length === 0) return null;

  const key = keys[0];
  const obj = objects[key];

  delete objects[key];

  return { key, obj };
}

function restoreObjToMap(coords, removed) {
  if (!removed) return;

  const tile = map.Map[coords[1]][coords[0]];
  tile.objects ??= {};

  tile.objects[removed.key] = removed.obj;
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
      delete tile.objects.lootbag;
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
  if (objName==='leaderboard'){
    readLeaderboard(name);
  }
  return false;
}

async function readLeaderboard(name){
  const leaderboard = await getLeaderboard();
  io.to(players[name].sock_id).emit('leaderboardData', leaderboard);
}

function readSign(name){
  let player = players[name];
  let coords = players[name].coords;
  let tile = map.Map[coords[1]][coords[0]];
  let text = tile.objects['sign'].text;
  console.log(tile.objects['sign'].text);
  io.to(players[name].sock_id).emit('readSign', text);
}

async function useDoor(name) {
  const player = players[name];
  const x = player.coords[0];
  const y = player.coords[1];
  const tile = map.Map[y]?.[x];
  if (!tile) return;

  const objects = tile?.objects;
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
    io.to(player.sock_id).emit('playSound', ['chop']);
    player.woodcuttingXpTotal+=1;
    lvlBonus=Math.floor(player.woodcuttingLvl/10);
  }
  if (itemById[player.hand]==='pickaxe'){
    io.to(player.sock_id).emit('playSound', ['pickaxe']);
    player.miningXpTotal+=1;
    lvlBonus=Math.floor(player.miningLvl/10);
  }
  /* ---------- drops ---------- */
  if (objDef.drops) {
    for (const [itemName, amount] of Object.entries(objDef.drops)) {
      const itemId = idByItem(itemName);
      if (itemId) await addItem(playerName, itemId, amount+lvlBonus);
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
  const tileData = map.Map[coords[1]][coords[0]];

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
    if (slot==="feet"){
      player.movementSpeed=player.baseMovementSpeed;
    }
  } else {
    player[slot] = id;
    map.Map[player.coords[1]][player.coords[0]]
      .players[playerName][slot] = id;
    if (slot==="feet"){
      player.movementSpeed=baseTiles[itemById[player[slot]]].speed;
    }
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
  if (itemDef.teleport){
    await removeItem(playerName, itemDef.id, 1);
    await syncInventory(playerName);
    await teleportPlayer(playerName);
  }
}

const activeChannels = {};//can be used for other stuff
const pendingTeleports = {};
async function teleportPlayer(name) {
  startChannel({
    playerName: name,
    duration: 5000,
    cancelOnMove: true,

    onComplete: () => {
      const player = players[name];
      if (!player) return;

      const x = player.coords[0];
      const y = player.coords[1];

      delete map.Map[y][x].players[name];
      markTileChanged(x, y);

      player.coords[0] = 49;
      player.coords[1] = 49;

      addPlayerToTile(name, 49, 49);
      markTileChanged(49, 49);
    },

    onCancel: () => {
      console.log("Teleport canceled");
    }
  });
}

function startChannel({
  playerName,
  duration,            // ms
  onComplete,
  onCancel,
  cancelOnMove = true
}) {
  const player = players[playerName];
  if (!player) return;

  // already channeling
  if (activeChannels[playerName]) return;

  const startX = player.coords[0];
  const startY = player.coords[1];
  const startTime = Date.now();

  // tell client to show progress bar
  console.log("CHANNEL START:", playerName, duration);
  io.to(player.sock_id).emit('channelStart', {
    duration,
    startTime
  });

  const timer = setTimeout(() => {
    delete activeChannels[playerName];
    onComplete?.();
    io.to(player.sock_id).emit('channelEnd');
  }, duration);

  activeChannels[playerName] = {
    timer,
    startX,
    startY,
    cancelOnMove,
    onCancel
  };
}

async function dropItem(name, item){
  let player = players[name];
  if (player.murderer) {
    io.to(player.sock_id).emit('pk message',
      {
        message: `As a murderer,  you cannot drop items...`
      }
    );
    return;
  }
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
  if (map.Map[player.coords[1]][player.coords[0]].objects){
    if (Object.keys(map.Map[player.coords[1]][player.coords[0]].objects).length !== 0) {
      return;//only one object on tile, need to change this
    }
  }

  const invItem = player.inventory[item]; // current inventory slot
  const baseName = itemById[invItem.id];  // normal name from ID
  const dropName = baseTiles[baseName]?.dropChange ?? baseName;

  const tile = map.Map[player.coords[1]][player.coords[0]];
  const container = baseTiles[dropName]?.container ?? "objects";

  tile ??= {};
  tile[container] ??= {};

  //tile[container][dropName] = { name: dropName };
  const tileItem = { name: dropName };

  // only set owner if the base tile defines it
  if ("owner" in baseTiles[dropName]) {
    tileItem.owner = name; // player name
    console.log(`name: ${baseName}`);
    if (baseName==='door'){
      tileItem.locked=true;
    }
  }

  tile[container][dropName] = tileItem;

  //markTileChanged(player.coords[0], player.coords[1]);
  //map.Map[player.coords[1]][player.coords[0]].objects[itemById[player.inventory[item].id]] = {"name": itemById[player.inventory[item].id]};
  await removeItem(name, players[name].inventory[item].id, 1);
  await ifEquippedRemove(name, players[name].inventory[item].id);
  markTileChanged(player.coords[0], player.coords[1]);
  await syncInventory(name);
}

async function ifEquippedRemove(name, itemId){
  let player = players[name];
  if (player.hand===itemId){
    player.hand=null;
  }
  if (player.head===itemId){
    player.head=null;
  }
  if (player.body===itemId){
    player.body=null;
  }
  if (player.feet === itemId){
    player.feet = null;
  }
}

//uncomment and remove old craftItem on 33rd item creation!

async function craftItem(playerName, itemName, smelt=false) {
  if (!itemName) return;

  const player = players[playerName];
  const coords = player.coords;
  const tileObjects = map.Map[coords[1]][coords[0]].objects;

  // normal crafting requires craft table; smelting bypasses table check
  if (!smelt && !tileObjects?.craftTable) return;

  const itemDef = baseTiles[itemName];
  if (!itemDef?.craft && !itemDef?.smelt) return; // not craftable
  // ---------- check materials ----------
  if (itemDef?.craft){
    for (const [materialName, requiredAmount] of Object.entries(itemDef.craft)) {
      const materialId = idByItem(materialName);
      const playerAmount = await getItemAmount(playerName, materialId);
      if (playerAmount < requiredAmount) return;
    }
    //remove materials
    for (const [materialName, requiredAmount] of Object.entries(itemDef.craft)) {
      const materialId = idByItem(materialName);
      await removeItem(playerName, materialId, requiredAmount);
      players[playerName].craftXpTotal += requiredAmount;
    }    
  }
  if (itemDef?.smelt){
    for (const [materialName, requiredAmount] of Object.entries(itemDef.smelt)) {
      const materialId = idByItem(materialName);
      const playerAmount = await getItemAmount(playerName, materialId);
      if (playerAmount < requiredAmount) return;
    } 
    for (const [materialName, requiredAmount] of Object.entries(itemDef.smelt)) {
      const materialId = idByItem(materialName);
      await removeItem(playerName, materialId, requiredAmount);
      players[playerName].craftXpTotal += requiredAmount;
    }   
  }

  // ---------- add crafted item (WITH SAFETY) ----------
  const craftedId = idByItem(itemName);
  if (!craftedId) return;

  // does player already have this item?
  const existing = await getItemAmount(playerName, craftedId);

  let added = 0;

  if (existing > 0) {
    // stacking is always allowed
    added = await addItem(playerName, craftedId, 1);
  } else {
    // new slot → check capacity
    const slotsUsed = await getInventoryCount(playerName);

    if (slotsUsed < 32) {
      added = await addItem(playerName, craftedId, 1);
    }
  }

  // if inventory couldn't accept it → send to bank
  if (added === 0) {
    await addBankItem(playerName, craftedId, 1);
    console.log(`Inventory full — crafted ${itemName} sent to bank`);
  }

  await syncInventory(playerName);
}

async function smeltOre(playerName) {
  const player = players[playerName];
  const coords = player.coords;
  const tileObjects = map.Map[coords[1]][coords[0]].objects;

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
    "b-t": "grass",
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

const mobs = new Map();

async function replenishResources() {
  await removeMobType("mushroom");
  await removeMobType("goat");
  for (let y = 0; y < map.Map.length; y++) {
    for (let x = 0; x < map.Map[y].length; x++) {
      const tile = map.Map[y][x];
      const isEmpty = obj => !obj || Object.keys(obj).length === 0;
      //delete all flowers first
      //plant regens like this need separate fxns
      Object.keys(tile?.objects ?? {}).forEach(k => k.startsWith("flower") && delete tile.objects[k]);
      if (
        isEmpty(tile?.objects) &&
        isEmpty(tile?.floor) &&
        isEmpty(tile?.roof) &&
        isEmpty(tile?.depletedResources) &&
        tile['b-t']==='grass'
        ) 
      {
        //random chance to grow a flower!
        const flowers = ['flowerred', 'floweryellow', 'flowerwhite'];
        let randFlower = Math.floor(Math.random()*1000);
        if (randFlower<flowers.length){
          addToMap(flowers[randFlower], x, y);
        }
      }
      if (
        isEmpty(tile?.objects) &&
        isEmpty(tile?.floor) &&
        isEmpty(tile?.roof) &&
        isEmpty(tile?.depletedResources) &&
        tile['b-t']==='grass'
        ) 
      {
        //random chance place a mushroom mob!
        let randMushroom = Math.floor(Math.random()*2000);
        if (randMushroom<3){
          //add mushroom
          let mushroom1 = createMob('mushroom', x, y);
          mobs.set(mushroom1.id, mushroom1);
          map.Map[y][x].mob = {
            id: mushroom1.id,
            sprite: "mushroomL"
          }
        }
      }

      //random chance for roaming goat!
      let randGoat = Math.floor(Math.random()*3000);
      if (randGoat<3){//1/1000
        if (
        isEmpty(tile?.objects) &&
        isEmpty(tile?.floor) &&
        isEmpty(tile?.roof) &&
        isEmpty(tile?.depletedResources) &&
        tile['b-t']==='grass'
        ) 
      {
        let testGoat = createMob('goat', x, y);
        mobs.set(testGoat.id, testGoat);
        map.Map[y][x].mob = {
          id: testGoat.id,
          sprite: "goatL"
        }
      }
      }

      // Loop over both containers so all stages are eligible
      for (const containerName of ["objects", "depletedResources"]) {
        const container = tile[containerName];
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
          tile.objects ??= {};
          tile.objects[nextName] = { name: nextName };

          markTileChanged(x, y);
        }
      }
    }
  }
}
replenishResources();//run at server start to add random ores n shit
setInterval(replenishResources, 60000*180);//every 3 hours
setInterval(mapUpdate, 200);
setInterval(mapPersist, 60000);//save map every minute

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
replenishResources();

//mob testing
//create mob registry
//const mobs = new Map();
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
/*
const mushroom1 = createMob('mushroom', 42, 57);
mobs.set(mushroom1.id, mushroom1);
map.Map[57][42].mob = {
  id: mushroom1.id,
  sprite: "mushroomL"
}
*/

async function removeMobType(type) {
  for (const [id, mob] of mobs) {
    if (mob.type === type) {
      let oldSprite = {x:mob.x, y: mob.y}; 
      mobs.delete(id);
      delete map.Map[oldSprite.y][oldSprite.x].mob;
    }
  }
}

const mobSpawns = [
    {//rats south of Old Haven
        type: "rat",
        x: 35,
        y: 76,
        count: 5,
        respawnTime: 20000 // ms
    },
    {
      type: "skeleton",
      x:40, y:35,
      count: 1,
      respawnTime: 20000
    },
    {
      type: "skeleton",
      x:44, y:35,
      count: 1,
      respawnTime: 20000
    },
    {
      type: "skeleton",
      x:40, y:33,
      count: 1,
      respawnTime: 20000
    },
    {
      type: "skeleton",
      x:44, y:33,
      count: 1,
      respawnTime: 20000
    },
    {
      type: "goblin",
      x:77, y:17,
      count: 1,
      respawnTime: 30000
    },
    {
      type: "goblin",
      x:121, y:46,
      count: 1,
      respawnTime: 30000
    },
    {
      type: "goblin",
      x:70, y:36,
      count: 1,
      respawnTime: 30000
    },
    {
      type: "goblin",
      x:98, y:9,
      count: 1,
      respawnTime: 30000
    },
    {
      type: "goblin",
      x:160, y:71,
      count: 2,
      respawnTime: 30000
    },
    {
      type: "goblin",
      x:223, y:79,
      count: 4,
      respawnTime: 30000
    },
    {
        type: "rat",
        x: 229,
        y: 66,
        count: 8,
        respawnTime: 20000 // ms
    },
    //zorg mini-boss!
    {
      type: "zorg",
      x: 42,
      y: 135,
      count: 1,
      respawnTime: 30000
    }
    /*
    let testZorg = createMob('zorg', 42, 135);
mobs.set(testZorg.id, testZorg);
map.Map[135][42].mob = {
  id: testZorg.id,
  sprite: "zorgL"
}
    */
];

function countMobsByType(type) {
  let count = 0;
  for (const mob of mobs.values()) {
    if (mob.type === type) count++;
  }
  return count;
}

function spawnMob(spawn) {
    const mob = createMob(spawn.type, spawn.x, spawn.y);
    mobs.set(mob.id, mob);

    map.Map[mob.y][mob.x].mob = {
        id: mob.id,
        sprite: mob.type + "L"
    };

    mob.spawnRef = spawn; // 🔑 link back to spawn
    //for minion spawners so they don't spam
    if (mob?.spawnMinion){
      mob.spawnCount = countMobsByType(mob.spawnMinion);
    }
}

for (const spawn of mobSpawns) {
    for (let i = 0; i < spawn.count; i++) {
        spawnMob(spawn);
    }
}

function updateMob(mob, now) {
  if (now < mob.nextThink) return;
  mob.nextThink = now + mob.thinkSpeed;
  if (mob?.spawnMinion){
    spawnMinion(mob);
  }
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

function spawnMinion(mob){
  //mob.spawnMinion="minizorg";
  //mob.spawnMax=5;
  //mob.spawnCount=n; get from mob.type
  //only spawns if health below max
  //only spawns up to .spawnMax
  //for zorg, needs to count mini zorgs in mobs
  //if gets killed, spawnCount gets reset
  if (mob.hp<mob.maxHp && mob.spawnCount<mob.spawnMax){
    let testMinion = createMob(mob.spawnMinion, mob.x, mob.y);
    mobs.set(testMinion.id, testMinion);
    map.Map[mob.x][mob.y].mob = {
      id: testMinion.id,
      sprite: mob.spawnMinion+"L"
    }
    mob.spawnCount+=1;
  }
}

function findPlayerInRange(mob) {
  if (mob?.passive) return  null;
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
  for (obj in tile.objects){
    if (baseTiles[tile.objects[obj].name].collision) return true;
  }
  if (baseTiles[tile['b-t']].collision) return true;
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
    if (Date.now()>mob.lastAttack+mob.thinkSpeed){
      mob.lastAttack=Date.now();
      let damage = mob.attack;
      if (player.head!==null){
        let headName = itemById[player.head];
        damage-=Math.floor(Math.random()*baseTiles[headName].defense);
      }
      if (player.body!==null){
        let bodyName = itemById[player.body];
        damage-=Math.floor(Math.random()*baseTiles[bodyName].defense);
      }
      if (player.feet!==null){
        let feetName = itemById[player.feet];
        damage-=Math.floor(Math.random()*baseTiles[feetName].defense);
      }
      if (damage>0){
        player.hp -= damage;
        player.lastHitBy = null;
        //io.to(player.sock_id).emit('playSound', ['hit']);
        io.to(player.sock_id).emit('playSound', ['hit', 'damage']);
        io.to(player.sock_id).emit('pk message', {//global chat, user needs toggle for wanting privacy
          message: `You got hit by the ${mob.type} for ${damage} damage!`
        });
      }
    }
}

function updateMobs() {
    const now = Date.now();
    for (const mob of mobs.values()) {
        updateMob(mob, now);
    }
}

setInterval(updateMobs, 250);

async function initMurderers() {
  // Get all players who are murderers with a remaining timer
  const rows = await query(
    `SELECT player_name, x, y, hp, hpXp, swordXp, craftXp, woodcuttingXp, miningXp, murderer, murderTimer
     FROM players
     WHERE murderer = 1 AND murderTimer > 0`
  );

  if (!rows.length) {
    console.log('No active murderers to reinitialize.');
    return;
  }

  for (const result of rows) {
    const name = result.player_name;
    let p_coords;
    if (result.x == null || result.y == null) {
      p_coords = [49, 49]; // default start point
    } else {
      p_coords = [result.x, result.y];
    }
    // Calculate levels
    const hpLvl = await levelFromXp(result.hpXp);
    const swordLvl = await levelFromXp(result.swordXp);
    const craftLvl = await levelFromXp(result.craftXp);
    const woodcuttingLvl = await levelFromXp(result.woodcuttingXp);
    const miningLvl = await levelFromXp(result.miningXp);
    // Initialize player object in memory
    await initPlayer(name);
    let player = players[name];
    player.murderSprite="murderR";
    player.murderer = true;
    player.murderTimer = result.murderTimer;
    addPlayerToTile(name, p_coords[0], p_coords[1]);
    markTileChanged(p_coords[0], p_coords[1]);
    syncInventory(name);
    console.log(`Reinitialized murderer: ${name} with ${result.murderTimer}ms remaining`);
  }
}

(async () => {
  await initMurderers();
})();

const MURDER_TICK_INTERVAL = 1000; // ms (1 second)

setInterval(async () => {
  // 1. Get all active murderers
  const rows = await query(
    `
    SELECT player_name, murderTimer
    FROM players
    WHERE murderer = 1
      AND murderTimer > 0
    `
  );

  if (!rows.length) return;
  for (const player of rows) {
    const newTimer = Math.max(player.murderTimer - MURDER_TICK_INTERVAL, 0);
    // update timer
    await query(
      `
      UPDATE players
      SET murderTimer = ?
      WHERE player_name = ?
      `,
      [newTimer, player.player_name]
    );

    // if timer expired, clear murderer
    if (newTimer === 0) {
      await query(
        `
        UPDATE players
        SET murderer = 0
        WHERE player_name = ?
        `,
        [player.player_name]
      );
      players[player.player_name].murderer=false;
      players[player.player_name].murderSprite=null;
      io.emit('server message', {//global chat, user needs toggle for wanting privacy
        message: `${player.player_name} has been cleared of murder charges...`
      });
      if (players[player.player_name].sock_id===null){//they weren't logged in
        cleanupPlayer(player.player_name);
      }
    } 
  }
}, MURDER_TICK_INTERVAL);

setInterval(async () => {
  for (const name in players) {
    const player = players[name];
    handlePlayerInput(name, player.keystate);
  }
}, 20);