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
  hand: null,
  head: null,
  hp: null
};

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
  { id: "stats", label: "Stats" }
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

const craftableList = Object.keys(base_tiles).filter(
  name => base_tiles[name]?.craft && Object.keys(base_tiles[name].craft).length > 0
);

//console.log(craftableList);

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

var clear;

//page setup stuff here
function devModeActive(){
  if (!devMode){
    devMode=true;
  } else {
    devMode=false;
  }
  if (devMode) {
    select = document.createElement('select');
    document.getElementById('side-column').appendChild(select);

    Object.keys(base_tiles).forEach(key => {
      const option = document.createElement("option");
      option.value = key;
      option.textContent = key;
      select.appendChild(option);
    });

    clear = document.createElement('button');
    document.getElementById('side-column').appendChild(clear);
    clear.textContent = "clear tile";
    clear.onclick = () => {socket.emit('clearTile')};
  }
  if (!devMode && select) {
    select.remove();
    select = null; // optional but tidy
    clear.remove();
    clear = null;
  }
}


function loadSounds() {
  const soundFiles = {
    rain: "audio/rain.mp3",
    hell: "audio/hell.mp3",
    hit: "audio/hit.mp3",
    stepR: "audio/stepR.mp3",
    stepL: "audio/stepL.mp3",
    damage: "audio/damage.wav",
    chop: "audio/chop.mp3",
    pickaxe: "audio/pickaxe.wav",
    miss: "audio/miss.mp3"
  };

  for (const [key, url] of Object.entries(soundFiles)) {
    const audio = new Audio(url);
    audio.preload = "auto";
    sounds[key] = audio;
  }
}

/*
function playSound(name, loop = false) {
  if (!sounds[name]) return;
  const audio = sounds[name];
  audio.loop = loop;
  audio.currentTime = 0;
  audio.play().catch(e => console.warn("Sound play failed:", e));
}
*/

