var devMode = false;//or if Admin in code
var noCollision = false;

const baseTiles = require('./server_base_tiles.js');
const books = require('./books.js');
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

let kWest = 0;
let kEast = 0;
for (let y = 0; y < map.Map.length; y++) {
  for (let x = 0; x < map.Map[y].length; x++) {

    const column = map.Map[y][x];
    if (!column) continue;

    // loop through all z levels
    for (const z in column) {

      const tile = column[z];
      if (!tile) continue;
      if (tile?.kTile){
        if (Object.keys(tile.kTile)[0]==='kWest') kWest+=1;
        if (Object.keys(tile.kTile)[0]==='kEast') kEast+=1;
      }
      // delete unwanted runtime data
      delete tile.mob;
      delete tile.players;
      if (tile.objects && Object.keys(tile.objects).length === 0) {
        delete tile.objects;
      }
      if (tile?.['b-t']){
        if (tile['b-t']==='water'){
          delete tile.objects;
        }
      }
      if (tile?.floor){
        if (Object.keys(tile.floor)[0]==='lightning'){
          delete tile.floor;
        }
      }
      if (tile?.typing) {
        delete tile.typing;
      }
    }
    for (z=4; z>0; z--){
      if (!column[z]) continue;
      if (Object.keys(column[z]).length===0){
        console.log('deleted empty upper z tile');
        delete column[z];
      }
    }
  }
}

console.log(`west: ${kWest}, east: ${kEast}`);

function getTile(x, y, z = 0) {//get a single tile in a column of z levels
  if (!map.Map[y]) return null;
  if (!map.Map[y][x]) return null;

  return map.Map[y][x][z] ?? null;
}

function getColumn(x, y) {//get entire column of z levels
  return map.Map?.[y]?.[x] ?? null;
}

//trade testing
let pendingTradeRequests = {};

//reset tile versions so they don't build up to ridiculous numbers
setInterval(async () => {
  for (i in map.Map) {
    for (j in map.Map[i]) {
      map.Map[i][j].version = 0;
    }
  }
}, 60 * 60 * 1000);


const { createMob, mobTypes, mobSpawns } = require("./mobs");

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

const query =  require('./db.js');
//const querystring = require('querystring');

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
  if (name.length > 30 || pass.length > 99) {
    res.redirect('/?please_dont_do_that');
    return;
  }
  try {
    await queryPassword(name, pass);
    req.session.user = name;
    res.redirect('/game/game.html');

  } catch (err) {
    console.error("Login failed:", err.message);
    res.redirect('/?error=401incorrect_password');
  }
});

app.use("/viewer", express.static(path.join(__dirname, "viewer")));

async function queryPassword(name, pass) {
  if (name.length > 30 || pass.length > 99) return;
  const sql = "SELECT player_name, pass FROM players WHERE player_name = ?";
  const result = await query(sql, [name]);
  if (!result || result.length === 0) {
    console.log("New player!");
    await addPlayer(name, pass);
    await initPlayer(name);
    await addItem(name, 1, 1);
    await syncInventory(name);
    return { created: true };
  }
  const actual_pass = result[0].pass;
  if (!checkPassword(pass, actual_pass)) {
    console.log("Wrong password!");
    throw new Error("incorrect_password");
  }
  return { created: false };
}

async function getLeaderboard() {//change limit for top 5 or 10/whatever
  const sql = `
    SELECT 'HP' AS skill, player_name, hpXp AS xp
    FROM (
      SELECT player_name, hpXp
      FROM players
      WHERE player_name <> 'Admin'
      ORDER BY hpXp DESC
      LIMIT 1
    ) AS t

    UNION ALL

    SELECT 'Swordsmanship' AS skill, player_name, swordXp AS xp
    FROM (
      SELECT player_name, swordXp
      FROM players
      WHERE player_name <> 'Admin'
      ORDER BY swordXp DESC
      LIMIT 1
    ) AS t

    UNION ALL

    SELECT 'Archery' AS skill, player_name, archeryXp AS xp
    FROM (
      SELECT player_name, archeryXp
      FROM players
      WHERE player_name <> 'Admin'
      ORDER BY archeryXp DESC
      LIMIT 1
    ) AS t

    UNION ALL

    SELECT 'Crafting' AS skill, player_name, craftXp AS xp
    FROM (
      SELECT player_name, craftXp
      FROM players
      WHERE player_name <> 'Admin'
      ORDER BY craftXp DESC
      LIMIT 1
    ) AS t

    UNION ALL

    SELECT 'Woodcutting' AS skill, player_name, woodcuttingXp AS xp
    FROM (
      SELECT player_name, woodcuttingXp
      FROM players
      WHERE player_name <> 'Admin'
      ORDER BY woodcuttingXp DESC
      LIMIT 1
    ) AS t

    UNION ALL

    SELECT 'Fishing' AS skill, player_name, fishingXp AS xp
    FROM (
      SELECT player_name, fishingXp
      FROM players
      WHERE player_name <> 'Admin'
      ORDER BY fishingXp DESC
      LIMIT 1
    ) AS t

    UNION ALL

    SELECT 'Cooking' AS skill, player_name, cookingXp AS xp
    FROM (
      SELECT player_name, cookingXp
      FROM players
      WHERE player_name <> 'Admin'
      ORDER BY cookingXp DESC
      LIMIT 1
    ) AS t

    UNION ALL

    SELECT 'Farming' AS skill, player_name, farmingXp AS xp
    FROM (
      SELECT player_name, farmingXp
      FROM players
      WHERE player_name <> 'Admin'
      ORDER BY farmingXp DESC
      LIMIT 1
    ) AS t

    UNION ALL

    SELECT 'Mage' AS skill, player_name, mageXp AS xp
    FROM (
      SELECT player_name, mageXp
      FROM players
      WHERE player_name <> 'Admin'
      ORDER BY mageXp DESC
      LIMIT 1
    ) AS t

    UNION ALL

    SELECT 'Mining' AS skill, player_name, miningXp AS xp
    FROM (
      SELECT player_name, miningXp
      FROM players
      WHERE player_name <> 'Admin'
      ORDER BY miningXp DESC
      LIMIT 1
    ) AS t;
  `;

  // Pass an empty array because there are no ? placeholders
  const rows = await query(sql, []);
  return rows; // array of { skill, player_name, xp }
}

async function initPlayer(name) {
  const sql = `SELECT * FROM players WHERE player_name = ?`;
  const params = [name];
  const result = await query(sql, params);

  let cookingLvl = await levelFromXp(result[0].cookingXp);
  let farmingLvl = await levelFromXp(result[0].farmingXp);
  let hpLvl = await levelFromXp(result[0].hpXp);
  let swordLvl = await levelFromXp(result[0].swordXp);
  let mageLvl = await levelFromXp(result[0].mageXp);
  let archeryLvl = await levelFromXp(result[0].archeryXp);
  let craftLvl = await levelFromXp(result[0].craftXp);
  let woodcuttingLvl = await levelFromXp(result[0].woodcuttingXp);
  let miningLvl = await levelFromXp(result[0].miningXp);
  let fishingLvl = await levelFromXp(result[0].fishingXp);

  players[name] = {// Initialize player object
    name: name,
    king: result[0].king,
    pledge: result[0].pledge,
    rank: result[0]?.player_rank ?? null,//should work
    takingThrone: false,
    x: result[0].x,
    y: result[0].y,
    z: result[0].z,
    sock_id: null, //to be set in io.connection
    sprite: "ghostR",
    murderSprite: null,
    criminalSprite: null,
    facing: 'right',
    lastInput: Date.now(),
    keystate: { up: false, down: false, left: false, right: false },
    baseMovementSpeed: 175,
    movementSpeed: 175,//speed boots>>115, back to normal >> baseMovementSpeed
    lastMove: Date.now(),
    lastDir: "right",
    step: 'stepR',
    typing: { state: false, lastSpot: { x: 0, y: 0, z:0 } },
    lastChunk: null,
    lastChunkSum: null,
    lastChunkKey: null,
    lastGather: Date.now(),
    lastMelee: Date.now(),    
    lastState: null,
    isCrafting: false,
    lastHitBy: null,
    lastPlayerHit: null,
    tradingWith: null,
    tradeOffer: {}, // itemId -> amount
    tradeAccepted: false,
    slow: false,//like when hit by web
    slowTime: 0,//set with proj.slowTime
    obscured: false,
    activeInventory: 0,
    inventory: [],

    hand: result[0].hand,
    head: result[0].head,
    body: result[0].body,
    feet: result[0].feet,
    quiver: result[0].quiver,

    hp: result[0].hp,//change to null, get hp from db
    maxHp: 100 + Math.floor(hpLvl * 2),//300hp at lvl 100
    mana: result[0].mana,
    maxMana: 100 + Math.floor(mageLvl * 2),    
    swordXpTotal: result[0].swordXp,
    mageXpTotal: result[0].mageXp,
    archeryXpTotal: result[0].archeryXp,
    fishingXpTotal: result[0].fishingXp,
    hpXpTotal: result[0].hpXp,
    craftXpTotal: result[0].craftXp,
    woodcuttingXpTotal: result[0].woodcuttingXp,
    miningXpTotal: result[0].miningXp,
    cookingXpTotal: result[0].cookingXp,
    farmingXpTotal: result[0].farmingXp,

    hpLvl: hpLvl,
    swordLvl: swordLvl,
    archeryLvl: archeryLvl,    
    mageLvl: mageLvl,
    woodcuttingLvl: woodcuttingLvl,
    miningLvl: miningLvl,
    craftLvl: craftLvl,    
    fishingLvl: fishingLvl,
    cookingLvl: cookingLvl,
    farmingLvl: farmingLvl,

    murderer: result[0].murderer,
    criminal: result[0].criminal,  
    murderTimer: 0,
    criminalTimer: 0,

    //quests and games
    trollQuest:result[0].trollQuest,
    chefQuest:result[0].chefQuest,
    farmerQuest:result[0].farmerQuest,
    maze1:0,//always this, just to set off quest tile
    eyeGame:0,
    //taxes
    taxProgress: 0
  };
  let player = players[name];
  if (player.king!==null){
    player.head = idByItem(player.king+"Crown");//assures they are wearing crown
  }
  if (player.x===0){
    player.x=49;
    player.y=49;
    player.z=0;
  } //kludge, works for now
  addPlayerToTile(name, player.x, player.y, player.z);
  markTileChanged(player.x, player.y);
  await syncInventory(name);
  if (player.socket!==null){
    setTimeout(() => {
      emitPlayerState(player);
      updateKingStatus(player);
    }, 1000);
  }
}

function updateKingStatus(player=null){
  if (player!==null){
    io.to(player.sock_id).emit('currentKings', {
      east: {
        king: kingdoms['east'].king,
        tax: kingdoms['east'].tax
      },
      west: {
        king: kingdoms['west'].king,
        tax: kingdoms['west'].tax
      }
    })    
    return;
  }
  io.emit('currentKings', {
      east: {
        king: kingdoms['east'].king,
        tax: kingdoms['east'].tax
      },
      west: {
        king: kingdoms['west'].king,
        tax: kingdoms['west'].tax
      }
  })
}

async function cleanupPlayer(name) {
  console.log("cleaning up disc'd player");
  let player = players[name];
  let tile = getTile(player.x, player.y, player.z);
  delete tile.players[name];
  markTileChanged(player.x, player.y);
  await dbPlayer(name);
  delete players[name];
}

async function levelFromXp(xp) {
  return Math.floor(Math.sqrt(xp / 10)) + 1;
}

