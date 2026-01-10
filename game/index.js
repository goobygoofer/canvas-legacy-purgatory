const spriteSheet = new Image();
spriteSheet.src = 'spritesheet-0.5.18.png';
const canvas = document.getElementById('disp');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = true;//toggle to enable grid? *shrugs*

const socket = io({reconnection : false});
const form = document.getElementById('form');
const input = document.getElementById('input');
const messages = document.getElementById('messages');

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = input.value.trim();
    if (message) {
        socket.emit('chat message', message);
        input.value = '';
    }
});

let typingTimeout;

input.addEventListener('input', () => {
  socket.emit('typing');

  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    socket.emit('stopTyping');
  }, 1000);
});

const keys = {
  ArrowLeft:  "left",
  ArrowRight: "right",
  ArrowUp:    "up",
  ArrowDown:  "down"
};

const keystate = {
  left: false,
  right: false,
  up: false,
  down: false,
  lastInput: Date.now()
};

document.addEventListener("keydown", onKeyDown);
document.addEventListener("keyup", onKeyUp);

window.addEventListener("keydown", e => {
  if (e.key.startsWith("Arrow")) {
    e.preventDefault();
  }
});

function onKeyDown(e) {
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

let emitInputSwitch = false;
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

canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();

  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  const mouseX = (e.clientX - rect.left) * scaleX;
  const mouseY = (e.clientY - rect.top) * scaleY;

  handleClick(mouseX, mouseY, "left");
});

canvas.addEventListener("contextmenu", (e) => {
  e.preventDefault();//prevent default context menu (right click options)
  const rect = canvas.getBoundingClientRect();

  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  const mouseX = (e.clientX - rect.left) * scaleX;
  const mouseY = (e.clientY - rect.top) * scaleY;

  handleClick(mouseX, mouseY, "right");
});

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

  const pixelInTileX = mouseX % 32;
  const pixelInTileY = mouseY % 32;

  const subX = Math.floor(pixelInTileX / 8);
  const subY = Math.floor(pixelInTileY / 8);

  console.log(`palette: ${palette.value}`);
  let data = {x:worldTileX, y:worldTileY, subX:subX, subY:subY, c:Number(palette.value), btn:leftRight};//change c(color) to picker val
  socket.emit('paint', data);
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

//player client side stuff
let playerData = {
  x: null,
  y: null,
  name: null//get from login? don't use this  yet
};

socket.on('playerState', (data)=> {
  playerData.x=data.x;
  playerData.y=data.y;
});


let latestView = null;
let animating = false;
let chunkNeedsRender = false;
socket.on('updateChunk', (data) => {
    console.log("received new chunk");
    //data is map chunk
    //send to another fxn that builds it on the clients canvas element
    latestView = data;
    chunkNeedsRender = true;
    /*
    if (animating===false){
      requestAnimationFrame(updateDraw);
      animating=true;
    }
    */
});

//draw everything here
function updateView(data){
  //console.log("drawing");
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
            ctx.fillStyle = COLOR_PALETTE[subTile[y][x]].name;
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

let lastRender = 0;
const FPS = 10;
const interval = 1000 / FPS;
function updateDraw(now) {
  if (now - lastRender > interval) {
    chunkNeedsRender = false;
    lastRender = now;
    updateView(latestView);
  }
  requestAnimationFrame(updateDraw);
}
requestAnimationFrame(updateDraw);


const COLOR_PALETTE = {
  0: { name: "Black", hex: "#000000" },
  1: { name: "White", hex: "#ffffff" },
  2: { name: "Red", hex: "#ff0000" },
  3: { name: "Green", hex: "#00ff00" },
  4: { name: "Blue", hex: "#0000ff" },
  5: { name: "Yellow", hex: "#ffff00" },
  6: { name: "Magenta", hex: "#ff00ff" },
  7: { name: "Cyan", hex: "#00ffff" },
  8: { name: "Brown", hex: "#804000" },
  9: { name: "Orange", hex: "#ff8000" },
  10: { name: "Purple", hex: "#8000ff" },
  11: { name: "Teal", hex: "#008080" },
  12: { name: "Gray", hex: "#808080" }
};

const palette = document.getElementById("colorSelect");


Object.keys(COLOR_PALETTE).forEach(key => {
  const color = COLOR_PALETTE[key];
  const option = document.createElement("option");
  console.log(key);
  option.value = key;
  option.textContent = color.name;
  palette.appendChild(option);
});

const preview = document.getElementById("colorPreview");
preview.style.backgroundColor = palette.value;

palette.addEventListener("change", () => {
  preview.style.backgroundColor = COLOR_PALETTE[palette.value].hex;
});

/*
//admin only! use only for production, do not deploy this code to server
//however if players are going to build stuff, some of this code
//will probably be useful for user client

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
  //selectedTile = "tree";
  let selectedTile = select.value;
  socket.emit('layTile', selectedTile);
}

function saveMap(){
  socket.emit('saveMap');
}
*/