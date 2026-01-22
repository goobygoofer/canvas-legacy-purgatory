//TURN THIS THE FUCK OFF BEFORE SHIPPING LOL
var devMode = false;//might not need this here (yet)
var noCollision = false;//TURN OFF WHEN PUSHING TO GITHUB
//app stuff
const baseTiles = require('./server_base_tiles.js');
const _player = require('./player.js');
const fs = require('fs');
var map = { 
  Map: require('./blank_map.json'),//this will be the in memory map, do stuff to map.Map...
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

//GLOBAL VARS
var players = {};
const PORT = process.env.PORT || 3000;

//Serve static files from /public
app.use(express.static(path.join(__dirname, 'public')));

//Serve game files securely after successful login
app.use('/game', (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/?error=403GET_OUT_OF_HERE');
  }
  next();
}, express.static(path.join(__dirname, 'game')));

// Handle login POST from your HTML form
app.post('/login', async (req, res) => {
  const { name, pass } = req.body;
  if (name.length>30 || pass.length>99){
    res.redirect('/?please_dont_do_that');
    return;
  }
  try {
    await queryPassword(name, pass);
    await setActive(name, 1); // make sure this is also promise-based
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
  console.log("queryPassword start");
  if (name.length>30 || pass.length > 99) return;
  console.log("got past name and pass length");
  const sql = "SELECT * FROM players WHERE player_name = ?";

  const result = await query(sql, [name]);

  // New player
  console.log(`result ${result}`);
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
  const result = await new Promise((resolve, reject) => {
    db.query(sql, [name], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });

  let p_coords;
  if (!result.length || !result[0].coords) {
    // No player found yet, set default coordinates (this may change)
    p_coords = [49, 49];
  } else {
    p_coords = JSON.parse(result[0].coords);
  }

  console.log("Player coords:", p_coords);

  // Initialize player object
  players[name] = {
    coords: p_coords,
    sock_id: null, // to be set in io.connection
    sprite: "ghostR",
    facing: 'right',
    lastInput: Date.now(),
    lastMove: Date.now(),
    typing: { state: false, lastSpot: { x: 0, y: 0 } },
    lastChunk: null,
    lastChunkSum: null,
    lastChunkKey: null,
    activeInventory: 0,
    inventory: [],//activeInventory used for position here
    hand: null,//test axe item for now, needs to be sent in playerData, also saved to db
    lastGather: Date.now()
  };
  map.Map[p_coords[1]][p_coords[0]].players[name] = {
    sprite: players[name].sprite,
    facing: players[name].facing,
    hand: players[name].hand
  };
  markTileChanged(p_coords[0], p_coords[1]);
  syncInventory(name);
}

function cleanupPlayer(name){
  console.log("cleaning up disc'd player");
  //remove sprite from tile
  delete map.Map[players[name].coords[1]][players[name].coords[0]].players[name];
  markTileChanged(players[name].coords[0], players[name].coords[1]);
  //save players coords to database
  dbPlayerCoords(name);
  delete players[name];
}

function dbPlayerCoords(name) {
  const sql = `UPDATE players SET x = ?, y = ? WHERE player_name = ?`;
  db.query(sql, [players[name].coords[0], players[name].coords[1], name], (err, result) => {
    if (err) {
      console.error('Error updating player position:', err);
      return;
    }
    if (result.affectedRows === 0) {
      console.warn(`No player found with name: ${name}`);
      return;
    }
  });
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
  console.log(`amount: ${amount}`);
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
  console.log(`inventory: ${inventory}`)
}

async function addPlayerToDb(name, pass){
  console.log("trying to addPlayerToDb");
  db.query("INSERT INTO players (player_name, pass, x, y) VALUES (?, ?, ?, ?)", [name, pass, 49, 49], (err) => {
    if (err) {
      console.error(err.message);
      return;
    }
    console.log("Player added:", name);
  });
}

// Add player
/*
async function addPlayer(name, pass) {
  //await addPlayerToDb(name, pass);
  db.query("INSERT INTO players (player_name, pass, x, y) VALUES (?, ?, ?, ?)", [name, pass, 49, 49], (err) => {
    if (err) {
      console.error(err.message);
      return;
    }
    console.log("Player added:", name);
  });
  db.query("INSERT IGNORE INTO inventories (player_name, id, amount) SELECT player_name, 1, 1 FROM players;", [name], (err) => {
    console.log("doesn't seem like this is working");
    if (err){
      console.error(err.message);
      return;
    }
  })
  //await addItem(name, 1, 1);
  syncInventory(name);
}
  */
async function addPlayer(name, pass) {
  console.log("addPlayer fxn");
  await addPlayerToDb(name, pass);
  /*
  await query(
    "INSERT INTO players (player_name, pass, x, y) VALUES (?, ?, ?, ?)",
    [name, pass, 49, 49]
  );
  */
 /*
  await query(
    `INSERT IGNORE INTO inventories (player_name, id, amount)
     VALUES (?, 1, 1)`,
    [name]
  );
  */

  await syncInventory(name);
  await addItem(name, 1, 1);
  await syncInventory(name);

  console.log("Player added:", name);
}
//replace with hashing
function checkPassword(input, actual) {
  return input === actual;
}

function mapPersist(){
  map.Fxn.persist(map.Map);
  //loop through active players and save their coords to db
  for (p in players){
    console.log(`${p}'s coords saved...`);
    addPlayerToTile(p)//cause they got took off lol
    dbPlayerCoords(p);
  }
}

var depletedList = [
  'tree4',
  'rock4'
]

function replenishResources(){
  for (y in map.Map){
    for (x in map.Map[y]){//change >> object name minus last char, to 0
                          //this implies natural resources go 0 to 4 (or more)
      for (i in depletedList){
        if (map.Map[y][x].data.objects[depletedList[i]]) {
          removeObjFromMap(x, y);
          //cut last char, add '0'
          let newName = depletedList[i].slice(0, -1) + '0';
          map.Map[y][x].data.objects[newName] = { "name": newName };
          markTileChanged(x, y);
        }
      }

    }
  }
}

function addToMap(name, x, y){//this for map building
  map.Map[y][x].data.objects[name] = {"name":name};
  markTileChanged(x, y);
  console.log(map.Map[y][x].data.objects);
}

function clearTile(x, y){//this for map building
  map.Map[y][x].data['base-tile']="grass";
  map.Map[y][x].data['collision']=false;
  map.Map[y][x].data.objects = {};
  markTileChanged(x, y);
  console.log(map.Map[y][x].data.objects);
}
/*
                "base-tile": "water",
                "collision": false,
                "players": {},
                "objects": {},
                "typing": false,
                "version": 0,
*/

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
    /*
    io.to(players[p].sock_id).emit('playerState', {//might remove this/put somewhere else
        x: player.coords[0],
        y: player.coords[1],
    });
    */
    const chunk = map.Fxn.chunk(player.coords);
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
    io.to(player.sock_id).emit('updateChunk', generateLiveChunk(chunk));
  }
}

async function markTileChanged(x, y){
  map.Map[y][x].data.version++;
  console.log(`${x}, ${y} changed`);
}

//this had to stay here because map_fxns.js doesn't have map
//would be nice to have this in map_fxns
function generateLiveChunk(player_chunk){
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

  return chunkObjects;
}


function handlePlayerInput(name, data){
  const directions = ['up', 'down', 'left', 'right'];
  if (Date.now()>players[name].lastInput+25){
    players[name].lastInput=Date.now();
    //check if move, use, etc
    if (data['up'] || data['down'] || data['left'] || data['right']){//jesus christ
      movePlayer(name, data);
    }
    if (data===' '){
      useItem(name);
    }
  }
}

//move this to another file?
let itemId = {
  1: "axe",
  2: "log",
  3: "pickaxe",
  4: "rock",
  5: "stoneSword"
}

let idItem = {
  "axe": 1,
  "log":2,
  "pickaxe":3,
  "rock":4,
  "stoneSword":5
}
//and this in same other file lol
let equipabbleItems = {
  "axe": {
    slot: "hand"
  },
  "pickaxe": {
    slot: "hand"
  },
  "stoneSword": {
    slot: "hand"
  }
};
//consumableItems, activateItems etc...

function useItem(name){
  let player = players[name];
  if (player.activeInventory+1 > player.inventory.length || player.activeInventory<0){
    return;//might've tried to use an empty inv spot
  }
  console.log(`${name} trying to use active item ${players[name].activeInventory}`);
  console.log(`Using ${itemId[players[name].inventory[players[name].activeInventory].id]}`);
  //equip, activate, etc
  if (equipabbleItems[itemId[players[name].inventory[players[name].activeInventory].id]]){
    equip(name, players[name].inventory[players[name].activeInventory].id);
  }
}

function equip(name, id){
  let player = players[name];
  let itemSlot = equipabbleItems[itemId[players[name].inventory[players[name].activeInventory].id]].slot;
  let holding = "unequipped";
  if (players[name][itemSlot] === id){
    players[name][itemSlot] = null;
    map.Map[player.coords[1]][player.coords[0]].players[name].hand=null;
  } else {
    players[name][itemSlot] = id;
    holding = "equipped";
    map.Map[player.coords[1]][player.coords[0]].players[name].hand=id;
  }
  emitPlayerState(players[name]);//might not need these?
  markTileChanged(players[name].coords[0], players[name].coords[1]);
  console.log(`hand: ${players[name].hand}`);
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

      //get new coordinates
      const [dx, dy] = dirOffsets[dir];
      modCoords = [pCoords[0] + dx, pCoords[1] + dy];
      if (checkCollision(name, modCoords)) return;//tile/obj/player interaction here?

      //update sprite if left/right
      if (spriteMap[dir]){
        players[name].sprite = spriteMap[dir];
        players[name].facing = dir;
      }
      //delete old sprite (why doesn't this work on logout/timeout sometimes?)
      delete map.Map[players[name].coords[1]][players[name].coords[0]].players[name];
      markTileChanged(players[name].coords[0], players[name].coords[1]);
      players[name].coords = modCoords;
      //change to function addPlayerToTile();
      addPlayerToTile(name, modCoords[0], modCoords[1]);
      /*
      map.Map[modCoords[1]][modCoords[0]].players[name] = {
        sprite : players[name].sprite,
        facing : players[name].facing,
        hand: players[name].hand,//then everygthing else
      }
      */
      markTileChanged(players[name].coords[0], players[name].coords[1]);
    }
  });
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
    hand: players[name].hand,//then everygthing else
  }
  markTileChanged(x, y);
}

