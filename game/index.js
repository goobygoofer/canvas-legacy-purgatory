var devMode = false;

const sounds = {};

const spriteSheet = new Image();
spriteSheet.src = 'spritesheet-0.5.18.png';
const canvas = document.getElementById('disp');
const invCanvas = document.getElementById('invDisp');
const ctx = canvas.getContext('2d');
const invCtx = invCanvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

const socket = io(window.location.origin, {
  reconnection: false
});
const form = document.getElementById('form');
const input = document.getElementById('input');
const messages = document.getElementById('messages');

let typingTimeout;
let isTyping=false;
let emitInputSwitch = false;
let currentButton = "left";
let ispainting = false;
let latestView = null;
let animating = false;
let chunkNeedsRender = false;
let lastRender = 0;
const FPS = 10;
const interval = 1000 / FPS;
let painting = false;
const palette = document.getElementById("colorSelect");
const preview = document.getElementById("colorPreview");
let playerData = {
  x: null,
  y: null,
  facing: null,
  name: null,//get from login? don't use this  yet
  inventory: {},//[{id:1, amt:1}, {id:5, amt:16}
  hand: null
};

/*
const ITEMS = {
  axe:        { id: 1 },
  log:        { id: 2 },
  pickaxe:    { id: 3 },
  rock:       { id: 4 },
  stoneSword: { id: 5 }
};

const itemById = Object.fromEntries(
  Object.entries(ITEMS).map(([name, data]) => [data.id, name])
);

//not even using this one, client may only need base_tiles and itemById
const idByItem = name => ITEMS[name]?.id;
*/
const itemById = Object.fromEntries(
  Object.entries(base_tiles)
    .filter(([name, def]) => def.id != null)
    .map(([name, def]) => [def.id, name])
);

// map object name → id
const idByItem = name => base_tiles[name]?.id;

const tabs = [
  { id: "inventory", label: "Inventory" },
  { id: "paint", label: "Paint" },
];
let activeTab = "inventory";
const TAB_HEIGHT = 14;
const TAB_PADDING = 10;

//this is for invCanvas
const CANVAS_WIDTH = 256;
const CANVAS_HEIGHT = 128;
const INV_COLS = 8;
const INV_ROWS = 4;
const SLOT_SIZE = (CANVAS_HEIGHT - TAB_HEIGHT) / INV_ROWS;

var activeInvItem = null;

const PALETTE_CELL_SIZE = 24;
const PALETTE_PADDING = 4;
const PALETTE_COLS = 6;
const PALETTE_START_X = 8;
const PALETTE_START_Y = TAB_HEIGHT + 8;

let activePaintColor = 0;

const keys = {
  ArrowLeft:  "left",
  ArrowRight: "right",
  ArrowUp:    "up",
  ArrowDown:  "down",
  w: "up",
  s: "down",
  a: "left",
  d: "right",
  W: "up",
  S: "down",
  A: "left",
  D: "right"

};

const keystate = {
  left: false,
  right: false,
  up: false,
  down: false,
  lastInput: Date.now()
};

const COLOR_PALETTE = {
  0:  { name: "Black",        hex: "#000000" },
  1:  { name: "White",        hex: "#ffffff" },
  2:  { name: "Red",          hex: "#810000" },
  3:  { name: "Green",        hex: "#008000" },
  4:  { name: "Blue",         hex: "#0000ff" },
  5:  { name: "Yellow",       hex: "#ffff00" },
  6:  { name: "Magenta",      hex: "#ff00ff" },
  7:  { name: "Cyan",         hex: "#00ffff" },
  8:  { name: "Brown",        hex: "#804000" },
  9:  { name: "Orange",       hex: "#ff8000" },
  10: { name: "Purple",       hex: "#8000ff" },
  11: { name: "Teal",         hex: "#008080" },
  12: { name: "Gray",         hex: "#808080" },
  13: { name: "Pink",         hex: "#ffb6c1" },
  14: { name: "Lime",         hex: "#7cff00" },
  15: { name: "Navy",         hex: "#000080" },
  16: { name: "Light Brown",  hex: "#b87333" },
  17: { name: "Light Gray",   hex: "#c0c0c0" },
  18: { name: "Sky Blue",     hex: "#87ceeb" },
  19: { name: "Coral",        hex: "#ff7f50" },
  20: { name: "Olive",        hex: "#808000" },
  21: { name: "Violet",       hex: "#ee82ee" },
  22: { name: "Turquoise",    hex: "#40e0d0" },
  23: { name: "Beige",        hex: "#f5f5dc" }
};

