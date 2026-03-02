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

messages.addEventListener("click", (e) => {
  // only handle clicks on elements with .chat-link
  const el = e.target.closest(".chat-link");
  if (!el) return;

  const { action, username } = el.dataset;

  switch (action) {
    case "acceptTrade":
      // clicking "Accept" on incoming trade
      console.log("accepted trade");
      socket.emit("acceptTrade", username);
      break;

    case "declineTrade":
      console.log("declined trade");
      // clicking "Decline" on incoming trade
      socket.emit("declineTrade", username);
      break;
  }
});

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
  z: null,
  facing: null,
  name: null,//get from login? don't use this  yet
  inventory: {},//[{id:1, amt:1}, {id:5, amt:16}
  hand: null,
  head: null,
  feet: null,
  quiver: null,
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
  { label: "music", x: 120, y: 70, width: 160, height: 25 },
  { label: "sfx", x: 120, y: 110, width: 160, height: 25 },
  { label: "rain", x: 120, y: 150, width: 160, height: 25 },
  { label: "tool_tips", x: 120, y: 190, width: 160, height: 25 }
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
  for(s in name){
    const audio = sounds[name[s]];
    if (!audio) continue;
    audio.loop = loop;
    audio.volume = volume;
    audio.currentTime = 0;
    audio.play().catch(e => console.warn("Sound play failed:", e));
  }
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
  const roof = tile?.roof;
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
invCanvas.addEventListener("mousemove", e => {
  handleInvCanvClick(e, null);
})
invCanvas.addEventListener("mouseout", e => {
  hoverInvItem = null;
  const tooltip = document.getElementById('inv-tooltip');
  if (tooltip) tooltip.style.display = 'none';
  const statTip = document.getElementById('stat-tooltip');
  if (statTip) statTip.style.display = 'none';
  //drawInventory();
})

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = input.value.trim();
    if (message) {
        socket.emit('chat message', message);
        input.value = '';
    }
    input.blur();
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

let isBuilding = false;
canvas.addEventListener("mousedown", (e) => {
  if (devMode){
    isBuilding=true;
  }
  e.preventDefault();
  currentButton = e.button === 2 ? "right" : "left"; // 0 = left, 2 = right
  let canvCoords = coordsInCanvas(e);
  let mapCoords={wX:null, wY:null, sX:null, sY:null};
  if (painting){
    ispainting = true;
  }
  mapCoords = coordsOnMap(canvCoords.x, canvCoords.y);
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
  if (!ispainting && !devMode) return;
  if (devMode && !isBuilding) return;

  const mapCoords = coordsOnMap(canvCoords.x, canvCoords.y);
  handleMainClick(
    canvCoords.x, canvCoords.y,
    mapCoords.wX, mapCoords.wY,
    mapCoords.sX, mapCoords.sY
  );
});

canvas.addEventListener("mouseup", () => {
  if (devMode){
    isBuilding=false;
  }
  if (painting){
    ispainting = false;
  }
});

canvas.addEventListener("contextmenu", (e) => e.preventDefault());

function closePopups(){
  crafting = false;
  showLeaderboard = false;
  if (bankOpen){
    closeBank();
  }
  if (isTrading){
    socket.emit("tradeCancel");
  }
}

function onKeyDown(e) {
  if (document.activeElement === input) return;
  if (e.key==="Enter"){
    setTimeout(() => {
      input.focus();
    }, 0);
    return;
  }

  if (e.key === 'Shift') {
    handleShiftKey();
    return;
  }

  if (e.key === ' ') {
    const active = document.activeElement;
    if (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA') return;
    socket.emit('player input', ' '); // keep your existing socket
    closePopups();
    return;
  }

  const key = keys[e.key];
  if (!key || keystate[key]) return; // only emit if not already pressed

  keystate[key] = true;
  socket.emit('player input', { key, state: true }); // one emit per keydown
  //crafting = false;
  //showLeaderboard = false;
  closePopups();
}

function onKeyUp(e) {
  const key = keys[e.key];
  if (!key || !keystate[key]) return; // only emit if it was pressed

  keystate[key] = false;
  socket.emit('player input', { key, state: false }); // one emit per keyup
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
    playSound(["hell"], true);
  }
}

function toggleRain(){
  if (rain===true){
    rain = false;
  } else {
    rain = true;
  }
}

let tool_tips = true;
function toggleInvNames(){
  if (tool_tips===true){
    tool_tips = false;
  } else {
    tool_tips = true;
  }
}

function toggleSfx(){
  if (sfx==="on"){
    sfx = "off";
    stopSound("rain");
  } else {
    sfx = "on";
    playSound(["rain"], true);
  }
}

function handleInvCanvClick(e, leftRight){
  const rect = invCanvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;
  if (leftRight!==null){
    if (my <= TAB_HEIGHT) {
      invCtx.font = "14px sans-serif";

      let cursorX = 0;
      for (const tab of tabs) {
        const width = invCtx.measureText(tab.label).width + TAB_PADDING * 2;

        if (mx >= cursorX && mx <= cursorX + width) {//this part messy
          activeTab = tab.id;
          drawTabs();
          if (activeTab === "paint") { togglePaint() }
          if (activeTab === "inventory") {
            drawInventory();
            if (painting === true) { togglePaint() }
          }
          if (activeTab === "stats") {
            drawStats();
            if (painting === true) { togglePaint() }
          }
          return;
        }

        cursorX += width;
      }
      return;
    }
  }

  handleActiveTabClick(mx, my, leftRight);
}

function handleActiveTabClick(x, y, leftRight){
  if (activeTab==='paint' && leftRight !== null){
    handlePaintClick(x, y);
    return;
  }
  if (activeTab==='inventory'){
    handleInvClick(x, y, leftRight);
    return;
  }
  if (activeTab==='stats'){
    handleInvClick(x, y, leftRight);
    return;
  }
}

let hoverInvItem = null;
let hoverStat = null;

