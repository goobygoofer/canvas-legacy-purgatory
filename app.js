var devMode = false;//or if Admin in code
var noCollision = false;

const baseTiles = require('./server_base_tiles.js');
const fs = require('fs');
var map = { 
  Map: require('./blank_map.json'),
  Fxn: require('./map_fxns.js')
};

function exportMapForViewer(mapData) {
  if (!players['Admin']) return;
  const outputPath = path.join(__dirname, "viewer", "view_map.js");
  // IMPORTANT → match what your renderer expects
  const fileContents =
    "window.map = " + JSON.stringify(mapData, null, 2) + ";";
  fs.writeFileSync(outputPath, fileContents);
  console.log("Map exported to viewer/view_map.js");
}

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

//trade testing
let pendingTradeRequests = {};

//reset tile versions so they don't build up to ridiculous numbers
setInterval(async () => {
  for (i in map.Map){
    for (j in map.Map[i]){
      map.Map[i][j].version=0;
  }
}
}, 60*60*1000);

const { createMob, mobTypes } = require("./mobs");

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

app.use("/viewer", express.static(path.join(__dirname, "viewer")));

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

    SELECT 'Archery' AS skill, player_name, archeryXp AS xp
    FROM (
      SELECT player_name, archeryXp
      FROM players
      ORDER BY archeryXp DESC
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

    SELECT 'Fishing' AS skill, player_name, fishingXp AS xp
    FROM (
      SELECT player_name, fishingXp
      FROM players
      ORDER BY fishingXp DESC
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
      archeryXp,
      hpXp,
      woodcuttingXp,
      miningXp,
      craftXp,
      fishingXp,
      murderer,
      criminal
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
  let fishingXp = result[0].fishingXp;
  let archeryXp = result[0].archeryXp;
  let craftXp = result[0].craftXp;
  let miningXp = result[0].miningXp;
  let woodcuttingXp=result[0].woodcuttingXp;
  let murdererStatus = result[0].murderer;
  let criminalStatus = result[0].criminal;
  let hpLvl = await levelFromXp(hpXp);
  let swordLvl = await levelFromXp(swordXp);
  let archeryLvl = await levelFromXp(archeryXp);
  let craftLvl = await levelFromXp(craftXp);
  let woodcuttingLvl = await levelFromXp(woodcuttingXp);
  let miningLvl = await levelFromXp(miningXp);
  let fishingLvl = await levelFromXp(fishingXp);
  players[name] = {// Initialize player object
    coords: p_coords,
    lastCoords: p_coords,//gets set in compartChunks
    sock_id: null, //to be set in io.connection
    sprite: "ghostR",
    murderSprite: null,//not murderer
    criminalSprite: null,
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
    quiver:null,//other stuff can go here than arrows
    lastGather: Date.now(),
    hp:currHp,//change to null, get hp from db
    maxHp: 100+Math.floor(hpLvl*2),//300hp at lvl 100
    lastMelee: Date.now(),
    name: name,
    swordXpTotal: swordXp,
    archeryXpTotal: archeryXp,
    fishingXpTotal: fishingXp,
    fishingLvl: fishingLvl,
    hpXpTotal: hpXp,
    swordXp: 0,//these get written to the db every so often
    hpXp: 0,   //then set back to 0
    craftXpTotal: craftXp,
    woodcuttingXpTotal: woodcuttingXp,
    miningXpTotal: miningXp,
    swordLvl: swordLvl,
    archeryLvl: archeryLvl,
    hpLvl: hpLvl,
    craftLvl: craftLvl,
    woodcuttingLvl: woodcuttingLvl,
    miningLvl: miningLvl,
    lastState: null,
    isCrafting: false,
    lastHitBy: null,
    lastPlayerHit: null,
    murderer: murdererStatus,//by default
    murderTimer: 0,
    criminal: criminalStatus,
    criminalTimer: 0,
    tradingWith: null,
    tradeOffer : {}, // itemId -> amount
    tradeAccepted : false,
    slow: false,//like when hit by web
    slowTime: 0//set with proj.slowTime
  };
  let player = players[name];
  addPlayerToTile(name, p_coords[0], p_coords[1]);
  markTileChanged(p_coords[0], p_coords[1]);
  syncInventory(name);
}

async function cleanupPlayer(name){
  console.log("cleaning up disc'd player");
  let player = players[name];
  delete map.Map[player.coords[1]][player.coords[0]].players[name];
  markTileChanged(player.coords[0], player.coords[1]);
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
    miningXp = ?,
    archeryXp = ?,
    fishingXp = ?
    WHERE player_name = ?
  `;
  let player = players[name];
  const params = [
    player.coords[0], players[name].coords[1], 
    player.hp,
    player.swordXpTotal,
    player.hpXpTotal,
    player.craftXpTotal,
    player.woodcuttingXpTotal,
    player.miningXpTotal,
    player.archeryXpTotal,
    player.fishingXpTotal,
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
  const sql = "INSERT INTO players (player_name, pass, x, y, hp, hpXp, swordXp, craftXp, woodcuttingXp, miningXp, murderer, murderTimer, criminal, criminalTimer, fishingXp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
  const params = [name, pass, 49, 49, 100, 0, 0, 0, 0, 0, false, 0, false, 0];
  await query(sql, params);
}

async function setCriminal(playerName, isCriminal, timerMs = null) {
  // If the player becomes a murderer, criminal is cleared
  if (players[playerName]?.murderer && isCriminal) return;
  players[playerName].criminal=true;
  // Build query and params dynamically
  let sql = `UPDATE players SET criminal = ?`;
  const params = [isCriminal ? 1 : 0];

  if (timerMs !== null) {
    sql += `, criminalTimer = ?`;
    params.push(timerMs);
  }

  sql += ` WHERE player_name = ?`;
  params.push(playerName);

  await query(sql, params);

  // Update memory if player is online
  if (players[playerName]) {
    players[playerName].criminal = isCriminal;
    if (timerMs !== null) players[playerName].criminalTimer = timerMs;
  }
}

async function clearCriminal(playerName) {
  let player = players[playerName];
  player.criminal = false;
  player.criminalTimer = 0;
  player.criminalSprite=null;
  player.criminalTimer = 0;

  await query(
    "UPDATE players SET criminal = 0, criminalTimer = 0 WHERE player_name = ?",
    [playerName]
  );
}

async function setMurdererStatus(playerName, isMurderer, timerMs = null) {
  // Build query and params dynamically
  clearCriminal(playerName);
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

async function incrementCriminalTimer(playerName, ms) {
  await query(
    `
    UPDATE players
    SET criminalTimer = criminalTimer + ?
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
  let player = players[name];
  if (x===null){
    x = players[name].coords[0];
  }
  if (y===null){
    y = players[name].coords[1];
  }
  if (!map.Map[y][x]?.players){
    map.Map[y][x].players = {};
  }
  map.Map[y][x].players[name] = {
    sprite: player.sprite,
    facing: player.facing,
    hand: player.hand,//then everything else
    head: player.head,
    body: player.body,
    feet: player.feet,
    quiver: player.quiver, //prob not needed cause not visible
    murderSprite: player.murderSprite,
    criminalSprite: player.criminalSprite
  }
  markTileChanged(x, y);
}

async function markTileChanged(x, y){
  map.Map[y][x].version++;
  viewerUpdate(x, y);
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

  if (tileData.container === "b-t") {
    tile["b-t"] = name;
  }

  if (tileData.container !== "b-t") {
    const type = tileData.container;
    tile[type] ??= {};
    tile[type][name] = { name };
  }

  if (tileData.roof === true) {
    tile["roof"] ??= {};
    tile["roof"][name] = { name };
  }
  markTileChanged(x, y);
}

async function removeObjFromMap(coords){
  delete map.Map[coords[1]][coords[0]].objects;// = {}
}

function clearTile(x, y){
  let tile = map.Map[y][x];
  tile['b-t']="grass";
  delete tile.objects;
  delete tile.floor;
  delete tile.roof;
  const data = map.Map[y][x];
  if (data && data.safeTile !== undefined) {
    delete data.safeTile;
  }
  markTileChanged(x, y);
}

//if (isSafeActive(tile)) return; blocks interaction
const isSafeActive = tile => !!tile?.safeTile && Object.keys(tile.safeTile).length > 0;

async function emitPlayerState(player){
  if (player.hp<=0){
    await playerDeath(player);
  }
  if (player.sock_id!==null){
    io.to(player.sock_id).emit('playerState', {
      x: player.coords[0],
      y: player.coords[1],
      hand: player.hand,
      head: player.head,
      body: player.body,
      feet: player.feet,
      quiver: player.quiver,
      facing: player.facing,
      hp: player.hp,
      hpLvl: player.hpLvl,
      hpXpTotal: player.hpXpTotal,
      swordLvl: player.swordLvl,
      swordXpTotal: player.swordXpTotal,
      fishingXpTotal: player.fishingXpTotal,
      fishingLvl: player.fishingLvl,
      archeryLvl: player.archeryLvl,
      archeryXpTotal: player.archeryXpTotal,
      craftLvl: player.craftLvl,
      craftXpTotal: player.craftXpTotal,
      woodcuttingLvl: player.woodcuttingLvl,
      woodcuttingXpTotal: player.woodcuttingXpTotal,
      miningLvl: player.miningLvl,
      miningXpTotal: player.miningXpTotal
    });
  }
}

async function playerDeath(player){
  if (player.lastHitBy !== null) {
    sendMessage('pk message', `${player.name} was defeated by ${player.lastHitBy}!`);
    if (!player.murderer && !player.criminal) {
      sendMessage('pk message', `${player.lastHitBy} is now a murderer!`);
      await startMurdererTimer(player.lastHitBy);
    }
  }
  player.hp = player.maxHp;//change to player level max hp
  await dropPlayerLootbag(player.name, player.coords[0], player.coords[1]);
  respawnPlayer(player.name);
}

function sendSound(player, sounds=[]){
  if (sounds.length===0) return;
  io.to(player.sock_id).emit('playSound', sounds);
}

function sendMessage(type, text, player=null){
  if (player===null){
    //goes to everybody
    io.emit(type, { message: text });
    return;
  }
  //player not null, goes to a player
  io.to(player.sock_id).emit(type, { message: text });
}

async function startMurdererTimer(name){
  if (!players[name].murderer){
    setMurdererStatus(name, true, 60*30*1000);//to start, make 1 hour in milliseconds 60*60*1000    
  }
}

async function startCriminalTimer(name){
  if (!players[name].criminal){
    setCriminal(name, true, 60*15*1000);
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
  players[name].quiver=null;
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
  player.archeryLvl = await levelFromXp(player.archeryXpTotal);
  player.craftLvl = await levelFromXp(player.craftXpTotal);
  player.woodcuttingLvl = await levelFromXp(player.woodcuttingXpTotal);
  player.miningLvl = await levelFromXp(player.miningXpTotal);
  player.fishingLvl = await levelFromXp(player.fishingXpTotal);

  const currState = {
    x: player.coords[0],
    y: player.coords[1],
    hand: player.hand,
    head: player.head,
    body: player.body,
    feet: player.feet,
    quiver: player.quiver,
    facing: player.facing,
    hp: player.hp,

    hpLvl: player.hpLvl,
    hpXpTotal: player.hpXpTotal,
    swordLvl: player.swordLvl,
    swordXpTotal: player.swordXpTotal,
    fishingXpTotal: player.fishingXpTotal,
    fishingLvl: player.fishingLvl,
    archeryLvl: player.archeryLvl,
    archeryXpTotal: player.archeryXpTotal,
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

//testing for live map viewer
const viewerNamespace = io.of("/viewer");
viewerNamespace.on("connection", (socket) => {
  console.log("Viewer connected");

  // send full map once
  socket.emit("mapInit", map.Map);
});

function viewerUpdate(x, y){
  if (!players['Admin']) return;
  viewerNamespace.emit("mapUpdate", { x, y, tile: map.Map[y][x] });
}

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
  sendMessage('server message', `${socket.user} logged in...`);

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

  socket.on("acceptTrade", fromName => {
    const toName = socket.user; // the accepter

    console.log(`${toName} accepted ${fromName}'s trade...`);

    // request must exist
    if (pendingTradeRequests[toName] !== fromName) return;

    // sender must still be online
    if (!players[fromName] || players[fromName].sock_id === null) {
      delete pendingTradeRequests[toName];
      return;
    }

    // neither already trading
    if (players[toName].tradingWith || players[fromName].tradingWith) {
      delete pendingTradeRequests[toName];
      return;
    }

    // remove pending request
    delete pendingTradeRequests[toName];

    // --- CLEAR OLD TRADE DATA ---
    players[toName].tradeOffer = {};
    players[toName].tradeAccepted = false;
    players[fromName].tradeOffer = {};
    players[fromName].tradeAccepted = false;

    // create trade link
    players[toName].tradingWith = fromName;
    players[fromName].tradingWith = toName;

    // tell both clients to open UI
    io.to(players[toName].sock_id).emit("tradeStarted", { with: fromName });
    io.to(players[fromName].sock_id).emit("tradeStarted", { with: toName });
  });

  socket.on("declineTrade", fromName => {
    const toName = socket.user;

    console.log(`${toName} declined ${fromName}'s trade...`);

    // request must exist
    if (pendingTradeRequests[toName] !== fromName) return;

    delete pendingTradeRequests[toName];

    // notify sender
    if (players[fromName] && players[fromName].sock_id) {
      sendMessage('pk message', `${toName} declined to trade!`, players[fromName])
    }
  });

  socket.on("tradeAccept", () => {
    const name = socket.user;
    const other = players[name].tradingWith;
    if (!other) return;

    players[name].tradeAccepted = true;

    const bothAccepted =
      players[name].tradeAccepted &&
      players[other].tradeAccepted;

    if (!bothAccepted) {
      // update UI for both
      io.to(players[name].sock_id).emit("tradeStatus", { who: name });
      io.to(players[other].sock_id).emit("tradeStatus", { who: name });
      return;
    }

    // 🚨 BOTH ACCEPTED → DO THE SWAP
    finalizeTrade(name, other);
  });

  socket.on("tradeCancel", () => {
    const name = socket.user;
    const other = players[name].tradingWith;
    if (!other) return;

    players[name].tradingWith = null;
    players[other].tradingWith = null;
    players[name].tradeOffer = {};
    players[other].tradeOffer = {};
    players[name].tradeAccepted = false;
    players[other].tradeAccepted = false;

    io.to(players[name].sock_id).emit("tradeCanceled");
    io.to(players[other].sock_id).emit("tradeCanceled");
  });

socket.on("tradeOfferUpdate", ({ slot, amount }) => {
  console.log(`slot: ${slot}, amount: ${amount}`);
  const name = socket.user;
  const other = players[name].tradingWith;
  if (!other){
    console.log("not other");
    return;
  }

  const item = players[name].inventory[slot];
  if (!item) {
    console.log("not item");
    return;
  }

  // Use the amount the user typed, clamped between 1 and inventory amount
  const finalAmount = Math.max(1, Math.min(amount, item.amount));

  // Update the tradeOffer with the chosen amount
  if (!players[name].tradeOffer) players[name].tradeOffer = {};
  players[name].tradeOffer[slot] = {
    id: item.id,
    amount: finalAmount,
    name: item.name
  };

  players[name].tradeAccepted = false;
  players[other].tradeAccepted = false;

  sendTradeSync(name, other);
});
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
    let x; 
    let y;
    if (data.x===null || data.y === null){
      players[socket.user].coords[0];
      players[socket.user].coords[1];
    } else {
      x=data.x;
      y=data.y;
    }
    addToMap(data.tile, x, y);
  });

  socket.on("clearTile", data => {
    console.log(socket.user);
    if (!devMode && socket.user!=="Admin") return;
    console.log("clearing tile");
    //console.log(data);
    //let x = players[socket.user].coords[0];
    //let y = players[socket.user].coords[1]
    clearTile(data.x, data.y);
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
  if (!tile.objects?.bankchest) return;
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
      sendMessage('server message', `${socket.user} is afk as a murderer!`);
      //don't cleanup, keep active on server
    } else {
      console.log(`User logged out: ${socket.user}`);
      setActive(socket.user, 0);
      cleanupPlayer(socket.user);
      socket.request.session.destroy();
      sendMessage('server message', `${socket.user} logged out...`);
    }
  });
});