function checkCollision(name, coords){
  if (coords[0]<10 || coords[0]>90){//FIX THIS. be able to use whole tilemap
    return true;
  }
  if (coords[1]<10 || coords[1]>90){
    return true;
  }
  if (noCollision){//TURN OFF OR TAKE OUT FOR CLIENT
    markTileChanged(coords[0], coords[1]);
    return false;
  }
  if (map.Map[coords[1]][coords[0]].data.collision){
    return true;
  }
  //check base-tile on potential tile
  if (baseTiles[map.Map[coords[1]][coords[0]].data['base-tile']].collision===true){
    return true;
  }
  //check objects on potential tile
  //come back to this when tiles have an object key
  for (obj in map.Map[coords[1]][coords[0]].data.objects){
        if (baseTiles[map.Map[coords[1]][coords[0]].data.objects[obj].name].collision===true){
        let objName = map.Map[coords[1]][coords[0]].data.objects[obj].name
        checkObjectCollision(name, coords, objName);
        return true;
      }
  }
  return false; 
}

var resources = {
  "tree" : 2,//log
  "log" : 2,
  "pickaxe": 3,
  "rock": 4,
  "stoneSword": 5
}

var axeInteracts = [//this can go in another file
  'tree0',//all different trees/wood stuff here
  'tree1',
  'tree2',
  'tree3',
  'axe'//put all different axes here
]