function handleInvClick(mx, my, leftRight) {
  if (my < TAB_HEIGHT) return null;

  const invY = my - TAB_HEIGHT;

  
    const col = Math.floor(mx / SLOT_SIZE);
    const row = Math.floor(invY / SLOT_SIZE);

    if (
      col < 0 || col >= INV_COLS ||
      row < 0 || row >= INV_ROWS
    ) {
      if (leftRight!==null){
        activeInvItem = null;
      }
      return;
    }
  if (leftRight!==null && activeTab==="inventory"){
    activeInvItem = row * INV_COLS + col; // 0–31

    // ⭐⭐⭐ IF TRADING → SEND TO TRADE ⭐⭐⭐
    if (isTrading) {
      if (leftRight === "left") {
        socket.emit("tradeOfferUpdate", {
          slot: activeInvItem,
          amount: 1
        });
      }
      return;
    }

    // normal behaviour
    if (leftRight === 'left') {
      socket.emit('activeInvItem', activeInvItem);
    }

    if (leftRight === 'right') {
      socket.emit('dropItem', activeInvItem);
    }
    drawInventory();
  } else {
    if (my < TAB_HEIGHT) return null;
    if (activeTab==='inventory'){
      hoverInvItem = row * INV_COLS + col;
      drawInventory(mx, my);
      return;
    }
    if (activeTab==='stats'){
      const iconSize = 16;
      const padding = 4;
      const columns = 4;

      const columnWidth = iconSize + padding + 24; // 44
      const rowHeight = iconSize + 6;              // 22
      const startY = 14;

      // Adjust mouse relative to stats grid
      const statsY = my - startY;

      if (statsY < 0) {
        hoverStat = null;
      } else {
        const col = Math.floor(mx / columnWidth);
        const row = Math.floor(statsY / rowHeight);

        if (col < 0 || col >= columns || row < 0) {
          hoverStat = null;
        } else {
          // Compute hoverStat as index like drawStats
          let index = 0;
          for (const stat of statsConfig) {
            if (!stat || !(stat.key in playerData)) continue;

            const statCol = index % columns;
            const statRow = Math.floor(index / columns);

            if (statCol === col && statRow === row) {
              hoverStat = index;
              break;
            }

            index++;
          }
          if (hoverStat === undefined){
            hoverStat = null;
          } else {
            drawStats(mx, my);
          }
        }
      }
    }
  }
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
  if (devMode){
    console.log(`${mX}, ${mY}`);
    if (currentButton==="left"){
      socket.emit('layTile', { tile: select.value, x:mX, y:mY });
    }
    if (currentButton==="right"){
      socket.emit('clearTile', { x:mX, y:mY });
    }
    return;
  }
  if (ispainting) {
    sendPaint(mX, mY, subX, subY, currentButton);
    return;
  }
  if (crafting){
    handleCraftMenuClick(cX, cY);
    return;
  }
  if (showSettings){
    handleSettingsClick(cX, cY);
    return;
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
        case "tool_tips":
          toggleInvNames();
          break;
      }
    }
  });
}

function layTile(){
  if (!devMode) return;
  console.log("laying tile");
  let selectedTile = select.value;
  socket.emit('layTile', { tile: selectedTile, x:null, y:null });
}

function saveMap(){
  if (!devMode) return;
  socket.emit('saveMap');//or can just wait for server to save
}