function sendTradeSync(a, b) {
  const playerA = players[a];
  const playerB = players[b];

  if (!playerA || !playerB) return;

  // what A sees
  io.to(playerA.sock_id).emit("tradeSync", {
    myOffer: playerA.tradeOffer || {},
    theirOffer: playerB.tradeOffer || {},
    accepted: {
      me: playerA.tradeAccepted || false,
      them: playerB.tradeAccepted || false
    }
  });

  // what B sees
  io.to(playerB.sock_id).emit("tradeSync", {
    myOffer: playerB.tradeOffer || {},
    theirOffer: playerA.tradeOffer || {},
    accepted: {
      me: playerB.tradeAccepted || false,
      them: playerA.tradeAccepted || false
    }
  });
}

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
  let player = players[name];
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
      sendMessage('pk message', `${words[1]} is not online...`, player);
    }
  }
  if (words[0]==="trade"){
    let targetName = words[1];
    if (targetName===name){
      sendMessage('pk message', `You must be high af...`, player);
      return;
    }
    if (players[name].murderer){
      sendMessage('pk message', `As a murderer, you cannot trade...`, player);
      return;
    }
    if (players[targetName]?.sock_id){
      if (players[targetName].murderer){
        sendMessage('pk message', `You cannot trade with murderers...`, player);
      } else {
        sendTradeRequest(name, targetName);
      }
    } else{
      sendMessage('pk message', `${targetName} is not online...`, player);
    }
  }
  if (words[0]==="who"){
    sendMessage('server message', `\n${Object.keys(players)}`, player);
  }
}

