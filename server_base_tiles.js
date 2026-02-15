
module.exports = {
  //----------------------------ID'd items, in order--------------------------------
  "axe": {
    kind: "item",
    id: 1,
    container: "objects",
    collision: false,
    equip: { slot: "hand" },
    attack: 0
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
    craft: { log: 5 },
    attack: 0
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
    craft: { log: 1, rock: 2 },
    attack: 5,//may need to tweak these
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
    smelt: { ironore: 5 },
  },
  "ironsword": {
    kind: "item",
    id: 10,
    container: "objects",
    collision: false,
    roof: false,
    equip: { slot: "hand" },
    craft: { log: 1, ironbar: 2 },
    attack: 7
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
    craft: {'flowerred':1, 'flowerwhite':1, 'floweryellow':1},
    defense: 1
  },
  "coin": {
    kind: "item",
    id: 21,
    container: "objects",
    collision: false
  },
  "apple": {
      kind: "item",
      id: 22,
      container: "objects",
      collision: false,
      hp: 5,
      time: 2000,
      consume: true
    },
  "hide": {
    kind: "item",
    id: 23,
    container: "objects",
    collision: false,
  },
  "goblinsword": {
    kind: "item",
    id: 24,
    container: "objects",
    collision: false,
    roof: false,
    equip: { slot: "hand" },
    attack: 30
  },
  "orangedust": {
    kind: "item",
    id: 25,
    container: "objects",
    collision: false
  },
  "bluedust": {
    kind: "item",
    id: 26,
    container: "objects",
    collision: false
  },
  "yellowdust": {
    kind: "item",
    id: 27,
    container: "objects",
    collision: false
  },
  "healthpotion":{
    kind: "item",
    id: 28,
    container: "objects",
    collision:false,
    hp: 25,
    time: 1000,
    consume: true,
    craft: { orangedust: 10 }
  },
  "leatherarmor": {
    kind: "item",
    id: 29,
    container: "objects",
    collision: false,
    roof: false,
    equip: { slot: "body" },
    craft: { hide: 5 },
    defense: 3//may need to tweak these
  },
  "leatherhelmet": {
    kind: "item",
    id: 30,
    container: "objects",
    collision: false,
    roof: false,
    equip: { slot: "head" },
    craft: { hide: 4 },
    defense: 2
  },
  "ironarmor": {
    kind: "item",
    id:31,
    container:"objects",
    collision: false,
    roof: false,
    equip: { slot: "body" },
    craft: { hide: 2, ironbar: 5 },
    defense: 5
  },
  "ironhelmet": {
    kind: "item",
    id:32,
    container:"objects",
    collision: false,
    roof: false,
    equip: { slot: "head" },
    craft: { hide: 1, ironbar: 2 },
    defense: 3
  },
  "bucket": {
    kind: "item",
    id:33,
    container:"objects",
    collision: false,
    craft: {log: 3, hide: 1, ironbar: 1}
  },
  "townteleport": {
    kind: "item",
    id: 34,
    container: "objects",
    collision: false,
    craft: { hide: 1, bluedust: 50 },
    consume: true,
    teleport: true
  },
  "speedboots": {
    kind: "item",
    id: 35,
    container: "objects",
    collision: false,
    craft: { hide: 4, bluedust: 100000 },
    equip: {slot: "feet"},
    defense: 1,
    speed: 115
  },
  "arrow": {
    kind: "item",
    id: 36,
    container: "objects",
    collision: false,
    craft: { log: 1, ironbar: 1 },
    craftAmount: 12,
    equip: { slot: "quiver" },
    attack: 10
  },
  "bow":{
    kind: "item",
    id: 37,
    container: "objects",
    collision: false,
    craft: { log: 1, hide: 1, string: 1 },
    equip: { slot: "hand" },
    attack: 1
  },
  "string": { 
    kind: "item",
    id: 38,
    container: "objects",
    collision: false
  },
  "fishingpole": {
    kind: "item",
    id: 39,
    container: "objects",
    collision: false,
    craft: { log: 1, hide: 1, string: 1, ironbar: 1 },
    equip: { slot: "hand" },
    attack: 0//lol
  },
  "cod":{
    kind: "item",
    id: 40,
    container: "objects",
    collision: false,
    xp: 5
  },
  "goldfish":{
    kind: "item",
    id: 41,
    container: "objects",
    collision: false,
    xp: 8
  },
  "redfish":{
    kind: "item",
    id: 42,
    container: "objects",
    collision: false,
    xp: 15
  },
  "arrowfire": {
    kind: "item",
    id: 43,
    container: "objects",
    collision: false,
    craft: { log: 1, ironbar: 1, yellowdust: 100 },
    craftAmount: 1,
    equip: { slot: "quiver" },
    attack: 12
  },
  "fishingspot":{
    container: "objects",
    collision: false
  },
  "lootbag": {
      kind: "lootbag",
      container: "objects",
      collision: false,
      items: {}
      //mobs drop these with random items
      //player drops all inventory on death
      //{id:1, amt:1} etc
  },
  "web": {
    attack: 5
  },
  "campfire1": {
    container: "objects",
    collision: true
  },
  // -----------------------------------resources----------------------------------------
  "tree0": {
    kind: "resource",
    container: "objects",
    collision: true,
    drops: { log: 1 },
    rareDrop: { apple: 1 },
    rarity: 50,//every 50 trees by chance
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
    drops: { log: 1 },
    rareDrop: { apple: 1 },
    rarity: 50,
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
    drops: { log: 1 },
    rareDrop: { apple: 1 },
    rarity: 50,
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
    drops: { log: 1 },
    rareDrop: { apple: 1 },
    rarity: 50,
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
    drops: { rock: 1 },
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
    drops: { rock: 1 },
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
    drops: { rock: 1 },
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
    drops: { rock: 1 },
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
    kind: "b-t",
    container: "b-t",
    collision: false
  },
  "grass2": {},
  "snow": {
    kind: "b-t",
    container: "b-t",
    collision: false
  },
  "oak": {
    "collision": true
  },
  "water": {
    kind: "b-t",
    container: "b-t",
    collision: true
  },
  "sand": {
    kind: "b-t",
    container: "b-t",
    collision:false
  },
  "rockroof": {
    kind: 'b-t',
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
  "leaderboard": {
    kind: "interactable",
    container: "objects",
    collision: false,
    roof: false
  },
  "abyss": {
    'roof': false,
    'type': 'b-t',
    'collision': true
  },
  "void": {
    'roof': false,
    'type': 'b-t',
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
    kind: 'b-t',
    container:'floor',
    'collision': false
  },
  "pathVERT": {
    kind: 'b-t',
    container:'floor',
    'collision': false
  },
  "pathTDWN": {
    kind: 'b-t',
    container:'floor',
    'collision': false
  },
  "pathTUP": {
    kind: 'b-t',
    container:'floor',
    'collision': false
  },
  "pathTRT": {
    kind: 'b-t',
    container:'floor',
    'collision': false
  },
  "pathTLT": {
    kind: 'b-t',
    container:'floor',
    'collision': false
  },
  "pathCRS": {
    kind: 'b-t',
    container:'floor',
    'collision': false
  },
  "pathCRV1": {
    kind: 'b-t',
    container:'floor',
    'collision': false
  },
  "pathCRV2": {
    kind: 'b-t',
    container:'floor',
    'collision': false
  },
  "pathCRV3": {
    kind: 'b-t',
    container:'floor',
    'collision': false
  },
  "pathCRV4": {
    kind: 'b-t',
    container:'floor',
    'collision': false
  },
    "bridge": {
    kind: "b-t",
    container: "b-t",
    collision:false
  },
  "safeTile": {
    kind: "safeTile",
    container: "safeTile",
    collision:false
  },
  "sign": {
    kind: "interactable",
    container: "objects",
    collision: false,
    text: null
  },
  "grave": {
    kind: "b-t",
    container: "objects",
    collision: false
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
  //"stoneblock": {},
  "stump2": {},
  "stump3": {},
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
  "fPoleR": {},
  "fPoleL": {},
  "fPole": {},
  "dungeonStairs": {},
  "bobber": {},
  "chest2": {},
  "raft": {},
  "sail": {},
  "key": {},
  "scroll": {},
  "trashcan": {},
  "F": {},
  "C": {},
  "hitOutlineLeft": {},
  "hitOutlineRight": {},
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
  "pebble": {},
  "whitewave": {},
  "fireballup": {},
  "fireballdown": {},
  "fireballleft": {},
  "fireballright": {},
  "mapExit": {},
  "mobGenerator": {},
  "skeletonR": {},
  "skeletonL": {},
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