var showSettings = false;

/*
var craftItems = {
  "pickaxe": {"log":5},
  "stoneSword": {"log":1, "rock":2}
}

const craftableList = Object.keys(craftItems);
*/

const craftableList = Object.keys(base_tiles).filter(
  name => base_tiles[name]?.craft && Object.keys(base_tiles[name].craft).length > 0
);

console.log(craftableList);

// optional helper: get recipe for a given item
const getCraftRecipe = itemName => base_tiles[itemName]?.craft ?? {};

let activeCraftItem = null;

const CRAFT_X = 100;
const CRAFT_Y = 50;
const CRAFT_W = 400;
const CRAFT_H = 200;

const ICON_SIZE = 16;
const ICON_PADDING = 8;

const CRAFT_COLS = Math.floor(
  CRAFT_W / (ICON_SIZE + ICON_PADDING)
);

const CRAFT_BTN_W = 64;
const CRAFT_BTN_H = 24;

const CRAFT_BTN_X = CRAFT_X + CRAFT_W - CRAFT_BTN_W - 8;
const CRAFT_BTN_Y = CRAFT_Y + CRAFT_H - CRAFT_BTN_H - 8;

var rain = true;
var crafting = false;

const settingsButtons = [
  { label: "music", x: 120, y: 80, width: 160, height: 40 },
  { label: "sfx", x: 120, y: 130, width: 160, height: 40 },
  { label: "rain", x: 120, y: 180, width: 160, height: 40 }
];

var mapDownload = [];

var music = "on";
var sfx = "on";
var select;

//page setup stuff here
function devModeActive(trueFalse){
  if (trueFalse){
    devMode=true;
  } else {
    devMode=false;
  }
  if (devMode) {
    console.log("got here");
    select = document.createElement('select');
    document.getElementById('side-column').appendChild(select);

    Object.keys(base_tiles).forEach(key => {
      const option = document.createElement("option");
      option.value = key;
      option.textContent = key;
      select.appendChild(option);
    });
  }
  if (!devMode && select) {
    select.remove();
    select = null; // optional but tidy
  }
}


function loadSounds() {
  const soundFiles = {
    rain: "audio/rain.mp3",
    hell: "audio/hell.mp3"
  };

  for (const [key, url] of Object.entries(soundFiles)) {
    const audio = new Audio(url);
    audio.preload = "auto";
    sounds[key] = audio;
  }
}

function playSound(name, loop = false) {
  if (!sounds[name]) return;
  const audio = sounds[name];
  audio.loop = loop;
  audio.currentTime = 0;
  audio.play().catch(e => console.warn("Sound play failed:", e));
}

function stopSound(name) {
  if (!sounds[name]) return;

  const audio = sounds[name];
  audio.pause();
  audio.currentTime = 0;
  audio.loop = false;
}

invCanvas.addEventListener("contextmenu", (e) => {
  e.preventDefault();
  handleInvCanvClick(e, 'right');
});
invCanvas.addEventListener("mousedown", e => {
  handleInvCanvClick(e, 'left');
});

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = input.value.trim();
    if (message) {
        socket.emit('chat message', message);
        input.value = '';
    }
});

input.addEventListener('input', () => {
  socket.emit('typing');
  isTyping=true;
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    isTyping = false;
    socket.emit('stopTyping');
  }, 1000);
});

document.addEventListener("keydown", onKeyDown);
document.addEventListener("keyup", onKeyUp);

window.addEventListener("keydown", e => {
  if (e.key.startsWith("Arrow")) {
    e.preventDefault();
  }
});

canvas.addEventListener("mousedown", (e) => {
  e.preventDefault();
  currentButton = e.button === 2 ? "right" : "left"; // 0 = left, 2 = right
  let canvCoords = coordsInCanvas(e);
  let mapCoords={wX:null, wY:null, sX:null, sY:null};
  if (painting){
    ispainting = true;
    mapCoords = coordsOnMap(canvCoords.x, canvCoords.y);
  }
  handleMainClick(
    canvCoords.x, canvCoords.y,
    mapCoords.wX, mapCoords.wY,
    mapCoords.sX, mapCoords.sY
  );
});

