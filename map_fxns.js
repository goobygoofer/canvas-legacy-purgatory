const fs = require('fs');

function save_map(map) {
  var jsonMap = JSON.stringify(map);
  const filePath = 'map_save.json';
  try {
    fs.writeFileSync(filePath, jsonMap);
    console.log('JSON data saved to file successfully.');
  } catch (error) {
    console.error('Error writing JSON data to file:', error);
  }
}

function persist_map(map){
  var jsonMap = JSON.stringify(map);
  const filePath = 'blank_map.json';
  try {
    fs.writeFileSync(filePath, jsonMap);
    console.log('JSON data saved to file successfully.');
  } catch (error) {
    console.error('Error writing JSON data to file:', error);
  }
}

function generate_Chunk(coords){//coords is [x,y], pulled from player x and player y in database
  const chunk = [];
  for (let y = coords[1] - 5; y <= coords[1] + 5; y++) {
    const row = [];
    for (let x = coords[0] - 10; x <= coords[0] + 10; x++) {
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