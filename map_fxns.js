const fs = require('fs');

function save_map(map) {
 persist_map(map);
}

function persist_map(map){
  var rawMap=[];
  for (y in map){
    for (x in map[y]){
      /*
      if (Object.keys(map[y][x].players).length!==0){
        map[y][x].players={};
      }
      */
    }
    rawMap.push(map[y]);
  }
  var jsonMap = JSON.stringify(rawMap);
  const filePath = 'blank_map.json';
  try {
    fs.writeFileSync(filePath, jsonMap);
    console.log('JSON data saved to file successfully.');
  } catch (error) {
    console.error('Error writing JSON data to file:', error);
  }
}

function generate_Chunk(px, py){//coords is [x,y], pulled from player x and player y in database
  const chunk = [];
  for (let y = py - 5; y <= py + 5; y++) {
    const row = [];
    for (let x = px - 10; x <= px + 10; x++) {
      row.push([x, y]);
    }
    chunk.push(row);
  }
  return chunk;
}

module.exports = {
    save: save_map,
    persist: persist_map,
    chunk: generate_Chunk,
}