var pickaxeInteracts = [
  'rock0',
  'rock1',
  'rock2',
  'rock3',
  'pickaxe'//all diff pickaxes here
]

var itemInteracts = [
  axeInteracts,
  pickaxeInteracts
]

async function checkObjectCollision(name, coords, objName){
  let player = players[name];
  for (interact in itemInteracts){
    let list = itemInteracts[interact];
    if (list.includes(itemId[player.hand]) && list.includes(objName)){
      await resourceInteract(name, coords, objName);
    }
  }
}

//need function to replenish natural resources every so often (24 hrs?)
async function resourceInteract(name, coords, objName){
  if (Date.now() < players[name].lastGather+1000){//account for respective lvl (wc, mining etc)
    return;
  }
  players[name].lastGather=Date.now();
  let newObjName = objName.slice(0, -1);//cut off last char
  let resourceId = resources[newObjName];//because itemId's doesn't start with 0
  await addItem(name, resourceId, 1);//need dynamic id, log, rock, etc
  await syncInventory(name);
  let newNum = Number(objName[objName.length-1])+1;//this prob really fucking bad lol
  newObjName+=newNum;//this makes tree1, tree 2, rock1, rock2, etc
  delete map.Map[coords[1]][coords[0]].data.objects[objName];
  map.Map[coords[1]][coords[0]].data.objects[newObjName] = {
    name: newObjName
  }
  await markTileChanged(coords[0], coords[1]);
}

