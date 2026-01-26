
module.exports = {
    "axe": {
    kind: "item",
    id: 1,
    container: "objects",
    collision: false,
    equip: { slot: "hand" }
  },
    "log": {
    kind: "item",
    id: 2,
    container: "objects",
    collision: false
  },
  "pickaxe": {
    kind: "item",
    id: 3,
    container: "objects",
    collision: false,
    equip: { slot: "hand" },
    craft: { log: 5}
  },
   "rock": {
    kind: "item",
    id: 4,
    container: "objects",
    collision: false
  },
  "stoneSword": {
    kind: "item",
    id: 5,
    container: "objects",
    collision: false,
    roof: false,
    equip: { slot: "hand" },
    craft: { log: 1, rock: 2 }
  },
    "woodblock": {
    kind: "item",
    id: 6,
    container: "objects",
    collision: true,
    craft: { log: 10},
    dropChange: "woodblock0"
  },
  "stoneblock":{
    kind: "item",
    id: 7,
    container: "objects",
    collision: true,
    craft: { rock: 10},
    dropChange: "stoneblock0"
  },
      "ironore":{
      "x":272, "y":32,
      kind: "item",
      id: 8,
      container: "objects",
      collision: false,
      smelt: "ironbar"
    },
    "ironbar":{
      "x":272, "y":0,
      kind: "item",
      id: 9,
      container: "objects",
      collision: false,
      craft: {ironore:5},
    },
  "ironsword": {
    kind: "item",
    id: 10,
    container: "objects",
    collision: false,
    roof: false,
    equip: { slot: "hand" },
    craft: { log: 1, ironbar: 2 }
  },
    "ironswordL":{"x":288, "y":976},
    "ironswordR":{"x":272, "y":976},
   "stoneblock0":{
    kind: "resource",
    container: "objects",
    collision: true,
    roof: false,
    drops: { rock: 1 },
    depletesTo: "stoneblock1",
    requiresTool: "pickaxe"
    },
"stoneblock1":{
    kind: "resource",
    container: "objects",
    collision: true,
    roof: false,
    drops: { rock: 1 },
    depletesTo: "stoneblock2",
    requiresTool: "pickaxe"
    },
"stoneblock2":{
    kind: "resource",
    container: "objects",
    collision: true,
    roof: false,
    drops: { rock: 1 },
    depletesTo: "stoneblock3",
    requiresTool: "pickaxe"
    },
"stoneblock3":{
    kind: "resource",
    container: "objects",
    collision: true,
    roof: false,
    drops: { rock: 1 },
    depletesTo: null,
    requiresTool: "pickaxe"
    },
  "grass": {
    kind: "base-tile",
    container: "base-tile",
    collision: false
  },
  "grass2": {},
  "snow": {
    kind: "base-tile",
    container: "base-tile",
    collision: false
  },
  "tree": {
    "collision": true,
  },
  "tree0": {
    kind: "resource",
    container: "objects",
    collision: true,
    drops: { log: 2 },
    depletesTo: "tree1",
    requiresTool: "axe"
  },

  "tree1": {
    kind: "resource",
    container: "objects",
    collision: true, 
    drops: { log: 2 }, 
    depletesTo: "tree2", 
    requiresTool: "axe" 
  },
  "tree2": { 
    kind: "resource", 
    container: "objects", 
    collision: true, 
    drops: { log: 2 }, 
    depletesTo: "tree3", 
    requiresTool: "axe" 
  },
  "tree3": { 
    kind: "resource", 
    container: "objects", 
    collision: true, 
    drops: { log: 2 }, 
    depletesTo: "tree4", 
    requiresTool: "axe" 
  },

  "tree4": {
    kind: "depletedResource",
    container: "depletedResource",
    collision: false,
    regrowsTo: "tree0"
  },
  "oak": {
    "collision": true
  },
 "ironrock0":{
  kind: "resource",
  container: "objects",
  collision: true,
  roof: true,
  drops: { ironore: 1},
  depletesTo: "ironrock1",
  requiresTool: "pickaxe",
      regrowsTo: [
      { name: "rock0", weight:80 },
      { name: "ironrock0", weight: 20 }
    ]
 },
  "ironrock1":{
  kind: "resource",
  container: "objects",
  collision: true,
  roof: true,
  drops: { ironore: 1},
  depletesTo: "ironrock2",
  requiresTool: "pickaxe",
      regrowsTo: [
      { name: "rock0", weight:80 },
      { name: "ironrock0", weight: 20 }
    ]
 },
  "ironrock2":{
  kind: "resource",
  container: "objects",
  collision: true,
  roof: true,
  drops: { ironore: 1},
  depletesTo: "ironrock3",
  requiresTool: "pickaxe",
      regrowsTo: [
      { name: "rock0", weight:80 },
      { name: "ironrock0", weight: 20 }
    ]
 },
  "ironrock3":{
  kind: "resource",
  container: "objects",
  collision: true,
  roof: true,
  drops: { ironore: 1},
  depletesTo: "ironrock4",
  requiresTool: "pickaxe",
      regrowsTo: [
      { name: "rock0", weight:80 },
      { name: "ironrock0", weight: 20 }
    ]
 },
 "ironrock4":{
    kind: "depletedResource",
    container: "depletedResource",
    collision: false,
        regrowsTo: [
      { name: "rock0", weight:80 },
      { name: "ironrock0", weight: 20 }
    ]
 },
 "rock0": {
    kind: "resource",
    container: "objects",
    collision: true,
    roof: true,
    drops: { rock: 2 },
    depletesTo: "rock1",
    requiresTool: "pickaxe",
    regrowsTo: [
      { name: "rock0", weight:80 },
      { name: "ironrock0", weight: 20 }
    ]
  },

  "rock1": { 
    kind: "resource", 
    container: "objects", 
    collision: true, 
    drops: { rock: 2 }, 
    depletesTo: "rock2", 
    requiresTool: "pickaxe",
    regrowsTo: [
      { name: "rock0", weight:80 },
      { name: "ironrock0", weight: 20 }
    ]
  },
  "rock2": { 
    kind: "resource", 
    container: "objects", 
    collision: true, 
    drops: { rock: 2 }, 
    depletesTo: "rock3", 
    requiresTool: "pickaxe",
    regrowsTo: [
      { name: "rock0", weight:80 },
      { name: "ironrock0", weight: 20 }
    ]
  },
  "rock3": { 
    kind: "resource", 
    container: "objects", 
    collision: true, 
    drops: { rock: 2 }, 
    depletesTo: "rock4", 
    requiresTool: "pickaxe",
        regrowsTo: [
      { name: "rock0", weight:80 },
      { name: "ironrock0", weight: 20 }
    ]
  },
  "rock4": {
    kind: "depletedResource",
    container: "depletedResource",
    collision: false,
    regrowsTo: [
      { name: "rock0", weight:80 },
      { name: "ironrock0", weight: 20 }
    ]
  },
  "water": {
    kind: "base-tile",
    container: "base-tile",
    collision: true
  },
  "woodblock0":{
    kind: "resource",
    container: "objects",
    collision: true,
    roof: false,
    drops: { log: 1 },
    depletesTo: "woodblock1",
    requiresTool: "axe"
    },
"woodblock1":{
    kind: "resource",
    container: "objects",
    collision: true,
    roof: false,
    drops: { log: 1 },
    depletesTo: "woodblock2",
    requiresTool: "axe"
    },
"woodblock2":{
    kind: "resource",
    container: "objects",
    collision: true,
    roof: false,
    drops: { log: 1 },
    depletesTo: "woodblock3",
    requiresTool: "axe"
    },
"woodblock3":{
    kind: "resource",
    container: "objects",
    collision: true,
    roof: false,
    drops: { log: 1 },
    depletesTo: null,
    requiresTool: "axe"
    },
  "stump1": {
    'roof': false,
    'type': 'depletedResource',
    'collision': false
  },
  "sand": {
    'roof': false,
    'type': 'base-tile',
    'collision': false
  },
  "woodplate": {
    'roof': true,
    'type': 'base-tile',
    'collision': false
  },
  "craftTable": {
    kind: "interactable",
    'roof': false,
    'type': 'objects',
    'collision': false
  },
    "forge":{
     "x":176, "y":992,
     kind: "interactable",
     container: "objects",
     collision: false
    },
  "abyss": {
    'roof': false,
    'type': 'base-tile',
    'collision': true
  },
  "void": {
    'roof': false,
    'type': 'base-tile',
    'collision': true
  },//just blank space for event tiles (like map exit or dungeon stairs)
  "craftingtable": {
    'roof': false,
    'type': 'objects',
    'collision': false
  },
  "cutGrass": {/*when grass2 gets cut*/ },
  "stoneSwordL": {},
  "stoneSwordR": {},
  "chatDots": {},
  "spiderL": {},
  "heartContainer": {},
  "staminaPot": {},
  "bridge": {},
  "heartPiece": {},
  "switch": {},
  "hookshot": {},
  "hookshotL": {},
  "hookshotR": {},
  "hookshotleft": {},
  "hookshotright": {},
  "hookshotup": {},
  "hookshotdown": {},
  "helpBG": {},
  "container": {},
  "heart": {},
  "babaBase": {},
  "babaRest": {},
  "babaUp": {},
  "babaDown": {},
  "babaLeft": {},
  "babaRight": {},
  "empty-heart": {},
  "ghostR": {},
  "ghostL": {},
  "deadtree": {},
  "snowtree": {},
  "flower1": {},
  "flower2": {},
  "flower3": {},
  "mushroom": {},
  "rupee": {},
  //paths
  "pathHORIZ": {},
  "pathVERT": {},
  "pathTDWN": {},
  "pathTUP": {},
  "pathTRT": {},
  "pathTLT": {},
  "pathCRS": {},
  "pathCRV1": {},
  "pathCRV2": {},
  "pathCRV3": {},
  "pathCRV4": {},
  "grave": {},
  //"stoneblock": {},
  "stump2": {},
  "stump3": {},
  "campfire": {},
  "rain": {},
  "fenceV": {},
  "fenceH": {},
  "boulder": {},
  "rockpile": {},
  "mapsign": {},
  "bed": {},
  "cactus": {},
  "ankh": {},
  "chest": {},
  "stoneplate": {},
  "door": {},
  "door2": {},
  "door3": {},
  "skull": {},
  "table": {},
  "chair": {},
  "sign": {},
  "deskHORIZ": {},
  "deskVERT": {},
  "deskCRV1": {},
  "deskCRV2": {},
  "deskCRV3": {},
  "deskCRV4": {},
  "redx": {},
  "redDownArrow": {},
  "glasspane1": {},
  "cloud": {},
  "axeR": {},
  "axeL": {},
  "pickaxeR": {},
  "pickaxeL": {},
  "statDisp": {},
  "splitlog": {},
  "upArrow": {},
  "downArrow": {},
  "hpIcon": {},
  "string": {},
  "fPoleR": {},
  "fPoleL": {},
  "fPole": {},
  "lootbag": {},
  "dungeonStairs": {},
  "fish": {},
  "portalfish": {},
  "cookedfish": {},
  "bobber": {},
  "chest2": {},
  "web": {},
  "raft": {},
  "sail": {},
  "key": {},
  "coin": {},
  "scroll": {},
  "apple": {},
  "trashcan": {},
  "F": {},
  "C": {},
  "hitOutlineLeft": {},
  "hitOutlineRight": {},
  "hide": {},
  "tunafish": {},
  "cookedtuna": {},
  "leatherArmorL": {},
  "leatherArmorR": {},
  "leatherArmorI": {},
  "brasskey": {},
  "heart": {},
  "speedbootsI": {},
  "speedbootsR": {},
  "speedbootsL": {},
  "UPARROW": {},
  "DOWNARROW": {},
  "palmtree": {},
  "longbow": {},
  "longbowL": {},
  "longbowR": {},
  "knife": {},
  "knifeL": {},
  "knifeR": {},
  "spikein": {},
  "spikeout": {},
  "stairsR": {},
  "hitsplat": {},
  "leftShad": {},
  "upShad": {},
  "rightShad": {},
  "downShad": {},
  "ulShad": {},
  "urShad": {},
  "llShad": {},
  "lrShad": {},
  "arrowup": {},
  "arrowdown": {},
  "arrowleft": {},
  "arrowright": {},
  "arrow": {},
  "pebble": {},
  "whitewave": {},
  "fireballup": {},
  "fireballdown": {},
  "fireballleft": {},
  "fireballright": {},
  "mapExit": {},
  "mobGenerator": {},
  "skelR": {},
  "skelL": {},
  "skelUp": {},
  "skelDown": {},
  "skelHit": {},
  "skelAtt": {},
  "ghostR": {},
  "ghostL": {},
  "ratR": {},
  "ratL": {},
  "spiderR": {},
  "spiderL": {},
  "shopkeepR": {},
  "gnollR": {},
  "gnollL": {},
  "rangeGoblinR": {},
  "rangeGoblinL": {},
  "mageLichR": {},
  "mageLichL": {}
}

