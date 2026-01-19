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
var noCollision = false;//TURN OFF WHEN PUSHING TO GITHUB
const PORT = process.env.PORT || 3000;

//Serve static files from /public
app.use(express.static(path.join(__dirname, 'public')));

//Serve game files securely after successful login
app.use('/game', (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/?error=403');
  }
  next();
}, express.static(path.join(__dirname, 'game')));

// Handle login POST from your HTML form
app.post('/login', async (req, res) => {
  const { name, pass } = req.body;
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

function query(sql, params = []) {//apply this to other bits in code
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
}

async function queryPassword(name, pass) {
  const sql = "SELECT * FROM players WHERE player_name = ?";

  const result = await query(sql, [name]);

  // New player
  if (!result || result.length === 0) {
    console.log("New player!");

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
  map.Map[p_coords[1]][p_coords[0]].data.players[name] = {
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
  delete map.Map[players[name].coords[1]][players[name].coords[0]].data.players[name];
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
  console.log(`inventory: ${inventory}`)
}

// Add player
function addPlayer(name, pass) {
  db.query("INSERT INTO players (player_name, pass, x, y) VALUES (?, ?, ?, ?)", [name, pass, 49, 49], (err) => {
    if (err) {
      console.error(err.message);
      return;
    }
    console.log("Player added:", name);
  });
  db.query("INSERT IGNORE INTO inventories (player_name, id, amount) SELECT player_name, 1, 1 FROM players;", [name], (err) => {
    if (err){
      console.error(err.message);
      return;
    }
  })
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
    dbPlayerCoords(p);
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
    if (data==='e'){
      //layTile
    }
  }
}

//move this to another file?
let itemId = {
  1: "axeItem",
  2: "log"
}
//and this in same other file lol
let equipabbleItems = {
  "axeItem": {
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
  //emitPlayerState(players[name]);
  //markTileChanged(players[name].coords[0], players[name].coords[1]);
  let player = players[name];
  console.log(`id in equip fxn: ${id}`);
  let itemSlot = equipabbleItems[itemId[players[name].inventory[players[name].activeInventory].id]].slot;
  console.log(`itemSlot: ${itemSlot}`);
  let holding = "unequipped";
  if (players[name][itemSlot] === id){
    players[name][itemSlot] = null;
    map.Map[player.coords[1]][player.coords[0]].data.players[name].hand=null;
  } else {
    players[name][itemSlot] = id;
    holding = "equipped";
    map.Map[player.coords[1]][player.coords[0]].data.players[name].hand=id;
  }
  console.log(`${name} has ${holding} ${itemId[players[name].inventory[players[name].activeInventory].id]} in ${itemSlot}`);
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
      delete map.Map[players[name].coords[1]][players[name].coords[0]].data.players[name];
      markTileChanged(players[name].coords[0], players[name].coords[1]);
      players[name].coords = modCoords;
      //change to function addPlayerToTile();
      map.Map[modCoords[1]][modCoords[0]].data.players[name] = {
        sprite : players[name].sprite,
        facing : players[name].facing,
        hand: players[name].hand,//then everygthing else
      }
      markTileChanged(players[name].coords[0], players[name].coords[1]);
    }
  });
}

function checkCollision(name, coords){
  //coords[0],[1]
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
  "tree" : 1//log
}

var axeInteracts = [//this can go in another file
  'tree0',//all different trees/wood stuff here
  'tree1',
  'tree2',
  'tree3',
  'axeItem'//put all different axes here
]

var itemInteracts = [
  axeInteracts
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
  let resourceId = resources[newObjName]+1;//because itemId's doesn't start with 0
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
  })

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
    console.log(data);
    let x = players[socket.user].coords[0];
    let y = players[socket.user].coords[1]
    addToMap(data, x, y);//addToMap then discerns what it is
  });

  socket.on("clearTile", data => {
    console.log(data);
    let x = players[socket.user].coords[0];
    let y = players[socket.user].coords[1]
    clearTile(x, y);
  });

  socket.on('saveMap', () => {
    map.Fxn.save(map.Map);
  });

  socket.on("getInventory", async () => {
    console.log("playerName on socket:", socket.user);
    const name = socket.user;
    await syncInventory(name);
  });

  socket.on("downloadMap", () => {
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
setInterval(mapUpdate, 200);
setInterval(mapPersist, 60000);//save map every minute

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});