canvas.addEventListener("mousemove", (e) => {
  if (ispainting){
    let canvCoords = coordsInCanvas(e);
    let mapCoords = coordsOnMap(canvCoords.x, canvCoords.y);
    handleMainClick(
      canvCoords.x, canvCoords.y,
      mapCoords.wX, mapCoords.wY,
      mapCoords.sX, mapCoords.sY
    );
  }
});

canvas.addEventListener("mouseup", () => {
  if (painting){
    ispainting = false;
  }
});

canvas.addEventListener("contextmenu", (e) => e.preventDefault());

function onKeyDown(e) {
  if (document.activeElement === input) return;
  if (e.key === 'Shift'){
    handleShiftKey();
    return;
  }
  if (e.key === ' ') {
    const active = document.activeElement;
    if (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA') {
      return;
    }
    if (devMode){
      layTile();
    } else {
      socket.emit('player input', e.key);
    }
    crafting = false;
    return;
  }
  const key = keys[e.key];
  if (!key) return;
  emitInputSwitch=true;
  keystate[key] = true;
  keystate.lastInput = Date.now();
  crafting = false;//need universal to close any similar popups
}

function onKeyUp(e) {
  const key = keys[e.key];
  if (!key) return;
  emitInputSwitch=false;
  keystate[key] = false;
  emitInput();
}

function handleShiftKey(){
  if (crafting){
    craftItem();
    return;
  }
  socket.emit('action');
}

function emitInput() {
  socket.emit("player input", {
    left: keystate.left,
    right: keystate.right,
    up: keystate.up,
    down: keystate.down,
    time: keystate.lastInput
  });
}

function logout(){
  socket.disconnect();
  location.reload();
  return false;
}

function settings(){
  if (showSettings){
    showSettings = false;
  } else {
    showSettings = true;
  }
}

function toggleMusic(){
  if (music==="on"){
    music = "off";
    stopSound("hell");
  } else {
    music = "on";
    playSound("hell", true);
  }
}

function toggleRain(){
  if (rain){
    rain = false;
  } else {
    rain = true;
  }
}

function toggleSfx(){
  if (sfx==="on"){
    sfx = "off";
    stopSound("rain");
  } else {
    sfx = "on";
    playSound("rain", true);
  }
}

function handleInvCanvClick(e, leftRight){
  const rect = invCanvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  if (my <= TAB_HEIGHT) {
    invCtx.font = "14px sans-serif";

    let cursorX = 0;
    for (const tab of tabs) {
      const width = invCtx.measureText(tab.label).width + TAB_PADDING * 2;

      if (mx >= cursorX && mx <= cursorX + width) {//this part messy
        activeTab = tab.id;
        drawTabs();
        if (activeTab==="paint"){togglePaint()}
        if (activeTab==="inventory"){
          drawInventory();
          if (painting===true){togglePaint()}
        }
        return;
      }

      cursorX += width;
    }
    return;
  }
  handleActiveTabClick(mx, my, leftRight);
}

function handleActiveTabClick(x, y, leftRight){
  if (activeTab==='paint'){
    handlePaintClick(x, y);
  }
  if (activeTab==='inventory'){
    handleInvClick(x, y, leftRight);
  }
}

function handleInvClick(mx, my, leftRight) {
  if (my < TAB_HEIGHT) return null;

  const invY = my - TAB_HEIGHT;

  const col = Math.floor(mx / SLOT_SIZE);
  const row = Math.floor(invY / SLOT_SIZE);

  if (
    col < 0 || col >= INV_COLS ||
    row < 0 || row >= INV_ROWS
  ) {
    activeInvItem = null;
  } else {
    activeInvItem = row * INV_COLS + col; //0–31
  }
  if (leftRight==='left'){
    socket.emit('activeInvItem', activeInvItem);
  }
  if (leftRight==='right'){
    socket.emit('dropItem', activeInvItem);
  }
  drawInventory();
}

function handlePaintClick(mx, my) {
  let i = 0;

  for (const key in COLOR_PALETTE) {
    const col = i % PALETTE_COLS;
    const row = Math.floor(i / PALETTE_COLS);

    const x = PALETTE_START_X + col * (PALETTE_CELL_SIZE + PALETTE_PADDING);
    const y = PALETTE_START_Y + row * (PALETTE_CELL_SIZE + PALETTE_PADDING);

    if (
      mx >= x &&
      mx <= x + PALETTE_CELL_SIZE &&
      my >= y &&
      my <= y + PALETTE_CELL_SIZE
    ) {
      activePaintColor = Number(key);
      drawTabs();
      drawPaintPalette();//make a general draw tabs container fxn
      return;
    }
    i++;
  }
}