function toggleCrafting(){
  activeTab = "inventory";
  if (painting===true){
    togglePaint();
  }
  drawInventory();
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

function addTradeIncomingMessage(username) {
  const line = document.createElement("div");

  const accept = document.createElement("span");
  accept.textContent = "Accept";
  accept.className = "chat-link";
  accept.dataset.action = "acceptTrade";
  accept.dataset.username = username;

  const decline = document.createElement("span");
  decline.textContent = " Decline";
  decline.className = "chat-link";
  decline.dataset.action = "declineTrade";
  decline.dataset.username = username;
  const nameSpan = document.createElement("span");
  nameSpan.textContent = `${username} wants to trade — `;
  nameSpan.style.color = "purple";
  accept.style.color = "green";
  decline.style.color = "red";
  line.append(nameSpan, accept, " ", decline);
  messages.append(line);
  messages.scrollTop = messages.scrollHeight;
}

socket.on("chatEvent", (data) => {
  if (data.type === "tradeRequest") {
    addTradeIncomingMessage(data.from);
  }
});


socket.on('chat message', (data) => {
  const { user, message } = data;
  messages.innerHTML += `<div><strong>${user}:</strong> ${message}</div>`;
  messages.scrollTop = messages.scrollHeight;
});


socket.on('server message', (data) => {
  const { message } = data;
  messages.innerHTML += `<div><strong>${message}</strong></div>`;
  messages.scrollTop = messages.scrollHeight;
});

socket.on('playerState', (data)=> {
  playerData.x=data.x;
  playerData.y=data.y;
  playerData.z=data.z;
  playerData.hand=data.hand;
  playerData.head=data.head;
  playerData.body=data.body;
  playerData.feet=data.feet;
  playerData.quiver=data.quiver;
  playerData.facing=data.facing;
  playerData.hp=data.hp;
  playerData.hpLvl=data.hpLvl;
  playerData.hpXpTotal=data.hpXpTotal;
  playerData.swordLvl=data.swordLvl;
  playerData.swordXpTotal=data.swordXpTotal;
  playerData.fishingLvl=data.fishingLvl;
  playerData.fishingXpTotal=data.fishingXpTotal;
  playerData.archeryXpTotal=data.archeryXpTotal;
  playerData.archeryLvl=data.archeryLvl;
  playerData.craftLvl=data.craftLvl;
  playerData.craftXpTotal=data.craftXpTotal;
  playerData.woodcuttingLvl=data.woodcuttingLvl;
  playerData.woodcuttingXpTotal=data.woodcuttingXpTotal;
  playerData.miningLvl=data.miningLvl;
  playerData.miningXpTotal=data.miningXpTotal;
  playerData.mageXpTotal=data.mageXpTotal;
  playerData.mageLvl=data.mageLvl;
  playerData.mana=data.mana;
  playerData.activeInvItem=data.activeInvItem;
  playerData.obscured=data.obscured;
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
  messages.innerHTML += `<div style="color: brown;">\n<strong>${data.message}\n</div>`;
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
  messages.scrollTop = messages.scrollHeight;
});

let isTrading = false;
socket.on("tradeStarted", data => {
  isTrading=true;
  openTradeWindow(data.with);
  messages.innerHTML += `<div><strong style="color: green;">Trading with ${data.with}!</strong></div>`;
  messages.scrollTop = messages.scrollHeight;
});

socket.on("tradeStatus", data => {
  console.log(data.who, "accepted");
  messages.innerHTML += `<div><strong style="color: green;">${data.who} agreed to trade!</strong></div>`;
  messages.scrollTop = messages.scrollHeight;
});

socket.on("tradeComplete", () => {
  console.log("trade complete!");
  messages.innerHTML += `<div><strong style="color: green;">Trade successful!!</strong></div>`;
  isTrading=false;
  closeTradeWindow();
});

socket.on("tradeCanceled", () => {
  console.log("They aint wanna trade with you");
  messages.innerHTML += `<div><strong style="color: red;">Trade cancelled!</strong></div>`;
  closeTradeWindow();
});

socket.on('explosion', (data) => {
  spawnExplosion(data.x, data.y, data.color, data?.dist || 32);
})

function closeTradeWindow(){
  isTrading=false;
  document.getElementById("tradeWindow")?.remove();
  messages.innerHTML += `<div><strong style="color: black;">Trade ended!</strong></div>`;
  messages.scrollTop = messages.scrollHeight;
}

let myTradeOffer = null;
let theirTradeOffer = null;
let tradeAccepted = null;

socket.on("tradeSync", ({ myOffer, theirOffer, accepted }) => {
  tradeState.myOffer = myOffer;
  tradeState.theirOffer = theirOffer;
  tradeState.accepted = accepted;
  console.log(tradeState);
  renderTradeItems();
  messages.innerHTML += `<div><strong style="color: green;">Trade updated!</strong></div>`;
  messages.scrollTop = messages.scrollHeight;
});

function openTradeWindow(otherPlayer) {
  // Remove old trade window if it exists
  tradeState.myOffer = {};
  tradeState.theirOffer = {};
  const old = document.getElementById("tradeWindow");
  if (old) old.remove();
  tradeState.myOffer = {}
  tradeState.theirOffer = {};
  tradeState.accepted = false
  const trade = document.createElement("div");
  trade.id = "tradeWindow";
  trade.style.position = "fixed";
  trade.style.top = "50px";
  trade.style.left = "50%";
  trade.style.transform = "translateX(-50%)";
  trade.style.border = "2px solid #666";
  trade.style.padding = "10px";
  trade.style.background = "#222";
  trade.style.color = "#fff";
  trade.style.zIndex = 1000;

  const title = document.createElement("h3");
  title.textContent = `Trading with ${otherPlayer}`;

  // Containers for my and their items
  const myDiv = document.createElement("div");
  myDiv.id = "myTradeItems";
  myDiv.style.border = "1px solid #555";
  myDiv.style.padding = "5px";
  myDiv.style.marginBottom = "10px";

  const theirDiv = document.createElement("div");
  theirDiv.id = "theirTradeItems";
  theirDiv.style.border = "1px solid #555";
  theirDiv.style.padding = "5px";
  theirDiv.style.marginBottom = "10px";

  // Buttons
  const accept = document.createElement("button");
  accept.textContent = "Accept";
  accept.onclick = () => socket.emit("tradeAccept");

  const cancel = document.createElement("button");
  cancel.textContent = "Cancel";
  cancel.onclick = () => socket.emit("tradeCancel");

  trade.append(title, myDiv, theirDiv, accept, cancel);
  document.body.appendChild(trade);

  // Render the items
  renderTradeItems();
}

const tradeState = {
  myOffer: {},
  theirOffer: {},
  accepted: false
};
  
function renderTradeItems() {
  const myDiv = document.getElementById("myTradeItems");
  const theirDiv = document.getElementById("theirTradeItems");

  // --- My Offer ---
  for (const slot in tradeState.myOffer) {
    const item = tradeState.myOffer[slot];
    if (!item) continue;

    // ALWAYS ensure amount exists
    if (!("amount" in item) || item.amount == null) {
      item.amount = 1;
    }

    let container = document.getElementById("mySlot_" + slot);
    let numInput;

    if (!container) {
      container = document.createElement("div");
      container.id = "mySlot_" + slot;
      myDiv.appendChild(container);

      const label = document.createElement("span");
      label.id = "label_" + slot;
      container.appendChild(label);

      // Icon
      const iconCanvas = document.createElement("canvas");
      iconCanvas.width = 16;
      iconCanvas.height = 16;
      iconCanvas.id = "icon_" + slot;
      container.appendChild(iconCanvas);

      const ctx = iconCanvas.getContext("2d");
      const tile = base_tiles[itemById[item.id]];
      ctx.drawImage(spriteSheet, tile.x, tile.y, 16, 16, 0, 0, 16, 16);

      // Input
      numInput = document.createElement("input");
      numInput.type = "number";
      numInput.min = 1;
      numInput.max = item.initialAmount || 9999999999;
      numInput.value = item.amount;
      numInput.id = "input_" + slot;

      numInput.addEventListener("input", () => {
        let val = parseInt(numInput.value, 10);

        if (!Number.isFinite(val) || val < 1) val = 1;
        const max = item.initialAmount || 9999999999;
        if (val > max) val = max;

        // Update tradeState
        tradeState.myOffer[slot].amount = val;

        // Update input to sanitized value
        numInput.value = val;

        // Send to server
        socket.emit("tradeOfferUpdate", { slot, amount: val });
      });

      container.appendChild(numInput);
    } else {
      // Update input to always reflect tradeState
      numInput = document.getElementById("input_" + slot);
      if (numInput) {
        numInput.max = item.initialAmount || 9999999999;
        if (parseInt(numInput.value, 10) !== item.amount) {
          numInput.value = item.amount;
        }
      }

      // Update icon
      const iconCanvas = document.getElementById("icon_" + slot);
      if (iconCanvas) {
        const ctx = iconCanvas.getContext("2d");
        const tile = base_tiles[itemById[item.id]];
        ctx.clearRect(0, 0, 16, 16);
        ctx.drawImage(spriteSheet, tile.x, tile.y, 16, 16, 0, 0, 16, 16);
      }
    }

    //document.getElementById("label_" + slot).textContent = `${item.name || item.id} x`;
  }

  // --- Their Offer ---
  for (const slot in tradeState.theirOffer) {
    const item = tradeState.theirOffer[slot];
    if (!item) continue;

    if (!("amount" in item) || item.amount == null) {
      item.amount = 1;
    }

    let container = document.getElementById("theirSlot_" + slot);
    if (!container) {
      container = document.createElement("div");
      container.id = "theirSlot_" + slot;
      theirDiv.appendChild(container);

      const label = document.createElement("span");
      label.id = "theirLabel_" + slot;
      container.appendChild(label);

      const iconCanvas = document.createElement("canvas");
      iconCanvas.width = 16;
      iconCanvas.height = 16;
      iconCanvas.id = "theirIcon_" + slot;
      container.appendChild(iconCanvas);

      const ctx = iconCanvas.getContext("2d");
      const tile = base_tiles[itemById[item.id]];
      ctx.drawImage(spriteSheet, tile.x, tile.y, 16, 16, 0, 0, 16, 16);
    } else {
      const iconCanvas = document.getElementById("theirIcon_" + slot);
      if (iconCanvas) {
        const ctx = iconCanvas.getContext("2d");
        const tile = base_tiles[itemById[item.id]];
        ctx.clearRect(0, 0, 16, 16);
        ctx.drawImage(spriteSheet, tile.x, tile.y, 16, 16, 0, 0, 16, 16);
      }
    }

    document.getElementById("theirLabel_" + slot).textContent = `${item.amount}`;
  }
}

// SOCKET: make sure theirOffer updates correctly
socket.on("tradeOfferUpdate", (data) => {
  if (!tradeState.theirOffer[data.slot]) {
    tradeState.theirOffer[data.slot] = {};
  }
  tradeState.theirOffer[data.slot].amount = data.amount;
  tradeState.theirOffer[data.slot].name = data.name || tradeState.theirOffer[data.slot].name;
  renderTradeItems(); // now the other client updates correctly
});

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
  bankOpen = false;
  if (tooltipEl){
    tooltipEl.remove();
    tooltipEl = null;
  }
}

document.getElementById("bankClose").onclick = closeBank;

