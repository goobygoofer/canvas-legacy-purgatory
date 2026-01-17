const spriteSheet = new Image();
spriteSheet.src = 'spritesheet-0.5.18.png';
const canvas = document.getElementById('disp');
const invCanvas = document.getElementById('invDisp');
const ctx = canvas.getContext('2d');
const invCtx = invCanvas.getContext('2d');
ctx.imageSmoothingEnabled = false;//toggle to enable grid? *shrugs*

const socket = io(window.location.origin, {
  reconnection: false
});
const form = document.getElementById('form');
const input = document.getElementById('input');
const messages = document.getElementById('messages');

//GLOBAL VARIABLES
let typingTimeout;
let isTyping=false;
let emitInputSwitch = false;
let currentButton = "left";//Track left or right mouse button
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
  name: null,//get from login? don't use this  yet
  inventory: {}//[{id:1, amt:1}, {id:5, amt:16}
};

//id's for items, name from base_tiles to disp in inv
let itemId = {
  1: "axeItem"
}

//stuff for inv, paint etc tabs
const tabs = [
  { id: "inventory", label: "Inventory" },
  { id: "paint", label: "Paint" },
];
let activeTab = "inventory";
const TAB_HEIGHT = 14;
const TAB_PADDING = 10;

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
drawTabs();

invCanvas.addEventListener("mousedown", e => {
  const rect = invCanvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  if (my <= TAB_HEIGHT) {
    invCtx.font = "14px sans-serif";

    let cursorX = 0;
    for (const tab of tabs) {
      const width = invCtx.measureText(tab.label).width + TAB_PADDING * 2;

      if (mx >= cursorX && mx <= cursorX + width) {
        activeTab = tab.id;
        drawTabs();
        togglePaint();
        return;
      }

      cursorX += width;
    }

    // Clicked tab bar but not a tab, do nothing
    return;
  }
  handleActiveTabClick(mx, my);
});

function handleActiveTabClick(x, y){
  console.log(`clicked ${x},${y} in tabs container`);
  if (activeTab==='paint'){
    handlePaintClick(x, y);
  }
}

const PALETTE_CELL_SIZE = 24;
const PALETTE_PADDING = 4;
const PALETTE_COLS = 6;
const PALETTE_START_X = 8;
const PALETTE_START_Y = TAB_HEIGHT + 8;

let activePaintColor = 0;

function drawPaintPalette() {
  let i = 0;

  for (const key in COLOR_PALETTE) {
    const col = i % PALETTE_COLS;
    const row = Math.floor(i / PALETTE_COLS);

    const x = PALETTE_START_X + col * (PALETTE_CELL_SIZE + PALETTE_PADDING);
    const y = PALETTE_START_Y + row * (PALETTE_CELL_SIZE + PALETTE_PADDING);

    // draw color square
    invCtx.fillStyle = COLOR_PALETTE[key].hex;
    invCtx.fillRect(x, y, PALETTE_CELL_SIZE, PALETTE_CELL_SIZE);

    // highlight active color
    if (Number(key) === activePaintColor) {
      invCtx.strokeStyle = "#000000ff";
      invCtx.lineWidth = 2;
      invCtx.strokeRect(x - 1, y - 1, PALETTE_CELL_SIZE + 2, PALETTE_CELL_SIZE + 2);
    }

    i++;
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
  2:  { name: "Red",          hex: "#ff0000" },
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

  // new colors added after original palette
  19: { name: "Coral",        hex: "#ff7f50" },
  20: { name: "Olive",        hex: "#808000" },
  21: { name: "Violet",       hex: "#ee82ee" },
  22: { name: "Turquoise",    hex: "#40e0d0" },
  23: { name: "Beige",        hex: "#f5f5dc" }
};
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

function onKeyDown(e) {
  if (document.activeElement === input) return;
  //remove for, for admin only
  if (e.key === ' ') {
    const active = document.activeElement;
    if (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA') {
      return;
    }
    layTile();
    return;
  }
  
  const key = keys[e.key];
  if (!key) return;
  emitInputSwitch=true;
  keystate[key] = true;
  keystate.lastInput = Date.now();
}

function onKeyUp(e) {
  const key = keys[e.key];
  if (!key) return;
  emitInputSwitch=false;
  keystate[key] = false;
  emitInput();
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

setInterval(()=>{
  if (emitInputSwitch){
    emitInput();
  }
}, 100);

function logout(){
  socket.disconnect();
  location.reload();
  return false;
}

//When mouse button is pressed
canvas.addEventListener("mousedown", (e) => {
  e.preventDefault(); // prevent right-click menu
  ispainting = true;
  currentButton = e.button === 2 ? "right" : "left"; // 0 = left, 2 = right
  paintAtMouse(e);
});

//When mouse moves
canvas.addEventListener("mousemove", (e) => {
  if (!ispainting) return;
  paintAtMouse(e);
});

//When mouse button is released
canvas.addEventListener("mouseup", () => {
  ispainting = false;
});

//Prevent right-click menu
canvas.addEventListener("contextmenu", (e) => e.preventDefault());

function paintAtMouse(e) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  const mouseX = (e.clientX - rect.left) * scaleX;
  const mouseY = (e.clientY - rect.top) * scaleY;

  handleClick(mouseX, mouseY, currentButton);
}

//need to fix this, clicking canvas will be for other stuff too
function handleClick(mouseX, mouseY, leftRight) {
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

  if (painting===false){
    return;//need to fix this later
  }

  const pixelInTileX = mouseX % 32;
  const pixelInTileY = mouseY % 32;

  const subX = Math.floor(pixelInTileX / 8);
  const subY = Math.floor(pixelInTileY / 8);

  let data = {
    x: worldTileX,
    y: worldTileY,
    subX: subX,
    subY: subY,
    c: activePaintColor,
    btn: leftRight
  };
  socket.emit("paint", data);
}

//move all these to bottom?
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
});