function coordsInCanvas(e) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  const mouseX = (e.clientX - rect.left) * scaleX;
  const mouseY = (e.clientY - rect.top) * scaleY;

  return {x:mouseX, y:mouseY};
}

function coordsOnMap(mouseX, mouseY){//first part gets tile on map.Map
  const tilesAcross = 20;
  const tilesDown = 10;

  const viewCenterX = Math.floor(tilesAcross / 2);
  const viewCenterY = Math.floor(tilesDown / 2);

  const tileOffsetX = Math.floor(mouseX / 32);
  const tileOffsetY = Math.floor(mouseY / 32);

  const topLeftTileX = playerData.x - viewCenterX;
  const topLeftTileY = playerData.y - viewCenterY;

  const worldTileX = topLeftTileX + tileOffsetX;
  const worldTileY = topLeftTileY + tileOffsetY;

  const pixelInTileX = mouseX % 32;
  const pixelInTileY = mouseY % 32;

  const subX = Math.floor(pixelInTileX / 8);
  const subY = Math.floor(pixelInTileY / 8);

  return {
    wX:worldTileX,
    wY:worldTileY,
    sX:subX,
    sY:subY
  }
}

//c canvas coord, m map coord, subX/Y sub coord in map coord
function handleMainClick(cX, cY, mX=null, mY=null, subX=null, subY=null){
  if (ispainting) {
    sendPaint(mX, mY, subX, subY, currentButton);
  }
  if (crafting){
    handleCraftMenuClick(cX, cY);
  }
  if (showSettings){
    handleSettingsClick(cX, cY);
  }
}

function isCraftButtonClicked(mx, my) {
  return (
    mx >= CRAFT_BTN_X &&
    mx <= CRAFT_BTN_X + CRAFT_BTN_W &&
    my >= CRAFT_BTN_Y &&
    my <= CRAFT_BTN_Y + CRAFT_BTN_H
  );
}

function handleCraftMenuClick(mx, my){
  if (isCraftButtonClicked(mx, my)){
    craftItem();
  }
  if (
    mx < CRAFT_X || mx > CRAFT_X + CRAFT_W ||
    my < CRAFT_Y || my > CRAFT_Y + CRAFT_H
  ) {
    return;
  }
  const lx = mx - CRAFT_X;
  const ly = my - CRAFT_Y;

  const cellW = ICON_SIZE + ICON_PADDING;
  const col = Math.floor(lx / cellW);
  const row = Math.floor(ly / cellW);

  const index = row * CRAFT_COLS + col;

  if (index < 0 || index >= craftableList.length) return;

  activeCraftItem = craftableList[index];
}

function handleSettingsClick(mouseX, mouseY) {
  if (!showSettings) return;

  settingsButtons.forEach(btn => {
    if (
      mouseX >= btn.x &&
      mouseX <= btn.x + btn.width &&
      mouseY >= btn.y &&
      mouseY <= btn.y + btn.height
    ) {
      // Button was clicked
      switch (btn.label) {
        case "music":
          toggleMusic();
          break;
        case "sfx":
          toggleSfx();
          break;
        case "rain":
          toggleRain();
          break;
      }
    }
  });
}

function layTile(){
  if (!devMode) return;
  console.log("laying tile");
  let selectedTile = select.value;
  socket.emit('layTile', selectedTile);
}

function saveMap(){
  if (!devMode) return;
  socket.emit('saveMap');//or can just wait for server to save
}

function toggleCrafting(){
  activeTab = "inventory";
  if (painting===true){
    togglePaint();
    drawInventory();
  }
  crafting = true;
}

function updateInventory(data){
  playerData.inventory = data;
  drawInventory();
}

function sendInvSelect(id){
  socket.emit('sendInvSelect', id);
}

function togglePaint(){
  if (activeTab==='paint'){
    painting=true;
    ctx.imageSmoothingEnabled = true;
    drawPaintPalette();
  } else {
    painting=false;
    ctx.imageSmoothingEnabled = false;
  }
}

function craftItem(){
  socket.emit('craftItem', activeCraftItem);
}

