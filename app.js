//app stuff
const baseTiles = require('./server_base_tiles.js');
const _player = require('./player.js');
const fs = require('fs');
var map = { 
  Map: require('./blank_map.json'),//this will be the in memory map, do stuff to map.Map...
  Fxn: require('./map_fxns.js')
};

map.Fxn.save(map.Map);//just to initialize this and prove works, change later

require('dotenv').config();
const express = require('express');
const session = require('express-session');
const http = require('http');
//const https = require('https');
const { Server } = require('socket.io');
const path = require('path');
const app = express();
//Session middleware FIRST (move this above all routes)

const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
});

app.use(sessionMiddleware);

const server = http.createServer(app);
//https.createServer({ key, cert }, app);
const io = new Server(server);

//const mysql = require('mysql');
const db = require('./db.js');
const querystring = require('querystring');
app.use(express.urlencoded({ extended: true }));

// Serve static files from /public
app.use(express.static(path.join(__dirname, 'public')));

// Serve game files securely after successful login
app.use('/game', (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/?error=403');
  }
  next();
}, express.static(path.join(__dirname, 'game')));

// Handle login POST from your HTML form
app.post('/login', (req, res) => {
  const { name, pass } = req.body;
  queryPassword(
    name,
    pass,
    () => {
      setActive(name, 1);//putting this here might resolve login server crash bug
      req.session.user = name; // store user in session
      res.redirect('/game/game.html');   // redirect after success
    },
    () => {
      return res.redirect('/?error=401incorrect_password');
    }
  );
});

// Query password function
function queryPassword(name, pass, onSuccess, onFail) {
  const sql = "SELECT * FROM players WHERE player_name = ?";
  db.query(sql, [name], function (err, result) {
    if (err) {
      console.error(err.message);
      return onFail();
    }

    if (!result || result.length === 0) {
      console.log("New player!");
      addPlayer(name, pass, onSuccess);
      setActive(name, 1);
      return;
    }

    const actual_pass = result[0].pass;
    if (checkPassword(pass, actual_pass)) {
      return onSuccess();
    } else {
      console.log("Wrong password!");
      return onFail();
    }
  });
}

var players = {

  /*
  example:
    "playerName": {
      coords: p_coords,
      sock_id: null,//add at io.connection part
      sprite: "ghostR",
      lastInput: Date.now(),
      add more stuff as needed, put it here for reference if changes
    }
  */

};

function setActive(name, active){
  const sql = "UPDATE players SET active = ? WHERE player_name = ?";
  db.query(
    sql,
    [active, name],
    (err) => {
      if (err) {
        console.error(err.message);
        return;
      }
      console.log(`${name} active value set to ${active}`);
    }
  );
  if (active==0){
    cleanupPlayer(name);
  } else {
      initPlayer(name);
  }
}

function initPlayer(name){//maybe make a player template for easier changes
                          //can put that in player.js or something
  //if this doesn't finish before player is added to players list, there will be a no coords error
  //pull player x and y coord from db and put it in an array
  let p_coords;
  db.query("SELECT JSON_ARRAY(x, y) AS coords FROM players WHERE player_name = ?;", [name], (err, result) => {
    if (err) {
      console.error(err.message);
      return;
    }
    p_coords = JSON.parse(result[0].coords);
    console.log(p_coords);
    players[name] = {
    coords: p_coords,
    sock_id: null,//add at io.connection part
    sprite: "ghostR",
    lastInput: Date.now(),
    lastMove: Date.now(),
    typing: {"state": false, "lastSpot":{x:0, y:0}},
    lastChunk: null,//last chunk of map received by client, hopefully works
    lastChunkSum: null
    };
    map.Map[p_coords[1]][p_coords[0]].data.players[name] = {
      sprite: players[name].sprite
    }
    markTileChanged(p_coords[0], p_coords[1]);
  });
}

function cleanupPlayer(name){
  console.log("cleaning up disc'd player");
  //remove sprite from tile
  delete map.Map[players[name].coords[1]][players[name].coords[0]].data.players[name];
  markTileChanged(players[name].coords[0], players[name].coords[1]);
  //save players coords to database
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
  delete players[name];
}

// Add player
function addPlayer(name, pass, callback) {
  db.query("INSERT INTO players (player_name, pass, x, y) VALUES (?, ?, ?, ?)", [name, pass, 49, 49], (err) => {
    if (err) {
      console.error(err.message);
      return;
    }
    console.log("Player added:", name);
    callback();
  });
}
// Simple password check (replace with hashing in production)
function checkPassword(input, actual) {
  return input === actual;
}

