
base_tiles = {
  "axe": {
    "x": 64, "y": 64,
    kind: "item",
    id: 1,
    container: "objects",
    collision: false,
    equip: { slot: "hand" }
  },
  "log": {
    "x": 96, "y": 0,
    kind: "item",
    id: 2,
    container: "objects",
    collision: false
  },
  "pickaxe": {
    "x": 32, "y": 64,
    kind: "item",
    id: 3,
    container: "objects",
    collision: false,
    equip: { slot: "hand" },
    craft: { log: 5 }
  },
  "rock": {
    "x": 256, "y": 0,
    kind: "item",
    id: 4,
    container: "objects",
    collision: false
  },
  "stoneSword": {
    "x": 272, "y": 16,
    kind: "item",
    id: 5,
    container: "objects",
    collision: false,
    roof: false,
    equip: { slot: "hand" },
    craft: { log: 1, rock: 2 }
  },
  "woodblock": {
    "x": 112, "y": 0,
    kind: "item",
    id: 6,
    container: "objects",
    collision: true,
    craft: { log: 10 }
  },
  "stoneblock": {
    "x": 288, "y": 0,
    kind: "item",
    id: 7,
    container: "objects",
    collision: true,
    craft: { rock: 10 },
    dropChange: "stoneblock0"
  },
  "ironore": {
    "x": 272, "y": 32,
    kind: "item",
    id: 8,
    container: "objects",
    collision: false,
    smelt: "ironbar"
  },
  "ironbar": {
    "x": 272, "y": 0,
    kind: "item",
    id: 9,
    container: "objects",
    collision: false,
    craft: { ironore: 5 }
  },
  "ironsword": {
    "x": 304, "y": 976,
    kind: "item",
    id: 10,
    container: "objects",
    collision: false,
    craft: { ironbar: 4, log: 2 },
  },
  "oaklog": {
    "x": 192, "y": 1104,
    id: 11
  },
  "woodplate": {
    "x": 112,
    "y": 80,
    id: 12,
    craft: { log: 5 }
  },
  "stoneplate": {
    "x": 128, "y": 80,
    id: 13,
    craft: { rock: 5 }
  },
  "woodroof": {
    "x": 112,
    "y": 80,
    id: 14,
    craft: { log: 5 }
  },
  "stoneroof": {
    "x": 128, "y": 80,
    id: 15,
    craft: { rock: 5 }
  },
  "door": {
    "x": 288, "y": 96,
    id: 16,
    craft: { ironbar: 2, oaklog: 5 }
  },
  "flowerred": {
    "x": 16, "y": 48,
    id:17
  },//
  "flowerwhite": {
    "x": 64, "y": 48,
    id:18
  },//
  "floweryellow": {
    "x": 112, "y": 48,
    id:19
  },//
  "flowercrown":{
    "x":208,"y":1120,
    id: 20,
    craft: {'flowerred':1, 'flowerwhite':1, 'floweryellow':1}
  },
  "coin": {
    "x": 176, "y": 240,
    id: 21
  },
  "apple": {
    "x": 304, "y": 160,
    id: 22
  },
  "hide": {
    "x": 224, "y": 272,
    id: 23
  },
  "goblinsword": {
    "x":64, "y":656,
    id: 24
  },
  "orangedust": {
    "x":32,"y":256,
    id: 25
  },
  "bluedust": {
    "x":48,"y":256,    
    id: 26
  },
  "yellowdust": {
    "x":64,"y":256,    
    id: 27
  },
  "healthpotion": {
    "x":256,"y":896,
    id: 28,
    craft: { orangedust: 10 }
  },
  "leatherarmor": {
    "x":272,"y":272,
    id: 29,
    craft: { hide: 5 }
  },
  "leatherhelmet": {
    "x":176,"y":352,
    id: 30,
    craft: { hide: 4 },
  },
  "ironarmor": {
    "x":286,"y":208,
    id:31,
    craft: { hide: 2, ironbar: 5 },
  },
  "ironhelmet": {
    "x":160,"y":352,
    id:32,
    craft: { hide: 1, ironbar: 2 },
  },
  "bucket": {
    "x":304,"y":16,
    id:33,
    craft: {log: 3, hide: 1, ironbar: 1}
  },
  "townteleport": {
    "x":192,"y":496,
    id: 34,
    craft: { hide: 1, bluedust: 50 },
  },
  "ironarmorL":{
    "x":145,"y":272
  },
  "ironarmorR":{
    "x":95,"y":272
  },
  "ironhelmetL":{
    "x":49,"y":368
  },
  "ironhelmetR":{
    "x":31,"y":368
  },
  "leatherhelmetL": {
    "x":81,"y":368,
  },
  "leatherhelmetR": {
    "x":63,"y":368,
  },
    "leatherarmorL": {
    "x":209,"y":272,
  },
    "leatherarmorR": {
    "x":159,"y":272,
  },
  "goblinswordL": {
    "x":80, "y":656
  },
  "goblinswordR": {
    "x":80,"y":640
  },
  "flowercrownL":{
    "x":192, "y":1120
  },
  "flowercrownR":{
    "x":176,"y":1120
  },
  "rockroof":{
    "x": 176, "y": 0
  },
  "ironswordL": { "x": 288, "y": 976 },
  "ironswordR": { "x": 272, "y": 976 },
  "forge": {
    "x": 176, "y": 992,
    kind: "interactable",
    container: "objects",
    collision: false
  },
  "stoneblock0": {
    "x": 288, "y": 0,
    kind: "resource",
    container: "objects",
    collision: true,
    roof: false,
    drops: { rock: 1 },
    depletesTo: "stoneblock1",
    requiresTool: "pickaxe"
  },
  "stoneblock1": {
    "x": 112, "y": 64,
    kind: "resource",
    container: "objects",
    collision: true,
    roof: false,
    drops: { rock: 1 },
    depletesTo: "stoneblock2",
    requiresTool: "pickaxe"
  },
  "stoneblock2": {
    "x": 128, "y": 64,
    kind: "resource",
    container: "objects",
    collision: true,
    roof: false,
    drops: { rock: 1 },
    depletesTo: "stoneblock3",
    requiresTool: "pickaxe"
  },
  "stoneblock3": {
    "x": 144, "y": 64,
    kind: "resource",
    container: "objects",
    collision: true,
    roof: false,
    drops: { rock: 1 },
    depletesTo: null,
    requiresTool: "pickaxe"
  },
  "oak0": {
    "x": 128, "y": 1104
  },
  "oak1": {
    "x": 144, "y": 1104
  },
  "oak2": {
    "x": 160, "y": 1104
  },
  "oak3": {
    "x": 176, "y": 1104
  },
  //"stoneSword":{"x": 272, "y": 16, 'roof':false, 'type':'objects', 'collision':false},
  "stoneSwordL": { "x": 192, "y": 192 },
  "stoneSwordR": { "x": 80, "y": 192 },
  "chatDots": { "x": 80, "y": 626 },
  "safeTile": {
    "x":256, "y":1072,
    kind: "safeTile",
    container: "safeTile",
    collision:false
  },
  "craftTools":{
    "x":64, "y":672
  },
  "leaderboard": {
    "x":144, "y":336
  },
  "murderL":{
    "x":113,"y":176
  },
  "murderR":{
    "x":63, "y":176
  },
  "spiderL": { "x": 112, "y": 240 },
  "heartContainer": { "x": 128, "y": 528 },
  "staminaPot": { "x": 64, "y": 1072 },
  "bridge": { "x": 0, "y": 80 },
  "heartPiece": { "x": 224, "y": 512 },
  "switch": { "x": 304, "y": 576 },
  "hookshot": { "x": 80, "y": 192 },
  "hookshotL": { "x": 96, "y": 192 },
  "hookshotR": { "x": 64, "y": 192 },//L and R are holding, "y":rest are chain and act like arrows I guess ??
  "hookshotleft": { "x": 0, "y": 192 },
  "hookshotright": { "x": 16, "y": 192 },
  "hookshotup": { "x": 32, "y": 192 },
  "hookshotdown": { "x": 48, "y": 192 },
  "helpBG": { "x": 288, "y": 992 },
  "container": { "x": 160, "y": 1232 },
  "heart": { "x": 144, "y": 528 },
  "babaBase": { "x": 0, "y": 272 },
  "babaRest": { "x": 16, "y": 272 },
  "babaUp": { "x": 32, "y": 272 },
  "babaDown": { "x": 48, "y": 272 },
  "babaLeft": { "x": 64, "y": 272 },
  "babaRight": { "x": 80, "y": 272 },
  "empty-heart": { "x": 160, "y": 528 },
  "ghostR": { "x": 48, "y": 80 },//
  "ghostL": { "x": 64, "y": 96 },
  "grass": { "x": 0, "y": 0, 'roof': false, 'type': 'base-tile', 'collision': false },//plain, "y":green grass
  "grass2": { "x": 160, "y": 608 },
  "cutGrass": { "x": 128, "y": 48 },//when grass2 gets cut
  "snow": { "x": 208, "y": 528, 'roof': false, 'type': 'base-tile', 'collision': false },//
  "tree": {//deprecated
    "x": 16,
    "y": 0,
    "collision": true,
  },
  "tree0": {
    "x": 16,
    "y": 0,
    "collision": true,
    'type': 'objects',
  },
  "tree1": {
    "x": 32,
    "y": 0,
    "collision": true,
    'type': 'objects'
  },
  "tree2": {
    "x": 48,
    "y": 0,
    "collision": true,
    'type': 'objects'
  },
  "tree3": {
    "x": 64,
    "y": 0,
    "collision": true,
    'type': 'objects'
  },
  "tree4": {//same as stump1
    "x": 80,
    "y": 0,
    "collision": false,
    'type': 'depletedResource'
  },
  "ironrock0": {
    "x": 176, "y": 0,
    kind: "resource",
    container: "objects",
    collision: true,
    roof: true,
    drops: { ironore: 1 },
    depletesTo: "ironrock1",
    requiresTool: "pickaxe"
  },
  "ironrock1": {
    "x": 224, "y": 992,
    kind: "resource",
    container: "objects",
    collision: true,
    roof: true,
    drops: { ironore: 1 },
    depletesTo: "ironrock2",
    requiresTool: "pickaxe"
  },
  "ironrock2": {
    "x": 240, "y": 992,
    kind: "resource",
    container: "objects",
    collision: true,
    roof: true,
    drops: { ironore: 1 },
    depletesTo: "ironrock3",
    requiresTool: "pickaxe"
  },
  "ironrock3": {
    "x": 256, "y": 992,
    kind: "resource",
    container: "objects",
    collision: true,
    roof: true,
    drops: { ironore: 1 },
    depletesTo: "ironrock4",
    requiresTool: "pickaxe"
  },
  "ironrock4": {
    "x": 272, "y": 992,
    kind: "depletedResource",
    container: "depletedResource",
    collision: false,
    regrowsTo: "rock0"
  },
  "oak": { "x": 128, "y": 1104, "collision": true },//
  "deadtree": { "x": 48, "y": 464 },//
  "snowtree": { "x": 176, "y": 544 },//
  "rock0": { "x": 176, "y": 0, "collision": true, 'roof': true, 'type': 'objects' },//
  "rock1": { "x": 192, "y": 0, "collision": true, 'roof': false, 'type': 'objects' },//
  "rock2": { "x": 208, "y": 0, "collision": true, 'roof': false, 'type': 'objects' },//
  "rock3": { "x": 224, "y": 0, "collision": true, 'roof': false, 'type': 'objects' },//
  "rock4": { "x": 240, "y": 0, "collision": false, 'roof': false, 'type': 'depletedResource' },//
  //"rock":{"x":256, "y":0, "collision":false},//
  "water": { "x": 0, "y": 48, "collision": true, 'roof': false, 'type': 'base-tile' },//
  "mushroomL": { "x": 80, "y": 256 },//
  "mushroomR": { "x": 80, "y": 256 },//
  "rupee": { "x": 64, "y": 800 },//need to change this sprite to look more like a rupee
  //paths
  "pathHORIZ": { "x": 0, "y": 544 },//
  "pathVERT": { "x": 16, "y": 544 },//
  "pathTDWN": { "x": 32, "y": 544 },//
  "pathTUP": { "x": 48, "y": 544 },//
  "pathTRT": { "x": 64, "y": 544 },//
  "pathTLT": { "x": 80, "y": 544 },//
  "pathCRS": { "x": 96, "y": 544 },//
  "pathCRV1": { "x": 112, "y": 544 },//
  "pathCRV2": { "x": 128, "y": 544 },//
  "pathCRV3": { "x": 144, "y": 544 },//
  "pathCRV4": { "x": 160, "y": 544 },//
  //stuff
  "grave": { "x": 32, "y": 160 },//
  //"stoneblock":{"x":288, "y":0},//
  /*
  "woodblock":{
    "x":112, 
    "y":0,
  },
  */
  "woodblock0": {
    "x": 112,
    "y": 0
  },
  "woodblock1": {
    "x": 128,
    "y": 0
  },
  "woodblock2": {
    "x": 144,
    "y": 0
  },
  "woodblock3": {
    "x": 160,
    "y": 0
  },
  "stump1": { "x": 192, "y": 448, 'roof': false, 'type': 'depletedResource', 'collision': false },
  "stump2": { "x": 64, "y": 1120 },
  "stump3": { "x": 80, "y": 1120 },
  "campfire": { "x": 32, "y": 384 },//
  "rain": { "x": 144, "y": 432 },//
  "fenceV": { "x": 0, "y": 160 },
  "fenceH": { "x": 16, "y": 160 },
  "sand": { "x": 16, "y": 64, 'roof': false, 'type': 'base-tile', 'collision': false },
  "boulder": { "x": 144, "y": 1232 },
  "rockpile": { "x": 304, "y": 1072 },
  "mapsign": { "x": 16, "y": 176 },
  "bed": { "x": 128, "y": 112 },
  "cactus": { "x": 160, "y": 48 },
  "ankh": { "x": 128, "y": 96 },
  "bankchest": { "x": 32, "y": 128 },
  "door2": { "x": 192, "y": 816 },
  "door3": { "x": 32, "y": 848 },
  "skull": { "x": 304, "y": 1024 },
  "table": { "x": 64, "y": 352 },
  "chair": { "x": 80, "y": 352 },
  "sign": { "x": 80, "y": 512 },
  "deskHORIZ": { "x": 112, "y": 128 },
  "deskVERT": { "x": 0, "y": 144 },
  "deskCRV1": { "x": 16, "y": 144 },
  "deskCRV2": { "x": 32, "y": 144 },
  "deskCRV3": { "x": 96, "y": 1264 },
  "deskCRV4": { "x": 112, "y": 1264 },
  "redx": { "x": 288, "y": 751 },//this one was weird
  "redDownArrow": { "x": 96, "y": 640 },
  "glasspane1": { "x": 160, "y": 560 },
  "cloud": { "x": 240, "y": 1264 },
  "axeR": { "x": 0, "y": 192 },
  "axeL": { "x": 272, "y": 192 },
  //"axe":{"x":64, "y":64, 'roof':false, 'type':'objects', 'collision':false},
  "pickaxeR": { "x": 16, "y": 192 },
  "pickaxeL": { "x": 256, "y": 192 },
  //"pickaxe":{"x": 32, "y": 64, 'roof':false, 'type':'objects', 'collision':false},
  "statDisp": { "x": 80, "y": 624 },
  //"log":{"x":96, "y":0, 'roof':false, 'type':'objects', 'collision':false},
  "splitlog": { "x": 96, "y": 1120 },
  "upArrow": { "x": 80, "y": 975 },
  "downArrow": { "x": 96, "y": 975 },
  "hpIcon": { "x": 160, "y": 832 },
  "string": { "x": 80, "y": 240 },//probabl"y" another objects like logs where no actual objects (like A"x"e), "y":just inv obj and sprite obj
  "fPoleR": { "x": 0, "y": 496 },
  "fPoleL": { "x": 16, "y": 495 },
  "fPole": { "x": 288, "y": 480 },
  "craftTable": { "x": 192, "y": 528, 'roof': false, 'type': 'objects', 'collision': false },//just this for now as a click point
  "lootbag": { "x": 192, "y": 240 },
  "abyss": { "x": 176, "y": 32, 'roof': false, 'type': 'base-tile', 'collision': true },
  "void": { "x": 240, "y": 1232, 'roof': false, 'type': 'base-tile', 'collision': true },//just blank space for event tiles (like map e"x"it or dungeon stairs)
  "dungeonStairs": { "x": 0, "y": 352 },
  "fish": { "x": 256, "y": 480 },
  "portalfish": { "x": 224, "y": 480 },
  "cookedfish": { "x": 272, "y": 480 },
  "bobber": { "x": 304, "y": 480 },
  "chest2": { "x": 240, "y": 816 },
  "web": { "x": 208, "y": 400 },
  "raft": { "x": 128, "y": 1264 },
  "sail": { "x": 144, "y": 1264 },//draw raft > pla"y"er > sail
  "key": { "x": 16, "y": 848 },
  "craftingtable": { "x": 192, "y": 528, 'roof': false, 'type': 'objects', 'collision': false },
  "scroll": { "x": 160, "y": 1264 },
  "trashcan": { "x": 128, "y": 752 },
  //letters here
  "F": { "x": 80, "y": 768 },
  "C": { "x": 32, "y": 768 },
  //end letters
  "hitOutlineLeft": { "x": 112, "y": 176 },
  "hitOutlineRight": { "x": 62, "y": 176 },
  "tunafish": { "x": 240, "y": 480 },
  "cookedtuna": { "x": 64, "y": 496 },
  "leatherArmorL": { "x": 159, "y": 272 },
  "leatherArmorR": { "x": 209, "y": 272 },
  "leatherArmorI": { "x": 288, "y": 224 },
  "brasskey": { "x": 176, "y": 1264 },
  "heart": { "x": 144, "y": 528 },
  "speedbootsI": { "x": 144, "y": 448 },
  "speedbootsR": { "x": 160, "y": 448 },//might have to switch/tweak R/L or offset
  "speedbootsL": { "x": 160, "y": 432 },
  "UPARROW": { "x": 208, "y": 1264 },
  "DOWNARROW": { "x": 192, "y": 1264 },
  "palmtree": { "x": 224, "y": 1264 },
  "longbow": { "x": 32, "y": 240 },
  "longbowL": { "x": 144, "y": 240 },
  "longbowR": { "x": 128, "y": 240 },
  "knife": { "x": 288, "y": 432 },
  "knifeL": { "x": 304, "y": 464 },
  "knifeR": { "x": 304, "y": 432 },
  "spikein": { "x": 0, "y": 864 },
  "spikeout": { "x": 0, "y": 848 },
  "stairsR": { "x": 32, "y": 352 },
  "hitsplat": { "x": 256, "y": 1264 },
  //shadows
  "leftShad": { "x": 288, "y": 320 },
  "upShad": { "x": 304, "y": 320 },
  "rightShad": { "x": 288, "y": 336 },
  "downShad": { "x": 304, "y": 336 },
  "ulShad": { "x": 288, "y": 352 },
  "urShad": { "x": 304, "y": 352 },
  "llShad": { "x": 288, "y": 369 },
  "lrShad": { "x": 304, "y": 368 },
  //projectiles -- all these have up down left right
  "arrowup": { "x": 208, "y": 240 },
  "arrowdown": { "x": 224, "y": 240 },
  "arrowleft": { "x": 240, "y": 240 },
  "arrowright": { "x": 256, "y": 240 },
  "arrow": { "x": 48, "y": 1216 },
  "pebble": { "x": 208, "y": 576 },
  "whitewave": { "x": 144, "y": 736 },
  "fireballup": { "x": 96, "y": 256 },
  "fireballdown": { "x": 112, "y": 256 },
  "fireballleft": { "x": 128, "y": 256 },
  "fireballright": { "x": 144, "y": 256 },
  "mapExit": { "x": 240, "y": 1232 },
  "mobGenerator": { "x": 240, "y": 1232 },
  "skeletonR": { "x": 128, "y": 16 },///ma"y" need to remove from here
  "skeletonL": { "x": 128, "y": 32 },
  "skelUp": { "x": 144, "y": 16 },
  "skelDown": { "x": 144, "y": 32 },
  "skelHit": { "x": 144, "y": 64 },
  "skelAtt": { "x": 144, "y": 48 },
  "ghostR": { "x": 48, "y": 80 },//ghost facing right coords
  "ghostL": { "x": 64, "y": 96 },//ghost facing left coords
  "ratR": { "x": 112, "y": 144 },
  "ratL": { "x": 192, "y": 128 },
  "spiderR": { "x": 96, "y": 240 },
  "spiderL": { "x": 112, "y": 240 },
  "shopkeepR": { "x": 16, "y": 128 },//no shopkeepL "y"et
  "gnollR": { "x": 224, "y": 576 },
  "gnollL": { "x": 240, "y": 576 },
  "rangeGoblinR": { "x": 80, "y": 336 },
  "rangeGoblinL": { "x": 96, "y": 336 },
  "mageLichR": { "x": 80, "y": 160, "collision": true },
  "mageLichL": { "x": 64, "y": 160, "collision": true },//to here
  "goblinR": {
    "x":80,"y":16
  },
  "goblinL": {
    "x":80,"y":32
  }
}