function sendPaint(x, y, subX, subY, leftRight){
  let data = {
    x: x,
    y: y,
    subX: subX,
    subY: subY,
    c: activePaintColor,
    btn: leftRight
  };
  socket.emit("paint", data);
}

socket.on('chat message', (data) => {
  const { user, message } = data;
  messages.innerHTML += `<div><strong>${user}:</strong> ${message}</div>`;
  messages.scrollTop = messages.scrollHeight;
});

socket.on('server message', (data) => {
  const { message } = data;
  messages.innerHTML += `<div><strong>${message}</strong></div>`;
});

socket.on('playerState', (data)=> {
  playerData.x=data.x;
  playerData.y=data.y;
  playerData.hand=data.hand;
  playerData.facing=data.facing;
});

socket.on('invData', (data) => {
  playerData.inventory = data;
  if (activeTab==="inventory"){
    drawInventory();
  }
});

socket.on('updateChunk', (data) => {
    latestView = data;
    chunkNeedsRender = true;
});

socket.on('updateInventory', (data) => {
  updateInventory(data);//item name||id, amt
  drawInventory();
});

socket.on('crafting', (data) => {
  toggleCrafting();
});

socket.on('mapDownload', (data) => {
  mapDownload.push(data);
});

function drawTabs() {
  invCtx.clearRect(0, 0, invCanvas.width, invCanvas.height);
  invCtx.setTransform(1, 0, 0, 1, 0, 0);

  invCtx.font = "12px sans-serif";
  invCtx.textBaseline = "middle";

  let x = 0;
  for (const tab of tabs) {
    const width = invCtx.measureText(tab.label).width + TAB_PADDING * 2;

    invCtx.fillStyle = tab.id === activeTab ? "#333" : "#111";
    invCtx.fillRect(x, 0, width, TAB_HEIGHT);

    invCtx.strokeStyle = "#555";
    invCtx.strokeRect(x, 0, width, TAB_HEIGHT);

    invCtx.fillStyle = "#fff";
    invCtx.fillText(tab.label, x + TAB_PADDING, TAB_HEIGHT / 2);

    x += width;
  }
}

function drawInventory() {
  invCtx.clearRect(0, TAB_HEIGHT, invCanvas.width, invCanvas.height);
  const slotSize = SLOT_SIZE;

  for (let row = 0; row < INV_ROWS; row++) {
    for (let col = 0; col < INV_COLS; col++) {
      const slotIndex = row * INV_COLS + col;
      const x = col * slotSize;
      const y = TAB_HEIGHT + row * slotSize;
      const item = playerData.inventory[slotIndex];
      invCtx.fillStyle = "#663d00ff";
      invCtx.fillRect(x, y, slotSize, slotSize);

      invCtx.strokeStyle = "#442900ff";
      invCtx.strokeRect(x, y, slotSize, slotSize);
      if (item) {
        //draw item
        drawItemInSlot(item, x, y, slotSize, slotIndex);
      }
      //highlight active slot
      if (slotIndex === activeInvItem) {
        invCtx.strokeStyle = "#ffff00";
        invCtx.lineWidth = 2;
        invCtx.strokeRect(x + 1, y + 1, slotSize - 2, slotSize - 2);
        invCtx.lineWidth = 1;
      }
    }
  }
}

function drawItemInSlot(item, x, y, size, slotIndex) {
  let name = base_tiles[itemById[item.id]];
  console.log(`x:${x}, y:${y}`);
  const pad = size * 0.15;
  const s = size - pad * 2;
  invCtx.drawImage(
    spriteSheet,
    name.x, name.y,
    16, 16,
    x + pad, y + pad,
    s, s
  );
  invCtx.font = "10px sans-serif";
  invCtx.fillStyle = "yellow";
  invCtx.fillText(`${playerData.inventory[slotIndex].amount}`, x + pad, y + pad);
}

function drawPaintPalette() {
  let i = 0;

  for (const key in COLOR_PALETTE) {
    const col = i % PALETTE_COLS;
    const row = Math.floor(i / PALETTE_COLS);

    const x = PALETTE_START_X + col * (PALETTE_CELL_SIZE + PALETTE_PADDING);
    const y = PALETTE_START_Y + row * (PALETTE_CELL_SIZE + PALETTE_PADDING);

    //draw color square
    invCtx.fillStyle = COLOR_PALETTE[key].hex;
    invCtx.fillRect(x, y, PALETTE_CELL_SIZE, PALETTE_CELL_SIZE);

    //highlight active color
    if (Number(key) === activePaintColor) {
      invCtx.strokeStyle = "#000000ff";
      invCtx.lineWidth = 2;
      invCtx.strokeRect(x - 1, y - 1, PALETTE_CELL_SIZE + 2, PALETTE_CELL_SIZE + 2);
    }

    i++;
  }
}