function addToMap(name, x, y){//this for map building
  map.Map[y][x].data.objects[name] = {"name":name};
  markTileChanged(x, y);
  console.log(map.Map[y][x].data.objects);
}

function mapUpdate() {
  if (Object.keys(players).length === 0) return;

  for (const p in players) {
    const player = players[p];

    io.to(players[p].sock_id).emit('playerState', {
        x: player.coords[0],
        y: player.coords[1]
    });
    if (!player.sock_id) continue;

    // Generate the chunk for this player
    const chunk = map.Fxn.chunk(player.coords);

    // Compute sum of versions for the new chunk
    let newSum = 0;
    for (const row of chunk) {
      for (const [x, y] of row) {
        //const tile = map.Map[y]?.[x];
        //if (tile) newSum += tile.data.version;
        newSum += map.Map[y][x].data.version;
      }
    }

    // Compare to previous sum
    //console.log(`${player.lastChunkSum}:${newSum}`);
    if (player.lastChunkSum === newSum) {
      continue; // nothing changed → skip
    }

    // Store the new sum for next tick
    player.lastChunkSum = newSum;

    // Generate and send the live chunk
    const liveChunk = generateLiveChunk(chunk);
    player.lastChunk = liveChunk;
    io.to(player.sock_id).emit('updateChunk', liveChunk);
  }
}

function markTileChanged(x, y){
  map.Map[y][x].data.version++;
  console.log(`${x}, ${y} changed`);
}

function generateLiveChunk(player_chunk){
  const chunkObjects = [];

  for (let row of player_chunk) {
    const objectRow = [];
    for (let [x, y] of row) {
      // Access the map object from your global 'map' variable
      if (map.Map[y] && map.Map[y][x]) {
        objectRow.push(map.Map[y][x]);
      } else {
        objectRow.push(null); // or skip if you prefer
      }
    }
    chunkObjects.push(objectRow);
  }

  return chunkObjects;
}

function handlePlayerInput(name, data){
  if (Date.now()>players[name].lastInput+25){
    players[name].lastInput=Date.now();
    movePlayer(name, data);
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
      switch (dir){
        case 'up':
          modCoords = [pCoords[0], pCoords[1] - 1];
          if (checkCollision(modCoords)) return;
          break;
        case 'down':
          modCoords = [pCoords[0], pCoords[1] + 1];
          if (checkCollision(modCoords)) return;
          break;
        case 'left':
          players[name].sprite="ghostL";
          modCoords = [pCoords[0] - 1, pCoords[1]];
          if (checkCollision(modCoords)) return;
          break;
        case 'right':
          players[name].sprite="ghostR";
          modCoords = [pCoords[0] + 1, pCoords[1]];
          if (checkCollision(modCoords)) return;
          break;
      }
      delete map.Map[players[name].coords[1]][players[name].coords[0]].data.players[name];
      markTileChanged(players[name].coords[0], players[name].coords[1]);
      players[name].coords = modCoords;
      //change to function addPlayerToTile();
      map.Map[modCoords[1]][modCoords[0]].data.players[name] = {
        sprite : players[name].sprite
      }
      markTileChanged(players[name].coords[0], players[name].coords[1]);
    }
  });
}

function checkCollision(coords){
  //coords[0],[1]
  if (coords[0]<10 || coords[0]>90){
    return true;
  }
  if (coords[1]<10 || coords[1]>90){
    return true;
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
      return true;
    }
  }
  return false; 
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

//I think this is where the error is when a login crashes server
//need to have client set up before sockets? idk
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.user}`);
  players[socket.user].sock_id = socket.id;//this work?
  console.log(`Added id: ${socket.user} : ${players[socket.user].sock_id}`);
  Object.entries(players).forEach(([playerName, playerData]) => {
    console.log('Player:', playerName, 'ID:', playerData.sock_id);
  });
  io.emit('server message', {
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

  socket.on('paint', data => {
    console.log(data.c);
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

  socket.on('saveMap', () => {
    map.Fxn.save(map.Map);
  })

  socket.on('disconnect', () => {
    console.log(`User logged out: ${socket.user}`);
    setActive(socket.user, 0);
    socket.request.session.destroy();
    io.emit('server message', {
      message: `${socket.user} logged out...`
    });
  });
});

//really we need a global interval for all game synapses?
setInterval(mapUpdate, 200);

const PORT = process.env.PORT || 3000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});