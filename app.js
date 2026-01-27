var devMode = false;//or if Admin in code
var noCollision = false;

const baseTiles = require('./server_base_tiles.js');
const fs = require('fs');
var map = { 
  Map: require('./blank_map.json'),
  Fxn: require('./map_fxns.js')
};

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

function setActive(name, active) {
  return query(
    "UPDATE players SET active = ? WHERE player_name = ?",
    [active, name]
  );
}

async function initPlayer(name) {
  const sql = "SELECT JSON_ARRAY(x, y) AS coords FROM players WHERE player_name = ?";
  const params = [name];
  const result = await query(sql, params);
  let p_coords;
  if (!result.length || !result[0].coords) {
    p_coords = [49, 49];//or default start point of game
  } else {
    p_coords = JSON.parse(result[0].coords);
  }
  console.log("Player coords:", p_coords);
  players[name] = {// Initialize player object
    coords: p_coords,
    lastCoords: p_coords,//gets set in compartChunks
    sock_id: null, //to be set in io.connection
    sprite: "ghostR",
    facing: 'right',
    lastInput: Date.now(),
    lastMove: Date.now(),
    lastDir: "right",//not using yet
    typing: { state: false, lastSpot: { x: 0, y: 0 } },
    lastChunk: null,
    lastChunkSum: null,
    lastChunkKey: null,
    activeInventory: 0,
    inventory: [],//activeInventory used for position here
    hand: null,
    lastGather: Date.now(),

  };
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

async function dbPlayerCoords(name) {
  const sql = `UPDATE players SET x = ?, y = ? WHERE player_name = ?`;
  const params = [players[name].coords[0], players[name].coords[1], name];
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

async function addItem(playerName, itemId, amount) {
  const sql = `
    INSERT INTO inventories (player_name, id, amount)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE amount = amount + VALUES(amount)
  `;
  await query(sql, [playerName, itemId, amount]);
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
  }
  markTileChanged(x, y);
}

async function markTileChanged(x, y){
  map.Map[y][x].data.version++;
}
/*
function addToMap(name, x, y) {
  const tile = map.Map[y][x];
  const type = baseTiles[name].container;
  tile.data ??= {};
  tile.data[type] ??= {};
  tile.data[type][name] = { name };
  console.log(`tile data: ${tile.data[type]}`);
  markTileChanged(x, y);
}
*/
function addToMap(name, x, y) {
  const tile = map.Map[y]?.[x];
  if (!tile) {
    console.error(`Tile at (${x},${y}) does not exist`);
    return;
  }

  tile.data ??= {};

  const type = baseTiles[name]?.container;
  if (!type) {
    console.error(`Tile ${name} does not have a container`);
    return;
  }

  if (type === "base-tile") {
    // Replace the existing base-tile string
    tile.data["base-tile"] = name;
  } else {
    // Ensure the container object exists for objects or roof
    tile.data[type] ??= {};
    tile.data[type][name] = { name };
  }

  console.log(`Placed ${name} in ${type} at (${x},${y})`);
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
  markTileChanged(x, y);
  console.log(map.Map[y][x].data.objects);
}

function emitPlayerState(player){
      io.to(player.sock_id).emit('playerState', {//might remove this/put somewhere else
        x: player.coords[0],
        y: player.coords[1],
        hand: player.hand,
        facing: player.facing
    });
}

function mapUpdate() {
  if (Object.keys(players).length === 0) return;

  for (const p in players) {
    const player = players[p];
    if (!player.sock_id) continue;
    emitPlayerState(player);
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
    return;
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
    return true;
  }
  if (baseTiles[map.Map[coords[1]][coords[0]].data['base-tile']].collision===true){
    return true;
  }
  for (obj in map.Map[coords[1]][coords[0]].data.objects){
    if (baseTiles[map.Map[coords[1]][coords[0]].data.objects[obj].name].collision === true) {
      let objName = map.Map[coords[1]][coords[0]].data.objects[obj].name
      checkObjectCollision(name, coords, objName);
      return true;
    }
  }
  return false; 
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

  // ---------- special interactable objects ----------
  if (objDef.kind === "objects" || objDef.kind === "interactable") {
    checkInteract(playerName, objName);
  }
}

function checkInteract(name, objName){
  if (objName==='craftTable'){
    io.to(players[name].sock_id).emit('crafting');//opens up crafting for player
  }
  if (objName==='forge'){
    smeltOre(name);//tries to smelt whatever player has selected in inventory
  }
  if (objName==='bankchest'){
    playerBank(name);
  }
}

async function resourceInteract(playerName, coords, objName) {
  const player = players[playerName];

  // gather cooldown
  if (Date.now() < player.lastGather + 1000) return;
  player.lastGather = Date.now();

  const objDef = baseTiles[objName];
  if (!objDef || objDef.kind !== "resource") return;

  /* ---------- drops ---------- */
  if (objDef.drops) {
    for (const [itemName, amount] of Object.entries(objDef.drops)) {
      const itemId = idByItem(itemName);
      if (itemId) await addItem(playerName, itemId, amount);
    }
    await syncInventory(playerName);
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
      .players[playerName].hand = null;
  } else {
    player[slot] = id;
    map.Map[player.coords[1]][player.coords[0]]
      .players[playerName].hand = id;
  }

  emitPlayerState(player);
  markTileChanged(player.coords[0], player.coords[1]);
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
const dropName = baseTiles[baseName]?.dropChange ?? baseName; // use dropChange if it exists

map.Map[player.coords[1]][player.coords[0]].data.objects[dropName] = { name: dropName };
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

function playerBank(){
  //open bank on player end, send view of all items in bank
  //other fxn only lets player bank something if on bank
  //just like forge or craftTable
  //get bank select position for when removing items
  //get inv select position for when adding items
  //all this happens on front end
  //player tries to open bank from client, popup with no items
  //and server knows items cant be placed or removed
  //so this fxn just io.to(players[name].sock_id).emit('openbank', data);
  //data being the inventory
  //and when player puts in an item, takes out an item, or changes selected
  //cell in bank, it sends to the server so it has that data
  //server only sends updated bank if item in or out
  //client needs option for single item in/out or input for amt of item in/out
  console.log("player opening bank");
}

function replenishResources() {
  for (let y = 0; y < map.Map.length; y++) {
    for (let x = 0; x < map.Map[y].length; x++) {
      const tile = map.Map[y][x];

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
setInterval(replenishResources, 60000);//every 30 minutes
setInterval(mapUpdate, 200);
setInterval(mapPersist, 60000);//save map every minute

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
replenishResources();