socket.on('invData', (data) => {
  console.log("invData worked client side");
  playerData.inventory = data;
});

socket.on('updateChunk', (data) => {
    console.log("received new chunk");
    latestView = data;
    chunkNeedsRender = true;
});

socket.on('updateInventory', (data) => {
  console.log(`got inv data: ${data}`);
  updateInventory(data);//item name||id, amt
});

//DON'T PUSH THIS!!!
var mapDownload = [];
socket.on('mapDownload', (data) => {
  mapDownload.push(data);
});

//draw everything here
function updateView(data){
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (i in data){
    for (j in data[i]){
      if (data[i][j]===null){
        continue;
      }
      //draw each tile, remember i*32, j*32
      //just draw base-tile first
      ctx.drawImage(
        spriteSheet,
        //sx, sy, sw, sh,
        base_tiles[data[i][j].data['base-tile']].x,base_tiles[data[i][j].data['base-tile']].y,
        16, 16,
        //dx, dy, dw, dh
        j*32, i*32, 32, 32
      );
      //draw pixels
     
      let subTile = data[i][j].data.pixels;
      for (let y in subTile){
        for (let x in subTile[y]){
          if (subTile[y][x]!==-1){
            //draw pixel
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
      //draw players
      for (obj in data[i][j].data.objects){
        try {
          ctx.drawImage(
            spriteSheet,
            base_tiles[data[i][j].data.objects[obj].name].x, base_tiles[data[i][j].data.objects[obj].name].y,
            16, 16,
            j * 32, i * 32, 32, 32
          );
        } catch (err) {
          //haha!
        }
      }
      if (Object.keys(data[i][j].data.players).length > 0) {
        for (p in data[i][j].data.players) {
          let spriteName = data[i][j].data.players[p].sprite;
          //p being name, ...data.players[p].sprite (draw that lol)
          try {
            ctx.drawImage(
              spriteSheet,
              base_tiles[spriteName].x, base_tiles[spriteName].y,
              16, 16,
              j * 32, i * 32, 32, 32
            );
          } catch (err) {
            //haha!
          }
        }
      }
      if (data[i][j].data.typing===true){
        //draw chat bubbles
        ctx.drawImage(
          spriteSheet,
          base_tiles['chatDots'].x, base_tiles['chatDots'].y,
          16, 16,
          (j*32)+8, (i*32)-8, 16, 16
        );
      }
    }
  }
}

function updateDraw(now) {
  if (now - lastRender > interval) {
    chunkNeedsRender = false;
    lastRender = now;
    updateView(latestView);
  }
  requestAnimationFrame(updateDraw);
}
requestAnimationFrame(updateDraw);

invCanvas.addEventListener("contextmenu", (e) => e.preventDefault());
invCanvas.addEventListener("click", (e) => {
//calculate what number slot is clicked, send to server
//server uses this number to check item from list
});

function updateInventory(data){
  //draw inventory from data sent from server
  //only updates if player clicks in it
  //or something on server changes inv
  playerData.inventory = data;
}

function sendInvSelect(id){
  //this after player clicks in inventory canvas ele
  //emit id of selected item to server
  //server checks that player actually has that item in db
  //sets that as active item for player in server memory
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

Object.keys(COLOR_PALETTE).forEach(key => {
  const color = COLOR_PALETTE[key];
  const option = document.createElement("option");
  console.log(key);
  option.value = key;
  option.textContent = color.name;
  palette.appendChild(option);
});

//admin only! use only for production, do not deploy this code to server
//however if players are going to build stuff, some of this code
//will probably be useful for user client
/*
const select = document.getElementById("tileSelect");

Object.keys(base_tiles).forEach(key => {
  const option = document.createElement("option");
  option.value = key;
  option.textContent = key;
  select.appendChild(option);
});

function layTile(){
  //put object or base-tile on tile on player coords on map
  //when done world building, emit save map, server saves map to local json file
  //gets base-tile name from selected in dropdown list
  console.log("laying tile");
  //get tile from dropdown list
  let selectedTile = select.value;
  socket.emit('layTile', selectedTile);
}

function saveMap(){//need to take this out for server lol
  socket.emit('saveMap');
}
*/