// Render bank grid from global bankData
function renderBank() {
  bankGrid.innerHTML = "";
  bankGrid.style.maxHeight = "300px";   // adjust to fit your popup
  bankGrid.style.overflowY = "auto";
  bankGrid.style.overflowX = "hidden";

  // Optional: keep grid layout clean
  bankGrid.style.display = "grid";
  bankGrid.style.gridTemplateColumns = "repeat(auto-fill, 32px)";
  bankGrid.style.gap = "4px";
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
      tooltipEl.remove();
      tooltipEl = null;
      renderBank();
    };
    if (tool_tips===true){
      attachSlotHover(slot, tileDef.prettyName ?? itemName);
    }
    bankGrid.appendChild(slot);
  }
}
let tooltipEl = null;
function attachSlotHover(slot, prettyName) {
  slot.onmouseenter = (e) => {
    // Create tooltip when hover starts
    tooltipEl = document.createElement('div');
    tooltipEl.textContent = prettyName;
    Object.assign(tooltipEl.style, {
      position: 'absolute',
      pointerEvents: 'none',
      background: 'gray',
      border: '1px solid black',
      padding: '2px 4px',
      fontSize: '12px',
      fontFamily: 'Arial',
      zIndex: '1000'
    });
    document.body.appendChild(tooltipEl);

    // Position tooltip initially
    tooltipEl.style.left = `${e.pageX + 8}px`;
    tooltipEl.style.top = `${e.pageY - 20}px`;
  };

  slot.onmousemove = (e) => {
    if (tooltipEl) {
      // Update position while moving
      tooltipEl.style.left = `${e.pageX + 8}px`;
      tooltipEl.style.top = `${e.pageY - 20}px`;
    }
  };

  slot.onmouseleave = () => {
    // Destroy tooltip when hover ends
    if (tooltipEl) {
      tooltipEl.remove();
      tooltipEl = null;
    }
  };
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

    invCtx.fillStyle = tab.id === activeTab ? "#696969" : "#3b3b3b";
    invCtx.fillRect(x, 0, width, TAB_HEIGHT);

    invCtx.strokeStyle = "#555";
    invCtx.strokeRect(x, 0, width, TAB_HEIGHT);

    invCtx.fillStyle = "#fff";
    invCtx.fillText(tab.label, x + TAB_PADDING, TAB_HEIGHT / 2);

    x += width;
  }
}

function drawInventory(mouseX, mouseY) {
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
  // optional: draw tooltip/item next to mouse
  if (mouseX !== undefined && mouseY !== undefined && playerData.inventory[hoverInvItem] && tool_tips === true) {

    const item = base_tiles[itemById[playerData.inventory[hoverInvItem].id]]?.prettyName ?? itemById[playerData.inventory[hoverInvItem].id];
    if (item) {
      const tooltip = document.getElementById('inv-tooltip') || (() => {
        const t = document.createElement('div');
        t.id = 'inv-tooltip';
        t.style.position = 'absolute';
        t.style.background = "#a0732fc2";
        t.style.border = '1px solid black';
        t.style.fontSize = '12px';
        t.style.padding = '2px 4px';
        t.style.pointerEvents = 'none';
        document.body.appendChild(t);
        return t;
      })();

      tooltip.style.display = 'block';
      tooltip.textContent = item;
      tooltip.style.left = (mouseX + invCanvas.offsetLeft + 10) + 'px';
      tooltip.style.top = (mouseY + invCanvas.offsetTop + 10) + 'px';
    } else {
      const tooltip = document.getElementById('inv-tooltip');
      if (tooltip) tooltip.style.display = 'none';
    }
  }
}

function drawItemInSlot(item, x, y, size, slotIndex) {
  // --- draw the item normally ---
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

  // --- draw the amount ---
  invCtx.font = "10px sans-serif";
  invCtx.fillStyle = "yellow";

  const amt = playerData.inventory[slotIndex].amount;
  invCtx.fillText(formatItemAmount(amt), x + pad, y + pad);

  // --- draw "e" if this item is equipped ---
  const equippedSlots = ["hand", "head", "body", "feet", "quiver"];
  const isEquipped = equippedSlots.some(slot => playerData[slot] === item.id);

  if (isEquipped) {
    invCtx.font = "12px sans-serif";
    invCtx.fillStyle = "lime";

    const eX = x + size - 8;       // 8px from the right edge
    const eY = y + size - 4;       // 4px above the bottom to avoid clipping

    invCtx.fillText("e", eX, eY);
  }
}