async function sendTradeRequest(fromName, toName) {
  console.log(`${fromName} attempting to trade ${toName}`);

  if (!players[toName] || players[toName].sock_id === null) {
    sendMessage('pk message', `${toName} is not online...`, players[fromName]);
    return;
  }

  if (pendingTradeRequests[toName]) {
    sendMessage('pk message', `${toName} already has a pending request.`, players[fromName]);
    return;
  }
  
  pendingTradeRequests[toName] = fromName;
  // sender sees confirmation
  sendMessage('server message', `Trade request sent to ${toName}`, players[fromName]);
  // receiver gets the request
  io.to(players[toName].sock_id).emit("chatEvent", {
    type: "tradeRequest",
    from: fromName
  });
}

async function finalizeTrade(a, b) {
  const offerA = players[a].tradeOffer || {};
  const offerB = players[b].tradeOffer || {};

  // remove items from A → give to B
  console.log("moving A's items");
  for (const slot in offerA) {
    const item = offerA[slot];
    if (!item) continue;

    const amount = Number(item.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      console.log("Invalid trade amount from A:", item);
      continue;
    }

    await removeItem(a, item.id, amount);
    await addItem(b, item.id, amount);
  }

  // remove items from B → give to A
  console.log("moving B's items");
  for (const slot in offerB) {
    const item = offerB[slot];
    if (!item) continue;

    const amount = Number(item.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      console.log("Invalid trade amount from B:", item);
      continue;
    }

    await removeItem(b, item.id, amount);
    await addItem(a, item.id, amount);
  }

  console.log("Trade successful!");

  // cleanup
  players[a].tradingWith = null;
  players[b].tradingWith = null;
  players[a].tradeOffer = {};
  players[b].tradeOffer = {};
  players[a].tradeAccepted = false;
  players[b].tradeAccepted = false;

  io.to(players[a].sock_id).emit("tradeComplete");
  io.to(players[b].sock_id).emit("tradeComplete");
  await syncInventory(a);
  await syncInventory(b);
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
  if (players[name].slow===true){
    players[name].slowTime-=players[name].movementSpeed;
    if (players[name].slowTime<=0){
      players[name].slow=false;
      players[name].slowTime=0;
    }
    return;//can move next time lol
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
        if (players[name].murderer){
          players[name].criminal=false;
          clearCriminal(name);
        }
        if (players[name].criminal){
          console.log("setting criminal sprite");
          const crimSpriteMap = {
            left: "criminalL",
            right: "criminalR"
          }
          players[name].criminalSprite = crimSpriteMap[dir];
        }
      }
      delete map.Map[players[name].coords[1]][players[name].coords[0]].players[name];
      markTileChanged(players[name].coords[0], players[name].coords[1]);
      sendSound(players[name], [players[name].step]);
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

const tileMaxX = map.Map[0].length;
const tileMaxY = map.Map.length;

function checkCollision(name, coords){
  if (coords[0]< 0 || coords[0]>tileMaxX-1){  //need next map on collision with edge
    return true;
  }
  if (coords[1]<0 || coords[1]>tileMaxY-1){
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
  let tile = map.Map[coords[1]][coords[0]];
  if (tile?.mob){
    if (tile.mob?.collision===true){
      return true;
    }
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
        sendMessage('pk message', `As a murderer,  you cannot hide...`, players[name]);
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
    sendMessage('pk message', `As a murderer, you cannot enter safe places...`, players[name]);
    return true;//lol they can't go to safe area!
  }
  return false; 
}

function checkMelee(name, coords) {
    let player = players[name];
    if (player.hand === null) return false;
    if (player.slow === true) return false;//can't attack if slowed!
    const tile = map.Map[coords[1]][coords[0]];
    const isSafe = isSafeActive(tile);

    // 1️⃣ Players first
    const tilePlayerNames = Object.keys(tile.players || {});
    if (tilePlayerNames.length > 0) {
      const playerTarget = tilePlayerNames[0];

      // allow attack if tile is not safe OR target is a murderer
      if (!isSafe || (players[playerTarget] && players[playerTarget].murderer)) {
        meleeAttack(name, playerTarget);
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
  let player = players[name];
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
    damagePlayer(player, targetPlayer, damage, "melee");
  }
}

function damagePlayer(player, targetPlayer, damage, type) {
  if (targetPlayer.head !== null) {
    let headName = itemById[targetPlayer.head];
    damage -= Math.floor(Math.random() * baseTiles[headName].defense);
  }
  if (targetPlayer.body !== null) {
    let bodyName = itemById[targetPlayer.body];
    damage -= Math.floor(Math.random() * baseTiles[bodyName].defense);
  }
  if (targetPlayer.feet !== null) {
    let feetName = itemById[targetPlayer.feet];
    damage -= Math.floor(Math.random() * baseTiles[feetName].defense);
  }

  if (damage < 0) {
    damage = 0;
  }
  targetPlayer.hp -= damage;//change to playerattack-targetdefense etc
  if (!targetPlayer.criminal && !targetPlayer.murderer){
    if (!player.criminal && !player.murderer){
      startCriminalTimer(player.name);//15 min criminal!
      sendMessage('pk message', 'You are now wanted!', player);
    }
  }
  targetPlayer.lastHitBy = player.name;
  player.lastPlayerHit = targetPlayer.name;
  if (damage > 0) {
    sendSound(player, ['hit']);
    sendSound(targetPlayer, ['hit', 'damage']);
    sendMessage('pk message', `${player.name} hit you for ${damage} damage!`, targetPlayer);
    sendMessage('pk message', `You hit ${targetPlayer.name} for ${damage} damage!`, player);
  }
  else {
    sendSound(player, ['miss']);
    sendSound(targetPlayer, ['miss']);
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
    if (damage!==0){
      damageMob(playerName, mobId, damage, "melee");
    } else {
      sendSound(players[playerName], ['miss']);
    }
}

async function damageMob(playerName, mobId, damage, type){
  let player = players[playerName];
  let targetMob = mobs.get(mobId);
  let xp = Math.floor(damage / 10);
  if (targetMob.hp - damage < 0) {
    xp = Math.floor(Math.floor(targetMob.hp / 10));
  }
  if (xp< 1) {
    xp= 1;
  }
  await giveXp(playerName, xp, type);
  if (damage < 0) {
    damage = 0;
  }
  targetMob.hp -= damage;
  sendSound(players[playerName], ['hit']);
  sendMessage('pk message', `You hit the ${targetMob.type} for ${damage} damage!`, players[playerName]);
}

async function giveXp(playerName, xp, type){
  let player = players[playerName];
  switch (type){
    case "melee":
      player.swordXpTotal += xp;
      player.hpXpTotal += xp;
      break;
    case "archery":
      player.archeryXpTotal += xp;
      break;
    case "mage":
      player.mageXpTotal += xp;
      break;
    case "fishing":
      player.fishingXpTotal +=xp;
  }
}

async function killMob(mob) {
    const tile = map.Map[mob.y][mob.x];
    delete tile.mob;
    await dropMobLoot(mob.drop, mob.x, mob.y);
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

async function playerAction(playerName){
  //player pressed shift for action and ain't standin on nothin important
  //check what player is holding and do something with it
  let player = players[playerName];
  if (player.hand!==null){
    playerHeldItemAction(playerName);
  }
  //what other actions are there if nothing held and
  //nothing to interact with on tile?
}

async function playerHeldItemAction(playerName){
  let player = players[playerName];
  if (player.slow===true) return;
  if (itemById[player.hand].startsWith("bow")) {
    await playerShootBow(player);
    return;
  }
  if (itemById[player.hand].startsWith("fishingpole")){
    await playerTryFishing(player);
    return;
  }
}

async function playerTryFishing(player){
  console.log("fishin!");
  //check for water +1 to last dir
  //check if it's a fishing spot
  //same timer as teleport
  //bobber on fishing spot
  //check quiver for bait, higher chance for fish/different fish
  //chance to catch fish, catch nothing, or break pole (fishing lvl)
  let fishTileCoords = checkOnNextTile(player.coords, player.lastDir, "fishingspot");
  if (fishTileCoords===false) return;
  //else it's coords!
  sendMessage('server message', 'You cast out your line.', player);
  //add bobber to tile, only on front end?
  //add fishing=true/false so others can see too
  map.Map[fishTileCoords.y][fishTileCoords.x].objects['fishingspot'].fishing=true;
  markTileChanged(fishTileCoords.x, fishTileCoords.y);
  startChannel({
    playerName: player.name,
    duration: 5000,
    cancelOnMove: true,

    onComplete: async () => {
      console.log("you reel in your line");
      map.Map[fishTileCoords.y][fishTileCoords.x].objects['fishingspot'].fishing=false;
      markTileChanged(fishTileCoords.x, fishTileCoords.y);
      sendMessage('server message', "You reel in your line.", player);
      //random chance for fish
      await randomChanceForFish(player, fishTileCoords);
      setTimeout(() => {
        playerTryFishing(player, fishTileCoords);
      }, 500);
    },

    onCancel: () => {
      console.log("Fishing canceled");
      map.Map[fishTileCoords.y][fishTileCoords.x].objects['fishingspot'].fishing=false;
      markTileChanged(fishTileCoords.x, fishTileCoords.y);
      sendMessage('server message', "You stop fishing.", player);
    }
  });
}

let fish = [
  'cod',
  'goldfish',
  'redfish'
]

async function randomChanceForFish(player, spot){
  //random chance for fish, if get fish, fishTileCoords .amount-=1;
  //if amount===0, delete fishingspot!
  //change this to fishing level, list of fish, etc
  if (roll(player.fishingLvl)){
    sendMessage('server message', 'You caught a fish!', player);
    let caughtFish = fish[Math.floor(Math.random()*fish.length)];
    await addItem(player.name, idByItem(caughtFish), 1);
    await syncInventory(player.name);
    let xp = baseTiles[caughtFish].xp;
    giveXp(player.name, xp, 'fishing');
    let tile = map.Map[spot.y][spot.x];
    tile.objects['fishingspot'].amount-=1;
    if (tile.objects['fishingspot'].amount<=0){
      delete tile.objects;
      markTileChanged(spot.x, spot.y);
    }
  }
}

function roll(level) {
  const base = 0.30;                    // early generosity (30%)
  const chance = base + (1 - base) * (1 - Math.pow(0.97, level));
  return Math.random() < chance;
}
function checkOnNextTile(coords, lastDir, thing){
  let check = { x:0, y:0 };
  switch (lastDir) {
    case "up": check.y -= 1; break;
    case "down": check.y += 1; break;
    case "left": check.x -= 1; break;
    case "right": check.x += 1; break;
  }
  let newCoords = { x: coords[0]+check.x, y: coords[1]+check.y }
  let tile = map.Map[newCoords.y][newCoords.x];
  if (tile?.objects){
    if (tile.objects[thing]){
      return newCoords;
    }
  }
  return false;
}

async function playerShootBow(player){
  if (Date.now() < player.lastMelee + 1000) {//change to -level?
    return;
  }
  player.lastMelee = Date.now();
  if (player.quiver === null) return;
  let projName = itemById[player.quiver];
  //check amount, decrement if shoots
  let projAmount = await getItemAmount(player.name, player.quiver);
  if (projAmount === 0) {
    player.quiver = null;
    return;
  }
  await removeItem(player.name, player.quiver, 1);
  await syncInventory(player.name);
  const arrow = createProjectile(projName, player.lastDir, player.coords[0], player.coords[1], player.name, 10);
  addProjectileToTile(arrow);
}

async function interactTile(playerName) {
  const player = players[playerName];
  const tile = map.Map[player.coords[1]][player.coords[0]];
  const mapObjects = tile.objects ?? {};

  const objNames = Object.keys(mapObjects);
  if (objNames.length === 0){
    playerAction(playerName);//not standin on nothin, see what action does
    return;
  }
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
    return true;
  }
  if (objName==='leaderboard'){
    readLeaderboard(name);
    return true;
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
  let text = String(tile.objects['sign'].text);
  console.log(tile.objects['sign']);
  sendMessage('readSign', text, player);
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
  sendMessage('server message', `Door ${lockMsg}!`, players[name]);
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
    sendSound(player, ['chop']);
    player.woodcuttingXpTotal+=1;
    lvlBonus=Math.floor(player.woodcuttingLvl/10);
  }
  if (itemById[player.hand]==='pickaxe'){
    sendSound(player, ['pickaxe']);
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
  let chance = null;//for potential resource mob
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
    if (nextName.startsWith('tree')){
      chance = player.woodcuttingLvl;
    }
    if (nextName.startsWith('rock')){
      chance = player.miningLvl;
    }
  } else {
    tileData.objects ??= {};
    tileData.objects[nextName] = { name: nextName };
  }
}
  if (chance!==null){//change to scaled to player lvl
    spawnResourceMob(playerName, coords, chance);
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

async function equip(playerName, id) {
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
  await syncInventory(playerName);
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
      player.hp=player.maxHp;
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
    sendMessage('pk message', `As a murderer, you cannot drop items...`, player);
    return;
  }
  /*
  try {
    if (itemById[player.inventory[item].id]==="axe"){
      return;//take this out when get axe on death or whatever
    }
  } catch(err){
    return;
  }
  */
  /*
  if (itemById[player.inventory[item].id]==="axe"){
    return;//take this out when get axe on death or whatever
  }
  */
  if (map.Map[player.coords[1]][player.coords[0]].objects){
    if (Object.keys(map.Map[player.coords[1]][player.coords[0]].objects).length !== 0) {
      return;
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
    await dropOwnedItem(player, baseName);
    /*
    tileItem.owner = name; // player name
    console.log(`name: ${baseName}`);
    if (baseName==='door'){
      tileItem.locked=true;
    }
    */
  }
  tile[container][dropName] = tileItem;
  await removeItem(name, players[name].inventory[item].id, 1);
  await ifEquippedRemove(name, players[name].inventory[item].id);
  markTileChanged(player.coords[0], player.coords[1]);
  await syncInventory(name);
}

async function dropOwnedItem(player, baseName){
  tileItem.owner = player.name; // player name
  if (baseName === 'door') {
    tileItem.locked = true;
  }
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
  if (player.quiver === itemId){
    player.quiver = null;
  }
}

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
  let craftAmount = 1;
  if (itemDef?.craftAmount){
    craftAmount = itemDef.craftAmount;
  }
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
    added = await addItem(playerName, craftedId, craftAmount);
  } else {
    // new slot → check capacity
    const slotsUsed = await getInventoryCount(playerName);

    if (slotsUsed < 32) {
      added = await addItem(playerName, craftedId, craftAmount);
    }
  }

  // if inventory couldn't accept it → send to bank
  if (added === 0) {
    await addBankItem(playerName, craftedId, craftAmount);
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
      if (tile['b-t'] === "water"){
        if (tile?.objects){//gets rid of fishing spots AND lost arrows lol
          delete tile.objects;
        }
        if (Math.floor(Math.random()*500)<10){
          randomFishingSpot(tile);
        }
      }
      const isEmpty = obj => !obj || Object.keys(obj).length === 0;
      //delete all flowers first
      //plant regens like this need separate fxns
      Object.keys(tile?.objects ?? {}).forEach(k => k.startsWith("flower") && delete tile.objects[k]);
      if (
        //will need to change this not to go on player plots and shit lol
        isEmpty(tile?.objects) &&
        isEmpty(tile?.floor) &&
        //isEmpty(tile?.roof) &&
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
        //isEmpty(tile?.roof) &&
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
  console.log(`${mobs.size}`);
}

async function randomFishingSpot(tile){
  //check surrounding tiles for b-t with no collision, e.g. grass
  //must be up/down/left/right tile, not corners
  const spots = [
    { x: tile.x,     y: tile.y - 1 }, // up
    { x: tile.x,     y: tile.y + 1 }, // down
    { x: tile.x - 1, y: tile.y },     // left
    { x: tile.x + 1, y: tile.y }      // right
  ];
  let valid = false;
  for (const s of spots) {
    if (!map.Map[s.y] || !map.Map[s.y][s.x]) continue;
    if (baseTiles[map.Map[s.y][s.x]['b-t']].collision === false) {
      valid=true;
      continue;
    }
  }
  if (valid===true){
    //add a fishing spot!
    console.log("added fishing spot!");
    addToMap('fishingspot', tile.x, tile.y);
    map.Map[tile.y][tile.x].objects['fishingspot'].fishing=false;
    map.Map[tile.y][tile.x].objects['fishingspot'].amount=Math.floor(Math.random()*24);
  }
}

replenishResources();//run at server start to add random ores n shit
setInterval(replenishResources, 60000*180);//every 3 hours
setInterval(mapUpdate, 200);
setInterval(mapPersist, 60000);//save map every minute

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

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
    {//goblins in mountain pass room
      type: "goblin",
      x:160, y:71,
      count: 2,
      respawnTime: 30000
    },
    {//goblins outside of shop
      type: "goblin",
      x:223, y:79,
      count: 4,
      respawnTime: 30000
    },
    {//rats northeast of shop
        type: "rat",
        x: 229,
        y: 66,
        count: 8,
        respawnTime: 20000 // ms
    },
    //zorg mini-boss!
    {//south of mountains south of Old Haven
      type: "zorg",
      x: 42,
      y: 135,
      count: 1,
      respawnTime: 30000
    },
    {
      type: "spider",
      x: 131,
      y: 108,
      count: 2,
      respawnTime: 5000
    },
    {
      type: "spider",
      x: 150,
      y: 98,
      count: 3,
      respawnTime: 5000
    },
    {
      type: "spiderweb",
      x:97, y:111,
      count: 1,
      respawnTime: 30000
    },
    {
      type: "spiderweb",
      x:110, y:118,
      count: 1,
      respawnTime: 30000
    },
    {
      type: "spiderweb",
      x:123, y:114,
      count: 1,
      respawnTime: 30000
    },
    {
      type: "spiderweb",
      x:135, y:106,
      count: 1,
      respawnTime: 30000
    },
    {
      type: "spiderweb",
      x:144, y:101,
      count: 1,
      respawnTime: 30000
    }
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
    if (mob?.collision===true){
      map.Map[mob.y][mob.x].mob.collision=true;
    }
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
  if (mob.hp<=0){
    killMob(mob);
    return;
  }
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
    if (target?.name && mob?.rangeAttack){
      mobRangeAttack(mob, target);
    }
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

function mobRangeAttack(mob, target){
  if (Date.now()<mob.lastAttack+1000) return;
  mob.lastAttack=Date.now();
  let projType = mob.rangeAttack.type;
  const dir = getDirectionToward(mob.x, mob.y, target.coords[0], target.coords[1]);
  if (mob.rangeAttack?.slow===true){
    let slowTime = mob.rangeAttack.slowTime;
    const mobProj = createProjectile(projType, dir, mob.x, mob.y, mob.id, 10, true, slowTime);
    addProjectileToTile(mobProj);
  } else {
    const mobProj = createProjectile(projType, dir, mob.x, mob.y, mob.id);
    addProjectileToTile(mobProj);
  }
}

function getDirectionToward(fromX, fromY, toX, toY) {
  const dx = toX - fromX;
  const dy = toY - fromY;

  // whichever difference is larger wins
  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? "right" : "left";
  } else {
    return dy > 0 ? "down" : "up";
  }
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
        sendSound(player, ['hit', 'damage']);
        sendMessage('pk message', `You got hit by the ${mob.type} for ${damage} damage!`, player);
      }
    }
}

function spawnResourceMob(playerName, coords, chance){
  if (Math.floor(Math.random()*100)<90) return;
  //see what player is holding, hatchet/pickaxe, spawn treeEnt or stoneGolem
  let mobName = null;
  let mobDrop = null;
  if (itemById[players[playerName].hand]==='pickaxe'){
    mobName="rockGolem";
    mobDrop = "rock";
  }
  if (itemById[players[playerName].hand]==='axe'){
    mobName="treeEnt";
    mobDrop = "log";
  }
  if (mobName===null) return;//aww
  let testResMob = createMob("resourceMob", coords[0], coords[1]);
  testResMob.type=mobName;//hopefully works?
  testResMob.hp=10;//just for now, scale by lvl
  testResMob.attack=1;//just for now, scale
  testResMob.drop.push(
    { name: mobDrop, min: 100, max: 500, weight: 100 }
  )
  mobs.set(testResMob.id, testResMob);
  map.Map[coords[1]][coords[0]].mob = {
    id: testResMob.id,
    sprite: testResMob.type+"L"
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
    `SELECT player_name, x, y, hp, hpXp, swordXp, archeryXp, craftXp, woodcuttingXp, miningXp, murderer, murderTimer, fishingXp
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
    const fishingLvl = await levelFromXp(result.fishingXp);
    const archeryLvl = await levelFromXp(result.archeryXp);
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

async function initCriminals() {
  const rows = await query(`
    SELECT player_name, criminalTimer
    FROM players
    WHERE criminal = 1 AND criminalTimer > 0
  `);

  if (!rows.length) {
    console.log("No active criminals.");
    return;
  }

  for (const result of rows) {
    console.log(
      `Criminal timer active for ${result.player_name}: ${result.criminalTimer}ms remaining`
    );
  }
}

(async () => {
  await initMurderers();
  await initCriminals();
})();

const STATUS_TICK_INTERVAL = 1000; // 1 second

setInterval(async () => {
  // =============================
  // MURDERERS
  // =============================
  const murderRows = await query(`
    SELECT player_name, murderTimer
    FROM players
    WHERE murderer = 1
      AND murderTimer > 0
  `);

  for (const player of murderRows) {
    const newTimer = Math.max(player.murderTimer - STATUS_TICK_INTERVAL, 0);

    await query(
      `UPDATE players SET murderTimer = ? WHERE player_name = ?`,
      [newTimer, player.player_name]
    );

    if (newTimer === 0) {
      await query(
        `UPDATE players SET murderer = 0 WHERE player_name = ?`,
        [player.player_name]
      );

      if (players[player.player_name]) {
        players[player.player_name].murderer = false;
        players[player.player_name].murderSprite = null;
        sendMessage('server message', `${player.player_name} has been cleared of murder charges...`, players[player.player_name]);
        if (players[player.player_name].sock_id === null) {
          cleanupPlayer(player.player_name);
        }
      }
    }
  }

  // =============================
  // CRIMINALS
  // =============================
  const criminalRows = await query(`
    SELECT player_name, criminalTimer
    FROM players
    WHERE criminal = 1
      AND criminalTimer > 0
  `);

  for (const player of criminalRows) {
    const newTimer = Math.max(player.criminalTimer - STATUS_TICK_INTERVAL, 0);

    await query(
      `UPDATE players SET criminalTimer = ? WHERE player_name = ?`,
      [newTimer, player.player_name]
    );

    if (newTimer === 0) {
      await query(
        `UPDATE players SET criminal = 0 WHERE player_name = ?`,
        [player.player_name]
      );

      if (players[player.player_name]) {
        players[player.player_name].criminal = false;
        players[player.player_name].criminalSprite = null;
        sendMessage('server message', `${player.player_name} is no longer a criminal.`);
        if (players[player.player_name].sock_id === null) {
          cleanupPlayer(player.player_name);
        }
      }
    }
  }

}, STATUS_TICK_INTERVAL);

setInterval(async () => {
  for (const name in players) {
    const player = players[name];
    handlePlayerInput(name, player.keystate);
  }
}, 20);

//PROJECTILE TESTING
const projectiles = new Map();
let nextProjectileId = 1;

function createProjectile(type, direction, x, y, ownerId, decay=10, slow=false, slowTime=null) {
  const id = nextProjectileId++;
  const damage = baseTiles[type].attack;
  const projectile = {
    id,
    type,       // base type, e.g., "arrow"
    damage,
    direction,  // "up", "down", "left", "right"
    x,          // tile coordinates
    y,
    ownerId,
    life: decay,    // max ticks
    prevTile: null,  // track where it is on the map
  };

  // derive the tile name for rendering
  projectile.tileName = type + direction.charAt(0).toUpperCase() + direction.slice(1); // e.g., "arrowRight"
  if (slow===true){
    projectile.slow=true;
    projectile.slowTime=slowTime;
  }
  projectiles.set(id, projectile);
  return projectile;
}

function addProjectileToTile(proj) {
  const tile = map.Map[proj.y][proj.x];
  markTileChanged(proj.x, proj.y);
  // if tile already has a projectile, destroy both
  if (tile.projectile) {
    projectiles.delete(proj.id);
    // optionally delete the existing one? depends on rules
    delete tile.projectile;
    markTileChanged(proj.x, proj.y);
    return false;
  }
  if (checkProjectileCollision(proj)===true){
    projectiles.delete(proj.id);
    delete tile.projectile;
    markTileChanged(proj.x, proj.y);
    return false;
  }
  tile.projectile = { name: proj.tileName };
  proj.prevTile = { x: proj.x, y: proj.y };
  markTileChanged(proj.x, proj.y);
  return true;
}

function checkProjectileCollision(proj){
  const tile = map.Map[proj.y][proj.x];
  if (tile?.objects){
    for (obj in tile.objects){
      if (baseTiles[tile.objects[obj].name].collision){
        return true;
      }
    }
  }
  if (tile?.players){
    if (Object.keys(tile.players).length>0){
      if (tile.players[proj.ownerId]){
        return false;
      }
      let targetName = Object.keys(tile.players)[0];
      rangeAttackPlayer(proj, targetName);
      return true;
    }
  }
  if (tile?.mob){
    if (Object.keys(tile.mob).length>0 && mobs.get(proj.ownerId)===undefined){
      rangeAttackMob(proj, tile.mob);
      return true;
    }
  }
  return false;
}

//add all functionality, sounds, rand hits/crits, etc
function rangeAttackMob(proj, mob){
  if (mobs.get(proj.ownerId)!==undefined) return;
  let mobObj = mobs.get(mob.id);
  let player = players[proj.ownerId];
  let damage = Math.floor(Math.random()*baseTiles[proj.type].attack);
  damageMob(proj.ownerId, mob.id, damage, "archery");
}

//must consolidate doing damage to players/mobs
//else have to rewrite murder status, sounds etc
function rangeAttackPlayer(proj, targetName){
  let damage = Math.floor(Math.random()*baseTiles[proj.type].attack);
  let targetPlayer = players[targetName];
  if (proj?.slow===true){
    targetPlayer.slow=true;
    targetPlayer.slowTime=proj.slowTime;
  }
  if (mobs.get(proj.ownerId)!==undefined){
    mobRangeDamagePlayer(proj, targetPlayer);
  }else {
    let player = players[proj.ownerId];
    console.log(`${proj.ownerId} hit ${targetName} with ${proj.type} for ${damage} damage!`);
    damagePlayer(player, targetPlayer, damage, "archery");
  }
}

function mobRangeDamagePlayer(proj, targetPlayer){
  let damage = baseTiles[proj.type].attack;
  //other logic for combat triangle, armour etc
  targetPlayer.hp-=damage;
  let mobName = mobs.get(proj.ownerId);
  sendSound(targetPlayer, ['hit', 'damage']);
  sendMessage('pk message', `The ${mobName.type} hit you for ${damage} damage!`, targetPlayer);
}

function removeProjectileFromTile(proj) {
  if (!proj.prevTile) return;
  const tile = map.Map[proj.prevTile.y][proj.prevTile.x];
  if (tile.projectile) delete tile.projectile;
  markTileChanged(proj.x, proj.y);
}

function updateProjectiles() {
  for (const [id, proj] of [...projectiles]) { // clone for safe deletion
    // remove from old tile
    removeProjectileFromTile(proj);

    // move in direction
    switch(proj.direction) {
      case "up": proj.y -= 1; break;
      case "down": proj.y += 1; break;
      case "left": proj.x -= 1; break;
      case "right": proj.x += 1; break;
    }

    // add to new tile
    const added = addProjectileToTile(proj);
    if (!added) continue; // destroyed due to collision

    // decrease lifespan
    proj.life--;
    if (proj.life <= 0) {
      removeProjectileFromTile(proj);
      markTileChanged(proj.x, proj.y);
      if (proj.type.startsWith("arrow")){//still not perfect, fix
        addToMap(proj.type, proj.x, proj.y);
      }
     //change to drop proper item (or not for spells etc)
      projectiles.delete(id);
    }
  }
}

//projectiles interval
setInterval(() => {
  updateProjectiles();
},100)