function drawVignette(ctx, w, h, strength = 0.8) {
  if (!rain) return;
  const innerRadius = Math.min(w, h) * (0.15 + strength * 0.15);
  const outerRadius = Math.min(w, h) * (0.5 + strength * 0.5);

  const g = ctx.createRadialGradient(
    w / 2, h / 2, innerRadius,
    w / 2, h / 2, outerRadius
  );

  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(1, "rgba(0,0,0,0.85)");

  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

function drawRain(x, y){
  if (!rain) return;
  for (i=0; i<canvas.width/32; i++){
    for (j=0; j<canvas.height/32; j++){
      if (Math.floor(Math.random()*20)>1) continue;
      ctx.drawImage(
        spriteSheet,
        base_tiles['rain'].x, base_tiles['rain'].y,
        16, 16,
        i*32, j*32,
        32, 32
      )
    }
  }
}

function drawBaseTile(chunk){
  ctx.drawImage(
    spriteSheet,
    //sx, sy, sw, sh,
    base_tiles[chunk.data['base-tile']].x, base_tiles[chunk.data['base-tile']].y,
    16, 16,
    //dx, dy, dw, dh
    j * 32, i * 32, 32, 32
  );
}

function drawFloor(chunk) {
    const floorObj = chunk.data?.floor;
    if (!floorObj) return;

    // Get the first key in the floor object
    const floorName = Object.keys(floorObj)[0];
    if (!floorName) return;

    const tileData = floorObj[floorName];
    if (!tileData) return;

    // Make sure the tile exists in base_tiles
    const tile = base_tiles[floorName];
    if (!tile) return;
    // Draw it
    ctx.drawImage(
        spriteSheet,
        tile.x, tile.y, 16, 16,      // source rect
        j * 32, i * 32, 32, 32       // destination rect
    );
}

function drawPixels(chunk){
  let subTile = chunk.data.pixels;
  for (let y in subTile) {
    for (let x in subTile[y]) {
      if (subTile[y][x] !== -1) {
        ctx.fillStyle = COLOR_PALETTE[subTile[y][x]].hex;
        ctx.fillRect(
          j * 32 + (x * 8),
          i * 32 + (y * 8),
          8,
          8
        );
      }
    }
  }
}

function drawObjects(chunk){
  for (obj in chunk.data.objects) {
    try {
      ctx.drawImage(
        spriteSheet,
        base_tiles[chunk.data.objects[obj].name].x, base_tiles[chunk.data.objects[obj].name].y,
        16, 16,
        j * 32, i * 32, 32, 32
      );
    } catch (err) {
      //haha!
    }
  }
}

function drawDepletedResources(chunk) {
  const depleted = chunk.data?.depletedResources;//how tf this even workin?
  if (!depleted) return;
  for (const obj in depleted) {
    const res = depleted[obj];
    const tile = base_tiles[res?.name];
    if (!tile) continue;

    ctx.drawImage(
      spriteSheet,
      tile.x, tile.y,
      16, 16,
      j * 32, i * 32, 32, 32
    );
  }
}

function drawPlayers(chunk){
  if (Object.keys(chunk.players).length > 0) {
    let players = chunk.players;
    for (p in chunk.players) {
      let spriteName = chunk.players[p].sprite;//needs to include worn items, glow, etc
      //p being name, ...players[p].sprite (draw that lol)
      let equipToDraw = [];
      try {
        ctx.drawImage(
          spriteSheet,
          base_tiles[spriteName].x, base_tiles[spriteName].y,
          16, 16,
          j * 32, i * 32, 32, 32
        );
        //draw any equipped items
        if (players[p].hand !== null) {
          let handSprite = getEquipSprite(players[p].hand, players[p].facing);
          equipToDraw.push(handSprite);
        }//load all equip slots, and any other glows etc, then loop/draw all
        for (e in equipToDraw) {
          ctx.drawImage(
            spriteSheet,
            base_tiles[equipToDraw[e]].x, base_tiles[equipToDraw[e]].y,
            16, 16,
            j * 32, i * 32, 32, 32
          );
        }
      } catch (err) {
        //haha!
      }
    }
  }
}

function drawChatBubbles(chunk){
  if (chunk.data.typing === true) {
    //draw chat bubbles
    ctx.drawImage(
      spriteSheet,
      base_tiles['chatDots'].x, base_tiles['chatDots'].y,
      16, 16,
      (j * 32) + 8, (i * 32) - 8, 16, 16
    );
  }
}

function drawRoofs(chunk){
  const roofs = chunk.data?.roof;
  if (!roofs) return;
  if (Object.keys(latestView[5][10].data.roof).length>0) return;
  for (const obj in roofs) {
    const res = roofs[obj];
    const tile = base_tiles[res?.name];
    if (!tile) continue;

    ctx.drawImage(
      spriteSheet,
      tile.x, tile.y,
      16, 16,
      j * 32, i * 32, 32, 32
    );
  }
}

function getEquipSprite(item, facing){
  return itemById[item] + facing[0].toUpperCase();
}

function drawCrafting(){
  if (!crafting) return;
  ctx.fillStyle = "#ffae4485"
  ctx.fillRect(100, 50, 400, 200);
  craftableList.forEach((item, i) => {
    const col = i % CRAFT_COLS;
    const row = Math.floor(i / CRAFT_COLS);

    const x = CRAFT_X + col * (ICON_SIZE + ICON_PADDING);
    const y = CRAFT_Y + row * (ICON_SIZE + ICON_PADDING);

    ctx.drawImage(
      spriteSheet,
      base_tiles[item].x, base_tiles[item].y,
      16, 16,
      x, y,
      16, 16
    );

    if (item === activeCraftItem) {
      ctx.strokeStyle = "#ffff00";
      ctx.lineWidth = 1;
      ctx.strokeRect(x - 1, y - 1, ICON_SIZE + 2, ICON_SIZE + 2);
    }
  });
  //DRAFT CRAFT BUTTON
  ctx.fillStyle = "#6d3500ff";
  ctx.fillRect(CRAFT_BTN_X, CRAFT_BTN_Y, CRAFT_BTN_W, CRAFT_BTN_H);
  ctx.strokeStyle = "#000";
  ctx.strokeRect(CRAFT_BTN_X, CRAFT_BTN_Y, CRAFT_BTN_W, CRAFT_BTN_H);
  ctx.fillStyle = "#fff";
  ctx.font = "14px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(
    "Craft Item",
    CRAFT_BTN_X + CRAFT_BTN_W / 2,
    CRAFT_BTN_Y + CRAFT_BTN_H / 2
  );
}