function formatItemAmount(n) {
  if (n < 10000) return String(n);
  if (n < 1_000_000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  if (n < 1_000_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "m";
  if (n < 1_000_000_000_000) return (n / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "b";
  return (n / 1_000_000_000_000).toFixed(1).replace(/\.0$/, "") + "t";
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
  { key: "swordLvl", name: "Swordsmanship", sx: base_tiles['ironsword'].x, sy: base_tiles['ironsword'].y, xpTotalKey: "swordXpTotal" },
  { key: "hpLvl", name: "HP", sx: base_tiles['heart'].x, sy: base_tiles['heart'].y, xpTotalKey: "hpXpTotal" },
  { key: "archeryLvl", name: "Archery", sx: base_tiles['arrow'].x, sy: base_tiles['arrow'].y, xpTotalKey: "archeryXpTotal" },
  { key: "mageLvl", name: "Mage", sx: base_tiles['magebook'].x, sy: base_tiles['magebook'].y, xpTotalKey: "mageXpTotal" },
  { key: "craftLvl", name: "Crafting", sx: base_tiles['craftTools'].x, sy: base_tiles['craftTools'].y, xpTotalKey: "craftXpTotal" },
  { key: "woodcuttingLvl", name: "Woodcutting", sx: base_tiles['axe'].x, sy: base_tiles['axe'].y, xpTotalKey: "woodcuttingXpTotal" },
  { key: "miningLvl", name: "Mining", sx: base_tiles['pickaxe'].x, sy: base_tiles['pickaxe'].y, xpTotalKey: "miningXpTotal" },
  { key: "fishingLvl", name: "Fishing", sx: base_tiles['fishingpole'].x, sy: base_tiles['fishingpole'].y, xpTotalKey: "fishingXpTotal" }
];

function drawStats(mx, my) {
  if (!playerData) return;
  invCtx.clearRect(0, TAB_HEIGHT, invCanvas.width, invCanvas.height);
  const iconSize = 16;
  const padding = 4;

  const columns = 4;
  const columnWidth = iconSize + padding + 24;
  const rowHeight = iconSize + 6;
  const startY = 14;

  let index = 0;

  for (const stat of statsConfig) {
    if (!stat || !stat.key) continue;
    if (!(stat.key in playerData)) continue;

    const level = playerData[stat.key];

    const col = index % columns;
    const row = Math.floor(index / columns);

    const x = col * columnWidth;
    const y = startY + row * rowHeight;

    // icon
    invCtx.drawImage(
      spriteSheet,
      stat.sx, stat.sy, iconSize, iconSize,
      x, y, iconSize, iconSize
    );

    // level text
    invCtx.fillStyle = "black";
    invCtx.font = "12px Arial";
    invCtx.textBaseline = "middle";
    invCtx.fillText(
      level,
      x + iconSize + padding,
      y + iconSize / 2
    );

    // ---------- Tooltip ----------

    index++;
  }
  if (hoverStat !== null && tool_tips===true) {

    const stat = statsConfig[hoverStat];
    if (stat && playerData[stat.xpTotalKey] !== undefined) {
      let tooltipEl = document.getElementById('stat-tooltip');
      if (!tooltipEl) {
        tooltipEl = document.createElement('div');
        tooltipEl.id = 'stat-tooltip';
        tooltipEl.style.position = 'absolute';
        tooltipEl.style.pointerEvents = 'none';
        tooltipEl.style.background = "#a0732fc2";
        tooltipEl.style.border = '1px solid black';
        tooltipEl.style.padding = '2px 4px';
        tooltipEl.style.fontSize = '12px';
        tooltipEl.style.fontFamily = 'Arial';
        tooltipEl.style.display = 'none';
        tooltipEl.style.zIndex = '1000';
        document.body.appendChild(tooltipEl);
      }

      const xp = playerData[stat.xpTotalKey];
      tooltipEl.textContent = `${stat.name} XP: ${xp}`;

      tooltipEl.style.left = `${invCanvas.offsetLeft + mx + 10}px`;
      tooltipEl.style.top = `${invCanvas.offsetTop + my + 10}px`;
      tooltipEl.style.display = 'block';
    }
  } else {
    const tooltipEl = document.getElementById('stat-tooltip');
    if (tooltipEl) tooltipEl.style.display = 'none';
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
/*
function drawRain() {
  if (!rain) return;
  if (!latestView) return;
  // player tile is fixed in the view
  const playerTile = latestView[5][10];
  const playerRoof = playerTile?.roof;
  const playerUnderRoof =
    playerRoof && Object.keys(playerRoof).length > 0;

  for (let i = 0; i < latestView.length; i++) {
    for (let j = 0; j < latestView[i].length; j++) {

      const tile = latestView[i][j];
      const roof = tile?.roof;
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
*/
function drawRain() {
  if (!rain) return;
  if (!latestView) return;

  // Player is fixed at center of view
  const column = latestView[5][10];
  const playerTile = column?.[playerData.z];

  const playerUnderRoof =
    !!playerTile?.roof &&
    Object.keys(playerTile.roof).length > 0;

  for (let i = 0; i < latestView.length; i++) {
    for (let j = 0; j < latestView[i].length; j++) {

      const tile = latestView[i][j]?.[playerData.z];
      if (!tile) continue;

      const hasRoof =
        !!tile.roof &&
        Object.keys(tile.roof).length > 0;

      // If player is indoors, don't draw rain on roofed tiles
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

let fog = true;
/*
function drawOutsideFog() {
  if (fog===false) return;
  if (!latestView) return;
  // player tile is fixed in the view
  const playerTile = latestView[5]?.[10];
  const playerRoof = playerTile?.roof;
  const playerUnderRoof =
    playerRoof && Object.keys(playerRoof).length > 0;
  if (!playerUnderRoof) return;
  for (let i = 0; i < latestView.length; i++) {
    for (let j = 0; j < latestView[i].length; j++) {

      const tile = latestView[i][j];
      const roof = tile?.roof;
      const hasRoof = roof && Object.keys(roof).length > 0;

      // if player is indoors, don't draw rain on roofed tiles
      if (playerUnderRoof && hasRoof) {
        continue;
      }
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.fillRect(j*32, i*32, 32, 32);
    }
  }
}
*/
function drawOutsideFog() {
  if (!fog) return;
  if (!latestView) return;

  const column = latestView[5]?.[10];
  const playerTile = column?.[playerData.z];

  const playerUnderRoof =
    !!playerTile?.roof &&
    Object.keys(playerTile.roof).length > 0;

  if (!playerUnderRoof) return;

  for (let i = 0; i < latestView.length; i++) {
    for (let j = 0; j < latestView[i].length; j++) {

      const tile = latestView[i][j]?.[playerData.z];
      if (!tile) continue;

      // IMPORTANT: only check roof at player's Z
      const hasRoofAtPlayerZ =
        !!tile.roof &&
        Object.keys(tile.roof).length > 0;

      // Only roofs on player's Z stay visible
      if (hasRoofAtPlayerZ) continue;

      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.fillRect(j * 32, i * 32, 32, 32);
    }
  }
}

let night = false;
function drawNightTime(){
  if (night===false) return;
  if (!latestView) return;
  // player tile is fixed in the view
  const playerTile = latestView[5]?.[10];
  const playerRoof = playerTile?.roof;
  const playerUnderRoof =
    playerRoof && Object.keys(playerRoof).length > 0;
  //if (playerUnderRoof) return;
  for (let i = 0; i < latestView.length; i++) {
    for (let j = 0; j < latestView[i].length; j++) {

      const tile = latestView[i][j];
      const roof = tile?.roof;
      const hasRoof = roof && Object.keys(roof).length > 0;

      // if player is indoors, don't draw rain on roofed tiles
      if (playerUnderRoof && hasRoof) {
        continue;
      }
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.fillRect(j*32, i*32, 32, 32);
    }
  }
}

function drawBaseTile(chunk){
  if (!chunk?.['b-t']) return;
  ctx.drawImage(
    spriteSheet,
    //sx, sy, sw, sh,
    base_tiles[chunk['b-t']].x, base_tiles[chunk['b-t']].y,
    16, 16,
    //dx, dy, dw, dh
    j * 32, i * 32, 32, 32
  );
}

function drawFloor(chunk) {
    const floorObj = chunk?.floor;
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
  let subTile = chunk.pixels;
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
  for (obj in chunk.objects) {
    try {
      ctx.drawImage(
        spriteSheet,
        base_tiles[chunk.objects[obj].name].x, base_tiles[chunk.objects[obj].name].y,
        16, 16,
        j * 32, i * 32, 32, 32
      );
    } catch (err) {
      //haha!
    }
    if (chunk.objects['fishingspot']){
      animateFishing(chunk);
    }
    if (chunk.objects.forge || chunk.objects.campfire1){
      animateForge(chunk);
    }
    if (Object.keys(chunk.objects)[0].startsWith('flower')){
      drawBees(chunk, i, j);
    }
  }
}

function animateFire(chunk, i, j, color = "orange") {
  const tileSize = 32;
  const centerX = j * tileSize + tileSize / 2;
  const centerY = i * tileSize + tileSize / 2;

  // flicker factor for pulsing
  const flicker = 0.6 + Math.random() * 0.4;

  // create radial gradient: strong center -> transparent edge
  const gradient = ctx.createRadialGradient(centerX, centerY, 4, centerX, centerY, 32);

  gradient.addColorStop(0, `rgba(${getRGB(color)}, ${0.6 * flicker})`);
  gradient.addColorStop(1, `rgba(${getRGB(color)}, 0)`);

  ctx.save();
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(centerX, centerY, 32, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function getRGB(color) {
  const temp = document.createElement("div");
  temp.style.color = color;
  document.body.appendChild(temp);

  const computed = getComputedStyle(temp).color;
  document.body.removeChild(temp);

  // computed comes back like "rgb(r, g, b)"
  return computed.match(/\d+/g).slice(0, 3).join(", ");
}

//all bees will move in unison but that's fine lol
function drawBees(chunk) {
  // j = x, i = y
  const baseX = j * 32;
  const baseY = i * 32;

  // slightly inside tile so sprite never clips out
  const cx = baseX + 15;
  const cy = baseY + 15;

  // slower movement
  const radius = 9;
  const speed = 900; // bigger = slower

  const t = Date.now() / speed;

  // circular motion
  let beeX = cx + Math.cos(t) * radius;
  let beeY = cy + Math.sin(t) * radius;

  // small jitter (feels buzzy)
  beeX += Math.sin(t * 7) * 1.5;
  beeY += Math.cos(t * 9) * 1.5;

  drawPixelBee(Math.floor(beeX), Math.floor(beeY));
}

function drawPixelBee(x, y) {
  const p = 1;

  function px(dx, dy, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x + dx * p, y + dy * p, p, p);
  }

  // wings/body
  px(1, 0, "black");
  px(2, 0, "black");
  px(3, 0, "yellow");
  px(4, 0, "black");

  px(0, 1, "black");
  px(1, 1, "yellow");
  px(2, 1, "yellow");
  px(3, 1, "yellow");
  px(4, 1, "yellow");
  px(5, 1, "black");

  px(1, 2, "black");
  px(2, 2, "yellow");
  px(3, 2, "black");
  px(4, 2, "black");
}



function animateForge(chunk){
  for (k = 0; k < 32; k++) {
    for (p = 0; p < 32; p++) {
      if (Math.floor(Math.random() * 10000 < 10)) {
        ctx.fillStyle = "#ff5e00";   // whatever color
        ctx.fillRect(j * 32 + k, i * 32 + p - 16 , 2, 2);
        ctx.fillStyle = "#ffd900";   // whatever color
        ctx.fillRect(j * 32 + k, i * 32 + p  - 18 , 1, 1);
      }
    }
  }
}

function drawForgeGlow(i, j) {
  const tileSize = 32;

  const centerX = j * tileSize + 16;
  const topY = i * tileSize - 4;

  const maxRadius = 14;

  // flicker factor: oscillates 0.7 → 1.3
  const flicker = 0.8 + Math.sin(Date.now() / 500 + i + j) * 0.1;

  for (let r = maxRadius; r > 0; r--) {
    // fade based on distance
    const alpha = ((maxRadius - r) / maxRadius) * 0.35 * flicker;

    ctx.fillStyle = `rgba(255,208,0,${alpha})`;
    // draw half circle with horizontal strips
    const width = Math.sqrt(maxRadius * maxRadius - r * r) * flicker;

    ctx.fillRect(
      centerX - width,
      topY + r * 0.6,
      width * 2,
      1
    );
  }
}

function animateFishing(chunk){
  for (k = 0; k < 32; k++) {
    for (p = 0; p < 32; p++) {
      if (Math.floor(Math.random() * 10000 < 10)) {
        ctx.fillStyle = "#ffffff";   // whatever color
        ctx.fillRect(j * 32 + k, i * 32 + p, 1, 1);
      }
    }
  }
  if (chunk.objects['fishingspot'].fishing === true) {
    ctx.drawImage(
      spriteSheet,
      base_tiles['bobber'].x, base_tiles['bobber'].y,
      16, 16,
      j * 32, i * 32, 32, 32
    );
  }
}

function worldTileToScreen(worldI, worldJ) {
  const tilesAcross = 20;
  const tilesDown = 10;

  const viewCenterX = Math.floor(tilesAcross / 2);
  const viewCenterY = Math.floor(tilesDown / 2);

  const topLeftTileX = playerData.x - viewCenterX;
  const topLeftTileY = playerData.y - viewCenterY;

  const offsetX = (worldJ - topLeftTileX) * 32; // screen pixels
  const offsetY = (worldI - topLeftTileY) * 32; // screen pixels

  return { x: offsetX, y: offsetY };
}

let explosions = [];

function spawnExplosion(worldJ, worldI, mainColor = "orange", dist = 32) {
  const { x: screenX, y: screenY } = worldTileToScreen(worldI, worldJ);

  const numParticles = 80;
  const particles = [];

  // define RGB palettes for main colors
  const colorPalettes = {
    orange: [[255,140,0],[255,200,0]],  // main, secondary
    yellow: [[255,255,0],[255,220,0]],
    blue:   [[0,150,255],[0,200,255]],
    red:    [[255,60,0],[255,100,0]],
    green:  [[50,255,50],[0,200,0]],
    purple: [[200,0,255],[150,0,255]],
    default:[[255,140,0],[255,200,0]]
  };

  const palette = colorPalettes[mainColor] || colorPalettes.default;

  for (let p = 0; p < numParticles; p++) {
    const angle = Math.random() * 2 * Math.PI;
    const speed = 1 + Math.random() * 10;
    const maxDist = dist + Math.random() * 32;
    //maxDist = maxDist + Math.random() * 32;
    const size = 2 + Math.floor(Math.random() * 2);
    //size = size + Math.floor(Math.random() * 2);
    const roll = Math.random();
    let color = palette[0]; // main color
    if (roll > 0.7) color = palette[1]; // secondary
    else if (roll > 0.9) color = [128,128,128]; // gray

    particles.push({
      worldX: worldJ * 32 + 16,
      worldY: worldI * 32 + 16,
      angle,
      speed,
      traveled: 0,
      maxDist,
      size,
      color,
      alpha: 1
    });
  }

  explosions.push(particles);
}

// Call every frame
function drawExplosions() {
  for (let e = explosions.length - 1; e >= 0; e--) {
    const particles = explosions[e];
    let allDead = true;

    for (let p of particles) {
      if (p.alpha <= 0) continue;
      allDead = false;

      // move particle
      p.worldX += Math.cos(p.angle) * p.speed;
      p.worldY += Math.sin(p.angle) * p.speed;
      p.traveled += p.speed;

      // fade
      p.alpha = 1 - p.traveled / p.maxDist;

      // convert world → screen using playerData (like coordsOnMap)
      const screen = worldTileToScreen(
        Math.floor(p.worldY / 32),
        Math.floor(p.worldX / 32)
      );

      // add sub-tile pixel offset
      const pixelX = screen.x + (p.worldX % 32);
      const pixelY = screen.y + (p.worldY % 32);

      // draw pixel
      let r = p.color === "orange" ? 255 : p.color === "yellow" ? 255 : 128;
      let g = p.color === "orange" ? 140 : p.color === "yellow" ? 255 : 128;
      let b = 0;

      ctx.fillStyle = `rgba(${p.color[0]},${p.color[1]},${p.color[2]},${p.alpha})`;
      ctx.fillRect(Math.floor(pixelX), Math.floor(pixelY), p.size, p.size);
    }

    if (allDead) explosions.splice(e, 1);
  }
}

function drawDepletedResources(chunk) {
  const depleted = chunk?.depletedResources;//how tf this even workin?
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
  if (!chunk?.players) return;
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
        if (players[p].criminalSprite!==null){
          equipToDraw.push(
            players[p].criminalSprite
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
        if (players[p].feet !== null){
          let feetSprite = getEquipSprite(players[p].feet, players[p].facing);
          equipToDraw.push(feetSprite);
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
  let drawSize = 32;
  let spriteSize = 16;
  /*
  if (base_tiles[chunk.mob.sprite]?.drawSize) {
    drawSize = base_tiles[chunk.mob.sprite].drawSize;
  }
  */
  /*
  if (base_tiles[chunk.mob.sprite]?.spriteSize) {
    spriteSize = base_tiles[chunk.mob.sprite].spriteSize;
  }
  */
  ctx.drawImage(
    spriteSheet,
    base_tiles[chunk.mob.sprite].x, base_tiles[chunk.mob.sprite].y,
    spriteSize, spriteSize,
    j*32, i*32, drawSize, drawSize
  )
}

function draw32Mobs(data){
  const chunk = data.chunk;
  if (!chunk.mob) return;

  const mob = chunk.mob;

ctx.drawImage(
  spriteSheet,
  base_tiles[mob.sprite].x,
  base_tiles[mob.sprite].y,
  base_tiles[mob.sprite].spriteSize,
  base_tiles[mob.sprite].spriteSize,
  data.x * 32,
  data.y * 32,
  base_tiles[mob.sprite].drawSize,
  base_tiles[mob.sprite].drawSize
);
}

function drawProjectiles(chunk){
  //draw arrows n shit
  const proj = chunk?.projectile;
  if (!proj) return;
  ctx.drawImage(
    spriteSheet,
    base_tiles[proj.name].x, base_tiles[proj.name].y,
    16, 16,
    j * 32, i * 32, 32, 32
  );
}

function drawChatBubbles(chunk){
  if (chunk.typing === true) {
    //draw chat bubbles
    ctx.drawImage(
      spriteSheet,
      base_tiles['chatDots'].x, base_tiles['chatDots'].y,
      16, 16,
      (j * 32) + 8, (i * 32) - 8, 16, 16
    );
  }
}

function drawRoofs(chunk, i, j, z){
  const roofs = chunk?.roof;
  if (!roofs) return;

  if (roofs===undefined || roofs===null) return;
  const roof = latestView[5][10][z]?.roof;
  if (roof && Object.keys(roof).length > 0 && z >= playerData.z) {
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
  if (!crafting) return;//this necessary?
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
  if (tool_tips===false) return;
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
  ctx.font = "14px sans-serif";
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
  const safe = chunk?.safeTile;
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
  const manaPosX = 5;
  const manaPosY = canvas.height-30;
  ctx.strokeStyle = "#3030308c";
  ctx.strokeRect(hpPosX, hpPosY, 100, 10);
  ctx.strokeRect(manaPosX, manaPosY, 100, 10);
// determine the visual width of the full bar
  const barWidth = 100; // keeps the same size on screen

  // calculate max HP based on level
  const maxHp = 100 + playerData.hpLvl * 2;
  const maxMana = 100 + playerData.mageLvl * 2;

  // scale current HP relative to max
  const hpFillWidth = (playerData.hp / maxHp) * barWidth;
  const manaFillWidth = (playerData.mana/ maxMana) * barWidth;

  // clamp to prevent negative or overflowing bars
  const hpSafeWidth = Math.max(0, Math.min(barWidth, hpFillWidth));
  const manaSafeWidth = Math.max(0, Math.min(barWidth, manaFillWidth));

  // draw the HP bar
  ctx.fillStyle = "#ff00008c";
  ctx.fillRect(hpPosX + 1, hpPosY + 1, hpSafeWidth, 8);
  ctx.fillStyle = "white";
  ctx.font = "10px Arial";
  let hpText = `${playerData.hp}/${maxHp}`;
  ctx.fillText(hpText, hpPosX + 30 + hpText.length, hpPosY + 8);
  
  
  ctx.fillStyle = "#00ccff8c";
  ctx.fillRect(manaPosX + 1, manaPosY +1, manaSafeWidth, 8);
  ctx.fillStyle = "white";
  ctx.font = "10px Arial";
  let manaText = `${playerData.mana}/${maxMana}`;
  ctx.fillText(manaText, manaPosX + 30 + manaText.length, manaPosY + 8);
  //draw combat icon
  ctx.drawImage(
    spriteSheet,
    base_tiles['combatIcon'].x, base_tiles['combatIcon'].y,
    16, 16, 
    canvas.width-24, canvas.height-24,
    16, 16
  )
  //
  if (latestView){
    if (latestView[5][10]?.safeTile){
      //cross out combat icon
      drawRedX(ctx, canvas.width-24, canvas.height-24);
    }
  }

}

function drawRedX(ctx, x, y, size = 16) {//wow this useful lmao
  ctx.strokeStyle = "#ff00008c";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + size, y + size);
  ctx.moveTo(x + size, y);
  ctx.lineTo(x, y + size);
  ctx.stroke();
}

function playerHasRoofOnOrAbove() {

  const column = latestView?.[5]?.[10];
  if (!column) return false;

  for (let z = playerData.z; z < column.length; z++) {

    const tile = column[z];
    if (tile?.roof && Object.keys(tile.roof).length > 0) {
      return true;
    }
  }

  return false;
}

//draw everything here
/*
function updateView(data){
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  let bigMobs = [];
  for (i in data){
    for (j in data[i]){
      if (data[i][j]===null || data[i][j]===undefined){
        ctx.drawImage(
          spriteSheet,
          base_tiles['water'].x, base_tiles['water'].y,
          16,16,
          j*32, i*32,
          32, 32
        )
        continue;
      }
      let columnChunk = data[i][j];
      let levels = Object.keys(columnChunk)
        .map(Number)
        .sort((a, b) => a - b);
      for (let z of levels) {
        if (playerData.obscured && z > playerData.z) {
          continue;
        }

        let chunk = columnChunk[z];
        if (!chunk) continue;


        drawBaseTile(chunk);
        drawFloor(chunk);
        drawDepletedResources(chunk);
        drawPixels(chunk);
        drawObjects(chunk);
        drawMobs(chunk);
        drawPlayers(chunk);
        drawProjectiles(chunk);
        drawRoofs(chunk, i, j, z);
        drawSafeTiles(chunk);
        drawChatBubbles(chunk);
      }
    }
  }
  drawExplosions();
  drawRain();
  drawOutsideFog();
  drawNightTime();
  drawVignette(ctx, canvas.width, canvas.height);
  drawHUD();
}
*/

const shadowCasters = [
  "rockroof", "woodroof", "stoneroof",
  "woodblock0","woodblock1","woodblock2","woodblock3",
  "rock0","rock1","rock2","rock3", "rock4",
  "ironrock0","ironrock1","ironrock2","ironrock3","ironrock4",
  "coalrock0","coalrock1","coalrock2","coalrock3", "coalrock4",
  "silverrock0","silverrock1","silverrock2","silverrock3", "silverrock4",
  "goldrock0","goldrock1","goldrock2","goldrock3", "goldrock4",
  "copperrock0","copperrock1","copperrock2","copperrock3", "copperrock4",
  "diamondrock0","diamondrock1","diamondrock2","diamondrock3", "diamondrock4"
];
function updateView(data) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  let bigMobs = [];

  for (i in data) {
    for (j in data[i]) {

      if (data[i][j] === null || data[i][j] === undefined) {
        ctx.drawImage(
          spriteSheet,
          base_tiles['water'].x, base_tiles['water'].y,
          16, 16,
          j * 32, i * 32,
          32, 32
        );
        continue;
      }

      let columnChunk = data[i][j];

      let levels = Object.keys(columnChunk)
        .map(Number)
        .sort((a, b) => a - b);

      for (let z of levels) {

        if (playerData.obscured && z > playerData.z) {
          continue;
        }

        let chunk = columnChunk[z];
        if (!chunk) continue;
        if (latestView[5][10][playerData.z]) {
          let roofCheck = latestView[5][10][playerData.z];
          if (roofCheck?.roof) {
            if (Object.keys(roofCheck.roof).length > 0 && z> playerData.z) {
              continue;
            }
          }
        }
        drawBaseTile(chunk);
        drawFloor(chunk);
        drawDepletedResources(chunk);
        drawPixels(chunk);
        drawMarks(chunk);
        drawObjects(chunk);
        drawMobs(chunk);
        drawPlayers(chunk);
        drawProjectiles(chunk);
        drawRoofs(chunk, i, j, z);



        drawSafeTiles(chunk);
        drawChatBubbles(chunk);
      }
    }
  }
  drawShadows();
  drawExplosions();
  drawRain();
  drawOutsideFog();
  drawNightTime();
  drawVignette(ctx, canvas.width, canvas.height);
  drawHUD();
}

function drawMarks(chunk){
  if (!chunk?.objects) return;
  if (Object.keys(chunk.objects).length===0) return;
  let key = Object.keys(chunk.objects)[0];
  if (key==="lootbag"){
    if (chunk.objects[key]?.owner){
      ctx.drawImage(
        spriteSheet,
        base_tiles['deathskull'].x, base_tiles['deathskull'].y,
        16, 16,
        j*32-16, i*32,
        32, 32
      )
    }
  }
}

let surround = [
  { x: -1, y: 0, sprite: base_tiles['shadLeft']},
  { x: 0, y: -1 , sprite: base_tiles['shadUp']},
  { x: 1, y: 0 , sprite: base_tiles['shadRight']},
  { x: 0, y: 1 , sprite: base_tiles['shadDown']}
]
/*
function drawShadows() {
  if (!latestView) return;

  for (let y = 0; y < latestView.length; y++) {
    for (let x = 0; x < latestView[y].length; x++) {

      const cell = latestView[y][x];
      if (!cell) continue;

      // ---- DETERMINE IF TILE IS CASTER ----
      let isCaster = false;

      for (let z in cell) {
        const tile = cell[z];
        if (!tile?.objects) continue;

        for (let key in tile.objects) {
          if (shadowCasters.includes(key)) {
            isCaster = true;
            break;
          }
        }

        if (isCaster) break;
      }

      if (!isCaster) continue;

      // ---- CAST TO SURROUNDINGS ----
      for (let dir of surround) {

        const nx = x + dir.x;
        const ny = y + dir.y;

        if (!latestView[ny]?.[nx]) continue;

        const neighborCell = latestView[ny][nx];

        // ---- CHECK NEIGHBOR COLLISION (ALL Z) ----
        let neighborBlocks = false;
for (let nz in neighborCell) {
  const neighborTile = neighborCell[nz];

  // If tile exists, check blockers
  if (neighborTile) {

    if (neighborTile.objects) {
      for (let key in neighborTile.objects) {
        if (base_tiles[key]?.collision === true) {
          neighborBlocks = true;
          break;
        }
      }
    }

    if (neighborTile.roof && Object.keys(neighborTile.roof).length > 0) {
      neighborBlocks = true;
    }

    if (neighborBlocks) break;
  }

  // If neighborTile does NOT exist,
  // we do nothing — shadow remains allowed.
}

        // ---- DRAW ONLY IF NOT BLOCKED ----
        if (!neighborBlocks) {
          ctx.drawImage(
            spriteSheet,
            dir.sprite.x,
            dir.sprite.y,
            16,
            16,
            nx * 32,
            ny * 32,
            32,
            32
          );
        }
      }
    }
  }
}
*/
/*
function drawShadows() {
  if (!latestView) return;

  for (let y = 0; y < latestView.length; y++) {
    for (let x = 0; x < latestView[y].length; x++) {

      const cell = latestView[y][x];
      if (!cell) continue;

      const zLevels = Object.keys(cell)
        .filter(z => z !== "version")
        .sort((a, b) => Number(a) - Number(b));

      for (let z of zLevels) {

        const tile = cell[z];
        if (!tile?.objects) continue;

        // ---- CHECK IF THIS Z IS A CASTER ----
        let isCaster = false;

        for (let key in tile.objects) {
          if (shadowCasters.includes(key)) {
            isCaster = true;
            break;
          }
        }

        if (!isCaster) continue;

        // ---- CAST AT SAME Z LEVEL ----
        for (let dir of surround) {

          const nx = x + dir.x;
          const ny = y + dir.y;

          if (!latestView[ny]?.[nx]?.[z]) continue;

          const neighborTile = latestView[ny][nx][z];

          let neighborBlocks = false;

          if (neighborTile.objects) {
            for (let key in neighborTile.objects) {
              if (base_tiles[key]?.collision === true) {
                neighborBlocks = true;
                break;
              }
            }
          }

          if (neighborTile.roof &&
              Object.keys(neighborTile.roof).length > 0) {
            neighborBlocks = true;
          }

          if (!neighborBlocks) {
            ctx.drawImage(
              spriteSheet,
              dir.sprite.x,
              dir.sprite.y,
              16,
              16,
              nx * 32,
              ny * 32,
              32,
              32
            );
          }
        }
      }
    }
  }
}
*/
function drawShadows() {
  if (!latestView) return;

  for (let y = 0; y < latestView.length; y++) {
    for (let x = 0; x < latestView[y].length; x++) {

      const cell = latestView[y][x];
      if (!cell) continue;

      const zLevels = Object.keys(cell)
        .filter(z => z !== "version")
        .sort((a, b) => Number(a) - Number(b));

      for (let z of zLevels) {

        const tile = cell[z];
        if (!tile?.objects || !tile?.roof) continue;

        // ---- CHECK IF THIS Z IS A CASTER ----
        let isCaster = false;
        if (tile?.objects){
          for (let key in tile.objects) {
            if (shadowCasters.includes(key)) {
              isCaster = true;
              break;
            }
          }
        }
        if (tile?.roof){
          for (let key in tile.roof) {
            if (shadowCasters.includes(key)) {
              isCaster = true;
              break;
            }
          }
        }

        if (!isCaster) continue;

        // ---- CAST AT SAME Z LEVEL ----
        for (let dir of surround) {

          const nx = x + dir.x;
          const ny = y + dir.y;

          if (!latestView[ny]?.[nx]) continue;

          const neighborCell = latestView[ny][nx];

          let neighborBlocks = false;

          // IMPORTANT:
          // We check the neighbor z if it exists,
          // but if it does NOT exist, we DO NOTHING (shadow allowed)

          const neighborTile = neighborCell[z];

          if (neighborTile) {

            if (neighborTile.objects) {
              for (let key in neighborTile.objects) {
                if (base_tiles[key]?.collision === true) {
                  neighborBlocks = true;
                  break;
                }
              }
            }

            if (neighborTile.roof &&
                Object.keys(neighborTile.roof).length > 0) {
              neighborBlocks = true;
            }
          }

          // If neighborTile does NOT exist:
          // neighborBlocks remains false → shadow draws

          if (!neighborBlocks) {
            ctx.drawImage(
              spriteSheet,
              dir.sprite.x,
              dir.sprite.y,
              16,
              16,
              nx * 32,
              ny * 32,
              32,
              32
            );
          }
        }
      }
    }
  }
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
playSound(["rain"], true);
playSound(["hell"], true);
drawTabs();
requestAnimationFrame(updateDraw);

setInterval(()=>{
  if (emitInputSwitch){
    emitInput();
  }
}, 100);