//sounds.rain.volume = 0.2;   // muffle rain
//sounds.music.volume = 0.6; // lower music
function playSound(name, loop = false, volume = 1) {
  const audio = sounds[name];
  if (!audio) return;

  audio.loop = loop;
  audio.volume = volume;
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

let lastUnderRoof = false;
function updateRainAudio() {
  if (!latestView) return;
  const tile = latestView[5]?.[10];
  const roof = tile?.data?.roof;
  const underRoof = roof && Object.keys(roof).length > 0;

  // only react when the state changes
  if (underRoof === lastUnderRoof) return;
  lastUnderRoof = underRoof;

  const rain = sounds.rain;
  if (!rain) return;

  // fade down indoors, fade back up outdoors
  fadeVolume(rain, underRoof ? 0.5 : 0.9, 0.01);
}

function fadeVolume(audio, target, speed = 0.01) {
  if (!audio) return;

  const interval = setInterval(() => {
    if (Math.abs(audio.volume - target) < speed) {
      audio.volume = target;
      clearInterval(interval);
    } else {
      audio.volume += audio.volume < target ? speed : -speed;
    }
  }, 16); // ~60fps
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

/*
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
*/
let mouseX = 0;
let mouseY = 0;

canvas.addEventListener("mousemove", (e) => {
  const canvCoords = coordsInCanvas(e);

  // ALWAYS track mouse for hover
  mouseX = canvCoords.x;
  mouseY = canvCoords.y;

  // ONLY do painting logic when painting
  if (!ispainting) return;

  const mapCoords = coordsOnMap(canvCoords.x, canvCoords.y);
  handleMainClick(
    canvCoords.x, canvCoords.y,
    mapCoords.wX, mapCoords.wY,
    mapCoords.sX, mapCoords.sY
  );
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
  showLeaderboard=false;
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
        if (activeTab==="stats"){
          drawStats();
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
  playerData.head=data.head;
  playerData.body=data.body;
  playerData.facing=data.facing;
  playerData.hp=data.hp;
  playerData.hpLvl=data.hpLvl;
  playerData.hpXpTotal=data.hpXpTotal;
  playerData.swordLvl=data.swordLvl;
  playerData.swordXpTotal=data.swordXpTotal;
  playerData.craftLvl=data.craftLvl;
  playerData.craftXpTotal=data.craftXpTotal;
  playerData.woodcuttingLvl=data.woodcuttingLvl;
  playerData.woodcuttingXpTotal=data.woodcuttingXpTotal;
  playerData.miningLvl=data.miningLvl;
  playerData.miningXpTotal=data.miningXpTotal;
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

socket.on('playSound', (data) => {
  if (sfx==="off") return;
  playSound(data);
});

socket.on('readSign', (data) => {
  messages.innerHTML += `<div style="color: brown;">\n<strong>${data}\n</div>`;
  messages.scrollTop = messages.scrollHeight;
})

var leaderboardData = null;
socket.on('leaderboardData', (data) => {
  leaderboardData = data;
  showLeaderboard=true;
  drawLeaderboard();
});

var bankData;
socket.on('openBank', (data) => {
  bankData = data;
  bankOpen = true;
  openBank();
});

let channelStartTime = 0;
let channelDuration = 0;
let isChanneling = false;

socket.on('channelStart', ({ duration, startTime }) => {
  channelStartTime = startTime;
  channelDuration = duration;
  isChanneling = true;
});

socket.on('channelEnd', () => {
  isChanneling = false;
});

socket.on('channelCancel', () => {
  isChanneling = false;
});

socket.on('pk message', (data) => {
  const { message } = data;
  messages.innerHTML += `<div><strong style="color: red;">${message}</strong></div>`;
})
const bankContainer = document.getElementById("bankContainer");
const bankGrid = document.getElementById("bankGrid");
const amountInput = document.getElementById("bankAmount");

let selectedBankItemId = null;

// Open bank (server calls this)
function openBank() {
  bankContainer.style.display = "block";
  renderBank();
}

// Close bank
function closeBank() {
  bankContainer.style.display = "none";
  selectedBankItemId = null;
}

document.getElementById("bankClose").onclick = closeBank;

// Render bank grid from global bankData
function renderBank() {
  bankGrid.innerHTML = "";

  for (const key in bankData) {
    const item = bankData[key]; // {id, amt}
    const slot = document.createElement("div");
    slot.style.border = "1px solid #666";
    slot.style.display = "flex";
    slot.style.flexDirection = "column";
    slot.style.alignItems = "center";
    slot.style.justifyContent = "center";
    slot.style.cursor = "pointer";
    slot.style.width = "32px"; // slot size
    slot.style.height = "32px";

    if (item.id === selectedBankItemId) slot.style.borderColor = "yellow";

    // Get item name from id
    const itemName = itemById[item.id];
    const tileDef = base_tiles[itemName];

    if (tileDef) {
      // Create an img element for the sprite
      const img = document.createElement("img");
      img.src = tileDef.src || "spritesheet-0.5.18.png"; // your spritesheet
      img.style.width = "16px";
      img.style.height = "16px";

      // If using a single spritesheet, use CSS to show the correct portion
      if (tileDef.x != null && tileDef.y != null) {
        img.style.objectFit = "none";
        img.style.objectPosition = `-${tileDef.x}px -${tileDef.y}px`;
      }

      slot.appendChild(img);
    }

    // Show amount below icon
    const amtLabel = document.createElement("div");
    amtLabel.textContent = item.amt;
    amtLabel.style.fontSize = "10px";
    amtLabel.style.color = "white";
    slot.appendChild(amtLabel);

    slot.onclick = () => {
      selectedBankItemId = item.id;
      renderBank();
    };

    bankGrid.appendChild(slot);
  }
}

// Withdraw button — emits to server
document.getElementById("withdrawBtn").onclick = () => {
  if (!selectedBankItemId) return;
  const amt = parseInt(amountInput.value) || 1;
  socket.emit("bankWithdraw", { id: selectedBankItemId, amt: amt});
};

// Deposit button — emits to server using activeInvItem from inventory
document.getElementById("depositBtn").onclick = () => {
  if (!activeInvItem) return;
  const amt = parseInt(amountInput.value) || 1;
  socket.emit("bankDeposit", { id: playerData.inventory[activeInvItem].id, amt: amt });
};

function levelFromXp(xp) {
  return Math.floor(Math.sqrt(xp / 10)) + 1;
}

let showLeaderboard = false;
function drawLeaderboard() {
  if (!leaderboardData || leaderboardData.length === 0) return;
  if (!showLeaderboard) return;

  const width = 450;
  const height = 250;
  const x = canvas.width / 2 - width / 2;
  const y = canvas.height / 2 - height / 2;

  // --- background ---
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(x, y, width, height);

  // --- title ---
  ctx.fillStyle = 'yellow';        // change to yellow
  ctx.font = '18px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Leaderboard', x + width / 2, y + 28); // move up 2px

  // --- draw list ---
  ctx.font = '14px Arial';
  ctx.textAlign = 'left';
  const startY = y + 60;
  const lineHeight = 26;

  // column positions
  const colSkill = x + 20;
  const colName = x + 160;
  const colLevel = x + 300;
  const colXp = x + 360;

  ctx.fillStyle = '#fff';
  leaderboardData.forEach((entry, i) => {
    const level = levelFromXp(entry.xp);
    ctx.fillText(entry.skill, colSkill, startY + i * lineHeight);
    ctx.fillText(entry.player_name, colName, startY + i * lineHeight);
    ctx.fillText(`Lvl ${level}`, colLevel, startY + i * lineHeight);
    ctx.fillText(entry.xp.toLocaleString(), colXp, startY + i * lineHeight);
  });

  // --- border ---
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, width, height);
}

function drawChannelBar() {
  if (!isChanneling) return;

  const now = Date.now();
  const elapsed = now - channelStartTime;
  const progress = Math.min(elapsed / channelDuration, 1);

  const barWidth = 200;
  const barHeight = 16;
  const x = canvas.width / 2 - barWidth / 2;
  const y = canvas.height - 60;

  // background
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(x, y, barWidth, barHeight);

  // fill
  ctx.fillStyle = '#00ff88';
  ctx.fillRect(x, y, barWidth * progress, barHeight);

  // border
  ctx.strokeStyle = '#fff';
  ctx.strokeRect(x, y, barWidth, barHeight);
}

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

const statsConfig = [
  { key: "swordLvl", name: "Swordsmanship", sx: base_tiles['ironsword'].x, sy: base_tiles['ironsword'].y },       // icon at (0,0) in spritesheet
  { key: "hpLvl", name: "HP", sx: base_tiles['heart'].x, sy: base_tiles['heart'].y }, // icon at (16,0)
  { key: "craftLvl", name: "Crafting", sx: base_tiles['craftTools'].x, sy: base_tiles['craftTools'].y },
  { key: "woodcuttingLvl", name: "Woodcutting", sx: base_tiles['axe'].x, sy: base_tiles['axe'].y },
  { key: "miningLvl", name: "HP", sx: base_tiles['pickaxe'].x, sy: base_tiles['pickaxe'].y }
  // Add more stats here as needed
];

function drawStats() {
  if (!playerData) return;

  const iconSize = 16;
  const padding = 4;
  const rowHeight = iconSize + 6;

  let y = 14; // top of stats panel

  for (const stat of statsConfig) {
    if (!stat || !stat.key) continue;
    if (!(stat.key in playerData)) continue;

    const level = playerData[stat.key];

    // icon (panel-relative)
    invCtx.drawImage(
      spriteSheet,
      stat.sx, stat.sy, iconSize, iconSize,
      0, y, iconSize, iconSize
    );

    // text
    invCtx.fillStyle = "black";
    invCtx.font = "12px Arial";
    invCtx.textBaseline = "middle";
    invCtx.fillText(
      level,
      iconSize + padding,
      y + iconSize / 2
    );

    y += rowHeight;
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

function drawRain() {
  if (!rain) return;
  if (!latestView) return;
  // player tile is fixed in the view
  const playerTile = latestView[5]?.[10];
  const playerRoof = playerTile?.data?.roof;
  const playerUnderRoof =
    playerRoof && Object.keys(playerRoof).length > 0;

  for (let i = 0; i < latestView.length; i++) {
    for (let j = 0; j < latestView[i].length; j++) {

      const tile = latestView[i][j];
      const roof = tile?.data?.roof;
      const hasRoof = roof && Object.keys(roof).length > 0;

      // if player is indoors, don't draw rain on roofed tiles
      if (playerUnderRoof && hasRoof) {
        continue;
      }
      if (Math.floor(Math.random() * 20) > 1) continue;

      ctx.drawImage(
        spriteSheet,
        base_tiles.rain.x, base_tiles.rain.y,
        16, 16,
        j * 32, i * 32,
        32, 32
      );
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
        if (players[p].murderSprite!==null){
          equipToDraw.push(
            players[p].murderSprite
          );
        }
        //draw any equipped items
        if (players[p].hand !== null) {
          let handSprite = getEquipSprite(players[p].hand, players[p].facing);
          equipToDraw.push(handSprite);
        }//load all equip slots, and any other glows etc, then loop/draw all
        if (players[p].head !== null) {
          let headSprite = getEquipSprite(players[p].head, players[p].facing);
          equipToDraw.push(headSprite);
        }//load all equip slots, and any other glows etc, then loop/draw all
        if (players[p].body !== null){
          let bodySprite = getEquipSprite(players[p].body, players[p].facing);
          equipToDraw.push(bodySprite);
        }
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

function drawMobs(chunk){
  if (!chunk.mob) return;//server end, create or delete .mob as needed, only has name (ratL, etc)
  ctx.drawImage(
    spriteSheet,
    base_tiles[chunk.mob.sprite].x, base_tiles[chunk.mob.sprite].y,
    16, 16,
    j*32, i*32, 32, 32
  )
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

  if (roofs===undefined || roofs===null) return;
  const roof = latestView[5][10].data?.roof;

  if (roof && Object.keys(roof).length > 0) {
    return;
  }
  
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
  if (ispainting || !crafting) return;
  if (!crafting) return;
  ctx.fillStyle = "#ffae4485"
  ctx.fillRect(100, 50, 400, 200);
let hoveredCraftItem = null;

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

  // hover check
  if (
    mouseX >= x &&
    mouseX <= x + ICON_SIZE &&
    mouseY >= y &&
    mouseY <= y + ICON_SIZE
  ) {
    hoveredCraftItem = item;
  }

  if (item === activeCraftItem) {
    ctx.strokeStyle = "#ffff00";
    ctx.lineWidth = 1;
    ctx.strokeRect(x - 1, y - 1, ICON_SIZE + 2, ICON_SIZE + 2);
  }
});
if (hoveredCraftItem) {
  drawCraftTooltip(hoveredCraftItem, mouseX + 12, mouseY + 12);
}
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

function drawCraftTooltip(itemName, x, y) {
  const recipe = base_tiles[itemName]?.craft;
  if (!recipe) return;

  const padding = 6;
  const iconSize = 16;
  const lineHeight = 18;

  ctx.font = "12px sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";

  const ingredients = Object.entries(recipe);

  const width = 140;
  const height =
    padding * 2 +
    lineHeight + // title
    ingredients.length * lineHeight;

  // background
  ctx.fillStyle = "#424242dd";
  ctx.fillRect(x, y, width, height);
  ctx.strokeStyle = "#888";
  ctx.strokeRect(x, y, width, height);

  // title
  ctx.fillStyle = "#fff";
  ctx.fillText(itemName, x + padding, y + padding + lineHeight / 2);

ingredients.forEach(([matName, required], i) => {
  const rowY =
    y + padding + lineHeight + i * lineHeight + lineHeight / 2;

  const tile = base_tiles[matName];
  if (tile) {
    ctx.drawImage(
      spriteSheet,
      tile.x, tile.y,
      16, 16,
      x + padding,
      rowY - iconSize / 2,
      iconSize, iconSize
    );
  }

  const owned = getInventoryAmountByName(matName);

ctx.fillStyle = owned < required ? "#ff4444" : "#09ff00";
ctx.fillText(
  `x${required}`,
  x + padding + iconSize + 6,
  rowY
);
});
}

function getInventoryAmountByName(itemName) {
  const id = idByItem(itemName);
  if (!id) return 0;

  const entry = playerData.inventory.find(i => i.id === id);
  return entry ? entry.amount : 0;
}

var bankOpen=false;

function drawBank(){
  if (!bankOpen) return;
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

function drawSafeTiles(chunk){
  const safe = chunk.data?.safeTile;
  if (!safe || Object.keys(safe).length===0) return;
  if (!devMode) return;
  ctx.drawImage(
    spriteSheet,
    base_tiles['safeTile'].x, base_tiles['safeTile'].y,
    16, 16,
    j * 32, i * 32, 32, 32
  );
}

function drawHUD(){
  //right now just hp in bottom left of screen
  const hpPosX = 5;
  const hpPosY = canvas.height-20;
  ctx.strokeStyle = "black";
  ctx.strokeRect(hpPosX, hpPosY, 100, 10);
  ctx.fillStyle = "red";
// determine the visual width of the full bar
  const barWidth = 100; // keeps the same size on screen

  // calculate max HP based on level
  const maxHp = 100 + playerData.hpLvl * 2;

  // scale current HP relative to max
  const fillWidth = (playerData.hp / maxHp) * barWidth;

  // clamp to prevent negative or overflowing bars
  const safeWidth = Math.max(0, Math.min(barWidth, fillWidth));

  // draw the HP bar
  ctx.fillRect(hpPosX + 1, hpPosY + 1, safeWidth, 8);
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
      drawMobs(chunk);
      drawPlayers(chunk);
      drawRoofs(chunk);
      drawSafeTiles(chunk);
      drawChatBubbles(chunk);
    }
  }
  drawRain();
  drawVignette(ctx, canvas.width, canvas.height);
  drawHUD();
}

function updateDraw(now) {
  if (now - lastRender > interval) {
    chunkNeedsRender = false;
    lastRender = now;
    updateView(latestView);
    updateRainAudio();
    drawCrafting();
    drawSettings();
    drawLeaderboard();
    drawChannelBar();//teleport wait
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