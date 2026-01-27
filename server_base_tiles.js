
module.exports = {
  //----------------------------ID'd items, in order--------------------------------
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
    craft: { log: 5 }
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
    craft: { log: 10 },
    dropChange: "woodblock0"
  },
  "stoneblock": {
    kind: "item",
    id: 7,
    container: "objects",
    collision: true,
    craft: { rock: 10 },
    dropChange: "stoneblock0"
  },
  "ironore": {
    kind: "item",
    id: 8,
    container: "objects",
    collision: false,
    smelt: "ironbar"
  },
  "ironbar": {
    kind: "item",
    id: 9,
    container: "objects",
    collision: false,
    craft: { ironore: 5 },
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
  "oaklog": {
    kind: "item",
    id: 11,
    container: "objects",
    collision: false,
  },
  "woodplate": {
    kind: 'item',
    id: 12,
    container:"floor",
    collision: false,
    roof: false,
    craft: { log: 5 }
  },
  "stoneplate": {
    kind: 'item',
    id: 13,
    container:'floor',
    collision: false,
    roof:false,
    craft: { rock: 5}
  },
  "woodroof":{
    kind: 'item',
    id: 14,
    container:"roof",
    collision: false,
    roof:true,
    craft: { log: 5}
  },
  "stoneroof": {
    kind: 'item',
    id: 15,
    container:'roof',
    collision: false,
    roof: true,
    craft: { rock: 5}
  },
  "door": {
    kind: 'item',
    id: 16,
    container:'objects',
    collision: true,
    roof: false,
    craft: { ironbar: 2, oaklog: 5},
    owner:null
  },
  "flowerred": {
    kind: 'item',
    id: 17,
    container: 'objects',
    collision: false
  },
  "flowerwhite": {
    kind: 'item',
    id: 18,
    container: 'objects',
    collision: false
  },
  "floweryellow": {
    kind: 'item',
    id: 19,
    container: 'objects',
    collision: false
  },
  "flowercrown":{
    kind: "item",
    id: 20,
    container: "objects",
    collision: false,
    equip: {slot: "head"},
    craft: {'flowerred':1, 'flowerwhite':1, 'floweryellow':1}
  },

  // -----------------------------------resources----------------------------------------
  "tree0": {
    kind: "resource",
    container: "objects",
    collision: true,
    drops: { log: 2 },
    depletesTo: "tree1",
    requiresTool: "axe",
    regrowsTo: [
      { name: "tree0", weight: 9950 },
      { name: "oak0", weight: 50 }
    ]
  },

  "tree1": {
    kind: "resource",
    container: "objects",
    collision: true,
    drops: { log: 2 },
    depletesTo: "tree2",
    requiresTool: "axe",
    regrowsTo: [
      { name: "tree0", weight: 9950 },
      { name: "oak0", weight: 50 }
    ]
  },
  "tree2": {
    kind: "resource",
    container: "objects",
    collision: true,
    drops: { log: 2 },
    depletesTo: "tree3",
    requiresTool: "axe",
    regrowsTo: [
      { name: "tree0", weight: 9950 },
      { name: "oak0", weight: 50 }
    ]

  },
  "tree3": {
    kind: "resource",
    container: "objects",
    collision: true,
    drops: { log: 2 },
    depletesTo: "tree4",
    requiresTool: "axe",
    regrowsTo: [
      { name: "tree0", weight: 9950 },
      { name: "oak0", weight: 50 }
    ]
  },

  "tree4": {
    kind: "depletedResource",
    container: "depletedResource",
    collision: false,
    regrowsTo: [
      { name: "tree0", weight: 9950 },
      { name: "oak0", weight: 50 }
    ]
  },
  "stoneblock0": {
    kind: "resource",
    container: "objects",
    collision: true,
    roof: false,
    drops: { rock: 1 },
    depletesTo: "stoneblock1",
    requiresTool: "pickaxe"
  },
  "stoneblock1": {
    kind: "resource",
    container: "objects",
    collision: true,
    roof: false,
    drops: { rock: 1 },
    depletesTo: "stoneblock2",
    requiresTool: "pickaxe"
  },
  "stoneblock2": {
    kind: "resource",
    container: "objects",
    collision: true,
    roof: false,
    drops: { rock: 1 },
    depletesTo: "stoneblock3",
    requiresTool: "pickaxe"
  },
  "stoneblock3": {
    kind: "resource",
    container: "objects",
    collision: true,
    roof: false,
    drops: { rock: 1 },
    depletesTo: null,
    requiresTool: "pickaxe"
  },
  "ironrock0": {
    kind: "resource",
    container: "objects",
    collision: true,
    roof: true,
    drops: { ironore: 1 },
    depletesTo: "ironrock1",
    requiresTool: "pickaxe",
    regrowsTo: [
      { name: "rock0", weight: 80 },
      { name: "ironrock0", weight: 20 }
    ]
  },
  "ironrock1": {
    kind: "resource",
    container: "objects",
    collision: true,
    roof: true,
    drops: { ironore: 1 },
    depletesTo: "ironrock2",
    requiresTool: "pickaxe",
    regrowsTo: [
      { name: "rock0", weight: 80 },
      { name: "ironrock0", weight: 20 }
    ]
  },
  "ironrock2": {
    kind: "resource",
    container: "objects",
    collision: true,
    roof: true,
    drops: { ironore: 1 },
    depletesTo: "ironrock3",
    requiresTool: "pickaxe",
    regrowsTo: [
      { name: "rock0", weight: 80 },
      { name: "ironrock0", weight: 20 }
    ]
  },
  "ironrock3": {
    kind: "resource",
    container: "objects",
    collision: true,
    roof: true,
    drops: { ironore: 1 },
    depletesTo: "ironrock4",
    requiresTool: "pickaxe",
    regrowsTo: [
      { name: "rock0", weight: 80 },
      { name: "ironrock0", weight: 20 }
    ]
  },
  "ironrock4": {
    kind: "depletedResource",
    container: "depletedResource",
    collision: false,
    regrowsTo: [
      { name: "rock0", weight: 80 },
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
      { name: "rock0", weight: 80 },
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
      { name: "rock0", weight: 80 },
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
      { name: "rock0", weight: 80 },
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
      { name: "rock0", weight: 80 },
      { name: "ironrock0", weight: 20 }
    ]
  },
  "rock4": {
    kind: "depletedResource",
    container: "depletedResource",
    collision: false,
    regrowsTo: [
      { name: "rock0", weight: 80 },
      { name: "ironrock0", weight: 20 }
    ]
  },
  "woodblock0": {
    kind: "resource",
    container: "objects",
    collision: true,
    roof: false,
    drops: { log: 1 },
    depletesTo: "woodblock1",
    requiresTool: "axe"
  },
  "woodblock1": {
    kind: "resource",
    container: "objects",
    collision: true,
    roof: false,
    drops: { log: 1 },
    depletesTo: "woodblock2",
    requiresTool: "axe"
  },
  "woodblock2": {
    kind: "resource",
    container: "objects",
    collision: true,
    roof: false,
    drops: { log: 1 },
    depletesTo: "woodblock3",
    requiresTool: "axe"
  },
  "woodblock3": {
    kind: "resource",
    container: "objects",
    collision: true,
    roof: false,
    drops: { log: 1 },
    depletesTo: null,
    requiresTool: "axe"
  },
  "stump1": {
    kind: "depletedResource",
    container: "depletedResource",
    collision: false,
    regrowsTo: [
      { name: "tree0", weight: 80 },
      { name: "oak0", weight: 20 }
    ]
  },
  "oak0": {
    kind: "resource",
    container: "objects",
    collision: true,
    drops: { oaklog: 1 },
    depletesTo: "oak1",
    requiresTool: "axe",
    regrowsTo: [
      { name: "tree0", weight: 9950 },
      { name: "oak0", weight: 50 }
    ]
  },
  "oak1": {
    kind: "resource",
    container: "objects",
    collision: true,
    drops: { oaklog: 1 },
    depletesTo: "oak2",
    requiresTool: "axe"
    ,
    regrowsTo: [
      { name: "tree0", weight: 9950 },
      { name: "oak0", weight: 50 }
    ]
  },
  "oak2": {
    kind: "resource",
    container: "objects",
    collision: true,
    drops: { oaklog: 1 },
    depletesTo: "oak3",
    requiresTool: "axe"
    ,
    regrowsTo: [
      { name: "tree0", weight: 9950 },
      { name: "oak0", weight: 50 }
    ]
  },
  "oak3": {
    kind: "resource",
    container: "objects",
    collision: true,
    drops: { oaklog: 1 },
    depletesTo: "tree4",
    requiresTool: "axe"
    ,
    regrowsTo: [
      { name: "tree0", weight: 9950 },
      { name: "oak0", weight: 50 }
    ]
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
  "oak": {
    "collision": true
  },
  "water": {
    kind: "base-tile",
    container: "base-tile",
    collision: true
  },
  "sand": {
    kind: "base-tile",
    container: "base-tile",
    collision:false
  },
  "rockroof": {
    kind: 'base-tile',
    container:'roof',
    collision: false,
    roof: true,
  },
  "craftTable": {
    kind: "interactable",
    'roof': false,
    'collision': false,
    'container':"objects",
  },
  "forge": {
    kind: "interactable",
    container: "objects",
    collision: false,
    'roof':false,
  },
  "bankchest": {
    kind: "interactable",
    container: "objects",
    collision: false,
    roof: false
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
    "flowercrownL":{
    "x":192, "y":1120
  },
  "flowercrownR":{
    "x":176,"y":1120
  },
    //paths
  "pathHORIZ": {
    kind: 'base-tile',
    container:'floor',
    'collision': false
  },
  "pathVERT": {
    kind: 'base-tile',
    container:'floor',
    'collision': false
  },
  "pathTDWN": {
    kind: 'base-tile',
    container:'floor',
    'collision': false
  },
  "pathTUP": {
    kind: 'base-tile',
    container:'floor',
    'collision': false
  },
  "pathTRT": {
    kind: 'base-tile',
    container:'floor',
    'collision': false
  },
  "pathTLT": {
    kind: 'base-tile',
    container:'floor',
    'collision': false
  },
  "pathCRS": {
    kind: 'base-tile',
    container:'floor',
    'collision': false
  },
  "pathCRV1": {
    kind: 'base-tile',
    container:'floor',
    'collision': false
  },
  "pathCRV2": {
    kind: 'base-tile',
    container:'floor',
    'collision': false
  },
  "pathCRV3": {
    kind: 'base-tile',
    container:'floor',
    'collision': false
  },
  "pathCRV4": {
    kind: 'base-tile',
    container:'floor',
    'collision': false
  },
    "bridge": {
    kind: "base-tile",
    container: "base-tile",
    collision:false
  },
  "cutGrass": {/*when grass2 gets cut*/ },
  "stoneSwordL": {},
  "stoneSwordR": {},
  "chatDots": {},
  "spiderL": {},
  "heartContainer": {},
  "staminaPot": {},
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
  "mushroom": {},
  "rupee": {},
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
  //"door2": {},
  //"door3": {},
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

