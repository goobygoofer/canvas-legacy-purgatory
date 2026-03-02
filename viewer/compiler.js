

const spriteSheet = new Image();
spriteSheet.src = 'spritesheet-0.5.18.png';
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');



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

  // new colors added after original palette
  19: { name: "Coral",        hex: "#ff7f50" },
  20: { name: "Olive",        hex: "#808000" },
  21: { name: "Violet",       hex: "#ee82ee" },
  22: { name: "Turquoise",    hex: "#40e0d0" },
  23: { name: "Beige",        hex: "#f5f5dc" }
};

function drawBaseTile(chunk, i, j) {
  const tile = base_tiles[chunk['b-t']];
  if (!tile) return;
  ctx.drawImage(
    spriteSheet,
    tile.x, tile.y, 16, 16,                 // source: 16x16 in spriteSheet
    offsetX + j * TILE_SIZE,                // destination X
    offsetY + i * TILE_SIZE,                // destination Y
    TILE_SIZE,                              // width on canvas
    TILE_SIZE                               // height on canvas
  );
}

function drawPixels(chunk, i, j) {
  const subTile = chunk?.pixels; // 4x4 array
  if (!subTile){
    return;
  }
  for (let y = 0; y < subTile.length; y++) {
    for (let x = 0; x < subTile[y].length; x++) {
      const colorIndex = subTile[y][x];
      if (colorIndex !== -1) {
        ctx.fillStyle = COLOR_PALETTE[colorIndex].hex;

        // each subpixel = 1 px, 4 subpixels per tile = 4x4 tile
        ctx.fillRect(
          offsetX + j * TILE_SIZE + x,   // canvas X
          offsetY + i * TILE_SIZE + y,   // canvas Y
          1,                             // width
          1                              // height
        );
      }
    }
  }
}

function drawObjects(chunk, i, j, z) {
  if (!chunk?.objects) return;
  for (let objKey in chunk.objects) {
    const obj = chunk.objects[objKey];
    const tile = base_tiles[obj.name];
    if (!tile) continue;
    if (obj.name==='diamondrock0'){
      ctx.fillStyle='blue';
      ctx.fillRect(
        offsetX + j * TILE_SIZE,           // dest X
        offsetY + i * TILE_SIZE,           // dest Y
        TILE_SIZE,                         // width 4 px
        TILE_SIZE   
      )
    }
    else if (obj.name==='goldrock0'){
            ctx.fillStyle='yellow';
      ctx.fillRect(
        offsetX + j * TILE_SIZE,           // dest X
        offsetY + i * TILE_SIZE,           // dest Y
        TILE_SIZE,                         // width 4 px
        TILE_SIZE   
      )
    }
    else if (obj.name==='silverrock0'){
            ctx.fillStyle='white';
      ctx.fillRect(
        offsetX + j * TILE_SIZE,           // dest X
        offsetY + i * TILE_SIZE,           // dest Y
        TILE_SIZE,                         // width 4 px
        TILE_SIZE   
      )
    }
    else if (obj.name==='copperrock0'){
            ctx.fillStyle='orange';
      ctx.fillRect(
        offsetX + j * TILE_SIZE,           // dest X
        offsetY + i * TILE_SIZE,           // dest Y
        TILE_SIZE,                         // width 4 px
        TILE_SIZE   
      )
    }
    else {
      ctx.drawImage(
        spriteSheet,
        tile.x, tile.y, 16, 16,            // source 16x16
        offsetX + j * TILE_SIZE,           // dest X
        offsetY + i * TILE_SIZE,           // dest Y
        TILE_SIZE,                         // width 4 px
        TILE_SIZE                          // height 4 px
      );
    }
    if (Object.keys(chunk.objects)[0] === 'rock0' && Number(z) > 0) {

      let baseGray = 112; // 0x70
      let gray = Math.min(255, baseGray + z * 40);

      let hex = gray.toString(16).padStart(2, "0");
      let newColor = "#" + hex + hex + hex;

      ctx.fillStyle = newColor;

      ctx.fillRect(
        j * TILE_SIZE,
        i * TILE_SIZE,
        4,
        4
      );
    }
  }
}

const CANVAS_SIZE = 3200;      // your canvas width/height
const TILE_PIXELS = 16;        // your tile width/height in source spriteSheet
const SUBPIXELS = 4;           // each tile has 4x4 subpixels

const mapWidth  = 800;  // number of tiles horizontally
const mapHeight = 600;     // number of tiles vertically

// total size of the map in “map pixels”
const mapPixelWidth  = mapWidth * TILE_PIXELS;
const mapPixelHeight = mapHeight * TILE_PIXELS;

// scale to fit canvas
const scale = Math.min(
  CANVAS_SIZE / mapPixelWidth,
  CANVAS_SIZE / mapPixelHeight
);

const TILE_SIZE = 4;          // each tile is 4x4 on canvas

// optional offsets to center (not really needed since it fills canvas)
const offsetX = 0;
const offsetY = 0;

function renderMap(){
  for (let i = 0; i < map.length; i++) {
    for (let j = 0; j < map[i].length; j++) {
      const chunk = map[i][j];
      for (let z in chunk){
        let col = chunk[z];
        drawBaseTile(col, i, j);
        drawPixels(col, i, j);
        drawObjects(col, i, j, z);
      }
      
    }
  }
}

function renderTile(x, y){
  /*
  const chunk = map[y][x];
  drawBaseTile(chunk, y, x);
  drawPixels(chunk, y, x);
  drawObjects(chunk, y, x);
  */
}

window.map = null;  // or {} if you prefer

// connect to /viewer namespace
const socket = io("/viewer");

// full map comes from server
socket.on("mapInit", (data) => {
  console.log("Received full map");
  window.map = data;

  // render AFTER map exists
  renderMap();
});

// updates
socket.on("mapUpdate", (change) => {
  if (!window.map) return; // ignore until full map is loaded
  const { x, y, tile } = change;
  window.map[y][x] = tile;
  renderTile(x, y); // partial redraw
});