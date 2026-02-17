const { map, mapFxn, mobs } = require('./state.js');

let players = {};

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
      criminal,
      head,
      body,
      hand,
      feet,
      quiver
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
    hand: result[0].hand,
    head: result[0].head,
    body: result[0].body,
    feet: result[0].feet,
    quiver:result[0].quiver,//other stuff can go here than arrows
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