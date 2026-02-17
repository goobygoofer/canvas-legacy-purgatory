const fs = require('fs');

const files = ['app.js']; // list your files
const funcNames = [];

files.forEach(file => {
  const code = fs.readFileSync(file, 'utf-8');
  const matches = code.match(/function\s+([a-zA-Z0-9_]+)/g);
  if (matches) {
    matches.forEach(m => funcNames.push(m.replace('function ', '')));
  }
});

funcNames.forEach(name => console.log(name));