async function dbPlayer(name) {
  const sql = `
    UPDATE players SET 
    x = ?, y = ?, z = ?,
    hp = ?,
    swordXp = ?,
    hpXp = ?,
    craftXp = ?,
    woodcuttingXp = ?,
    miningXp = ?,
    archeryXp = ?,
    fishingXp = ?,
    cookingXp = ?,
    farmingXp = ?,
    head = ?,
    body = ?,
    hand = ?,
    feet = ?,
    quiver = ?,
    mageXp = ?,
    mana = ?
    WHERE player_name = ?
  `;
  let player = players[name];
  const params = [
    player.x, player.y, player.z,
    player.hp,
    player.swordXpTotal,
    player.hpXpTotal,
    player.craftXpTotal,
    player.woodcuttingXpTotal,
    player.miningXpTotal,
    player.archeryXpTotal,
    player.fishingXpTotal,
    player.cookingXpTotal,
    player.farmingXpTotal,
    player.head,
    player.body,
    player.hand,
    player.feet,
    player.quiver,
    player.mageXpTotal,
    player.mana,
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
  let player = players[playerName];
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
    await syncInventory(playerName);
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
    await syncInventory(playerName);
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
      await syncInventory(playerName);
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
  await syncInventory(playerName);
}

async function addBankItem(playerName, itemId, amount) {
  if (amount <= 0) return; // ignore 0 or negative amounts
  const sql = `
    INSERT INTO bank (player_name, id, amount)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE amount = amount + VALUES(amount)
  `;
  await query(sql, [playerName, itemId, amount]);
  if (players[playerName]){
    await ifEquippedRemove(playerName, itemId);
  }
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

async function addPlayerToDb(name, pass) {
  const sql = `INSERT INTO players (player_name, pass) VALUES (?, ?)`;
  const params = [name, pass];
  await query(sql, params);
}

async function setCriminal(playerName, isCriminal, timerMs = null) {
  // If the player becomes a murderer, criminal is cleared
  if (players[playerName]?.murderer && isCriminal) return;
  players[playerName].criminal = true;
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
  player.criminalSprite = null;
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
  if (players[playerName]) {
    players[playerName].murderer = isMurderer;
  }
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

async function mapPersist() {
  map.Fxn.persist(map.Map);
  await dbKingdoms();
  for (p in players) {
    if (!players[p]) continue;
    addPlayerToTile(p)//cause they got took off lol
    dbPlayer(p);
  }
}

function addPlayerToTile(name, x = null, y = null, z = null) {
  let player = players[name];
  if (x === null) {
    x = player.x;
  }
  if (y === null) {
    y = player.y;
  }
  if (z === null){
    z = player.z;
  }
  let tile = getTile(x, y, z);
  if (!tile){
    map.Map[y][x][z]={};
    tile = map.Map[y][x][z];
  }
  if (!tile?.players) {
    tile.players = {};
  }
  tile.players[name] = {
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

async function markTileChanged(x, y) {
  let column = getColumn(x, y);
  column.version++;
  viewerUpdate(x, y);
}

function addToMap(name, x, y, z=0, admin=false) {//z safety since no create z tile yet
  let tile = getTile(x, y, z);
  if (admin===true){
    if (!tile){
      map.Map[y][x][z]={};
      tile = getTile(x, y, z);
    }
  }
  if (!tile) return;

  const tileData = baseTiles[name];
  if (!tileData || !tileData.container) {
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

function clearTile(x, y, z, kOnly=false) {
  console.log(`clearTile kOnly: ${kOnly}`);
  let tile = getTile(x, y, z);
  if (!tile) return;
  if (kOnly===true){
    console.log("clearing kTile");
    if (tile?.['kTile']){
      delete tile['kTile'];
    }
    markTileChanged(x, y);
    return;
  }
  if (z === 0){
    tile['b-t'] = "grass";
  }
  delete tile.objects;
  delete tile.floor;
  delete tile.roof;
  delete tile.depletedResources;
  if (tile && tile.safeTile !== undefined) {
    delete tile.safeTile;
  }
  if (tile && tile.questTile!==undefined){
    delete tile.questTile;
  }
  markTileChanged(x, y);
}

//if (isSafeActive(tile)) return; blocks interaction
const isSafeActive = tile => !!tile?.safeTile && Object.keys(tile.safeTile).length > 0;

async function emitPlayerState(player) {
  if (player.hp <= 0) {
    await playerDeath(player);
  }
  if (player.sock_id !== null) {
    io.to(player.sock_id).emit('playerState', {//emit only what has changed...
      x: player.x,
      y: player.y,
      z: player.z,
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
      mageXpTotal: player.mageXpTotal,
      mageLvl: player.mageLvl,
      mana: player.mana,
      fishingXpTotal: player.fishingXpTotal,
      fishingLvl: player.fishingLvl,
      archeryLvl: player.archeryLvl,
      archeryXpTotal: player.archeryXpTotal,
      craftLvl: player.craftLvl,
      craftXpTotal: player.craftXpTotal,
      woodcuttingLvl: player.woodcuttingLvl,
      woodcuttingXpTotal: player.woodcuttingXpTotal,
      miningLvl: player.miningLvl,
      miningXpTotal: player.miningXpTotal,
      cookingXpTotal: player.cookingXpTotal,
      cookingLvl: player.cookingLvl,
      farmingXpTotal: player.farmingXpTotal,
      farmingLvl: player.farmingLvl,
      activeInvItem: player.activeInventory,
      obscured: player.obscured,
      name: player.name,
      pledge: player.pledge,
      rank: player.rank
    });
  }
}

async function playerDeath(player) {
  if (player.lastHitBy !== null && player.lastHitBy !== player.name) {
    sendMessage('pk message', `${player.name} was defeated by ${player.lastHitBy}!`);
    //bounty stuff here, prevent murderer if applicable
    //check if player.lastHitBy is bounty hunter && if player has a bounty
    //if bounty hunter and player bounty, payout bounty to bounty hunters bank
    let protection = await checkBounty(player.lastHitBy, player.name);
    if (!player.murderer && !player.criminal && protection === false) {
      sendMessage('pk message', `${player.lastHitBy} is now a murderer!`);
      await startMurdererTimer(player.lastHitBy);
    }
  }
  player.hp = player.maxHp;//change to player level max hp
  if (player.name!=="Admin"){
    await dropPlayerLootbag(player.name, player.x, player.y, player.z);
  }
  respawnPlayer(player.name);
}

function sendSound(player, sounds = []) {
  if (sounds.length === 0) return;
  io.to(player.sock_id).emit('playSound', sounds);
}

function sendMessage(type, text, player = null) {
  if (player === null) {
    //goes to everybody
    io.emit(type, { message: text });
    return;
  }
  //player not null, goes to a player
  io.to(player.sock_id).emit(type, { message: text });
}

async function checkBounty(playerName, targetName){
  //return true for protected, false for not protected from murderer
  let [pData] = await query(`select pledge, player_rank from players where player_name = ?`, [playerName]);
  if (pData.pledge===null) return false;
  if (pData.rank===null) return false;
  let bountyParams = [targetName, pData.pledge];
  let [bountyData] = await query(`select * from bounties where player_name = ? and kingdom = ?`, bountyParams);
  if (!bountyData) return false;
  //attacking player has authority to collect bounty, targetPlayer has bounty, good to go!
  //public message of bounty collected, private msg to bountyhunter to say how much went to bank
  //private msg to targetPlayer to say their bounty has been collected and their name is clear
  //payout bounty to player's bank, clear bounty in db for targetPlayer
  let payout = bountyData.amount;
  await query(`delete from bounties where player_name = ? and kingdom = ?`, [targetName, pData.pledge]);
  await addBankItem(playerName, 21, payout);
  let player = players[playerName];
  let targetPlayer = players[targetName];
  if (player){
    sendMessage('server message', `You collect a bounty of ${payout} coins for defeating ${targetName}. It has been sent to your bank`, player);
  }
  if (targetPlayer){
    sendMessage('server message', `A bounty of ${payout} coins has been collected for your defeat. You are now a free man in the ${pData.pledge} kingdom!`, targetPlayer);
  }
  sendMessage('server message', `A bounty of ${payout} coins has been paid to ${playerName} by order of the ${pData.pledge} kingdom!`);
  return true;
}

async function startMurdererTimer(name) {
  if (!players[name].murderer) {
    setMurdererStatus(name, true, 60 * 30 * 1000);//to start, make 1 hour in milliseconds 60*60*1000    
  }
}

async function startCriminalTimer(name) {
  if (!players[name].criminal) {
    setCriminal(name, true, 60 * 15 * 1000);
  }
}

function getTilesInRadius(x, y, radius) {
  const tiles = [];

  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      const distSq = dx * dx + dy * dy;

      if (distSq <= radius * radius) { // <-- circle filter
        const nx = x + dx;
        const ny = y + dy;
        tiles.push({ nx, ny, dist: Math.sqrt(distSq) });
      }
    }
  }

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
    locked: false,
    owner: playerName
  };

  // move items from inventory into lootbag keyed by name
  for (const item of inv) {
    const name = Object.keys(baseTiles).find(key => baseTiles[key].id === item.id);
    if (!name) continue; // skip invalid items
    if (noTradeDrop.includes(name)){
      let noName = baseTiles[name]?.prettyName ?? name;
      sendMessage('pk message', `Your ${noName} is subjected to the elements and disappears...`, player);
      continue;
    }
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
  const tilesToCheck = getTilesInRadius(player.x, player.y, 3);

  for (const { nx, ny } of tilesToCheck) {
    const nTile = getTile(nx, ny, player.z);
    if (!nTile) continue;
    if (!nTile.objects || Object.keys(nTile.objects).length === 0) {
      nTile.objects = { lootbag };
      markTileChanged(nx, ny);
      break; // dropped successfully
    }
  }
}

async function respawnPlayer(name) {
  let player = players[name];
  const tile = getTile(player.x, player.y, player.z);
  delete tile.players[name];
  markTileChanged(player.x, player.y);
  player.hand = null;
  player.head = null;
  player.body = null;
  player.feet = null;
  player.quiver = null;
  if (player.murderer === true){
    player.x = 102;
    player.y = 74;
    player.z = 1;
    addPlayerToTile(name, 102, 74, 1);//forest jail!
    markTileChanged(102, 74);
    await addItem(name, idByItem("healthpotion"), 1);//lockpick when thieving a skill
    await addItem(name, idByItem("stoneSword"), 1);
    await syncInventory(name);
  } else {
    player.x = 26;
    player.y = 54;
    player.z = 0;
    addPlayerToTile(name, 26, 54, 0);//hospital!
    markTileChanged(26, 54);
  }
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
  player.mageLvl = await levelFromXp(player.mageXpTotal);
  player.farmingLvl = await levelFromXp(player.farmingXpTotal);

  const currState = {
    x: player.x,
    y: player.y,
    z: player.z,
    hand: player.hand,
    head: player.head,
    body: player.body,
    feet: player.feet,
    quiver: player.quiver,
    facing: player.facing,
    hp: player.hp,
    mana: player.mana,
    hpLvl: player.hpLvl,
    hpXpTotal: player.hpXpTotal,
    swordLvl: player.swordLvl,
    swordXpTotal: player.swordXpTotal,
    mageXpTotal: player.mageXpTotal,
    fishingXpTotal: player.fishingXpTotal,
    fishingLvl: player.fishingLvl,
    archeryLvl: player.archeryLvl,
    archeryXpTotal: player.archeryXpTotal,
    craftLvl: player.craftLvl,
    craftXpTotal: player.craftXpTotal,
    woodcuttingLvl: player.woodcuttingLvl,
    woodcuttingXpTotal: player.woodcuttingXpTotal,
    miningLvl: player.miningLvl,
    miningXpTotal: player.miningXpTotal,
    farmingLvl: player.farmingLvl,
    farmingXpTotal: player.farmingXpTotal
  };

  const last = player.lastState || {};

  const changed = Object.keys(currState).some(
    key => currState[key] !== last[key]
  );

  if (changed) {
    emitPlayerState(player);
    player.lastState = { ...currState };
  }
}

function mapUpdate() {
  if (Object.keys(players).length === 0) return;

  for (const p in players) {
    const player = players[p];
    if (!player) continue;
    environmentCheck(player);
    updatePlayerState(player);
    const chunk = map.Fxn.chunk(player.x, player.y);//coordinates only
    let newSum = 0;
    for (const row of chunk) {
      for (const [x, y] of row) {
        if (map.Map[y] && map.Map[y][x]) {
          newSum += map.Map[y][x].version;
        }
      }
    }
    const chunkKey = `${player.x},${player.y}`;
    if (player.lastChunkSum === newSum && player.lastChunkKey === chunkKey
    ) {
      continue;
    }
    player.lastChunkSum = newSum;
    player.lastChunkKey = chunkKey;
    io.to(player.sock_id).emit('updateChunk', generateLiveChunk(p, chunk));
  }
}

function environmentCheck(player){
  //right now just check lava tiles to damage player
  let tile = getTile(player.x, player.y, player.z);
  if (!tile) return;//?
  if (tile?.['b-t']){
    if (tile['b-t']==='lava'){
      //damage player if no fire boots (tba)
      if (Date.now()>player.lastGather+500){
        player.lastGather=Date.now();
        damagePlayer(null, player, 25, 'fire');
        sendMessage('pk message', `The lava burns you severely!`, player);        
      }

    }
  }
}

function generateLiveChunk(name, player_chunk) {
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
  if (!players[name].lastChunk) {//only runs once
    players[name].lastChunk = chunkObjects;
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

  socket.on('editorAddRadiusTiles', (data) => {
    console.log(`big editor >> click: ${data.click} x: ${data.x}, y: ${data.y}, z: ${data.z}, tile: ${data.tile}, radius: ${data.radius}, kOnly: ${data.k}`);
    editorAddTiles(data);
  })
});

async function editorAddTiles(data){
  console.log(`click: ${data.click}`);
  if (data.z<0 || data.z>4) return;
  let affectedTiles = getTilesInRadius(data.x, data.y, data.radius);
  if (!data.tile || !baseTiles[data.tile]) return;
  //check for players and mobs on those tiles
  for (tile in affectedTiles) {
    const { nx, ny } = affectedTiles[tile];
    let mapTile = getTile(nx, ny, data.z);
    if (!mapTile) continue;
    if (data.click==='left'){
      addToMap(data.tile, nx, ny, data.z, true);
    }
    if (data.click==='right'){
      clearTile(nx, ny, data.z, data.k);
    }
  }

}

function viewerUpdate(x, y) {
  //if (!players['Admin']) return;
  viewerNamespace.emit("mapUpdate", { x, y, tile: map.Map[y][x] });
}

io.on('connection', async (socket) => {
  console.log(`connecting ${socket.user} with socket id: ${socket.id}...`);

  // Check if the player object already exists in memory
  await connectPlayer(socket);
 
  Object.entries(players).forEach(([playerName, playerData]) => {
    console.log('Player:', playerName, 'ID:', playerData.sock_id);
  });
  sendMessage('server message', `${socket.user} logged in...`);

  socket.on('chat message', (msg) => {
    chatMessage(socket, msg);
  });

  socket.on("acceptTrade", fromName => {
    const toName = socket.user; // the accepter
    acceptTrade(fromName, toName);
  });

  socket.on("declineTrade", fromName => {
    const toName = socket.user;
    declineTrade(fromName, toName);
  });

  socket.on("tradeAccept", () => {
    const name = socket.user;
    tradeAccept(name);
  });

  socket.on("tradeCancel", () => {
    const name = socket.user;
    tradeCancel(name);
  });

  socket.on("tradeOfferUpdate", ({ slot, amount }) => {
    const name = socket.user;
    tradeOfferUpdate(name, slot, amount);
  });
  socket.on("player input", data => {
    const player = players[socket.user];
    setPlayerKeystate(player, data);
  });

  socket.on('typing', () => {
    setPlayerTyping(socket);
  });

  socket.on('stopTyping', () => {
    stopPlayerTyping(socket);
  })

  socket.on('paint', data => {
    playerPaint(socket.user, data);
  });

  socket.on("layTile", data => {
    layTile(socket, data);
  });

  socket.on("clearTile", data => {
    if (!devMode && socket.user !== "Admin") return;
    let admin = players[socket.user];
    clearTile(data.x, data.y, admin.z);
  });

  socket.on('createTile', data => {
    if (socket.user !== "Admin") return;
    createTileIfMissing(data.x, data.y, data.z);
  });

  socket.on('saveMap', () => {
    if (!devMode || socket.user !== "Admin") return;
    map.Fxn.save(map.Map);
  });

  socket.on("getInventory", async () => {
    const name = socket.user;
    await syncInventory(name);
  });

  socket.on('adminMove', (data) => {
    if (!devMode && socket.user !== 'Admin') return;
    let player = players[socket.user];
    let oldTile = getTile(player.x, player.y, player.z);
    delete oldTile.players['Admin'];
    markTileChanged(player.x, player.y);
    player.x = data[0];
    player.y = data[1];
    player.z = data[2];//change data to object frontend
    addPlayerToTile('Admin', player.x, player.y, player.z);
    markTileChanged(player.x, player.y);
  });

  socket.on('adminItem', async (data) => {
    if (!devMode && socket.user !== 'Admin') return;
    let player = players[socket.user];
    await addItem('Admin', data.id, data.amt);
  })

  socket.on('setSign', (data) => {
    if (!devMode && socket.user !== 'Admin') return;
    let player = players[socket.user];
    let tile = getTile(player.x, player.y, player.z);
    let signType = 'sign';
    if (!tile.objects?.['sign']) signType = 'signPost';
    tile.objects[signType].text = data;
  });

  socket.on('setOwner', (data) => {
    if (!devMode && socket.user !== 'Admin') return;
    let player = players[socket.user];
    let tile = getTile(player.x, player.y, player.z);
    let objName = Object.keys(tile.objects)[0];
    let objDef = tile.objects[objName];
    if (objDef?.owner){
      tile.objects[objName].owner = data;
    }
  })

  socket.on('setToCoords', (data) => {
    if (!devMode && socket.user !== 'Admin') return;
    let player = players[socket.user];
    let tile = getTile(player.x, player.y, player.z);
    let toObj = tile.objects[Object.keys(tile.objects)[0]];
    toObj.toX = data.x;
    toObj.toY = data.y;
    toObj.toZ = data.z;
    if (data?.exclusiveTo){
      toObj.exclusiveTo=data.exclusiveTo;//like for maze n shit
    }
  });

  socket.on('setQuestTile', (data) => {
    if (!devMode && socket.user !== 'Admin') return;
    let player = players[socket.user];
    let tile = getTile(player.x, player.y, player.z);
    let qTile = tile.questTile;
    if (!qTile) return;
    qTile.questName = data.name;
    qTile.stagePass = data.stage;
    qTile.prettyName = data.prettyName;
  })

  socket.on("downloadMap", () => {
    if (!devMode || socket.user !== "Admin") return;
    for (y in map.Map) {
      io.to(socket.id).emit("mapDownload", map.Map[y]);
    }
  });

  socket.on('activeInvItem', async (data) => {
    if (data >= 0 || data <= 31) {
      players[socket.user].activeInventory = data;
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

  socket.on('cookItem', async (data) => {
    let player = players[socket.user];
    if (player.chefQuest===0){
      sendMessage('pk message', `You must start the Chef's Quest to use the cooking range!`, player);
      return;
    }
    if (player.chefQuest<=1 && data!=='cookedRedfish'){
      sendMessage('pk message', `You must finish the Chef's Quest to prepare this!`, player);
      return;     
    }
    await craftItem(socket.user, data);
    await syncInventory(socket.user);
  });

  // Player withdraws from bank → goes into inventory
  socket.on('bankWithdraw', async (data) => {
    await bankWithdraw(socket, data);
  });

  // Player deposits into bank → removes from inventory
  socket.on('bankDeposit', async (data) => {
    await bankDeposit(socket, data);
  });

  socket.on('playerStuck', async () => {
    await teleportPlayer(socket.user, true);
  });

  socket.on('getLeaderboard', async () => {
    await loadLeaderboard(socket);
  });

  socket.on('disconnect', () => {
    disconnectPlayer(socket);
  });
});

function disconnectPlayer(socket){
  if (players[socket.user].murderer) {
    sendMessage('server message', `${socket.user} is afk as a murderer!`);
    //don't cleanup, keep active on server
  } else {
    console.log(`User logged out: ${socket.user}`);
    cleanupPlayer(socket.user);
    socket.request.session.destroy();
    sendMessage('server message', `${socket.user} logged out...`);
  }
}

async function loadLeaderboard(socket){
  try {
    const leaderboard = await getLeaderboard();

    // send it back to the same client
    socket.emit('leaderboardData', leaderboard);
  } catch (err) {
    console.error('Error fetching leaderboard:', err);
    // optional: notify client of error
    socket.emit('leaderboardError', { message: 'Could not load leaderboard' });
  }
}

async function bankDeposit(socket, data){
  let player = players[socket.user];
  if (Object.keys(player.tradeOffer).length>0){
    sendMessage('pk message', `DON'T`, player);
    return;
  }
  //check if king, if kings chest, etc
  let tile = getTile(player.x, player.y, player.z);
  if (!tile.objects['bankchest'] && !tile.objects['kingchest']) return;
  console.log("got past which chest type check");
  try {
    const { id, amt } = data;
    let bankName = player.name;
    // 1. Check how much is in inventory
    const invItems = await query(
      `SELECT amount FROM inventories WHERE player_name = ? AND id = ?`,
      [bankName, id]
    );
    let king = false;
    if (tile.objects?.['kingchest'] && player.king!==null){
      bankName = player.king;
      king = true;
    }
    if (invItems.length === 0) return; // nothing to deposit

    const invAmount = invItems[0].amount;
    const toDeposit = Math.min(amt, invAmount);

    if (toDeposit <= 0) return;

    // 2. Add to bank
    await addBankItem(bankName, id, toDeposit);

    // 3. Remove from inventory
    await removeItem(player.name, id, toDeposit);

    playerBank(player.name, king);
    syncInventory(player.name);
  } catch (err) {
    console.error('Error handling bankDeposit:', err);
  }
}

async function bankWithdraw(socket, data){
  //check if king, kings chest, etc
  let player = players[socket.user];
  let tile = getTile(player.x, player.y, player.z);
  if (!tile.objects?.bankchest && !tile.objects?.kingchest) return;
  try {
    const { id, amt } = data;

    // 1. Check how much is in the bank
    let bankName = player.name;
    let king = false;
    if (tile.objects?.kingchest && player.king!==null){
      bankName = player.king;
      king = true;
    }
    const bankItems = await query(
      `SELECT amount FROM bank WHERE player_name = ? AND id = ?`,
      [bankName, id]
    );

    if (bankItems.length === 0) return; // nothing to withdraw

    const bankAmount = bankItems[0].amount;
    const toWithdraw = Math.min(amt, bankAmount);

    if (toWithdraw <= 0) return;

    // 2. Try to add to inventory
    const added = await addItem(player.name, id, toWithdraw);

    if (added > 0) {
      // 3. Remove from bank only the amount actually added
      await removeBankItem(bankName, id, added);
      playerBank(player.name, king);
      syncInventory(player.name);
    } else {
    }
  } catch (err) {
    console.error('Error handling bankWithdraw:', err);
  }
}

function layTile(socket, data){
  if (!devMode && socket.user !== "Admin") {
    console.log("not Admin or devmode");
    return;
  }
  let x; let y; let z;
  if (data.x === null || data.y === null) {
    x = players[socket.user].x;
    y = players[socket.user].y;
  } else {
    x = data.x;
    y = data.y;
  }
  z = players[socket.user].z;
  if (x<0 || x>799 || y<0 || y>599) return;//out of bounds!
  addToMap(data.tile, x, y, z, true);
}

function playerPaint(name, data){//change this later
  if (data.y < 0 || data.y > 599 || data.x < 0 || data.x > 799) return;
  let player = players[name];
  if (data.y > player.y+6 || player.y < player.y-6){
    console.log("paint out of bounds!");
    return;
  }
  if (data.x > player.x+10 || player.x < player.x-10){
    return;
  }
  if (!player) return;
  let tile = getTile(data.x, data.y, player.z);
  let below = null;
  if (player.z>0){
    below = getTile(data.x, data.y, player.z-1);
  }
  if (data.btn === "right") {
    if (map.Map[data.y][data.x][0]?.pixels) {
      map.Map[data.y][data.x][0].pixels[data.subY][data.subX] = -1;
    }
  } else {
    if (map.Map[data.y][data.x][0]?.pixels) {
      map.Map[data.y][data.x][0].pixels[data.subY][data.subX] = data.c;
    } else {
      map.Map[data.y][data.x][0].pixels ??=
        [
          [-1, -1, -1, -1],
          [-1, -1, -1, -1],
          [-1, -1, -1, -1],
          [-1, -1, -1, -1]
        ];
      map.Map[data.y][data.x][0].pixels[data.subY][data.subX] = data.c;
    }

  }
  markTileChanged(data.x, data.y);
}

function stopPlayerTyping(socket){
  players[socket.user].typing.state = false;
  let player = players[socket.user];
  let tile = getTile(player.typing.lastSpot.x, player.typing.lastSpot.y, player.typing.lastSpot.z);
  tile.typing = false;
  markTileChanged(player.typing.lastSpot.x, player.typing.lastSpot.y);
}

function setPlayerTyping(socket){
  let player = players[socket.user];
  player.typing.state = true;
  player.typing.lastSpot.x = player.x;
  player.typing.lastSpot.y = player.y;
  player.typing.lastSpot.z = player.z;
  let tile = getTile(player.x, player.y, player.z);
  tile.typing = true;
  markTileChanged(player.x, player.y);
}

function setPlayerKeystate(player, data){
  if (!player.keystate) player.keystate = { up: false, down: false, left: false, right: false };

  // If data is a single key change
  if (typeof data === 'object' && data.key) {
    player.keystate[data.key] = data.state;
    return;
  }

  // If data is a space (existing behavior)
  if (data === ' ') useItem(player.name);
}

function tradeOfferUpdate(name, slot, amount){
  const other = players[name].tradingWith;
  if (!other) {
    return;
  }

  const item = players[name].inventory[slot];
  if (!item) {
    return;
  }
  if (noTradeDrop.includes(itemById[item.id])){
    let noName = baseTiles[itemById[item.id]]?.prettyName ?? itemById[item.id];
    sendMessage('pk message', `${noName}'s cannot be traded!`, players[name]);
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
}

function tradeCancel(name){
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
}

function tradeAccept(name){
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
}

async function connectPlayer(socket){
  if (players[socket.user]) {
    console.log(`${socket.user} is reconnecting to existing player object.`);
    players[socket.user].sock_id = socket.id; // reconnect socket
    let p = players[socket.user];
    markTileChanged(p.x, p.y);
    syncInventory(socket.user);
    emitPlayerState(p);
  } else {
    // Player does not exist → initialize normally
    await initPlayer(socket.user);
    console.log(`User connected: ${socket.user}`);
    players[socket.user].sock_id = socket.id;
    console.log(`Added id: ${socket.user} : ${players[socket.user].sock_id}`);
    await syncInventory(socket.user);
  }
}

function acceptTrade(fromName, toName){

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
}

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

function declineTrade(fromName, toName){

  // request must exist
  if (pendingTradeRequests[toName] !== fromName) return;

  delete pendingTradeRequests[toName];

  // notify sender
  if (players[fromName] && players[fromName].sock_id) {
    sendMessage('pk message', `${toName} declined to trade!`, players[fromName])
  }
}

function chatMessage(socket, msg){
  console.log(`${socket.user}: ${msg}`)
  if (msg[0] === "/") {
    parseCmdMsg(socket.user, msg);
  } else {
    let senderName = socket.user;
    if (players[socket.user].murderer===true){
      senderName = `<span style="color: red;">${senderName}</span>`;
    }
    if (players[socket.user].king!==null){
      switch (players[socket.user].king){
        case 'east':
          senderName = `<span style="color: green;">King</span> ${senderName}`;
          break;
        case 'west':
          senderName = `<span style="color: blue;">King</span> ${senderName}`;
          break;
      }
    }
    io.emit('chat message', {
      user: senderName,
      message: msg
    });
  }
}

async function parseCmdMsg(name, cmd) {
  let player = players[name];
  const words = cmd.slice(1).trim().split(/\s+/);
  if (words[0] === "tell") {
    if (players[words[1]]) {
      let recipient = words[1];
      let msg = words.slice(2).join(" ");
      io.to(players[words[1]]?.sock_id).emit('chat message', {
        user: "From: " + name,
        message: msg
      })
      io.to(player.sock_id).emit('chat message', {
        user: "To: " + player.name,
        message: msg
      })
    } else {
      sendMessage('pk message', `${words[1]} is not online...`, player);
    }
  }
  if (words[0]==='help'){
    helpChat(player, words);
  }
  if (words[0]==='bounty'){
    //await setBounty(player, words);
    sendMessage('pk message', `This feature is in development!`, player);
  }
  if (words[0]==='rank'){
    await rankPlayer(player, words);
  }
  if (words[0] === "trade") {
    let targetName = words[1];
    if (targetName === name) {
      sendMessage('pk message', `You must be high af...`, player);
      return;
    }
    if (players[name].murderer) {
      sendMessage('pk message', `As a murderer, you cannot trade...`, player);
      return;
    }
    if (players[targetName]?.sock_id) {
      if (players[targetName].murderer) {
        sendMessage('pk message', `You cannot trade with murderers...`, player);
      } else {
        sendTradeRequest(name, targetName);
      }
    } else {
      sendMessage('pk message', `${targetName} is not online...`, player);
    }
  }
  if (words[0] === "who") {
    sendMessage('server message', `\n${Object.keys(players)}`, player);
  }
  if (words[0] === "tax") {
    await setTaxes(player, words[1]);
  }
}

async function rankPlayer(player, words){
  //words[0] rank, words[1] name, words[2] title
  console.log(`targetPlayer: ${words[1]}, rank: ${words[2]}`);
  if (player.king===null){
    sendMessage('pk message', `Only the king may set ranks!`, player);
    return;
  }
  if (player.name===words[1]){
    sendMessage('pk message', `You are of the highest rank! You high or somethin'?`, player);
    return;
  }
  if (words[1]==='Admin'){
    sendMessage('pk message', `Lightning strikes the turrets of your castle!`, player);
    return;
  }
  if (words[2]!=='knight' && words[2]!=='general' && words[2]!=='none'){
    sendMessage('pk message', `Rank must be 'knight' or 'general'! 'none' to derank a player.`, player);
    return;
  }
  let targetPlayer = words[1];
  const [row] = await query(
    `SELECT 1 FROM players WHERE player_name = ? LIMIT 1`,
    [targetPlayer]
  );
  if (!row){
    sendMessage('pk message', `${targetPlayer} does not exist, or check that you spelled the player's name correctly.`, player);
    return;
  }
  let [targetSide] = await query(`select pledge from players where player_name = ?`, [targetPlayer]);
  if (targetSide.pledge!==player.king){
    sendMessage('pk message', `You can only rank constituents of your kingdom!`, player);
    return;
  }
  let [targetRank] = await query(`select player_rank from players where player_name = ?`, [targetPlayer]);
  if (targetRank.player_rank===words[2]){
    sendMessage('pk message', `${targetPlayer} already holds the rank of ${words[2]}!`, player);
    return;
  }
  sendMessage('server message', `You set ${targetPlayer}'s rank to ${words[2]}!`);
  let setRank = words[2];
  if (setRank === 'none') setRank = null;
  query(`update players set player_rank = ? where player_name = ?`, [setRank, words[1]]);

}

async function setBounty(player, words){
  //words[0] bounty, words[1] name, words[2] amount of coin
  if (player.king===null){
    sendMessage('pk message', `Only the king may set bounties!`, player);
    return;
  }
  if (player.name===words[1]){
    sendMessage('pk message', `You can't set a bounty on yourself!`, player);
    return;
  }
  if (words[1]==='Admin'){
    sendMessage('pk message', `Lightning strikes the turrets of your castle!`, player);
    return;
  }
  let targetPlayer = words[1];
  const [row] = await query(
    `SELECT 1 FROM players WHERE player_name = ? LIMIT 1`,
    [targetPlayer]
  );
  if (!row){
    sendMessage('pk message', `${targetPlayer} does not exist, or check that you spelled the player's name correctly.`, player);
    return;
  }
  const bounty = Number(words[2]);
  if (isNaN(bounty) || bounty <= 0){
    sendMessage('pk message', `Enter a valid number of coins for bounty. ex: '/bounty playerName 12345'`, player);
    return;
  }
  let hasCoin = await getItemAmount(player.name, 21);
  if (hasCoin < bounty) {
    sendMessage('pk message', `You only have ${hasCoin} coins, bounty cannot be set!`, player);
    return;
  }
  await removeItem(player.name, 21, bounty);
  //check if bounty exists/is compounding
  let existingBounty = false;
  let bountyQuery = [targetPlayer, player.king];
  let [hasBounty] = await query(`select * from bounties where player_name = ? and kingdom = ?`, bountyQuery);
  if (hasBounty){
    //exists, hasBounty.amount is the existing amount of bounty
    existingBounty = true;
  }
  await query(
    `INSERT INTO bounties (player_name, kingdom, amount)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE amount = amount + VALUES(amount)`,
    [targetPlayer, player.king, bounty]
  );
  sendMessage('server message', `You set a bounty of ${bounty} coins on ${words[1]}!`, player);
  if (existingBounty===true){
    sendMessage('server message', `Total bounty for ${targetPlayer} is now ${hasBounty.amount + bounty} coins!`, player);
  }
  let targetSide = await query(`select pledge from players where player_name = ?`, [targetPlayer]);
  if (targetSide[0] && targetSide[0]?.pledge === player.king){
    await query(`update players set pledge = NULL where player_name = ?`, [targetPlayer]);
    sendMessage('server message', `${targetPlayer} was unpledged from the kingdom!`, player);
  }
  if (players[targetPlayer]){
    sendMessage('pk message', `King ${player.name} of the ${player.king} kingdom has put a bounty of ${bounty} coins on your head!`, players[targetPlayer]);
    if (existingBounty===true){
      sendMessage('pk message', `You now have a bounty of ${hasBounty.amount + bounty} coins on your head!`, players[targetPlayer]);
    }
    if (players[targetPlayer].pledge===player.king){
      players[targetPlayer].pledge = null;
      sendMessage('pk message', `You have lost your citizenship of the ${player.king} kingdom!`, players[targetPlayer]);
    }
  }
  sendMessage('pk message', `King ${player.name} of the ${player.king} kingdom has set the bounty on ${targetPlayer} to ${hasBounty?.amount || 0 + bounty} coins!`);
}

function helpChat(player, words){
  //words[0] is 'chat', if only words[0] send basic help, otherwise parse help words
  if (words.length===1){
    //send basic help
    sendMessage(
      'server message',
      `<span style="color:green;">WASD or arrow keys to move around, Shift to interact with most things while standing on or next to thing.\nLeft click inventory item to select it, Right click to drop it, space to use or equip it.\nType '/help all' to see a list of /help commands to help you with stuff in the game! Stand on signs and press Shift for info!</span>`,
      player
    )
    return;
  }
  switch (words[1]){
    case 'trade':
      sendMessage(
        'server message',
        `type '/trade playername123' (insert a real name, ding dong) to trade with another player if they are online. A message will appear in the chat log, click Accept to initiate trade or Decline to deny it.`,
        player
      )
      return;
    case 'controls':
      sendMessage(
        'server message',
        `WASD/Arrow keys to move around. Left click an item in inventory to select it, Right click to drop it. Spacebar to use or equip selected inventory item. For range and mage, equip bow or mage book and arrows or dust, then Shift to shoot arrow or cast spell.`,
        player
      );
      return;
    case 'paint':
      sendMessage(
        'server message',
        `Click the 'paint' tab, select a color (black by default), then left click/drag to paint on the map! Right click to erase pixels.`,
        player
      );
      return;
    case 'all':
      sendMessage(
        'server message',
        `/help commands: 'all', 'trade', 'controls', paint`,
        player
      );
      return;
  }
  sendMessage(
    'server message',
    `Syntax for /help is '/help <thing>', e.g. '/help trade' or '/help controls'. Type '/help all' for a list of help commands.`,
    player
  )
}

async function setTaxes(player, tax){
  if (player.king === null) {
    sendMessage('pk message', `You don't have the authority to do that!`, player); return;
  }
  const taxes = Number(tax);
  if (isNaN(taxes)){
    sendMessage('pk message', `Enter a valid number (0-50)...`, player);
    return;
  }
  if (taxes < 0 || taxes > 50) {
    sendMessage('pk message', `Taxes must be between 0 and 50.`, player);
    return;
  }
  await query(`update kingdoms set tax = ? where kingdom = ?`, [taxes, player.king]);
  kingdoms[player.king].tax = taxes;

  await dbKingdoms();
  sendMessage('server message', `You set the ${player.king} kingdom's taxes to ${taxes}%`, player);
  updateKingStatus();
}

async function sendTradeRequest(fromName, toName) {

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
  for (const slot in offerA) {
    const item = offerA[slot];
    if (!item) continue;

    const amount = Number(item.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      continue;
    }

    await removeItem(a, item.id, amount);
    await addItem(b, item.id, amount);
  }

  // remove items from B → give to A
  for (const slot in offerB) {
    const item = offerB[slot];
    if (!item) continue;

    const amount = Number(item.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      continue;
    }

    await removeItem(b, item.id, amount);
    await addItem(a, item.id, amount);
  }

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

async function handlePlayerInput(name, keystate) {
  if (!players[name]) return;
  let player = players[name];
  if (keystate.up || keystate.down || keystate.left || keystate.right) {
    await movePlayer(name, keystate);
  }
}

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

const murderSpriteMap = {
  left: "murderL",
  right: "murderR"
};

const crimSpriteMap = {
  left: "criminalL",
  right: "criminalR"
}

const directions = ['up', 'down', 'left', 'right'];

async function movePlayer(name, data) {
  cancelPendingChannels(name);

  let player = players[name];

  if (Date.now() < player.lastMove + player.movementSpeed) return;
  if (slowPlayer(player)) return;

  player.lastMove = Date.now();

  let modCoords;
  let _dir;

  directions.forEach(dir => {
    if (data[dir]) {
      const [dx, dy] = dirOffsets[dir];
      modCoords = { x: player.x + dx, y: player.y + dy };
      _dir = dir;
    }
  });

  if (!modCoords) return;

  setSprite(player, _dir);
  player.lastDir = _dir;

  addPlayerToTile(name, player.x, player.y, player.z);
  markTileChanged(player.x, player.y);

  if (checkCollision(name, modCoords.x, modCoords.y, player.z)) return;

  let tile = getTile(player.x, player.y, player.z);
  delete tile.players[name];
  markTileChanged(player.x, player.y);

  sendSound(player, [player.step]);

  player.step = (player.step === "stepR") ? "stepL" : "stepR";

  let checkTile = getTile(modCoords.x, modCoords.y, player.z);
  let checkCol = getColumn(modCoords.x, modCoords.y);

 // ===== Z LOGIC =====

  let targetZ = player.z;

  for (let z = player.z; z >= 0; z--) {
    if (checkTile?.['b-t']){
      break;
    }
    if (checkTile?.floor){
      if (Object.keys(checkTile.floor).length>0){
        break;
      }
    }
    let colTile = checkCol[z];
    if (!colTile) continue;
    // b-t / collision object → land here
    if (colTile.objects) {
      let keys = Object.keys(colTile.objects);
      if (keys.length > 0) {
        let obj = baseTiles[keys[0]];
        if (obj && obj.collision === true && !keys[0].startsWith('tree')) {
          targetZ = z+1;
          break;
        }
      }
    }
    // ROOF → stay at current z
    if (colTile.roof && Object.keys(colTile.roof).length > 0) {
      targetZ = player.z;
      break;
    }

    // FLOOR → stand on this z
    if (colTile.floor) {
      targetZ = z;
      break;
    }

    if (z === 0) {
      targetZ = 0;
      break;
    }
  }
  
  if (checkTile?.objects) {
    if (Object.keys(checkTile.objects).length > 0) {
      let key = Object.keys(checkTile.objects)[0];
      if (key === "stairsL" || key === "stairsR") {
        if (player.z < 4) {
          targetZ = player.z + 1;
        }
      }
    }
  }
  
  player.z = targetZ;
  
  // ===== END Z LOGIC =====


  player.x = modCoords.x;
  player.y = modCoords.y;

  addPlayerToTile(name, modCoords.x, modCoords.y, player.z);
  checkObscured(player);
  markTileChanged(player.x, player.y);
}

function checkObscured(player) {

  let col = getColumn(player.x, player.y);
  player.obscured = false;

  if (!col) return;

  for (let z in col) {

    z = Number(z);
    if (z <= player.z) continue;

    let tile = col[z];
    if (!tile) continue;

    if (
      (tile.floor && Object.keys(tile.floor).length > 0) ||
      (tile.roof && Object.keys(tile.roof).length > 0) ||
      (tile.objects &&
        baseTiles[Object.keys(tile.objects)[0]]?.collision === true)
    ) {
      player.obscured = true;
      return;
    }
  }
}

function slowPlayer(player){
  if (player.slow === true) {
    player.slowTime -= player.movementSpeed;
    if (player.slowTime <= 0) {
      player.slow = false;
      player.slowTime = 0;
      return false;
    }
    return true;//can move next time lol
  }
  return false;
}

function cancelPendingChannels(name){
  if (pendingTeleports[name]) {
    clearTimeout(pendingTeleports[name]);
    delete pendingTeleports[name];
  }
  const channel = activeChannels[name];

  if (channel && channel.cancelOnMove) {
    clearTimeout(channel.timer);
    delete activeChannels[name];

    channel.onCancel?.();
    if (players[name]){
      io.to(players[name].sock_id).emit('channelCancel');
    }
  }
}

function setSprite(player, dir){
  if (!spriteMap[dir]) return;
  player.sprite = spriteMap[dir];
  player.facing = dir;

  // murderer sprite override if player is a murderer
  if (player.murderer) {
    player.murderSprite = murderSpriteMap[dir];
  } else {
    player.murderSprite = null;
  }
  if (player.murderer) {
    player.criminal = false;
    clearCriminal(player.name);
  }
  if (player.criminal) {
    player.criminalSprite = crimSpriteMap[dir];
  }
}

function createTileIfMissing(x, y, z) {
  if (!map.Map[y] || !map.Map[y][x]) return; // do NOT create new columns
  if (!map.Map[y][x][z]) {
    map.Map[y][x][z] = {
    };
  }
}

const tileMaxX = map.Map[0].length;
const tileMaxY = map.Map.length;

function checkCollision(name, x, y, z) {
  let player = players[name];
  if (x < 0 || x > tileMaxX - 1) {  //need next map on collision with edge
    return true;
  }
  if (y < 0 || y > tileMaxY - 1) {
    return true;
  }

  let tile = getTile(x, y, z);
  if (tile===null || tile===undefined) return;
  if (tile?.['b-t']){
    if (baseTiles[tile['b-t']].collision === true) {
      //but if it's water, do other stuff, coulda put fishing here lmao
      checkCollisionBaseTile(name, tile);
      return true;
    }
  }
  if (tile?.questTile) {//for entry into quest only areas
    let qName = tile.questTile.questName;
    if (player[tile.questTile.questName] < tile.questTile.stagePass) {
      if (tile.questTile.questName === 'eyeGame') {
        sendMessage('pk message', `To play the Eye Game, put 250 coins in the coffer by standing on it and pressing shift!`, player);
        return true;
      } else {
        sendMessage('pk message', `You must complete ${tile.questTile.prettyName} to pass...`, player);
        return true;
      }
    }
    if (qName && qName.startsWith('maze')) {
      initMaze(player, qName);
    }
    if (qName && qName.includes('Game')){
      initGame(player, qName);
    }
  }
  //player melee here??
  if (checkMelee(name, x, y, z)) {//stay in place if hitting somebody
    return true;
  }
  if (tile?.mob) {
    if (tile.mob?.collision === true) {
      return true;
    }
  }
  const objects = tile.objects ?? {};
  for (const objKey in objects) {
    const obj = objects[objKey];
    const def = baseTiles[obj.name];

    if (!def || def.collision !== true) continue;

    if (obj.name === "door" && obj.locked === false) continue;
    // Special: allow owners to walk through their own doors
    if (obj.name === "door" && obj.owner === name) {
      if (players[name].murderer) {
        sendMessage('pk message', `As a murderer,  you cannot hide...`, players[name]);
        return true;
      } else {
        continue; // skip collision for this object
      }
    }
    if (npcs.includes(obj.name)){
      npcInteract(name, obj.name);
      return true;
    }

    // Normal collision otherwise
    checkObjectCollision(name, x, y, z, obj.name);
    return true;
  }
  if (players[name].murderer && tile.safeTile) {
    sendMessage('pk message', `As a murderer, you cannot enter safe places...`, players[name]);
    return true;//lol they can't go to safe area!
  }
  return false;
}

let eyeGame = {
  currPlayer: null,//set when paid, can't pay if currPlayer not null
  started: false,//set with initGame
  tries: 0,//max 6, reset to 0
  full: 4,
  correctList: [],
  slots:{
    1:{x:523, y:350, color:null, correct:null},//color is players choice, set back to null each try or end game
    2:{x:524, y:350, color:null, correct:null},
    3:{x:525, y:350, color:null, correct:null},
    4:{x:526, y:350, color:null, correct:null}
  },
  eyeClue: getTile(522, 350, 0),
  doorTimer:null,//forfeit if doesn't enter after 30 seconds, delete if enter, otherwise set player.eyeGame to 0
  gameTimer:null,//1 or 2 minutes of guessing time, delete
  logicInterval:null,//a setInterval that checks eyeGame state, increments guesses, sets win/lose etc
  prizeTimer:null,//30 seconds to get prize or get kicked out!
}

async function randomizeEyeGame(){
  for (let i = 1; i<5; i++){
    let randColor = "eye" + eyeTypes[Math.floor(Math.random()*eyeTypes.length)];
    eyeGame.slots[i].correct = randColor;
    eyeGame.correctList.push(randColor);
  }
}

let eyeGameDrops = [
  { name: "coin", min: 1, max: 10000, weight: 10000 },
  { name: "silver", min: 1, max: 12, weight: 1000 },
  { name: "gold", min: 1, max: 12, weight: 500 },
  { name: "diamond", min: 1, max: 12, weight: 100 },
  { name: "speedboots", min:1, max: 1, weight: 100 },
  { name: "xpHat", min:1, max:1, weight: 25 }
]


async function startEyeGame(player){
  //function to randomize eye game color order
  await randomizeEyeGame();
  eyeGame.eyeClue.floor.clues={
    1:null,
    2:null,
    3:null,
    4:null
  }
  for (let i = 1; i<5; i++){
    console.log(eyeGame.slots[i].correct);
  }
  player.eyeGame=2;
  eyeGame.logicInterval = setInterval(() => {
    //actual game logic function
    eyeGameLogic(player);//pulls everything from 
  },100);
  eyeGame.gameTimer = setTimeout(() =>{
    //will get cancelled and there will be a treasure timer if win (logicInterval cancels this)
    sendMessage('pk message', `Time's up!`, player);
    let tile = getTile(player.x, player.y, player.z);
    delete tile.players;
    player.x=524; player.y=354; player.z=0;
    addPlayerToTile(player.name, player.x, player.y, player.z);
    markTileChanged(player.x, player.y);
    player.eyeGame=0;
    //reset eye game function
    resetEyeGame();
  }, 1000*60*2);//2 minutes of guessing, 10 guesses
}

function eyeGameLogic(player){
  for (let i = 1; i<5; i++){
    if (eyeGame.slots[i].color===null){
      let x = eyeGame.slots[i].x; let y = eyeGame.slots[i].y;
      let tile = getTile(x, y, 0);
      if (tile?.objects){
        if (Object.keys(tile.objects)[0].startsWith('eye')){
          eyeGame.slots[i].color=Object.keys(tile.objects)[0];
          eyeGame.full-=1;
        } else {
          //maybe give item back or tell player it went into a black hole!
          delete tile.objects;
        }
      }
    }
  }
  if (eyeGame.full===0){
    checkEyeGameWin(player);
  }
}

function checkEyeGameWin(player){
  eyeGame.eyeClue.floor.clues={
    1: null,
    2: null,
    3: null,
    4: null
  }
  if(
    eyeGame.slots[1].correct === eyeGame.slots[1].color &&
    eyeGame.slots[2].correct === eyeGame.slots[2].color &&
    eyeGame.slots[3].correct === eyeGame.slots[3].color &&
    eyeGame.slots[4].correct === eyeGame.slots[4].color
  ) {
    sendMessage('server message', `You solved the puzzle! You have 30 seconds to claim your prize!`, player);
    clearInterval(eyeGame.logicInterval);
    clearTimeout(eyeGame.gameTimer);
    //add win stairs and/or prize and eyeGame.prizeTimer set
    dropMobLoot(eyeGameDrops, 522, 350);
    eyeGame.prizeTimer = setTimeout(() => {
      let prizeTile = getTile(522, 350, 0);
      delete prizeTile.objects;
      let tile = getTile(player.x, player.y, player.z);
      delete tile.players;
      player.x = 524; player.y = 354; player.z = 0;
      addPlayerToTile(player.name, player.x, player.y, player.z);
      markTileChanged(player.x, player.y);
      player.eyeGame = 0;
      resetEyeGame();
    }, 30000);
  } else{
    sendMessage('pk message', `Nope!`, player);
    //hilight correct tiles
    let corrects = [];
    for (let i = 1; i < 5; i++) {
      eyeGame.eyeClue.floor.clues[i]=null;
      if (eyeGame.slots[i].correct === eyeGame.slots[i].color){
        corrects.push('white');
        console.log(eyeGame.eyeClue.floor.clues[i]);
      }
      else if (eyeGame.correctList.includes(eyeGame.slots[i].color)){
        corrects.push('black');
        console.log(eyeGame.eyeClue.floor.clues[i]);
      }
    }
    for (let c = 1; c<=corrects.length; c++){
      eyeGame.eyeClue.floor.clues[c]=corrects[c-1];
    }
    eyeGame.full = 4;
    eyeGame.tries += 1;
    setTimeout(() => {
      for (let i = 1; i < 5; i++) {
        eyeGame.slots[i].color = null;
        let x = eyeGame.slots[i].x; let y = eyeGame.slots[i].y;
        let tile = getTile(x, y, 0);
        delete tile?.objects;
      }
      if (eyeGame.tries >= 10) {
        sendMessage('pk message', `You failed to solve the puzzle!`, player);
        let tile = getTile(player.x, player.y, player.z);
        delete tile.players;
        player.x = 524; player.y = 354; player.z = 0;
        addPlayerToTile(player.name, player.x, player.y, player.z);
        markTileChanged(player.x, player.y);
        player.eyeGame = 0;
        resetEyeGame();
      }
    }, 2000);
  }
}

function resetEyeGame(){
  //clear map markers, set properties back to default
  let prizeTile = getTile(522, 350, 0);
  delete prizeTile.objects;
  clearInterval(eyeGame.logicInterval);
  clearTimeout(eyeGame.gameTimer);
  for (let i = 1; i<5; i++){
    let x = eyeGame.slots[i].x; let y = eyeGame.slots[i].y;//y+1 through 9 for actual mastermind
    let tile = getTile(x, y, 0);
    delete tile?.objects;
  }
  eyeGame.eyeClue.floor.clues={
    1:null,
    2:null,
    3:null,
    4:null
  }
  eyeGame = {
    currPlayer: null,
    started: false,
    tries: 0,
    full: 4,
    correctList: [],
    eyeClue: getTile(522, 350, 0),
    slots: {
      1: { x: 523, y: 350, color: null, correct: null },
      2: { x: 524, y: 350, color: null, correct: null },
      3: { x: 525, y: 350, color: null, correct: null },
      4: { x: 526, y: 350, color: null, correct: null }
    },
    doorTimer: null,
    gameTimer: null,
    logicInterval: null,
    prizeTimer: null,
  }
}

async function initGame(player, gameName){
  switch (gameName){
    case "eyeGame":
      if (eyeGame.currPlayer===player.name && player.eyeGame===2){
        //forfeit game! tele player anyway
        sendMessage('pk message', `By leaving the area you forfeit the game!`, player);
        let prizeTile = getTile(522, 350, 0);
        delete prizeTile.objects;
        setTimeout(() => {
          let tile = getTile(player.x, player.y, player.z);
          delete tile.players;
          player.x = 524; player.y = 354; player.z = 0;
          addPlayerToTile(player.name, player.x, player.y, player.z);
          markTileChanged(player.x, player.y);
          player.eyeGame = 0;
          resetEyeGame();
        }, 500);
      } else {
        clearTimeout(eyeGame.doorTimer);
        eyeGame.doorTimer = null;
        startEyeGame(player);
      }
      break;
  }
}

async function initMaze(player, maze){
  switch (maze){
    case 'maze1':
      //player timer to add dungeon stairs to end of maze for x seconds
      //async function setMazeTimer(name, mazeName, dur, from, to, teleBack) {
      await setMazeTimer(
        player.name, maze, 6000,
        {x:265, y:12, z:0},
        {x:520, y:342, z:0},
        {x:259, y:13, z:0}
      )
      break;
  }
}

async function checkCollisionBaseTile(name, tile) {
  const player = players[name];
  if (!player) return;

  if (tile['b-t'] === 'water') {
    await waterTileInteract(player, tile);
  }
  //if tile campfire cook food
}

async function waterTileInteract(player, tile){
  const activeSlotIndex = player.activeInventory;
  const activeSlot = player.inventory[activeSlotIndex];
  if (!activeSlot) return;

  const activeItem = itemById[activeSlot.id];
  if (activeItem !== 'bucket') return;

  const bucketId = idByItem('bucket');
  const waterBucketId = baseTiles['waterbucket'].id;//dafuq lol

  // Check if player already has water bucket
  const existing = await getItemAmount(player.name, waterBucketId);
  if (existing > 0) {
    // stacking allowed
    // remove one bucket
    await removeItem(player.name, bucketId, 1);
    await addItem(player.name, waterBucketId, 1);
    sendMessage('server message', `You fill the bucket with water.`, player);
    await syncInventory(player.name);
    return;
  }

  // Inventory full? Check if we can replace this slot
  const slotsUsed = await getInventoryCount(player.name);
  if (slotsUsed >= 32) {
    // If the **current slot has the bucket**, we can replace it
    player.inventory[activeSlotIndex].id = waterBucketId;
    sendMessage('server message', `You fill the bucket with water.`, player);
    await removeItem(player.name, bucketId, 1);
    await addItem(player.name, waterBucketId, 1);
    await syncInventory(player.name);
    return;
  }

  // Otherwise, normal add
  const added = await addItem(player.name, waterBucketId, 1);
  if (added === 0) {
    sendMessage('pk message', `Your inventory is full.`, player);
    return;
  }

  // Remove bucket
  await removeItem(player.name, bucketId, 1);
  sendMessage('server message', `You fill the bucket with water.`, player);
  await syncInventory(player.name);
}

let npcs = ['shopkeep', 'belethor', 'merchant', 'chef', 'farmer', 'hermit', 'theEye', 'gateGuard', 'peasant', 'kingsaid'];

async function npcInteract(name, npcName){
  let player = players[name];
  let npcObject = baseTiles[npcName];
  if (npcObject?.speech){
    sendMessage('chat message', `\n<span style="color: green;">${npcObject.prettyName}</span>: ${npcObject.speech}`, player);
  }
  if (npcObject?.quest){
    await npcQuest(player, npcObject);
  }
  if (npcObject?.action){//action that is not in quest
    await npcAction(player, npcObject);
  }
}

async function npcQuest(player, npcObj){
  let questName = npcObj.quest.name;
  let questStage = player[questName];
  let npcSpeech = npcObj.quest[questStage].speech;
  sendMessage('chat message', `\n<span style="color: green;">${npcObj.prettyName}</span>: ${npcSpeech}`, player);
  if (npcObj.quest[questStage]?.action){
    npcObj.quest[questStage].action(player, query, addItem, removeItem, getItemAmount, sendMessage);//won't necessarily query, but fine this way
  }
}

async function npcAction(player, npcObj){
  npcObj.action(player, sendMessage, kingdoms);
}

async function mobQuestLogic(player, questName, mob){
  if (questName==='trollQuest'){
    if (player.trollQuest===1){
      await query(
        "UPDATE players SET trollQuest = 2 WHERE player_name = ?",
        [player.name]
      );
      player.trollQuest = 2;
    }
  }
}

function checkMelee(name, x, y, z) {
  let player = players[name];
  if (player.hand === null) return false;
  if (player.slow === true) return false;//can't attack if slowed!
  const tile = getTile(x, y, z);
  const isSafe = isSafeActive(tile);

  // 1️⃣ Players first
  const tilePlayerNames = Object.keys(tile.players || {});
  if (tilePlayerNames.length > 0) {
    const playerTarget = tilePlayerNames[0];

    // allow attack if tile is not safe OR target is a murderer
    if (!isSafe || (players[playerTarget] && players[playerTarget].murderer) || (players[playerTarget] && players[playerTarget].criminal)) {
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

async function meleeAttack(name, targetName) {
  let targetPlayer = players[targetName];
  let player = players[name];
  let timeBonus=1000;
  if (player.hand!==null){
    if (baseTiles[itemById[player.hand]]?.timeBonus){
      timeBonus -= baseTiles[itemById[player.hand]].timeBonus;
    }
  }
  
  if (Date.now() < players[name].lastMelee + timeBonus) {//change to -level?
    return;
  }
  players[name].lastMelee = Date.now();
  let damage = 0;
  let weaponName = itemById[players[name].hand];
  let weaponDmg = baseTiles[weaponName].attack;
  if (weaponDmg !== 0) {
    damage += Math.floor(Math.random() * weaponDmg);
    damage += Math.floor(Math.random() * players[name].swordLvl);
    damagePlayer(player, targetPlayer, damage, "melee");
  }
}

async function randomBeeSting(playerName) {
  let player = players[playerName];
  if (Math.floor(Math.random() * 10 < 5)) {
    sendMessage('pk message', 'You got stung by a bee while trying to pick the flower!', player);
    damagePlayer(null, player, 5, 'melee');
    return true;
  }
  return false;
}

async function areaDamage(projId, x, y, z, radius, type, damage) {
  let affectedTiles = getTilesInRadius(x, y, radius);
  //check for players and mobs on those tiles
  for (tile in affectedTiles) {
    
    const { nx, ny } = affectedTiles[tile];

    let mapTile = getTile(nx, ny);
    if (!mapTile) continue;
    if (mapTile.floor === undefined) {
      mapTile.floor = {};
      if (Object.keys(mapTile.floor).length === 0) {
        areaStrike(mapTile, type);
      }
    }
    if (type==='fire' || type ==='lightning' && mapTile?.objects){
      if (!mapTile?.objects) continue;
      if (Object.keys(mapTile.objects).length!==0){
        if (Object.keys(mapTile.objects)[0].startsWith('tree') || Object.keys(mapTile.objects)[0].startsWith('oak')){
          if (!mapTile?.depletedResources){
            delete mapTile.objects;
            mapTile.objects = {};
            mapTile.objects['deadtree0'] = {name: 'deadtree0'}
          }
        }
      }
    }
    if (mapTile?.mob && players[projId]) {
      damageMob(projId, mapTile.mob.id, damage);
    }
    if (mapTile?.players) {
      for (p in mapTile.players) {
        let targetPlayer = players[p];
        if (targetPlayer) {
          let fromPlayer = players[projId];
          if (!fromPlayer) {
            fromPlayer = null;
          } else {
            if (fromPlayer.name===projId && type==="lightning"){
              continue;
            }
          }
          damagePlayer(fromPlayer, targetPlayer, damage, type);
        }
      }
    }
  }
}

async function areaStrike(mapTile, type){
  mapTile.floor[type] = { name: type };//redundant but meh
  markTileChanged(mapTile.x, mapTile.y);
  setTimeout(async () => {
    delete mapTile.floor;
    markTileChanged(mapTile.x, mapTile.y);
    setTimeout(async () => {
      mapTile.floor = {};
      mapTile.floor[type] = { name: type };
      markTileChanged(mapTile.x, mapTile.y);
      setTimeout(async() => {
        delete mapTile.floor;
        markTileChanged(mapTile.x, mapTile.y);
      }, 250);
    }, 250);
  }, 250);
}

async function damagePlayer(player, targetPlayer, damage, type) {
  if (targetPlayer.takingThrone===true){
    cancelPendingChannels(targetPlayer.name);
  }
  if (player !== null) {
    if (type!=="lightning"){
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
    }
  }

  targetPlayer.hp -= damage;//change to playerattack-targetdefense etc
  if (player !== null) {
    if (!targetPlayer.criminal && !targetPlayer.murderer && targetPlayer.name !== player.name) {
      if (!player.criminal && !player.murderer) {
        let protection = false;
        let bountyParams = [targetPlayer.name, player.pledge];
        let [targetBounty] = await query(`select * from bounties where player_name = ? and kingdom = ?`, bountyParams);
        if (targetBounty && player.rank!==null){
          protection = true;
        }
        if (protection === false){
          startCriminalTimer(player.name);//15 min criminal!
          sendMessage('pk message', 'You are now wanted!', player);          
        } else {
          sendMessage('server message', `${targetPlayer.name}'s bounty prevents you from criminal status.`, player);
        }
      }
    }
  }
  if (player !== null) {
    targetPlayer.lastHitBy = player.name;
    player.lastPlayerHit = targetPlayer.name;
  }

  if (damage > 0) {
    if (player !== null) sendSound(player, ['hit']);
    sendSound(targetPlayer, ['hit', 'damage']);
    if (player !== null) {
      sendMessage('pk message', `${player.name} hit you for ${damage} damage!`, targetPlayer);
      sendMessage('pk message', `You hit ${targetPlayer.name} for ${damage} damage!`, player);
    }

  }
  else {
    if (player !== null) {
      sendSound(player, ['miss']);
      sendSound(targetPlayer, ['miss']);
    }
  }
}

function meleeAttackMob(playerName, mobId) {
  const mob = mobs.get(mobId);
  if (!mob) return;
  let player = players[playerName];
  let timeBonus = 1000;
  if (player.hand!==null){
    if (baseTiles[itemById[player.hand]]?.timeBonus){
      timeBonus -= baseTiles[itemById[player.hand]].timeBonus;
    }
  }
  if (Date.now() < players[playerName].lastMelee + timeBonus) return;
  players[playerName].lastMelee = Date.now();

  const weaponName = itemById[players[playerName].hand];
  const weaponDmg = baseTiles[weaponName].attack || 0;
  let damage = 0;
  if (weaponDmg !== 0) {
    damage += Math.floor(Math.random() * weaponDmg);
    damage += Math.floor(Math.random() * players[playerName].swordLvl);
  }
  if (damage !== 0) {
    damageMob(playerName, mobId, damage, "melee");
  } else {
    sendSound(players[playerName], ['miss']);
  }
}

async function damageMob(playerName, mobId, damage, type) {
  let player = players[playerName];
  let targetMob = mobs.get(mobId);
  if (targetMob?.guard){
    if (player.king!==null){
      if (targetMob?.kingdom){
        if (targetMob.kingdom===player.king){
          sendMessage('pk message', `The guard cowers before you... You sheath your sword...`, player);
          return;
        }
      }
    }
  }
  targetMob.lastHitBy = playerName;
  //if king/ally and guard of that kingdom, return (though may need to skip in collision?)
  let xp = Math.floor(damage / 10);
  if (targetMob.hp - damage < 0) {
    xp = Math.floor(Math.floor(targetMob.hp / 10));
  }
  if (xp < 1) {
    xp = 1;
  }
  await giveXp(playerName, xp, type);
  if (damage < 0) {
    damage = 0;
  }
  if (targetMob?.guard){
    if (!player.criminal && !player.murderer){
      await setCriminal(playerName, true, 1000*60*10);
    }
  }
  targetMob.hp -= damage;
  sendSound(players[playerName], ['hit']);
  sendMessage('pk message', `You hit the ${targetMob.type} for ${damage} damage!`, players[playerName]);
}

async function giveXp(playerName, xp, type) {//check player.*Lvl against lvlFromXp(*XpTotal) to send lvl up!
  let player = players[playerName];
  if (type===undefined) return;
  if (itemById[player.head]==="xpHat"){
    xp = xp*10;
  }
  sendMessage('server message', `+${xp} ${type} xp`, player);
  switch (type) {
    case "melee":
      player.swordXpTotal += xp;
      player.hpXpTotal += xp;
      break;
    case "archery":
      player.archeryXpTotal += xp;
      player.hpXpTotal += 1;
      break;
    case "mage":
      player.mageXpTotal += xp;
      player.hpXpTotal += 1;
      break;
    case "fishing":
      player.fishingXpTotal += xp;
      break;
    case "craft":
      player.craftXpTotal += xp;
      break;
    case "woodcutting":
      player.woodcuttingXpTotal += xp;
      break;
    case "mining":
      player.miningXpTotal += xp;
      break;
    case "cook":
      player.cookingXpTotal += xp;
      break;
    case "farming":
      player.farmingXpTotal += xp;
      break;
  }
}

async function killMob(mob) {
  if (mob?.quest){
    await mobQuestLogic(players[mob.lastHitBy], mob.quest.name, mob);  
  }
  if (mob?.kingdom){
    kingdoms[mob.kingdom].activeGuard-=1;
    if (kingdoms[mob.kingdom].activeGuard<0) kingdoms[mob.kingdom].activeGuard=0;
    kingdoms[mob.kingdom].guards-=1;
    if (kingdoms[mob.kingdom].guards<0) kingdoms[mob.kingdom].guards=0;
  }
  const oldTile = getTile(mob.x, mob.y);
  delete oldTile.mob;
  if (mob?.multiTile) {
    //come back to this
  }
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
    name: "lootbag",//remember .kind can be lootbag
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
    const nTile = getTile(nx, ny);
    if (!nTile) continue;
    if (!nTile.objects || Object.keys(nTile.objects).length === 0) {
      nTile.objects = { lootbag };
      markTileChanged(nx, ny);
      break; // dropped successfully
    }
  }
}

async function checkObjectCollision(playerName, x, y, z, objName) {
  const player = players[playerName];

  // what item is the player holding?
  const heldItemName = itemById[player.hand];
  if (!heldItemName) return;

  const heldDef = baseTiles[heldItemName];
  const objDef = baseTiles[objName];

  if (!heldDef || !objDef) return;

  // only world resources can be interacted with this way
  if (objDef.kind !== "resource") return;

  // resource requires a specific tool
  if (
    objDef.requiresTool &&
    //objDef.requiresTool !== heldItemName
    !heldItemName.startsWith(objDef.requiresTool)
  ) return;
  let lvlCheck;
  let lvlType;
  if (objDef?.reqLvl){
    switch (objDef.requiresTool){
      case "pickaxe":
        lvlCheck = player.miningLvl;
        lvlType = "mining";
        break;
      case "axe":
        lvlCheck = player.woodcuttingLvl;
        lvlType = "woodcutting";
        break;
    }
    if (objDef.reqLvl>lvlCheck){
      sendMessage('pk message', `You need level ${objDef.reqLvl} to gather ${objDef?.prettyName ?? "this"}.`, player);
      return;
    }
  }
  //check if safe tile first!
  let tile = getTile(x, y, z);
  if (isSafeActive(tile)) {
    return;
  }
  await resourceInteract(playerName, x, y, z, objName);
}

async function playerAction(playerName) {
  //player pressed shift for action and ain't standin on nothin important
  //check what player is holding and do something with it
  let player = players[playerName];
  if (player.hand !== null) {
    let action = await playerHeldItemAction(playerName);
    if (action === true) return true;
  }
  /*
  if (itemById[player.inventory[player.activeInventory].id]==='townteleport'){
    //come back to this
  }
  */
  //what other actions are there if nothing held and
  //nothing to interact with on tile?
  return false;
}

async function playerHeldItemAction(playerName) {
  let player = players[playerName];
  if (player.slow === true) return;
  if (itemById[player.hand].startsWith("bow")) {
    await playerShootBow(player);
    return true;
  }
  if (itemById[player.hand].startsWith("fishingpole")) {
    await playerTryFishing(player);
    return true;
  }
  if (itemById[player.hand].startsWith("mage")){
    await playerShootBow(player, true);
    return true;
  }
  if (itemById[player.hand].startsWith("orb")){
    let hotCold = await getHotCold(player);
    if (hotCold===false){
      sendMessage('pk message', "Not enough mana...", player);
      return true;
    }
    else if (hotCold===null){
      sendMessage('pk message', "The orb fizzles... No treasure for now...", player);
    } else {
     sendMessage('server message', `The orb glows...\n${hotCold}`, player);
    }
    return true;
  }
}

async function getHotCold(player) {
  if (player.mana<25) return false;
  player.mana-=25;
  if (treasureHidden === false) return null;
  let px = player.x;
  let py = player.y;

  let tx = Treasure.x;
  let ty = Treasure.y;

  const dx = px - tx;
  const dy = py - ty;

  const distance = Math.sqrt(dx * dx + dy * dy);

  const maxDistance = 1000; // approx map diagonal

  const ratio = distance / maxDistance;

  if (ratio <= 0.02) return "BURNING";
  if (ratio <= 0.05) return "Very Hot";
  if (ratio <= 0.1)  return "Hot";
  if (ratio <= 0.2)  return "Warm";
  if (ratio <= 0.4)  return "Cool";
  if (ratio <= 0.7)  return "Cold";
  return "Freezing";
}

async function playerTryFishing(player) {
  let fishTileCoords = checkOnNextTile(player.x, player.y, player.z, player.lastDir, "fishingspot");
  if (fishTileCoords === false) return;
  sendMessage('server message', 'You cast out your line.', player);
  let tile = getTile(fishTileCoords.x, fishTileCoords.y, fishTileCoords.z);
  tile.objects['fishingspot'].fishing = true;
  markTileChanged(fishTileCoords.x, fishTileCoords.y);
  startChannel({
    playerName: player.name,
    duration: 5000,
    cancelOnMove: true,

    onComplete: async () => {
      tile.objects['fishingspot'].fishing = false;
      markTileChanged(fishTileCoords.x, fishTileCoords.y);
      sendMessage('server message', "You reel in your line.", player);
      await randomChanceForFish(player, fishTileCoords);
      setTimeout(() => {
        playerTryFishing(player, fishTileCoords);
      }, 500);
    },

    onCancel: () => {
      tile.objects['fishingspot'].fishing = false;
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

let swampFish = [
  'bluefish',
  'greenfish',
  'yellowfish'
]

let sandFish = [
  'rainbowfish',
  'tealfish',
  'shark'
]

async function randomChanceForFish(player, spot) {
  if (roll(player.fishingLvl)) {
    sendMessage('server message', 'You caught a fish!', player);
    //check what kinda b-t player is on
    //if grass, regular fish
    //if swamp, swamp fish
    //if sand, desert fish
    //if snow, snow fish
    //catch fish first, if not level to catch fish, "it got off the hook!", still deplete spot!
    let fishType = fish;//default to regular fish just in case
    let pTile = getTile(player.x, player.y, 0);
    switch (pTile['b-t']){
      case 'grass':
        fishType = fish;
        break;
      case 'swamp':
        fishType = swampFish;
      case 'sand':
        fishType = sandFish;
    }
    let caughtFish = fishType[Math.floor(Math.random() * fishType.length)];
    let addFish = await addItem(player.name, idByItem(caughtFish), 1);
    if (addFish===0){
      sendMessage('pk message', `You don't have room in your inventory for the fish so you throw it back into the water.`, player);
      return;
    }
    await syncInventory(player.name);
    let xp = baseTiles[caughtFish].xp;
    giveXp(player.name, xp, 'fishing');
    let tile = getTile(spot.x, spot.y, spot.z);
    tile.objects['fishingspot'].amount -= 1;
    if (tile.objects['fishingspot'].amount <= 0) {
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
function checkOnNextTile(x, y, z, lastDir, thing) {
  let check = { x: 0, y: 0 };
  switch (lastDir) {
    case "up": check.y -= 1; break;
    case "down": check.y += 1; break;
    case "left": check.x -= 1; break;
    case "right": check.x += 1; break;
  }
  let newCoords = { x: x + check.x, y: y + check.y, z: z }
  let tile = getTile (newCoords.x, newCoords.y, z);
  if (tile?.objects) {
    if (tile.objects[thing]) {
      return newCoords;
    }
  }
  return false;
}

async function playerShootBow(player, mage = false) {
  if (player.quiver===null){
    let word;
    if (mage ===true){
      word="pouch";
    } else {
      word="quiver";
    }
    sendMessage('pk message', `You don't have anything in your ${word} to do that with!`, player);
    return;
  }
  let timeBonus=1000;
  if (player.hand!==null){
    if (itemById[player.hand].startsWith('bow') && itemById[player.quiver].includes('dust')){
      return;
    }
    if (itemById[player.hand].startsWith('mage') && itemById[player.quiver].includes('arrow')){
      return;
    }
    if (baseTiles[itemById[player.hand]]?.timeBonus){
      timeBonus -= baseTiles[itemById[player.hand]].timeBonus;
    }
  }
  if (Date.now() < player.lastMelee + timeBonus) {//change to -level?
    return;
  }
  if (player.quiver === null) return;
  if (mage === true){
    let dustAmmo = baseTiles[itemById[player.quiver]];
    if (player.mana<=0 || player.mana<dustAmmo.mana){
      sendMessage('pk message', "Not enough mana.", player);
      return;
    } else {
      player.mana-=dustAmmo.mana;
      sendSound(player, ['cast']);
      await giveXp(player.name, 1, "mage");
    }
  }
  player.lastMelee = Date.now();
  
  let projName = itemById[player.quiver];
  //check amount, decrement if shoots
  let projAmount = await getItemAmount(player.name, player.quiver);
  if (projAmount === 0) {
    player.quiver = null;
    return;
  }
  await removeItem(player.name, player.quiver, 1);
  await syncInventory(player.name);
  let slow = false;
  let slowTime = null;
  if (projName==='bluedust'){
    slow = true;
    slowTime = 2000;//plus player mage level calculation
  }
  let distance = 10;
  if (projName==='yellowdust'){
    distance = -1;
  }
  if (mage===false){
    sendSound(player, ['bow']);
  }
  const arrow = createProjectile(projName, player.lastDir, player.x, player.y, player.z, player.name, distance, slow, slowTime);
  addProjectileToTile(arrow);
}

async function floorRoofRemove(player, tile){
  //check tile for floor then ceiling, remove
  //need choice on frontend!
  if (isSafeActive(tile)) return false;
  if (itemById[player.hand]!=="tools") return false;
  const floor = tile.floor ?? {};
  const roof = tile.roof ?? {};
  if (Object.keys(floor).length !==0){
    let key = Object.keys(floor)[0];
    if (tile.floor[key]?.owner){
      if (tile.floor[key].owner!=='Admin' || player.name==='Admin'){
        delete tile.floor;//destroys floor!
        markTileChanged(player.x, player.y);
        return true;
      }
    }
  }
  if (Object.keys(roof).length !==0){
    let key = Object.keys(roof)[0];
    if (tile.roof[key]?.owner){
      if (tile.roof[key].owner!=='Admin' || player.name==='Admin'){
        delete tile.roof;//destroys floor!
        markTileChanged(player.x, player.y);
        return true;
      }
    }
  }
  return false;
}

async function interactTile(playerName) {
  const player = players[playerName];
  const tile = getTile(player.x, player.y, player.z);
  const mapObjects = tile.objects ?? {};
  if (tile?.floor){
    if (tile.floor['eyeSocket']){
      return;
    }
  }
  const objNames = Object.keys(mapObjects);
  if (objNames.length === 0) {
    let action = await playerAction(playerName);//not standin on nothin, see what action does
    if (action===true) return;
  }
  
  let buildRemove = await floorRoofRemove(player, tile);
  if (buildRemove===true) return;

  const objName = objNames[0]; // interact with the first object
  const objDef = baseTiles[objName];
  if (!objDef) return;
  // ---------- auto-drop items ----------
  let interacted = await checkInteract(playerName, mapObjects);
  if (interacted) return;//was a thing in checkInteract...
  if (objDef.kind === "item" && objDef.container === "objects") {
    const itemId = objDef.id;
    if (!itemId) return;
    if (itemById[itemId].startsWith('flower')) {
      let beeSting = await randomBeeSting(playerName);
      if (beeSting) {
        return 0;
      }
    }
    // 1. REMOVE OBJECT FIRST (atomic, synchronous)
    const removed = removeObjFromMapSync(player.x, player.y, player.z);
    if (!removed) return; // someone else already took it

    markTileChanged(player.x, player.y);

    // 2. TRY TO ADD TO INVENTORY
    const added = await addItem(playerName, itemId, 1);

    // 3. INVENTORY FULL → PUT IT BACK
    if (added === 0) {
      restoreObjToMap(player.x, player.y, player.z, removed);
      markTileChanged(player.x, player.y);
      return;
    }

    // 4. SUCCESS
    await syncInventory(playerName);
    return;
  }
  if (objDef.kind === 'lootbag' && objDef.container === "objects") {
    await openLootbag(playerName, tile.objects['lootbag'], player.x, player.y, player.z);//lootbag should have .items
    await syncInventory(playerName);
  }
}

function removeObjFromMapSync(x, y, z) {
  const tile = getTile(x, y, z);
  const objects = tile.objects;
  if (!objects) return null;

  const keys = Object.keys(objects);
  if (keys.length === 0) return null;

  const key = keys[0];
  const obj = objects[key];

  delete objects[key];

  return { key, obj };
}

function restoreObjToMap(x, y, z, removed) {
  if (!removed) return;
  const tile = getTile(x, y, z);
  tile.objects ??= {};
  tile.objects[removed.key] = removed.obj;
}

async function openLootbag(playerName, lootbagObject, x, y, z) {
  if (!lootbagObject || !lootbagObject.items) return;
  let player = players[playerName];
  if (lootbagObject.locked) return;
  lootbagObject.locked = true;

  let lootChat = {};
  let lootTile = getTile(x, y, z);
  if (lootbagObject?.teleBack) {
    lootTile.players = {};
    markTileChanged(x, y);
    let returnTo = lootbagObject.teleBack;
    if (returnTo) {
      player.x = returnTo.x;
      player.y = returnTo.y;
      player.z = returnTo.z;
    } else {
      player.x = 49;
      player.y = 49;
      player.z = 0;
    }
    addPlayerToTile(playerName, player.x, player.y, player.z);
    markTileChanged(player.x, player.y);
    sendMessage('server message', `Magic in the lootbag teleports you!`, player);
  }
  try {
    for (const name of Object.keys(lootbagObject.items)) {
      const item = lootbagObject.items[name];
      const itemId = baseTiles[name]?.id;
      if (!itemId) continue;

      const added = await addItem(playerName, itemId, item.amt);

      // ----- TRACK LOOT -----
      if (added > 0) {
        if (!lootChat[name]) {
          lootChat[name] = 0;
        }
        lootChat[name] += added;
        if (name==='coin'){
          //tax coins
          await taxCoins(playerName, item.amt);
        }
      }
      // ----------------------

      item.amt -= added;

      if (item.amt <= 0) delete lootbagObject.items[name];
    }

    // remove lootbag only if empty
    if (Object.keys(lootbagObject.items).length === 0) {
      const tile = getTile(x, y, z);
      delete tile.objects.lootbag;
      markTileChanged(x, y);
    }
    let ownerName = null;
    if (lootbagObject?.owner){
      ownerName = lootbagObject.owner;
    }
    // ----- SEND SUMMARY MESSAGE -----
    const entries = Object.entries(lootChat);
    if (entries.length > 0) {
      const lootString = entries
        .map(([name, amount]) => `${amount}x ${baseTiles[name]?.prettyName ?? name}`)
        .join(" , ");
      if (ownerName!==null){
         sendMessage('server message', `<span style="color: purple;">${ownerName}'s</span> loot: ${lootString}`, players[playerName]);
      } else {
        sendMessage('server message', `You received: ${lootString}`, players[playerName]);
      }
    } else {
      sendMessage('pk message', `Your inventory is full.`, players[playerName]);
    }
    // --------------------------------

  } finally {
    lootbagObject.locked = false;
  }
}

async function taxCoins(name, amt){
  let player = players[name];
  if (!player) return;
  let tile = getTile(player.x, player.y, 0);
  if (!tile?.kTile) return;
  let kName = Object.keys(tile.kTile)[0];
  let kingName = null;
  let coinTax = null;
  let kingdom;
  switch (kName){
    case 'kWest':
      kingdom='west'
      break;
    case 'kEast':
      kingdom='east';
      break;
  }
  kingName = kingdoms[kingdom].king;
  coinTax = kingdoms[kingdom].tax;
  if (kingName===null) return;//no tax!
  if (coinTax===0) return;//hmm, no tax!
  let percentTaken = Math.floor(amt*(coinTax/100));
  if (percentTaken>=amt) return;//I guess this makes sense?
  sendMessage('server message', `You pay ${percentTaken} coins in taxes to the ${kingdom} kingdom.`, player);
  await removeItem(name, 21, percentTaken);
  await addBankItem(kingdom, 21, percentTaken);
}

let exits = [
  'dungeonStairs',
  'upStairs'
]

async function checkInteract(name, mapObjects) {
  let objKeys = Object.keys(mapObjects);
  let objName = objKeys[0];
  if (mapObjects[objName]?.owner){
    if (baseTiles[objName]?.farming){
      farmingCheck(name, mapObjects[objName], objName);
      return true;
    }
  }
  if (exits.includes(objName)){
    enterExit(name, mapObjects[objName]);//that particular object so coords can be stored
    return true;
  }
  if (objName === 'craftTable') {
    io.to(players[name].sock_id).emit('crafting');//opens up crafting for player
    return true;
  }
  if (objName === 'cookingRange'){
    io.to(players[name].sock_id).emit('cooking');//opens up crafting for player
    return true;
  }
  if (objName === 'forge') {
    smeltOre(name);//tries to smelt whatever player has selected in inventory
    return true;
  }
  if (objName === 'alchemyTable'){
    brewPotion(name);
  }
  if (objName === 'bankchest') {
    playerBank(name);
    return true;
  }
  if (objName === 'kingchest'){
    playerBank(name, true);
  }
  if (objName === 'door') {
    useDoor(name);
    return true;
  }
  if (objName === 'sign' || objName === 'signPost') {
    readSign(name, objName);
    return true;
  }
  if (objName === 'leaderboard') {
    readLeaderboard(name);
    return true;
  }
  if (objName === 'westLeaderboard'){
    console.log("west");
    await getKingReigns('west', name);
    return true;
  }
  if (objName === 'eastLeaderboard'){
    console.log("east");
    await getKingReigns('east', name);
    return true;
  }
  if (objName === 'bedShop'){
    restUnownedBed(name);
    return true;
  }
  if (baseTiles[objName]?.cost){
    await purchaseItem(name, objName);
    return true;
  }
  if (objName.startsWith('throne')){
    await claimThrone(name, objName);
  }
  if (objName.startsWith('pledgeFlag')){
    await pledgeKingdom(name, objName);
  }
  if (objName.startsWith('book')){
    await readBook(name, objName);
  }
  return false;
}

async function readBook(name, objName){
  //send book text to player, gets stored in book obj on frontend
  //readBook popup on front end that lets you flip through pages
  //if book has attributes, do action (give xp, teleport, etc)
  //needs kind, container, collision in server_base_tiles. objName same as name in ./books
  let player = players[name];
  if (!player) return;
  console.log(`objName: ${objName}`);
  let bookName = baseTiles[objName].bookName;
  console.log(`bookName: ${bookName}`);
  let text = books[bookName].text;

  io.to(player.sock_id).emit('readBook', {
    name: bookName,
    text: text
  });
  //if baseTiles[objName]?.action, do thing
  //for xp boosts, must be written/checked in db
  //for action, must pass server fxns as args (like quests use)
}

async function pledgeKingdom(name, flag){
  console.log(`Pledged to ${flag} kingdom`);
  let player = players[name];
  if (player.king!==null){
    sendMessage('pk message', `You are the king, you cannot pledge or unpledge!`, player);
    return;
  }
  let side;
  switch (flag){
    case 'pledgeFlagEast':
      side='east';
      break;
    case 'pledgeFlagWest':
      side='west';
      break;
  }
  let [hasBounty] = await query(`select * from bounties where player_name = ? and kingdom = ?`, [name, side]);
  if (hasBounty){
    if (hasBounty.kingdom === side){
      sendMessage('pk message', `You are wanted in the ${side}, the recruiter denies your request to pledge!`, player);
      return;
    }
  }
  let playerPledge = await query(`select pledge, pledgeDate from players where player_name = ?`,[name]);
  if (playerPledge[0].pledge===side){
    if (Date.now() - playerPledge[0].pledgeDate < 86400000){
      sendMessage('pk message', `You must wait 24 hours before unpledging!`, player);
    } else {
      await query(`update players set pledge = null, pledgeDate = ? where player_name = ?`, [Date.now(), name]);
      sendMessage('server message', `You cease to be a constituent of the ${side} kingdom. You no longer hold a rank if you had one!`, player);
      //set rank to null, send message if it wasn't already null
      //query rank
      //query rank to null
      await query(`update player set player_rank = null where player_name = ?`, [name]);
    }
    return;
  }
  if (playerPledge[0].pledge===null){
    //set pledge and pledgeDate
    await query(`update players set pledge = ?, pledgeDate = ? where player_name = ?`, [side, Date.now(), name]);
    sendMessage('server message', `You pledge allegiance to the ${side} kingdom!`, player);
    return;
  }
  if (playerPledge[0].pledge!==side){
    //one or other side, check time, set if good
    if (Date.now() - playerPledge[0].pledgeDate < 86400000){
      sendMessage('pk message', `You must wait 24 hours before unpledging!`, player);
    } else {
      await query(`update players set pledge = ?, pledgeDate = ? where player_name = ?`, [side, Date.now(), name]);
      sendMessage('server message', `You pledge allegiance to the ${side} kingdom!`, player);
    }
    return;
  }
}

let kingdoms = {
  'east':{
    king: null,//pull from database
    guards: 0,//pull from db
    activeGuard: 0,
    tax: 0,//percent 0-50
    beds: 0
  },
  'west':{
    king: null,//pull from database
    guards: 0,//pull from db
    activeGuard: 0,
    tax: 0,//percent 0-50
    beds: 0
  }
}

async function initKingdoms(){
  //load east Kingdom and west Kingdom king and guards
  let west = await query(`select * from kingdoms where kingdom = 'west'`, []);
  kingdoms['west'].king=west[0].king;
  kingdoms['west'].guards=west[0].guards;
  kingdoms['west'].tax=west[0].tax;
  kingdoms['west'].beds=west[0].beds;
  let east = await query(`select * from kingdoms where kingdom = 'east'`, []);
  kingdoms['east'].king=east[0].king;
  kingdoms['east'].guards=east[0].guards;
  kingdoms['east'].tax=east[0].tax;
  kingdoms['east'].beds=east[0].beds;
  console.log(`East\nKing: ${kingdoms['east'].king}, Guards: ${kingdoms['east'].guards}, Tax: ${kingdoms['east'].tax}, Beds: ${kingdoms['east'].beds}`);
  console.log(`West\nKing: ${kingdoms['west'].king}, Guards: ${kingdoms['west'].guards}, Tax: ${kingdoms['west'].tax}, Beds: ${kingdoms['west'].beds}`);
  for (const spawn of mobSpawns) {//put this here cause initKingdoms took too fuckin long lol
    for (let i = 0; i < spawn.count; i++) {
      spawnMob(spawn);
    }
  }
}

initKingdoms();

async function dbKingdoms(){
  //save kingdom king and guards to db
  await query(`update kingdoms set guards = ${kingdoms['west'].guards} where kingdom = 'west'`,[]);
  await query (`update kingdoms set guards = ${kingdoms['east'].guards} where kingdom = 'east'`,[]);

  await query(`update kingdoms set tax = ${kingdoms['west'].tax} where kingdom = 'west'`,[]);
  await query (`update kingdoms set tax = ${kingdoms['east'].tax} where kingdom = 'east'`,[]);
}

async function claimThrone(name, throne){
  console.log(`throne: ${throne}, player claiming: ${name}`);
  let player = players[name];
  if (!player) return;
  if (player.king==='west' || player.king==='east'){
    sendMessage('pk message', `You are already king of the ${player.king}!`, player);
    return;//gets past here, player.king is null "Already King!"
  } 
  if (player.murderer === true){
    sendMessage('pk message', `Murderers cannot take the throne!`, player);
    //then broadcast that a murderer is in the throne room lmao
    return;//murderers cannot take throne, sendMessage
  }
  //1 min timer to take throne, set crim timer, if move or get hit, delete timer
  player.takingThrone = true;
  await setCriminal(name, true, 10*60*1000);
  startChannel({
    playerName: name,
    duration: 10000,//change to 60000, testing
    cancelOnMove: true,

    onComplete: async () => {
      if (await setNewKing(name, throne)===false){
        player.takingThrone=false;
        return;
      }
      await clearCriminal(name);
      player.takingThrone=false;
      sendMessage('server message', 'You have taken the throne!', player);
      let kColor;
      switch(player.king){
        case 'west':
          kColor = "blue";
          break;
        case 'east':
          kColor = "green"
          break;
      }
      sendMessage('server message', `<span style="color: purple">Hail <span style="color: ${kColor}">King ${player.name}</span> of the ${player.king}!</span>`);
      updateKingStatus();//should send to all players?
    },

    onCancel: () => {
      player.takingThrone=false;
      sendMessage('pk message', 'You fail to take the throne!', player);
    }
  });
}

async function setNewKing(name, throne){
  console.log(`Setting ${name} as new king of ${throne}`);
  let player = players[name];
  let kingdom;

  switch (throne){
    case 'throneEast':
      kingdom = 'east';
      break;
    case 'throneWest':
      kingdom = 'west';
      break;
  }
  if (kingdoms[kingdom].guards>0){
    sendMessage('pk message', `A guard thwarts your efforts to take the throne!`, player);
    return;   
  }
  //check guards
  const rows = await query(`select * from kingdoms where kingdom = ?`, [kingdom]);
  const chkGuards = rows[0];
  /*
  if (chkGuards.guards>0) return false;
  */
  await query('update players set king = null where player_name = ?', [chkGuards.king]);//remove old king
  let oldKing =  players[chkGuards.king];
  if (oldKing){
    oldKing.head = null;//remove in game if they online
    oldKing.king = null;
  }
  await query(`update players set head = null where player_name = ?`, [chkGuards.king]);//remove crown
  
  if (player){
    let crownId = baseTiles[kingdom+"Crown"].id;
    //await equip(name, crownId);
    if (player.head===null){//something wrong with this
      player.head = crownId;
    } else {
      await equip(name, crownId);
    }
    player.king = kingdom;
  }
  await query(`UPDATE kingdoms SET king = ? WHERE kingdom = ?;`, [name, kingdom]);
  await query(`update players set king = ? where player_name = ?;`, [kingdom, name]);
  await query(`update players set pledge = ?, pledgeDate = ? where player_name = ?`, [kingdom, Date.now(), name]);
  kingdoms[kingdom].king = name;
  //then stuff about how long player has held king, king board etc
  const now = Date.now();

  // end previous king
  await query(
    `UPDATE king_history 
    SET end = ? 
    WHERE kingdom = ? AND end IS NULL`,
    [now, kingdom]
  );

  // insert new king
  await query(
    `INSERT INTO king_history (name, kingdom, start)
    VALUES (?, ?, ?)`,
    [name, kingdom, now]
  );
  return true;
}

async function getKingReigns(kingdom, name) {
  let player = players[name];
  if (!player) return;
  console.log("got to queries");
  const rows = await query(
    `SELECT 
       name,
       kingdom,
       start,
       end
     FROM king_history
     WHERE kingdom = ?
     ORDER BY start DESC`,
    [kingdom]
  );
  let reignData = rows.map(row => ({
    name: row.name,
    kingdom: row.kingdom,
    start: row.start,
    end: row.end,
    isCurrent: row.end === null,
    duration: (row.end ?? Date.now()) - row.start
  }));
  console.log("emitting to player");
  if (reignData.length===0){
    sendMessage('pk message', `The ${kingdom} has had no king since the apocalypse.`, player);
    return;
  }
  io.to(players[name].sock_id).emit('kingReigns', {
    kingdom,
    reigns: reignData
  });
}

function farmingCheck(playerName, plantObject, plantName){
  let player = players[playerName];
  if (!player) return;
  let prettyName = baseTiles[plantName].prettyName;
  let growthText;
  if (baseTiles[plantName]?.regrowsTo){
    growthText = "is not ready to harvest...";
  } else {
    growthText = "is ready to harvest, dig it up with a spade!";
  }
  if (plantObject.owner===playerName){
    sendMessage('server message', `Your ${prettyName} ${growthText}`, player);
  } else {
    sendMessage('pk message', `This is not your ${prettyName}!`, player);
  }
}

async function restUnownedBed(name){
  let player = players[name];
  if (player.criminal===true || player.murderer===true){
    sendMessage('pk message', `Ain't no rest for the wicked!`, player);
    return;
  }
  let purchased = false;
  //only purchase if bed not paid for by respective kingdom (if even in a kingdom)
  let checkTile = getTile(player.x, player.y, 0);//checking kingdom so z0
  let kingdom = null;
  if (checkTile?.kTile){
    if (Object.keys(checkTile.kTile)[0]==='kWest') kingdom='west';
    if (Object.keys(checkTile.kTile)[0]==='kEast') kingdom='east';
  }
  let sleepMsg;
  if (kingdom!==null){
    if (kingdoms[kingdom].beds>0 && player.pledge===kingdom){
      purchased=true;
      sleepMsg = `The kingdom has made accomodations for you, the bed is free.`;
      await query(`update kingdoms set beds = beds - 1 where kingdom = ?`, [kingdom]);
      kingdoms[kingdom].beds-=1;
    } else {
      purchased = await purchaseItem(name, 'bedShop');
      if (player.pledge===kingdom){
        sleepMsg = `The kingdom has no free beds, so you pay out of pocket for a bed.`;
      } else {
        sleepMsg = `You are not pledged to this kingdom, the innkeeper reluctantly lets you pay for a bed.`;
      }
    }
  } else {
    purchased = await purchaseItem(name, 'bedShop');
    sleepMsg = `You pay to get some rest...`;
  }

  if (purchased === false){
    return;
  }
  sendMessage('server message', sleepMsg, player);
  startChannel({
    playerName: name,
    duration: 5000,
    cancelOnMove: true,

    onComplete: () => {
      player.hp = player.maxHp;
      player.mana = player.maxMana;
      emitPlayerState(player);
      sendMessage('server message', 'You feel well rested!', player);
    },

    onCancel: () => {
      damagePlayer(null, player, 5, "insomnia");
      sendMessage('pk message', 'You wake up groggy and hit your head on a bedpost!', player);
    }
  });
}

async function purchaseGame(player, game){
  switch (game){
    case 'eyeGame':
      if (eyeGame.currPlayer!==null){
        sendMessage('pk message', 'Game has already started!', player);
        return;
      }
      console.log("start eye game door timer!");
      sendMessage('server message', `You have 30 seconds to pass through the threshold and start the game!`, player);
      eyeGame.doorTimer = setTimeout(() => {
        player.eyeGame=0;
        eyeGame.currPlayer=null;
        sendMessage('pk message', 'You waited too long to enter and forfeited the game!', player);
      }, 10000);
      player.eyeGame=1;//setTimeout sets it back to 0 unless player goes in and cancels it!
      eyeGame.currPlayer=player.name;
      break;
  }
}

async function purchaseItem(playerName, objName){
    if (!objName) return false;

    const player = players[playerName];
    if (!player) return false;

    const itemDef = baseTiles[objName];
    if (!itemDef?.cost) return false; // nothing to buy

    // prevent buying during trade
    if (Object.keys(player.tradeOffer).length > 0) {
        sendMessage('pk message', `You cannot buy while trading!`, player);
        return false;
    }

    const costItemName = Object.keys(itemDef.cost)[0];
    const costAmount = itemDef.cost[costItemName];
    const buyItemId = idByItem(itemDef.item);
    const buyAmount = itemDef.amount;

    // ---------- check if player has enough of the cost item ----------
    const costItemId = idByItem(costItemName);
    const playerCostAmount = await getItemAmount(playerName, costItemId);
    if (playerCostAmount < costAmount) {
        sendMessage('pk message', `You need ${costAmount} ${costItemName} to purchase this.`, player);
        return false;
    }
    if (itemDef?.kingdom) {
      await kingPurchase(player, itemDef.item);
      return;
    }
    // ---------- deduct cost ----------
    await removeItem(playerName, costItemId, costAmount);

    //-----------game check----------------//need to give back money if purchase doesn't go through!
    if (itemDef?.item){
      if (itemDef.item.includes('Game')) {
        await purchaseGame(player, itemDef.item);
        return;
      }
    }
    // ---------- add the purchased item safely ----------
    let added = 0;
    if (buyItemId){
      const existingAmount = await getItemAmount(playerName, buyItemId);

      if (existingAmount > 0) {
        // stack on existing slot
        added = await addItem(playerName, buyItemId, buyAmount);
      } else {
        const slotsUsed = await getInventoryCount(playerName);
        if (slotsUsed < 32) { // assuming 32-slot inventory
          added = await addItem(playerName, buyItemId, buyAmount);
        } else {
          // no space
          sendMessage('pk message', `Your inventory is full!`, player);
          return false;
        }
      }
    }

    if (added > 0) {
      if (itemDef.item==='redfish' || itemDef.item==='cod' || itemDef.item==='goldfish'){
        //give Kfish the gold lol
        await addBankItem('Klinthios', idByItem(costItemName), costAmount);
      }
      sendMessage('server message', `You bought ${buyAmount} ${itemDef?.prettyName ?? itemDef.item}!`, player);
      syncInventory(playerName);
    }
    syncInventory(playerName);
    return true;
}

async function kingPurchase(player, item){
  if (player.king===null){
    sendMessage('pk message', `Only for use by the king!`, player);
    return;
  }
  let currKingdom = player.king;
  if (item==='guard'){
    let hasCoin = await getItemAmount(player.name, 21);
    if (hasCoin<1000){
      sendMessage('pk message', `Guards salary is 1000 coins!`, player);
      return;
    }
    await removeItem(player.name, 21, 1000);
    kingdoms[player.king].guards+=1;
    await query (`update kingdoms set guards = guards + ? where kingdom = ?`, [1, player.king]);
    sendMessage('server message', `You put 1000 coins into the coffer for a guard's salary.`, player);
  }
  if (item==='bed'){
    let hasCoin = await getItemAmount(player.name, 21);
    if (hasCoin<100){
      sendMessage('pk message', `100 coins are required to pay inn keepers for 20 free beds!`, player);
      return;
    }
    await removeItem(player.name, 21, 100);
    kingdoms[player.king].beds+=20;
    await query (`update kingdoms set beds = beds + ? where kingdom = ?`, [20, player.king]);
    sendMessage('server message', `You put 100 coins into the coffer and free up 20 beds at inns across the kingdom. There are currently ${kingdoms[player.king].beds} available.`, player);
  }
}

async function enterExit(name, exitObject){
  //start a timer
  //move player to new coords
  if (exitObject?.exclusiveTo){
    if (exitObject.exclusiveTo!==name){
      //sendMessage
      return;
    }
  }
  let toCoords = {x: exitObject.toX, y: exitObject.toY, z: exitObject.toZ}
  startChannel({
    playerName: name,
    duration: 1000,
    cancelOnMove: true,

    onComplete: async () => {
      const player = players[name];
      if (!player) return;

      const x = player.x;
      const y = player.y;
      const z = player.z;
      let tile = getTile(x, y, z);
      delete tile.players[name];
      markTileChanged(x, y);

      player.x = toCoords.x;
      player.y = toCoords.y;
      if (toCoords?.z){
        player.z=toCoords.z;
      } else {
        player.z = 0;//legacy stairs
      }
      
      addPlayerToTile(name, toCoords.x, toCoords.y, toCoords.z);
      markTileChanged(toCoords.x, toCoords.y);
    },

    onCancel: () => {
      //literally anything can go here
    }
  });
}

async function readLeaderboard(name) {
  const leaderboard = await getLeaderboard();
  io.to(players[name].sock_id).emit('leaderboardData', leaderboard);
}

function readSign(name, signType) {
  let player = players[name];
  let tile = getTile(player.x, player.y, player.z);
  let text = String(tile.objects[signType].text);
  sendMessage('readSign', text, player);
}

async function useDoor(name) {
  const player = players[name];
  const tile = getTile(player.x, player.y, player.z);
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

    markTileChanged(player.x, player.y);
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
  if (door.locked) {
    lockMsg = 'locked';
  } else {
    lockMsg = 'unlocked';
  }
  sendMessage('server message', `Door ${lockMsg}!`, players[name]);
  markTileChanged(player.x, player.y);
}

async function taxPlayer(name, itemName, amt=1){
  console.log("tax player function");
  let player = players[name];
  if (!player) return;
  let tile = getTile(player.x, player.y, 0);//since kTile only on z 0
  let kTile = null;
  if (tile?.kTile){
    kTile = Object.keys(tile.kTile)[0];
  }
  if (kTile===null) return;
  let kingName = null;
  let kingdom;
  switch (kTile){
    case 'kWest':
      kingdom='west';
      break;
    case 'kEast':
      kingdom='east';
      break;
  }
  kingName=kingdoms[kingdom].king;
  player.taxProgress+=kingdoms[kingdom].tax/100;
  if (kingName===null) return;//no king, no taxes! lel
  if (player.taxProgress>=1){
    player.taxProgress=0;
    //tax player by removing 1 itemName from inventory and adding to current king bank db
    await removeItem(name, idByItem(itemName), amt);
    //need to have a queue to minimize queries
    //players owe taxes? optional?
    await addBankItem(kingdom, idByItem(itemName), amt);
    sendMessage('server message', `You pay taxes to the ${kingdom} kingdom.`, player);
  }
}

async function resourceInteract(playerName, x, y, z, objName) {
  const player = players[playerName];
  let timeBonus = 1000;
  if (player.hand){
    timeBonus -= baseTiles[itemById[player.hand]].timeBonus;
  }
  // gather cooldown
  if (Date.now() < player.lastGather + timeBonus) return;
  player.lastGather = Date.now();

  const objDef = baseTiles[objName];
  if (!objDef || objDef.kind !== "resource") return;
  /* ---------- drops ---------- */
  if (objDef.drops) {
    for (const [itemName, amount] of Object.entries(objDef.drops)) {
      const itemId = idByItem(itemName);
      if (itemId){
        let added = await addItem(playerName, itemId, amount);
        if (added===0){
          sendMessage('pk message', "Your inventory is full!", player);
          return;
        }
        if (itemName==='rock' || itemName==='log'){
          await taxPlayer(playerName, itemName);
        }
      }
    }
    await syncInventory(playerName);
  }
  let resXp = 1;
  if (objDef?.xp) resXp = objDef.xp;
  if (itemById[player.hand].startsWith('axe')) {
    sendSound(player, ['chop']);
    await giveXp(player.name, resXp, "woodcutting");
  }
  if (itemById[player.hand].startsWith('pickaxe')) {
    sendSound(player, ['pickaxe']);
    await giveXp(player.name, resXp, "mining");
  }
  //rare drop
  if (objDef.rareDrop) {//implies also has .rarity
    if (Math.floor(Math.random() * 1000) < objDef.rarity) {
      for (const [itemName, amount] of Object.entries(objDef.rareDrop)) {
        const itemId = idByItem(itemName);
        if (itemId) await addItem(playerName, itemId, amount);
      }
      await syncInventory(playerName);
    }
  }

  /* ---------- depletion ---------- */
  let chance = null;//for potential resource mob
  const tileData = getTile(x, y, z);

  // remove current object
  delete tileData.objects?.[objName];

  if (objDef.depletesTo) {
    const nextName = objDef.depletesTo;
    const nextDef = baseTiles[nextName];

    if (nextDef?.container === "depletedResource") {
      // ✅ write to the map's depletedResources container
      tileData.depletedResources ??= {};
      tileData.depletedResources[nextName] = { name: nextName };
      if (nextName.startsWith('tree')) {
        chance = player.woodcuttingLvl;
      }
      if (nextName.startsWith('rock')) {
        chance = player.miningLvl;
      }
    } else {
      tileData.objects ??= {};
      tileData.objects[nextName] = { name: nextName };
    }
  }
  if (chance !== null) {//change to scaled to player lvl
    spawnResourceMob(playerName, x, y, z, chance);
  }
  await markTileChanged(x, y);
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

  if (itemDef.dig) {
    //player digs, either gets soil, sand, or finds treasure!
    playerDig(player);
    return;
  }
  // future: consumables, activatables, etc
  // if (itemDef.consume) consumeItem(playerName, itemName);
}

async function playerDig(player){
  if (player.z>0) return;
  if (Date.now()<player.lastGather+1000){
    return;
  }
  player.lastGather = Date.now();
  sendSound(player, ['dig']);
  let tX = Treasure?.x;
  let tY = Treasure?.y;
  if (tX && tY){
    //return if on treasure, player gets it
    if (tX===player.x && tY===player.y){
      sendMessage('server message', `<span style="color: purple;">You found buried treasure!</span>`, player);
      await dropMobLoot(baseTiles['treasure'].drop, Treasure.x, Treasure.y);
      Treasure={};
      treasureHidden=false;
      return;
    }
  }
  //else get dirt or sand if applicable
  console.log("digs up sand or dirt");
  //if basetile sand - sand, if basetile grass - dirt
  //farming!
  let tile = getTile(player.x, player.y, player.z);//returns if no z 0 anyway
  if (tile?.objects){
    let objKey = Object.keys(tile.objects)[0];
    if (objKey){
      if (baseTiles[objKey]?.farming) {
        await harvestPlant(player, tile, objKey);
      }
    }
  }
}

async function harvestPlant(player, tile, plantName){
  let plant = tile.objects[plantName];
  if (!idByItem(baseTiles[plantName]?.drops)){
    sendMessage('pk message', `This is not yet ready to harvest.`, player);
    return;
  }
  let added = addItem(player.name, idByItem(baseTiles[plantName].drops), 1);
  if (added===0) {
    sendMessage('pk message', `You must clear some inventory space to harvest this!`, player);
    return;
  }
  if (plant.amt!==null){
    plant.amt-=1;
  }
  markTileChanged(player.x, player.y);
  sendMessage('server message', `You harvest the ${baseTiles[plantName].drops}.`, player);
  if (plant.owner===player.name){
    await giveXp(player.name, baseTiles[plantName].xp, "farming");
    if (baseTiles[plantName].drops==='tomato' && player.farmerQuest===4){
      sendMessage('server message', `Go show Olive the farmer the tomato!`, player);
      await query(
        "UPDATE players SET farmerQuest = 5 WHERE player_name = ?",
        [player.name]
      );
      player.farmerQuest = 5;
    }
  } else {
    //criminal!
    await setCriminal(player.name, true, 60*1000*10);
    sendMessage('pk message', `A passerby reported you for stealing crops!`, player);
  }
  if (plant.amt<=0 || plant.amt===null || plant.amt===undefined){
    delete tile.objects;//should work lol
    markTileChanged(player.x, player.y);
  }
}

async function equip(playerName, id) {
  const player = players[playerName];
  const itemName = itemById[id];
  if (!itemName) return;

  const itemDef = baseTiles[itemName];
  if (!itemDef || !itemDef.equip) return;

  if (itemDef?.reqLvl){
    if (itemDef.reqLvl.lvl > player[itemDef.reqLvl.type]){
      sendMessage('pk message', `You need level ${itemDef.reqLvl.lvl} ${itemDef.reqLvl.pretty} to equip this.`, player);
    }
  }

  const slot = itemDef.equip.slot;
  if (slot==='head' && player.king!==null){
    sendMessage('pk message', `As king of the ${player.king}, you must bear the crown!`, player);
    return;
  }

  const isEquipped = player[slot] === id;
  let tile = getTile(player.x, player.y, player.z);

  if (isEquipped) {
    player[slot] = null;
    tile.players[playerName][slot] = null;
    if (slot === "feet") {
      player.movementSpeed = player.baseMovementSpeed;
    }
  } else {
    player[slot] = id;
    tile.players[playerName][slot] = id;
    if (slot === "feet") {
      player.movementSpeed = baseTiles[itemById[player[slot]]].speed;
    }
  }

  emitPlayerState(player);
  markTileChanged(player.x, player.y);
  await syncInventory(playerName);
}

async function consume(playerName, id) {
  const player = players[playerName];

  const itemName = itemById[id];
  if (!itemName) return;
  const itemDef = baseTiles[itemName];
  if (!itemDef || !itemDef.consume) return;
  if (itemDef.teleport) {
    await removeItem(playerName, itemDef.id, 1);
    await syncInventory(playerName);
    await teleportPlayer(playerName);
  }

  if (itemDef.consume) {
    await eatDrinkTimed(playerName, itemDef);
    return;
  }
}

async function eatDrinkTimed(name, itemObj) {
  let player = players[name];
  startChannel({
    playerName: name,
    duration: itemObj.time,
    cancelOnMove: itemObj?.cancelOnMove ?? false,

    onComplete: async () => {
      if (itemObj?.hp){
        player.hp += itemObj.hp;
        if (player.hp > player.maxHp) {
          player.hp = player.maxHp;
        }
      }
      if (itemObj?.mana){
        player.mana += itemObj.mana;
        if (player.mana > player.maxMana) {
          player.mana = player.maxMana;
        }
      }
      if (itemObj?.seed){
        //give player seed(s) from plant seed: {item: "tomatoSeed", amt: 5}
        let seedId = idByItem(itemObj.seed['item']);
        let seedAmt = itemObj.seed['amt'];
        await addItem(player.name, seedId, seedAmt);//hmm other stuff, like key hidden in a cake or some shit lol
        sendMessage('server message', `You pick some seeds out of your teeth.`, player);
      }

      await removeItem(name, itemObj.id, 1);
      await syncInventory(name);
    },

    onCancel: () => {
      //literally anything can go here
    }
  });
}

const activeChannels = {};//can be used for other stuff
const pendingTeleports = {};
async function teleportPlayer(name, stuck=false) {
  let dur = 5000;
  if (stuck===true){
    dur = 30000
  }
  startChannel({
    playerName: name,
    duration: dur,
    cancelOnMove: true,

    onComplete: () => {
      const player = players[name];
      if (!player) return;

      const x = player.x;
      const y = player.y;
      const z = player.z;
      let tile = getTile(x, y, z);
      delete tile.players[name];
      io.emit('explosion', { x: x, y: y, color: "blue" });
      markTileChanged(x, y);

      player.x = 49;
      player.y= 49;
      player.z = 0;

      addPlayerToTile(name, 49, 49, 0);
      markTileChanged(49, 49);
    },

    onCancel: () => {
    }
  });
}

let mazeDrops = {
  maze1: 
    [
      { name: "coin", min: 100, max: 1000, weight: 10000 },
      { name: "gold", min: 1, max: 10, weight: 1000 },
      { name: "diamond", min: 1, max: 5, weight: 100 },
      { name: "amethyst", min:1, max: 2, weight: 1 }
    ],
}

async function setMazeTimer(name, mazeName, dur, from, to, teleBack) {
  if (activeChannels[mazeName]) return;
  const player = players[name];
  if (!player) return;
  let fromX = from.x;
  let fromY = from.y;
  let fromZ = from.z;
  let toX = to.x;
  let toY = to.y;
  let toZ = to.z;
  //add stairs here
  //put prize in to area, picking up prize must tele player back to maze
  let fromTile = getTile(from.x, from.y, from.z);
  addToMap('dungeonStairs', from.x, from.y, from.z);
  fromTile.objects['dungeonStairs'].exclusiveTo=name;//only initiating player can enter!
  markTileChanged(from.x, from.y);
  sendMessage('server message', `You have ${dur/1000} seconds to reach the stairs at the end of the maze!`, player);
  let stairKey = Object.keys(fromTile.objects)[0];
  let stairObj = fromTile.objects[stairKey];
  stairObj.toX = toX;
  stairObj.toY = toY;
  stairObj.toZ = toZ;
  let toTile = getTile(toX, toY, toZ);
  if (toTile?.objects){
    delete toTile.objects;
    markTileChanged(toX, toY);
  }
  await dropMobLoot(mazeDrops[mazeName], toX, toY);
  toTile.objects['lootbag'].teleBack = teleBack;
  startChannel({
    playerName: mazeName,
    duration: dur,
    cancelOnMove: false,
    onComplete: () => {
      //delete stairs here, prize stays
      delete fromTile.objects;//should delete stairs
      markTileChanged(fromX, fromY);
      sendMessage('pk message', `The stairs disappear from the end of the maze...`, player);
    },

    onCancel: () => {
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
  //if (!player) return;

  // already channeling
  if (activeChannels[playerName]) return;
  let startX; let startY; let startZ;
  if (player){
    startX = player.x;
    startY = player.y;
    startZ = player.z;
  } else {
    startX = 0;
    startY = 0;
    startZ = 0;
  }
  const startTime = Date.now();
  // tell client to show progress bar
  if (player){
    io.to(player.sock_id).emit('channelStart', {
      duration,
      startTime
    });
  }

  const timer = setTimeout(() => {
    delete activeChannels[playerName];
    onComplete?.();
    if (player){
      io.to(player.sock_id).emit('channelEnd');
    }
  }, duration);

  activeChannels[playerName] = {
    timer,
    startX,
    startY,
    startZ,
    cancelOnMove,
    onCancel
  };
}

let zRaise = [//put stairs in here?
  'woodblock0',
  'stoneblock0'
]

let noTradeDrop = [//items that can't be dropped, lootbagged, or traded
  "orbFinder"
]

async function dropItem(name, item) {
  let player = players[name];
  if (player.murderer) {
    sendMessage('pk message', `As a murderer, you cannot drop items...`, player);
    return;
  }
  let tile = getTile(player.x, player.y, player.z);
  if (tile.objects) {
    if (Object.keys(tile.objects).length !== 0) {
      return;
    }
  }
  let questDrop=null;
  if (tile?.questTile){
    questDrop = await checkQuestDrop(player, item, tile.questTile.questName);
    if (questDrop===false){
      sendMessage('pk message', "You cannot drop items here...", player);
      return;
    }
  }
  if(!player.inventory[item]){
    return;
  }
  if (tile?.['b-t']){//maybe let player drop certain things in water /if/ they can get in water lol
    if (tile['b-t']==='water'){
      return;
    }
  }

  const invItem = player.inventory[item]; // current inventory slot
  const baseName = itemById[invItem.id];  // normal name from ID
  const dropName = baseTiles[baseName]?.dropChange ?? baseName;
  const container = baseTiles[dropName]?.containerChange ?? baseTiles[dropName].container;//this might break?

  if (isSafeActive(tile) && player.name!=='Admin'){
    switch (dropName){
      case "stoneblock0":
      case "woodblock0":
      case "woodroof":
      case "woodplate":
      case "stoneroof":
      case "stoneplate":
      case "stairsR":
      case "stairsL":
      case "door":
        sendMessage('pk message', `You cannot drop this item in a safe zone.`, player);
        return;
    }
  }
  if (noTradeDrop.includes(dropName)){
    let noName = baseTiles[dropName]?.prettyName ?? dropName;
    sendMessage('pk message', `${noName}'s cannot be dropped!`, player);
    return;
  }
  if (baseTiles[dropName]?.farming && player.z>0){
    sendMessage('pk message', `You can only plant seeds at ground level!`, player);
    return;
  }
  if (baseTiles[dropName]?.farming){//should put this in another function
    if (player.farmerQuest<3){
      sendMessage('pk message', `You must help Olive the Farmer to plant seeds!`, player);
      return;
    }
    if (baseTiles[dropName]?.lvl>player.farmingLvl){
      console.log("not reqd lvl");
      sendMessage('pk message', `You need level ${baseTiles[dropName].lvl} farming to plant this!`, player);
      return;
    }
    if (tile?.['b-t']!=='grass'){
      sendMessage('pk message', `You can only plant seeds in fresh earth!`, player);
      return;
    }
    if (tile?.floor){
      if (Object.keys(tile.floor).length>0){
        sendMessage('pk message', `You can't plant that here!`, player);
        return;
      }
    }
    if (tile?.roof){
      if (Object.keys(tile.roof).length>0){
        sendMessage('pk message', `Sunlight can't reach your plant here!`, player);
        return;
      }  
    }
    if (isSafeActive(tile)){
      sendMessage('pk message', `Farming is not permitted within zones guarded by the kingdom!`, player);
      return;    
    }
    //this should be all the cases
  }
  if (baseTiles[dropName]?.farming){//fuck, there's .farm and .farming in baseTiles...
    if (dropName==='tomatoPlant0' && player.farmerQuest===3){
      console.log("tomatoPlant0!");
      sendMessage('server message', `The tomato seed germinated! While waiting for it to grow, go talk to Olive the Farmer!`, player);
      await query(
        "UPDATE players SET farmerQuest = 4 WHERE player_name = ?",
        [player.name]
      );
      player.farmerQuest = 4;
    }
  }
  tile[container] ??= {};
  const tileItem = { name: dropName };

  // only set owner if the base tile defines it
  if ("owner" in baseTiles[dropName]) {//should work for farming
    await dropOwnedItem(player, baseName, tileItem);
  }

  //set on tile
  tile[container][dropName] = tileItem;

  //z raise
  if (zRaise.includes(dropName) && player.z<4){
    let oldTile = getTile(player.x, player.y, player.z);
    delete oldTile.players[player.name];
    markTileChanged(player.x, player.y);
    player.z+=1;
    addPlayerToTile(player.name, player.x, player.y, player.z);
    markTileChanged(player.x, player.y);
  }
  let item_Id = player.inventory[item].id;
  await removeItem(name, item_Id, 1);
  await ifEquippedRemove(name, item_Id);
  markTileChanged(player.x, player.y);
  await syncInventory(name);
}

async function dropOwnedItem(player, baseName, tileItem) {
  tileItem.owner = player.name; // player name
  if (baseName === 'door') {
    tileItem.locked = true;
  }
}

async function checkQuestDrop(player, item, quest){
  if (!quest){
    return false;
  }
  const invItem = player.inventory[item]; // current inventory slot
  const baseName = itemById[invItem.id];  // normal name from ID
  if (quest==="eyeGame" && baseName.startsWith('eye')){
    return true;
  }
  return false;
}

async function ifEquippedRemove(name, itemId) {
  let player = players[name];
  if (player.hand === itemId) {
    player.hand = null;
  }
  if (player.head === itemId) {
    player.head = null;
  }
  if (player.body === itemId) {
    player.body = null;
  }
  if (player.feet === itemId) {
    player.feet = null;
  }
  if (player.quiver === itemId) {
    player.quiver = null;
  }
}

async function craftItem(playerName, itemName, smelt = false) {
  if (!itemName) return;
  const player = players[playerName];
  if (Object.keys(player.tradeOffer).length>0){
    sendMessage('pk message', `DON'T`, player);
    return;
  }
  //
  let tile = getTile(player.x, player.y, player.z);
  const tileObjects = tile.objects;

  // normal crafting requires craft table; smelting bypasses table check
  if (!smelt && !tileObjects?.craftTable && !tileObjects?.cookingRange) return;

  const itemDef = baseTiles[itemName];
  if (!itemDef?.craft && !itemDef?.smelt && !itemDef?.cook) return; // not craftable
  // ---------- check materials ----------
  let craftAmount = 1;
  if (itemDef?.craftAmount) {
    craftAmount = itemDef.craftAmount;
  }
  //above here
  if (itemDef?.craft || itemDef?.smelt) {
    if (itemDef?.craftLvl > player.craftLvl) {
      sendMessage('pk message', `You need a crafting level of ${itemDef.craftLvl} to make this item...`, player);
      return;
    }
  }
  if (itemDef?.cook){
    if (itemDef?.cookingLvl > player.cookingLvl){
      sendMessage('pk message', `You need a cooking level of ${itemDef.cookLvl} to prepare this...`, player);
      return;
    }
  }
  let materialSlot;
  if (itemDef?.craft) materialSlot = "craft";
  if (itemDef?.smelt) materialSlot = "smelt";
  if (itemDef?.brew) materialSlot = "brew";
  if (itemDef?.cook) materialSlot = "cook";
  let questStatus = true;
  if (materialSlot==='cook'){
    questStatus = await chefQuestLogic(player, itemName);
  }
  if (!questStatus){
    sendMessage('pk message', `You must complete the Chef's Quest to prepare this!`, player);
    return;
  }
  for (const [materialName, requiredAmount] of Object.entries(itemDef[materialSlot])) {
    const materialId = idByItem(materialName);
    const playerAmount = await getItemAmount(playerName, materialId);
    if (playerAmount < requiredAmount) {
      sendMessage('pk message', `You don't have enough ${materialName} to make this...`, player);
      return;
    };
  }
  //remove materials
  let xpType;
  switch (materialSlot){
    case 'craft':
    case 'smelt':
      xpType = 'craft';
      break;
    case 'cook':
      xpType = 'cook';
      break;
  }
  let xpGiven = 0;
  for (const [materialName, requiredAmount] of Object.entries(itemDef[materialSlot])) {
    const materialId = idByItem(materialName);
    await removeItem(playerName, materialId, requiredAmount);
    xpGiven+=requiredAmount;
    //await giveXp(playerName, requiredAmount, xpType);
  }
  if (itemDef?.xp){
    xpGiven=itemDef.xp;
  }
  await giveXp(playerName, xpGiven, xpType);
  // ---------- add crafted item (WITH SAFETY) ----------
  const craftedId = idByItem(itemName);
  if (!craftedId){
    sendMessage('pk message', "DON'T DO THAT", player);
    return;
  } 

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
    sendMessage('server message', `${itemName} was put in your bank because your inventory was full!`, player);
  } else {
    sendMessage('server message', `You made a ${itemName}!`, player);
  }
  await syncInventory(playerName);
}

async function chefQuestLogic(player, itemName){
  if (player.chefQuest===1){
    if (itemName==='cookedRedfish'){
      await query(
        "UPDATE players SET chefQuest = 2 WHERE player_name = ?",
        [player.name]
      );
      player.chefQuest = 2;
      return true;
    } else return false;
  }
  if (player.chefQuest===2 && itemName!=='cookedRedfish'){
    sendMessage('pk message', `You must complete the Chef's Quest to prepare this!`, player);
    return false;
  }
  if (player.chefQuest===3){
    if (itemName==='bread'){
      await query(
        "UPDATE players SET chefQuest = 4 WHERE player_name = ?",
        [player.name]
      );
      player.chefQuest = 4;
      return true;     
    }
  else if (itemName==='cookedRedfish'){
    return true;
  } else {
      sendMessage('pk message', `You must complete the Chef's Quest to prepare this!`, player);
      return false;
    }
  }
  if (player.chefQuest===4){
    if (itemName==='cookedRedfish' || itemName==='bread'){
      return true;
    } else {
      sendMessage('pk message', `You must complete the Chef's Quest to prepare this!`, player);
      return false;
    }
  }
  if (player.chefQuest===5){
    if (itemName==='fishSandwich'){
      await query(
        "UPDATE players SET chefQuest = 6 WHERE player_name = ?",
        [player.name]
      );
      player.chefQuest = 6;
    }
    else if (itemName==='bread' || itemName==='cookedRedfish'){
      return true;
    } else {
      sendMessage('pk message', `You must complete the Chef's Quest to prepare this!`, player);
      return false;
    }
  }
  return true;
}

async function smeltOre(playerName) {
  const player = players[playerName];
  if (Object.keys(player.tradeOffer).length>0){
    sendMessage('pk message', `DON'T`, player);
    return;
  }
  let tile = getTile(player.x, player.y, player.z);
  const tileObjects = tile.objects;

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

async function playerBank(playerName, king=false) {
  //check if king and if kings chest?
  let bankName = playerName;
  if (king===true){
    if (players[playerName].king===null){
      sendMessage('pk message', `Only for use by the king!`, players[playerName]);
      return;
    }
    bankName = players[playerName].king;//implies player_name = 'east' or 'west' in db
  }
  const rows = await query(`
    SELECT id, amount
    FROM bank
    WHERE player_name = ? AND amount > 0
  `, [bankName]);

  const bankItems = {};
  for (const row of rows) {
    bankItems[row.id] = { id: row.id, amt: row.amount };
  }

  const player = players[playerName];
  io.to(players[playerName].sock_id).emit('openBank', bankItems);

  return bankItems;
}

const mobs = new Map();

let treasureHidden = false;
let Treasure = {};
async function initTreasure(){//favors north part of map, fix that
  treasureHidden = false;
  Treasure = {};//empty that shit
  for (let y = 0; y < 295; y++) {
    for (let x = 0; x < 491; x++) {
      if (treasureHidden===true) return;
      let tile = getTile(x, y, 0);
      let bt = tile?.['b-t'];
      if (!bt || bt!=='grass') continue;
      if (Math.floor(Math.random()*144845 < 10)){
        Treasure.x = x;
        Treasure.y = y;
        treasureHidden = true;
        console.log(`Treasure hidden at ${Treasure.x},${Treasure.y}`);
      }
    }
  }
}

let rock = 0;
let iron = 0;
let coal = 0;
let copper = 0;
let silver = 0;
let gold = 0;
let diamond = 0;
let amethyst = 0;

async function replenishResources(farming=false) {
  if (!farming){
    await initTreasure();
    await removeMobType("mushroom");
    await removeMobType("goat");
    await removeMobType("wolf");
    await removeMobType("poisonMushroom");
    await removeMobType("rabbit");
    await removeMobType("scorpion");
    await removeMobType("ghast");
  }
  for (let y = 0; y < map.Map.length; y++) {
    for (let x = 0; x < map.Map[y].length; x++) {
      for (let z = 0; z<5; z++){//full send 6 z levels :o
        const tile = getTile(x, y, z);
        if (!tile || tile === undefined || tile === null) continue;

        if (tile?.typing === true) {
          delete tile.typing;
        }
        if (tile['b-t'] === "water") {
          if (tile?.objects) {//gets rid of fishing spots AND lost arrows lol
            delete tile.objects;
          }
          if (Math.floor(Math.random() * 500) < 10 && z===0) {
            randomFishingSpot(tile);
          }
        }
        if (!farming){
          await randMobsAndPlants(tile, x, y);
        }
        
        // Loop over both containers so all stages are eligible
        for (const containerName of ["objects", "depletedResources"]) {
          const container = tile[containerName];
          if (!container) continue;

          for (const objName in { ...container }) { // spread to avoid mutation issues
            const def = baseTiles[objName];
            if (!def?.regrowsTo) continue;
            if (!def?.farming){
              if (farming){
                continue;
              }
            }
            if (def?.farming){
              if (!farming){
                continue;
              }
            }
            // Pick weighted
            const nextName = Array.isArray(def.regrowsTo)
              ? pickWeighted(def.regrowsTo)
              : def.regrowsTo;
            if (!nextName) continue;
            let owner;
            if (container[objName]?.owner){
              owner = container[objName].owner;
            }
            // Remove old stage
            delete container[objName];
            // Add new stage into objects container
            tile.objects ??= {};
            tile.objects[nextName] = { name: nextName };
            if (farming){
              tile.objects[nextName].owner = owner;
            }
            if (farming && owner!==undefined){
              if (!baseTiles[nextName]?.regrowsTo){
                console.log("setting plant amt");
                //final stage, add amt depending on players level, always 4
                tile.objects[nextName].amt = 4;//+ Math.floor(Math.random()*Math.floor(player.farmingLvl/10));
              }
            }
            oreCount(nextName);
            markTileChanged(x, y);
          }
        }
      }
    }
  }
  console.log(`Mobs: ${mobs.size}`);
  console.log(`
    rock: ${rock},
    iron: ${iron},
    coal: ${coal},
    copper: ${copper},
    silver: ${silver},
    gold: ${gold},
    diamond: ${diamond},
    amethyst: ${amethyst},
    total: ${rock+iron+coal+copper+silver+gold+diamond+amethyst}
  `);
}

async function blob(cx, cy, size) {
  const out = [{ x: cx, y: cy }];
  const used = new Set([`${cx},${cy}`]);

  const dirs = [
    [1,0], [-1,0], [0,1], [0,-1]
  ];

  while (out.length < size) {
    const base = out[Math.floor(Math.random() * out.length)];
    const [dx, dy] = dirs[Math.floor(Math.random() * dirs.length)];

    const x = base.x + dx;
    const y = base.y + dy;
    const k = `${x},${y}`;

    if (!used.has(k)) {
      used.add(k);
      out.push({ x, y });
    }
  }

  return out;
}

async function randMobsAndPlants(tile, x, y){
  const isEmpty = obj => !obj || Object.keys(obj).length === 0;
  //delete all flowers first
  //plant regens like this need separate fxns
  Object.keys(tile?.objects ?? {}).forEach(k => k.startsWith("flower") && delete tile.objects[k]);
  Object.keys(tile?.objects ?? {}).forEach(k => k.startsWith("swamp") && delete tile.objects[k]);
  if (
    //will need to change this not to go on player plots and shit lol
    isEmpty(tile?.objects) &&
    isEmpty(tile?.floor) &&
    isEmpty(tile?.depletedResources) &&
    tile['b-t'] === 'grass'
  ) {
    //random chance to grow a flower!
    const flowers = ['flowerred', 'floweryellow', 'flowerwhite'];
    let randFlower = Math.floor(Math.random() * 1000);
    if (randFlower < flowers.length) {
      addToMap(flowers[randFlower], x, y);
    }
    const wildFlowers = ['flowerPurple', 'flowerPink', 'flowerBlue'];
    let randWild = Math.floor(Math.random()*1000);
    if (randWild < wildFlowers.length){
      if (!tile?.kTile && isEmpty(tile?.objects)){
        addToMap(wildFlowers[randWild], x, y);
      }
    }
  }
  if (
    isEmpty(tile?.objects) &&
    isEmpty(tile?.floor) &&
    isEmpty(tile?.depletedResources) &&
    tile['b-t'] === 'grass'
  ) {
    //random chance place a mushroom mob!
    let randMushroom = Math.floor(Math.random() * 2000);
    if (randMushroom < 3 && z === 0) {
      //add mushroom
      let mushroom1 = createMob('mushroom', x, y);
      mobs.set(mushroom1.id, mushroom1);
      tile.mob = {
        id: mushroom1.id,
        sprite: "mushroomL"
      }
    }
  }
  if (
    isEmpty(tile?.objects) &&
    isEmpty(tile?.floor) &&
    isEmpty(tile?.depletedResources) &&
    tile['b-t'] === 'swamp' &&
    !tile?.kTile//no mans land only
  ) {
    if (Math.random()*100<2){
      const tiles = await blob(x, y, 10);
      for (const { x: sx, y: sy } of tiles) {
        let sTile = getTile(sx, sy, 0);
        if (sTile?.['b-t']==='swamp'){
            if (sTile?.objects){
              if (Object.keys(sTile.objects).length>0){
                continue;
              }
            }
            addToMap('swampGrass', sx, sy);
        }
      }      
    }

  }
  if (
    isEmpty(tile?.objects) &&
    isEmpty(tile?.floor) &&
    isEmpty(tile?.depletedResources) &&
    tile['b-t'] === 'swamp' &&
    !tile?.kTile//no mans land only
  ) {
    //random chance place a mushroom mob!
    let randMushroom = Math.floor(Math.random() * 2000);
    if (randMushroom < 3 && z === 0) {
      //add mushroom
      let mushroom1 = createMob('poisonMushroom', x, y);
      mobs.set(mushroom1.id, mushroom1);
      tile.mob = {
        id: mushroom1.id,
        sprite: "poisonMushroomL"
      }
    }
  }
  //random chance for roaming goat!
  let randGoat = Math.floor(Math.random() * 3000);
  if (randGoat < 3 && z === 0) {//1/1000
    if (
      isEmpty(tile?.objects) &&
      isEmpty(tile?.floor) &&
      isEmpty(tile?.roof) &&
      isEmpty(tile?.depletedResources) &&
      tile['b-t'] === 'grass'
    ) {
      let testGoat = createMob('goat', x, y);
      mobs.set(testGoat.id, testGoat);
      tile.mob = {
        id: testGoat.id,
        sprite: "goatL"
      }
    }
  }
  let randRabbit = Math.floor(Math.random() * 3000);
  if (randRabbit < 3 && z === 0) {//1/1000
    if (
      isEmpty(tile?.objects) &&
      isEmpty(tile?.floor) &&
      isEmpty(tile?.roof) &&
      isEmpty(tile?.depletedResources) &&
      tile['b-t'] === 'grass' &&
      !isSafeActive(tile) &&
      !tile?.kTile
    ) {
      let testRabbit = createMob('rabbit', x, y);
      mobs.set(testRabbit.id, testRabbit);
      tile.mob = {
        id: testRabbit.id,
        sprite: "rabbitL"
      }
    }
  }
  let randWolf = Math.floor(Math.random() * 10000);
  if (randWolf < 3 && z === 0) {
    if (
      isEmpty(tile?.objects) &&
      isEmpty(tile?.floor) &&
      isEmpty(tile?.roof) &&
      isEmpty(tile?.depletedResources) &&
      tile['b-t'] === 'grass' &&
      !isSafeActive(tile) &&
      !tile?.kTile
    ) {
      let testWolf = createMob('wolf', x, y);
      mobs.set(testWolf.id, testWolf);
      tile.mob = {
        id: testWolf.id,
        sprite: "wolfL"
      }
    }
  }
  let randScorp = Math.floor(Math.random() * 1000);
  if (randScorp < 3 && z === 0) {
    if (
      isEmpty(tile?.objects) &&
      isEmpty(tile?.floor) &&
      isEmpty(tile?.roof) &&
      isEmpty(tile?.depletedResources) &&
      tile['b-t'] === 'sand' &&
      !isSafeActive(tile) &&
      !tile?.kTile
    ) {
      console.log("scorp!");
      let testScorp = createMob('scorpion', x, y);
      mobs.set(testScorp.id, testScorp);
      tile.mob = {
        id: testScorp.id,
        sprite: "scorpionL"
      }
    }
  }
  let randGhast = Math.floor(Math.random() * 1000);
  if (randGhast < 3 && z === 0) {
    if (
      isEmpty(tile?.objects) &&
      isEmpty(tile?.floor) &&
      isEmpty(tile?.roof) &&
      isEmpty(tile?.depletedResources) &&
      tile['b-t'] === 'swamp' &&
      !isSafeActive(tile) &&
      !tile?.kTile
    ) {
      console.log("ghast!");
      let testGhast = createMob('ghast', x, y);
      mobs.set(testGhast.id, testGhast);
      tile.mob = {
        id: testGhast.id,
        sprite: "ghastL"
      }
    }
  }
}

function oreCount(name){
  switch (name){
    case "rock0":
      rock+=1;
      return;
    case "ironrock0":
      iron+=1;
      return;
    case "coalrock0":
      coal+=1;
      return;
    case "copperrock0":
      copper+=1;
      return;
    case "silverrock0":
      silver+=1;
      return;
    case "goldrock0":
      gold+=1;
      return;
    case "diamondrock0":
      diamond+=1;
      return;
    case "amethystrock0":
      amethyst+=1;
      return;
  }
}

async function randomFishingSpot(tile) {
  //check surrounding tiles for b-t with no collision, e.g. grass
  //must be up/down/left/right tile, not corners
  const spots = [
    { x: tile.x, y: tile.y - 1, z:0 }, // up
    { x: tile.x, y: tile.y + 1, z:0 }, // down
    { x: tile.x - 1, y: tile.y, z:0 },     // left
    { x: tile.x + 1, y: tile.y, z:0 }      // right
  ];
  let valid = false;
  for (const s of spots) {
    let spotTile = getTile(s.x, s.y, s.z);
    if (!spotTile) continue;
    if (spotTile===null) {
      continue;
    }
    if (baseTiles[spotTile['b-t']].collision === false) {
      valid = true;
      continue;
    }
  }
  if (valid === true) {
    //add a fishing spot!
    addToMap('fishingspot', tile.x, tile.y);
    tile.objects['fishingspot'].fishing = false;
    tile.objects['fishingspot'].amount = Math.floor(Math.random() * 24);
  }
}

replenishResources();//run at server start to add random ores n shit
setInterval(replenishResources, 60000 * 180);//every 3 hours
setInterval(() => replenishResources(true), 1000*30*60);//every 30 minutes plant stage
setInterval(mapUpdate, 200);
setInterval(mapPersist, 60000);//save map every minute

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

async function removeMobType(type) {
  for (const [id, mob] of mobs) {
    if (mob.type === type) {
      let oldSprite = { x: mob.x, y: mob.y };
      mobs.delete(id);
      let tile = getTile(oldSprite.x, oldSprite.y);
      delete tile.mob;
    }
  }
}

function countMobsByType(type) {
  let count = 0;
  for (const mob of mobs.values()) {
    if (mob.type === type) count++;
  }
  return count;
}

let eyeTypes = [
  "LightBlue",
  "Green",
  "Yellow",
  "Blue",
  "Pink",
  "Red",
];

function spawnMob(spawn) {
  if (spawn?.kingdom){
    if (kingdoms[spawn.kingdom].activeGuard>=12) return;
    if (kingdoms[spawn.kingdom].guards<=0) return;
    if (kingdoms[spawn.kingdom].activeGuard===kingdoms[spawn.kingdom].guards) return;
    kingdoms[spawn.kingdom].activeGuard+=1;
  }
  const mob = createMob(spawn.type, spawn.x, spawn.y);
  if (spawn?.kingdom){
    mob.kingdom = spawn.kingdom;//for if gets killed to decrement kingdom guards
  }
  mobs.set(mob.id, mob);
  let tile = getTile(mob.x, mob.y);
  if (spawn.type==='eye'){
    mob.type+=eyeTypes[Math.floor(Math.random()*eyeTypes.length)];
    mob.drop=[
      { name: mob.type, min: 1, max: 5, weight: 100 }
    ]
  }
  tile.mob = {
    id: mob.id,
    sprite: mob.type + "L"
  };
  if (mob?.multiTile){

    //come back to this...

  }
  if (mob?.collision === true) {
    tile.mob.collision = true;//is this necessary?
  }
  mob.spawnRef = spawn; // 🔑 link back to spawn
  //for minion spawners so they don't spam
  if (mob?.spawnMinion) {
    mob.spawnCount = countMobsByType(mob.spawnMinion);
  }
}

setInterval(() => {
  for (const spawn of mobSpawns) {//put this here cause initKingdoms took too fuckin long lol
    for (let i = 0; i < spawn.count; i++) {
      if (!spawn?.kingdom) return;
      spawnMob(spawn);
    }
  }
}, 5000);

function updateMob(mob, now) {
  if (mob.hp <= 0) {killMob(mob); return;};
  if (now < mob.nextThink) return;
  mob.nextThink = now + mob.thinkSpeed;
  if (mob?.spawnMinion) spawnMinion(mob);
  if (mob.state === "return") {
    if (mob.x === mob.spawnX && mob.y === mob.spawnY) {
      //check if target comes back in range
      mob.state = "idle";
      return;
    }
    returnToSpawn(mob);
    return;
  }
  const player = findPlayerInRange(mob);
  if (player) {
    if (distFromSpawn(mob) > mob.leashRadius) {
      mob.state = "return";
      mob.target = null;
      return;
    }
    if (inAttackRange(mob, player)) {
      mob.thinkSpeed=mob.baseSpeed;
      attackPlayer(mob, player);
      return;
    }
    mob.thinkSpeed=mob.pursuitSpeed;
    moveToward(mob, player);
    return;
  }
  //check for mobs here if kingsguard or mob that's aggressive to other mobs
  //kingsguard attacks aggressive mobs only (mobs that don't have .passive)
  mob.thinkSpeed = mob.baseSpeed;
  wander(mob);
}

function findPlayerInRange(mob) {
  if (mob?.passive) return null;
  for (const name in players) {
    const player = players[name];
    if (!player) continue;
    if (mob?.guard){//reg guards and kingsguards
      if (!player.murderer && !player.criminal) continue;
    }
    const px = player.x;
    const py = player.y;
    const dist = Math.abs(mob.x - px) + Math.abs(mob.y - py);
    if (dist <= mob.aggroRadius) {
      return player;
    }
  }
  return null;
}

function tryMove(mob, newX, newY) {
  const oldTile = getTile(mob.x, mob.y);
  const newTile = getTile(newX, newY);
  if (newTile?.safeTile){
    if (!mob?.guard) return false;
  }
  if (!newTile) return false;
  if (newTile.mob) return false;
  if (mobCollision(newTile)) return false;

  // update facing
  mob.facing = newX > mob.x ? "right" : "left";
  // clear old tile
  delete oldTile.mob;
  if (mob?.multiTile) {
    //come back to this
  }
  // update mob position
  mob.x = newX;
  mob.y = newY;
  // set new tile
  //if big mob, put un-drawn mob/collision/id etc on all tiles the sprite appears on!
  newTile.mob = {
    id: mob.id,
    sprite: mob.type + (mob.facing === "left" ? "L" : "R")
  };
  if (mob?.multiTile){

    //come back to this

  }
  markTileChanged(mob.x, mob.y);
  return true;
}

function mobCollision(tile) {
  for (obj in tile.objects) {
    if (baseTiles[tile.objects[obj].name].collision) return true;
  }
  if (baseTiles[tile['b-t']].collision) return true;
  if (tile?.mob){
    if (Object.keys(tile.mob).length>0) return true;
  }
  return false;
}

function distance(a, b) {
  const ax = a.x;
  const ay = a.y;
  const bx = b.x;
  const by = b.y;
  return Math.abs(ax - bx) + Math.abs(ay - by);
}

function canSeePlayer(mob, player) {
  return distance(mob, player) <= mob.vision;
}

function distFromSpawn(mob) {
  return Math.abs(mob.x - mob.spawnX) + Math.abs(mob.y - mob.spawnY);
}

function wander(mob) {
  // 🚫 too far → go home instead
  if (distFromSpawn(mob) >= mob.leashRadius) {
    moveToward(mob, {x: mob.spawnX, y: mob.spawnY });
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
  const px = target.x;
  const py = target.y;
  if (target?.name && mob?.rangeAttack) {
    mobRangeAttack(mob, target);
  }
  const dx = Math.sign(px - mob.x);
  const dy = Math.sign(py - mob.y);

  // try x first if farther away horizontally
  if (mob.type==="spiderQueen" || mob.type==='troll') return;//just add a stationary property to certain mobs
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
  moveToward(mob, {x:mob.spawnX, y:mob.spawnY});
}

function inAttackRange(mob, player) {
  const px = player.x;
  const py = player.y;

  const dist = Math.abs(mob.x - px) + Math.abs(mob.y - py);
  if (player && mob?.rangeAttack && mob.type==='spiderQueen') {
    mobRangeAttack(mob, player);
  }
  return dist === 1; // adjacent tile
}

function attackPlayer(mob, player) {
  if (player.takingThrone===true){
    cancelPendingChannels(player.name);
  }
  if (player.z!==0) return;
  if (Date.now() > mob.lastAttack + mob.thinkSpeed) {
    mob.lastAttack = Date.now();
    let damage = mob.attack;
    if (player.head !== null) {
      let headName = itemById[player.head];
      damage -= Math.floor(Math.random() * baseTiles[headName].defense);
    }
    if (player.body !== null) {
      let bodyName = itemById[player.body];
      damage -= Math.floor(Math.random() * baseTiles[bodyName].defense);
    }
    if (player.feet !== null) {
      let feetName = itemById[player.feet];
      damage -= Math.floor(Math.random() * baseTiles[feetName].defense);
    }
    if (damage > 0) {
      player.hp -= damage;
      player.lastHitBy = null;
      sendSound(player, ['hit', 'damage']);
      sendMessage('pk message', `You got hit by the ${mob.type} for ${damage} damage!`, player);
    } else {
      sendSound(player, ['miss']);
    }
  }
}

function mobRangeAttack(mob, target) {
  if (Date.now() < mob.lastAttack + 1000) return;
  mob.lastAttack = Date.now();
  let projType = mob.rangeAttack.type;
  const dir = getDirectionToward(mob.x, mob.y, target.x, target.y);
  let decay = 10;
  if (mob.type==='spiderQueen'){
    decay = 0;
  }
  if (mob.type==='troll'){
    if (dir==='right'){
      return;
    }
  }
  if (mob.rangeAttack?.slow === true) {
    let slowTime = mob.rangeAttack.slowTime;
    const mobProj = createProjectile(projType, dir, mob.x, mob.y, 0, mob.id, decay, true, slowTime);
    addProjectileToTile(mobProj);
  } else {
    const mobProj = createProjectile(projType, dir, mob.x, mob.y, 0, mob.id, decay);
    addProjectileToTile(mobProj);
  }
}

function spawnMinion(mob) {
  if (mob.hp < mob.maxHp && mob.spawnCount < mob.spawnMax) {
    let testMinion = createMob(mob.spawnMinion, mob.x, mob.y);
    mobs.set(testMinion.id, testMinion);
    let tile = getTile(mob.x, mob.y);
    tile.mob = {
      id: testMinion.id,
      sprite: mob.spawnMinion + "L"
    }
    mob.spawnCount += 1;
  }
}

function spawnResourceMob(playerName, x, y, z, chance) {
  let player = players[playerName];
  if (player.z>0) return;
  if (Math.floor(Math.random() * 100) < 99) return;
  //see what player is holding, hatchet/pickaxe, spawn treeEnt or stoneGolem
  let mobName = null;
  let mobDrop = null;
  let dropMin = null;
  if (itemById[players[playerName].hand].startsWith('pickaxe')) {
    mobName = "rockGolem";
    mobDrop = "rock";
    dropMin = player.miningLvl*10;
  }
  if (itemById[players[playerName].hand].startsWith('axe')) {
    mobName = "treeEnt";
    mobDrop = "log";
    dropMin = player.woodcuttingLvl*10;
  }
  if (mobName === null) return;//aww
  let testResMob = createMob("resourceMob", x, y, z);
  testResMob.type = mobName;//hopefully works?
  testResMob.hp = Math.floor(player.hpLvl/2);//just for now, scale by lvl
  testResMob.attack = Math.floor(player.swordLvl/2);//just for now, scale
  testResMob.drop.push(
    { name: mobDrop, min: dropMin, max: dropMin*2, weight: 100 }
  )
  mobs.set(testResMob.id, testResMob);
  let tile = getTile(x, y, z);
  tile.mob = {
    id: testResMob.id,
    sprite: testResMob.type + "L"
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
    `SELECT *
     FROM players
     WHERE murderer = 1 AND murderTimer > 0`
  );

  if (!rows.length) {
    console.log('No active murderers to reinitialize.');
    return;
  }

  for (const result of rows) {
    const name = result.player_name;
    // Calculate levels
    let x = result.x;
    let y = result.y;
    let z = result.z;
    // Initialize player object in memory
    await initPlayer(name);
    let player = players[name];
    player.murderSprite = "murderR";
    player.murderer = true;
    player.murderTimer = result.murderTimer;
    addPlayerToTile(name, x, y, z);
    markTileChanged(x, y);
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
  if (players['Admin']) {
    clearCriminal('Admin');//tee
    setMurdererStatus('Admin', false, 0);//hee
    if (players['Admin']){
      players['Admin'].hp=2000;
      players['Admin'].mana=1000;
    }
  }
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
    if (!player) continue;
    await handlePlayerInput(name, player.keystate);
  }
}, 20);

//PROJECTILE TESTING
const projectiles = new Map();
let nextProjectileId = 1;

function createProjectile(type, direction, x, y, z, ownerId, decay = 10, slow = false, slowTime = null) {
  const id = nextProjectileId++;
  const damage = baseTiles[type].attack;
  const projectile = {
    id,
    type,       // base type, e.g., "arrow"
    damage,
    direction,  // "up", "down", "left", "right"
    x,          // tile coordinates
    y,
    z,
    ownerId,
    life: decay,    // max ticks
    prevTile: null,  // track where it is on the map
  };

  // derive the tile name for rendering
  projectile.tileName = type + direction.charAt(0).toUpperCase() + direction.slice(1); // e.g., "arrowRight"
  if (slow === true) {
    projectile.slow = true;
    projectile.slowTime = slowTime;
  }
  projectiles.set(id, projectile);
  return projectile;
}

function addProjectileToTile(proj) {
  let tile = getTile(proj.x, proj.y, proj.z);
  if (tile===null || tile===undefined){
    map.Map[proj.y][proj.x][proj.z]={};
    tile = getTile(proj.x, proj.y, proj.z);
  }

  markTileChanged(proj.x, proj.y);
  // if tile already has a projectile, destroy both
  if (tile?.projectile) {
    projectiles.delete(proj.id);
    // optionally delete the existing one? depends on rules
    delete tile.projectile;
    markTileChanged(proj.x, proj.y);
    return false;
  }
  let projCollision = checkProjectileCollision(proj);
  if (projCollision === true) {
    projectiles.delete(proj.id);
    delete tile.projectile;
    markTileChanged(proj.x, proj.y);
    return false;
  }
  if (projCollision === false) {
    tile['projectile'] = {};
    tile.projectile = { name: proj.tileName };
    proj.prevTile = { x: proj.x, y: proj.y, z:proj.z };
    markTileChanged(proj.x, proj.y);
    return true;
  }
  if (projCollision === 'end') {
    return 'end';
  }
}

function checkProjectileCollision(proj) {
  const tile = getTile(proj.x, proj.y, proj.z);
  if (tile?.objects) {
    for (obj in tile.objects) {
      if (baseTiles[tile.objects[obj].name].collision) {
        if (tile.objects[obj].name.startsWith('rock')) {
          return 'end';
        } else {
          return true;
        }
      }
    }
  }
  if (tile?.players) {
    if (Object.keys(tile.players).length > 0) {
      if (tile.players[proj.ownerId]) {
        return false;
      }
      let targetName = Object.keys(tile.players)[0];
      rangeAttackPlayer(proj, targetName);
      return true;
    }
  }
  if (tile?.mob) {
    if (Object.keys(tile.mob).length > 0 && mobs.get(proj.ownerId) === undefined) {
      rangeAttackMob(proj, tile.mob);
      return true;
    }
  }
  return false;
}

//add all functionality, sounds, rand hits/crits, etc
function rangeAttackMob(proj, mob) {
  if (mobs.get(proj.ownerId) !== undefined && mobs.get(proj.ownerId) !==null) return;
  let mobObj = mobs.get(mob.id);
  let player = players[proj.ownerId];
  let damage = Math.floor(Math.random() * baseTiles[proj.type].attack);
  if (baseTiles[itemById[player.hand]]?.attack) {
    damage += Math.floor(Math.random() * baseTiles[itemById[player.hand]].attack);
  }
  if (proj.type.includes('arrow')){
    damage += Math.floor(Math.random() * players[proj.ownerId].archeryLvl);
    damageMob(proj.ownerId, mob.id, damage, "archery");
  }
  if (proj.type.includes('dust')){
    damage += Math.floor(Math.random() * players[proj.ownerId].mageLvl);//change to mageLvl
    damageMob(proj.ownerId, mob.id, damage, "mage");
  }
}

//must consolidate doing damage to players/mobs
//else have to rewrite murder status, sounds etc
function rangeAttackPlayer(proj, targetName) {
  let damage = Math.floor(Math.random() * baseTiles[proj.type].attack);
  let targetPlayer = players[targetName];
  if (proj?.slow === true) {
    targetPlayer.slow = true;
    targetPlayer.slowTime = proj.slowTime;
    sendMessage('pk message', 'You have been immobilized!', targetPlayer);
  }
  if (mobs.get(proj.ownerId) !== undefined) {
    mobRangeDamagePlayer(proj, targetPlayer);
  } else {
    let player = players[proj.ownerId];
    if (baseTiles[itemById[player.hand]]?.attack){
      damage += Math.floor(Math.random()*baseTiles[itemById[player.hand]].attack);
    }
    if (baseTiles[itemById[player.hand]]?.attack) {
      damage += Math.floor(Math.random() * baseTiles[itemById[player.hand]].attack);
    }
    if (proj.type.includes('arrow')){
      damage += Math.floor(Math.random() * players[proj.ownerId].archeryLvl);
      damagePlayer(player, targetPlayer, damage, "archery");
    }
    if (proj.type.includes('dust')){
      damage += Math.floor(Math.random() * players[proj.ownerId].mageLvl);//change to .mageLvl
      damagePlayer(player, targetPlayer, damage, "mage");
    }
  }
}

function mobRangeDamagePlayer(proj, targetPlayer) {
  if (targetPlayer.takingThrone===true){
    cancelPendingChannels(targetPlayer.name);
  }
  let damage = baseTiles[proj.type].attack;
  //other logic for combat triangle, armour etc
  targetPlayer.hp -= damage;
  let mobName = mobs.get(proj.ownerId);
  sendSound(targetPlayer, ['hit', 'damage']);
  sendMessage('pk message', `The ${mobName.type} hit you for ${damage} damage!`, targetPlayer);
}

function removeProjectileFromTile(proj) {
  if (!proj.prevTile) return;
  const tile = getTile(proj.prevTile.x, proj.prevTile.y, proj.prevTile.z);
  if (tile.projectile) delete tile.projectile;
  markTileChanged(proj.x, proj.y);
}

function updateProjectiles() {
  for (const [id, proj] of [...projectiles]) { // clone for safe deletion
    // remove from old tile
    removeProjectileFromTile(proj);

    // move in direction
    switch (proj.direction) {
      case "up": proj.y -= 1; break;
      case "down": proj.y += 1; break;
      case "left": proj.x -= 1; break;
      case "right": proj.x += 1; break;
    }

    // add to new tile
    const added = addProjectileToTile(proj);
    if (added === 'end') { // destroyed due to collision
      if (proj.type.startsWith("arrow") && players[proj.ownerId]) {//still not perfect, fix
        if (proj.type.startsWith('arrowfire') || proj.type.includes('orangedust')) {
          io.emit('explosion', { x: proj.x, y: proj.y, color: 'orange' });
          areaDamage(proj.ownerId, proj.x, proj.y, proj.z, 1, "fire", 12);
        } else {
          spreadDropItem(proj.x, proj.y, proj.z, proj.type);
        }

      }
      if (proj.type.includes('yellowdust')){
          areaDamage(proj.ownerId, proj.x, proj.y, proj.z, 4, "lightning", 25);
      }
      proj.life = 0;
    }
    if (added === false) {
      proj.life = 0;
      if (proj.type.startsWith('arrowfire') || proj.type.includes('orangedust')) {
        io.emit('explosion', { x: proj.x, y: proj.y, color: 'orange' });
        areaDamage(proj.ownerId, proj.x, proj.y, proj.z, 1, "fire", 12);
        removeProjectileFromTile(proj);
        projectiles.delete(id);
        return;
      }
      if (proj.type.includes('yellowdust')) {
        areaDamage(proj.ownerId, proj.x, proj.y, proj.z, 4, "lightning", 25);
      }
    }


    // decrease lifespan
    proj.life--;
    if (proj.life <= 0) {
      removeProjectileFromTile(proj);
      markTileChanged(proj.x, proj.y);
      if (proj.type.startsWith('arrowfire') || proj.type.includes('orangedust')) {
        io.emit('explosion', { x: proj.x, y: proj.y, color: 'orange' });
        areaDamage(proj.ownerId, proj.x, proj.y, 1, proj.z, "fire", 15);
      }
      if (proj.type.includes('yellowdust')) {
        areaDamage(proj.ownerId, proj.x, proj.y, 4, proj.z, "lightning", 25);
      }
      if (proj.type.startsWith("arrow") && players[proj.ownerId] && added !== 'end' && added !== false) {//still not perfect, fix
        if (!proj.type.startsWith('arrowfire')) {
          spreadDropItem(proj.x, proj.y, proj.z, proj.type);
        }
      }
      //change to drop proper item (or not for spells etc)
      projectiles.delete(id);
    }
  }
}

function spreadDropItem(x, y, z, item) {
  const tilesToCheck = getTilesInRadius(x, y, 3);
  for (const { nx, ny } of tilesToCheck) {
    const nTile = getTile(nx, ny);
    if (!nTile) continue;
    if (!nTile.objects || Object.keys(nTile.objects).length === 0) {
      addToMap(item, nx, ny);
      markTileChanged(nx, ny);
      break; // dropped successfully
    }
  }
}

//projectiles interval
setInterval(() => {
  updateProjectiles();
}, 100)