function drawSettings() {
  if (!showSettings) return;

  // menu background
  ctx.fillStyle = "#ffae4485";
  ctx.fillRect(100, 50, 400, 200);

  // draw buttons
  ctx.font = "18px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  settingsButtons.forEach(btn => {
    // button background
    ctx.fillStyle = "#444";
    ctx.fillRect(btn.x, btn.y, btn.width, btn.height);

    // button label
    ctx.fillStyle = "#fff";
    ctx.fillText(btn.label + ` ${eval(btn.label)}`, btn.x + btn.width / 2, btn.y + btn.height / 2);
  });
}

//draw everything here
function updateView(data){
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (i in data){
    for (j in data[i]){
      if (data[i][j]===null || data[i][j]===undefined){
        continue;
      }
      let chunk = data[i][j];
      drawBaseTile(chunk);
      drawFloor(chunk);
      drawDepletedResources(chunk);
      drawPixels(chunk);
      drawObjects(chunk);
      drawPlayers(chunk);
      drawRoofs(chunk);
      drawChatBubbles(chunk);
    }
  }
  drawRain();
  drawVignette(ctx, canvas.width, canvas.height);
}

function updateDraw(now) {
  if (now - lastRender > interval) {
    chunkNeedsRender = false;
    lastRender = now;
    updateView(latestView);
    drawCrafting();
    drawSettings();
  }
  requestAnimationFrame(updateDraw);
}

loadSounds();//have to do this at page start I guess?
playSound("rain", true);
playSound("hell", true);
drawTabs();
requestAnimationFrame(updateDraw);

setInterval(()=>{
  if (emitInputSwitch){
    emitInput();
  }
}, 100);