async function dropItem(name, item){
  let player = players[name];
  try {
    if (itemId[player.inventory[item].id]==="axe"){
      return;//take this out when get axe on death or whatever
    }
  } catch(err){
    return;
  }
  if (itemId[player.inventory[item].id]==="axe"){
    return;//take this out when get axe on death or whatever
  }
  //data is activeInvItem
  console.log(item);
  console.log(`dropping ${itemId[players[name].inventory[item].id]}`);
  if (Object.keys(map.Map[player.coords[1]][player.coords[0]].data.objects).length!==0){
    return;//only one object on tile
  }
  map.Map[player.coords[1]][player.coords[0]].data.objects[itemId[player.inventory[item].id]] = {"name": itemId[player.inventory[item].id]};
  await removeItem(name, players[name].inventory[item].id, 1);
  markTileChanged(player.coords[0], player.coords[1]);
  await syncInventory(name);
}

var dropItems = [//also has to go in resources with it's id? that's kinda messy
  'axe',
  'log',
  'pickaxe',
  'rock',
  'stoneSword'
]

var interactItems = [
  'craftTable'
]

async function pickUpItem(name){
  let player = players[name];
  let mapObjects = map.Map[player.coords[1]][player.coords[0]].data.objects;
  if (Object.keys(mapObjects).length===0){
    return;
  }
  let id = resources[Object.keys(mapObjects)[0]];
  if (dropItems.includes(itemId[id])){
    await removeObjFromMap(player.coords);
    markTileChanged(player.coords[0], player.coords[1]);
    await addItem(name, id, 1);
    await syncInventory(name);
    return;
  }
  if (interactItems.includes(Object.keys(mapObjects)[0])){
    checkInteract(name, Object.keys(mapObjects)[0]);
  }
}

function checkInteract(name, objName){
  //check surrounding tiles for something to interact with (bank, crafttable etc)
  console.log(`checking interaction with ${objName}`);
  if (objName==='craftTable'){
    console.log("player interacting with craftTable");
    //when actually trying to craft something, will check if craftTable still there hehe
    io.to(players[name].sock_id).emit('crafting');//opens up crafting for player
  }
}

async function craftItem(name, item) {
  if (item===null) return;
  const coords = players[name].coords;
  const tileObjects = map.Map[coords[1]][coords[0]].data.objects;

  if (!tileObjects['craftTable']) {
    console.log("no longer at crafting table");
    return;
  }
  console.log(`attempting to craft ${item}`);

  // Check if player has enough materials
  for (const material in craftItems[item]) {
    console.log(`material: ${material}`);
    const materialId = idItem[material];          // lookup correct material
    const requiredAmount = craftItems[item][material];
    console.log(`reqdAmount: ${craftItems[item][material]}`)
    console.log(`materialId: ${materialId}`)
    const playerAmount = await getItemAmount(name, materialId);

    console.log(`Checking ${material} (id ${materialId}): have ${playerAmount}, need ${requiredAmount}`);

    if (playerAmount < requiredAmount) {
      console.log(`Not enough ${material}`);
      return;
    }
  }

  console.log("had enough items");

  // Remove materials
  for (const material in craftItems[item]) {
    const materialId = idItem[material];
    const removeAmount = craftItems[item][material];
    console.log(`Removing ${removeAmount} of ${material} (id ${materialId})`);
    await removeItem(name, materialId, removeAmount);
  }

  // Add crafted item
  await addItem(name, idItem[item], 1);
  console.log("got past addItem");

  await syncInventory(name);
}

var craftItems = {
  "pickaxe": {"log":5},
  "stoneSword": {"log":1, "rock":2}
}

async function removeObjFromMap(coords){
  map.Map[coords[1]][coords[0]].data.objects = {}
}

// Socket.IO connection handler
io.use((socket, next) => {
  sessionMiddleware(socket.request, {}, next);
});
io.use((socket, next) => {
  const session = socket.request.session;

  if (!session || !session.user) {
    return next(new Error("Unauthorized"));
  }

  socket.user = session.user; // attach user to socket
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
      console.log(`${socket.user} is typing...`);
    }
    players[socket.user].typing.state=true;
    players[socket.user].typing.lastSpot.y=players[socket.user].coords[1];
    players[socket.user].typing.lastSpot.x=players[socket.user].coords[0];
    //add chat bubble to map
    map.Map[players[socket.user].coords[1]][players[socket.user].coords[0]].data.typing=true;
    markTileChanged(players[socket.user].coords[0],players[socket.user].coords[1]);
  });

  socket.on('stopTyping', () => {
    players[socket.user].typing.state=false;
    console.log(`${socket.user} stopped typing.`);
    //remove chat bubble from map
    map.Map[players[socket.user].typing.lastSpot.y][players[socket.user].typing.lastSpot.x].data.typing=false;
    markTileChanged(players[socket.user].coords[0],players[socket.user].coords[1]);
  })

  socket.on('paint', data => {//client side needs to queue paint instead of sending every pixel
                              //user clicks, code waits a moment to see if another click
                              //then sends list of pixels to be painted
    //x, y, subX, subY, c (color)
    if (data.btn === "right"){
      map.Map[data.y][data.x].data.pixels[data.subY][data.subX]=-1;
    } else {
      map.Map[data.y][data.x].data.pixels[data.subY][data.subX]=data.c;
    }
    markTileChanged(data.x, data.y);//add to outside fxn
  });

  socket.on("layTile", data => {
    if (!devMode) return;
    console.log(data);
    let x = players[socket.user].coords[0];
    let y = players[socket.user].coords[1]
    addToMap(data, x, y);//addToMap then discerns what it is
  });

  socket.on("clearTile", data => {
    if (!devMode) return;
    console.log(data);
    let x = players[socket.user].coords[0];
    let y = players[socket.user].coords[1]
    clearTile(x, y);
  });

  socket.on('saveMap', () => {
    if (!devMode) return;
    map.Fxn.save(map.Map);
  });

  socket.on("getInventory", async () => {
    console.log("playerName on socket:", socket.user);
    const name = socket.user;
    await syncInventory(name);
  });

  socket.on("downloadMap", () => {
    if (!devMode) return;
    //send map.Map[0-99] to client to be stored in a variable
    //USE SPARINGLY!!!!! LOTS OF DATA!!!
    //COMMENT THIS OUT BEFORE UPDATING VPS!!!
    for (y in map.Map){
      io.to(socket.id).emit("mapDownload", map.Map[y]);
    }
  });

  socket.on('activeInvItem', async (data) => {
    //check if valid
    if (data>=0 || data<=31){
      players[socket.user].activeInventory=data;
    }
    await syncInventory(socket.user);
    console.log(`${socket.user} active item: ${players[socket.user].activeInventory}`);
  });

  socket.on('dropItem', async (data) => {
    await dropItem(socket.user, data);
    await syncInventory(socket.user);
  });

  socket.on('action', () => {
    console.log(`${socket.user} trying to pick something up...`);
    pickUpItem(socket.user);
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

//really we need a global interval for all game synapses?
setInterval(replenishResources, 60000*30);//every 30 minutes
setInterval(mapUpdate, 200);
setInterval(mapPersist, 60000);//save map every minute


server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});