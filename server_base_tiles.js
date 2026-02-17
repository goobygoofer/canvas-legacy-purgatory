
module.exports = {
  //----------------------------ID'd items, in order--------------------------------
  "axe": {
    kind: "item",
    id: 1,
    container: "objects",
    collision: false,
    equip: { slot: "hand" },
    attack: 0,
    timeBonus: 0
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
    attack: 0,
    timeBonus: 0
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
    timeBonus: 0
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
    craftLvl: 10,
  },
  "ironsword": {
    kind: "item",
    id: 10,
    container: "objects",
    collision: false,
    roof: false,
    equip: { slot: "hand" },
    craft: { log: 1, ironbar: 2 },
    attack: 7,
    craftLvl: 10,
    timeBonus: 0
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
    craft: { log: 5 },
    craftLvl: 10
  },
  "stoneplate": {
    kind: 'item',
    id: 13,
    container:'floor',
    collision: false,
    roof:false,
    craft: { rock: 5},
    craftLvl: 10
  },
  "woodroof":{
    kind: 'item',
    id: 14,
    container:"roof",
    collision: false,
    roof:true,
    craft: { log: 5},
    craftLvl: 10
  },
  "stoneroof": {
    kind: 'item',
    id: 15,
    container:'roof',
    collision: false,
    roof: true,
    craft: { rock: 5},
    craftLvl: 10
  },
  "door": {
    kind: 'item',
    id: 16,
    container:'objects',
    collision: true,
    roof: false,
    craft: { ironbar: 2, oaklog: 5},
    owner:null,
    craftLvl: 20
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
    defense: 1,
    craftLvl: 10
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
    attack: 25,
    timeBonus: 100
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
    craft: { orangedust: 10 },
    craftLvl: 25
  },
  "leatherarmor": {
    kind: "item",
    id: 29,
    container: "objects",
    collision: false,
    roof: false,
    equip: { slot: "body" },
    craft: { hide: 5 },
    defense: 3,//may need to tweak these
    craftLvl: 5
  },
  "leatherhelmet": {
    kind: "item",
    id: 30,
    container: "objects",
    collision: false,
    roof: false,
    equip: { slot: "head" },
    craft: { hide: 4 },
    defense: 2,
    craftLvl: 5
  },
  "ironarmor": {
    kind: "item",
    id:31,
    container:"objects",
    collision: false,
    roof: false,
    equip: { slot: "body" },
    craft: { hide: 2, ironbar: 5 },
    defense: 5,
    craftLvl: 10
  },
  "ironhelmet": {
    kind: "item",
    id:32,
    container:"objects",
    collision: false,
    roof: false,
    equip: { slot: "head" },
    craft: { hide: 1, ironbar: 2 },
    defense: 3,
    craftLvl: 10
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
    teleport: true,
    craftLvl: 10
  },
  "speedboots": {
    kind: "item",
    id: 35,
    container: "objects",
    collision: false,
    craft: { hide: 4, bluedust: 100000 },
    equip: {slot: "feet"},
    defense: 1,
    speed: 115,
    craftLvl: 99
  },
  "arrow": {
    kind: "item",
    id: 36,
    container: "objects",
    collision: false,
    craft: { log: 1, ironbar: 1 },
    craftAmount: 12,
    equip: { slot: "quiver" },
    attack: 10,
    craftLvl: 5
  },
  "bow":{
    kind: "item",
    id: 37,
    container: "objects",
    collision: false,
    craft: { log: 1, hide: 1, string: 1 },
    equip: { slot: "hand" },
    attack: 5,
    craftLvl: 5,
    timeBonus: 0
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
    attack: 0,//lol
    craftLvl: 5
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
    attack: 12,
    craftLvl: 20
  },
  "coal": {
    id: 44,
    kind: "item",
    container: "objects",
    collision: false
  },
  "silver": {
    id: 45,
    kind: "item",
    container: "objects",
    collision: false
  },
  "silverbar": {
    kind: "item",
    id: 46,
    container: "objects",
    collision: false,
    smelt: { silver: 5, coal: 1 },
    craftLvl: 25,
  },
  "copper": {
    id: 47,
    kind: "item",
    container: "objects",
    collision: false
  },
  "copperbar": {
    kind: "item",
    id: 48,
    container: "objects",
    collision: false,
    smelt: { copper: 5, coal: 1 },
    craftLvl: 20,
  },
  "gold": {
    id: 49,
    kind: "item",
    container: "objects",
    collision: false
  },
  "goldbar": {
    kind: "item",
    id: 50,
    container: "objects",
    collision: false,
    smelt: { gold: 5, coal: 5 },
    craftLvl: 40,
  },
  "diamond": {
    id: 51,
    kind: "item",
    container: "objects",
    collision: false
  },
  "diamondbar": {
    kind: "item",
    id: 52,
    container: "objects",
    collision: false,
    smelt: { diamond: 5, coal: 10 },
    craftLvl: 75,
  },
  "copperhelmet": {
    kind: "item",
    id:53,
    container:"objects",
    collision: false,
    equip: { slot: "head" },
    craft: { copperbar: 2, ironbar: 1, hide: 1 },
    defense: 8,
    craftLvl: 20
  },
  "silverhelmet": {
    kind: "item",
    id:54,
    container:"objects",
    collision: false,
    equip: { slot: "head" },
    craft: { silverbar: 2, ironbar: 1, hide: 1 },
    defense: 10,
    craftLvl: 25
  },
  "goldhelmet": {
    kind: "item",
    id:55,
    container:"objects",
    collision: false,
    equip: { slot: "head" },
    craft: { goldbar: 2, ironbar: 1, hide: 1 },
    defense: 20,
    craftLvl: 40
  },
  "diamondhelmet": {
    kind: "item",
    id:56,
    container:"objects",
    collision: false,
    equip: { slot: "head" },
    craft: { diamondbar: 2, ironbar: 1, hide: 1 },
    defense: 30,
    craftLvl: 75
  },
  "copperarmor": {
    kind: "item",
    id:57,
    container:"objects",
    collision: false,
    equip: { slot: "body" },
    craft: { copperbar: 5, ironbar: 2, hide: 2 },
    defense: 10,
    craftLvl: 22
  },
  "silverarmor": {
    kind: "item",
    id:58,
    container:"objects",
    collision: false,
    equip: { slot: "body" },
    craft: { silverbar: 5, ironbar: 2, hide: 2 },
    defense: 15,
    craftLvl: 27
  },
  "goldarmor": {
    kind: "item",
    id:59,
    container:"objects",
    collision: false,
    equip: { slot: "body" },
    craft: { goldbar: 5, ironbar: 2, hide: 2 },
    defense: 20,
    craftLvl: 42
  },
  "diamondarmor": {
    kind: "item",
    id:60,
    container:"objects",
    collision: false,
    equip: { slot: "body" },
    craft: { diamondbar: 5, ironbar: 2, hide: 2 },
    defense: 30,
    craftLvl: 77
  },
  "coppersword": {
    kind: "item",
    id: 61,
    container: "objects",
    collision: false,
    equip: { slot: "hand" },
    craft: { copperbar: 2, log: 1, ironbar: 1 },
    attack: 12,
    craftLvl: 25,
    timeBonus: 10
  },
  "silversword": {
    kind: "item",
    id: 62,
    container: "objects",
    collision: false,
    equip: { slot: "hand" },
    craft: { silverbar: 2, log: 1, ironbar: 1 },
    attack: 18,
    craftLvl: 30,
    timeBonus: 50
  },
  "goldsword": {
    kind: "item",
    id: 63,
    container: "objects",
    collision: false,
    equip: { slot: "hand" },
    craft: { goldbar: 2, log: 1, ironbar: 1 },
    attack: 25,
    craftLvl: 45,
    timeBonus: 75
  },
  "diamondsword": {
    kind: "item",
    id: 64,
    container: "objects",
    collision: false,
    equip: { slot: "hand" },
    craft: { diamondbar: 2, log: 1, ironbar: 1 },
    attack: 35,
    craftLvl: 80,
    timeBonus: 100
  },
  "bowoak":{
    kind: "item",
    id: 65,
    container: "objects",
    collision: false,
    craft: { oaklog: 2, hide: 1, string: 1 },
    equip: { slot: "hand" },
    attack: 15,
    craftLvl: 30,
    timeBonus: 100
  },
  "axeiron": {
    id: 66,
    kind: "item",
    container: "objects",
    collision: false,
    equip: { slot: "hand" },
    attack: 0,
    timeBonus: 10,
    craft: { log: 1, ironbar: 1 },
    craftLvl: 10
  },
  "axecopper": {
    id: 67,
    kind: "item",
    container: "objects",
    collision: false,
    equip: { slot: "hand" },
    attack: 0,
    timeBonus: 25,
    craft: { log: 1, copperbar: 1 },
    craftLvl: 20
  },
  "axesilver": {
    id: 68,
    kind: "item",
    container: "objects",
    collision: false,
    equip: { slot: "hand" },
    attack: 0,
    timeBonus: 55,
    craft: { log: 1, silverbar: 1 },
    craftLvl: 25
  },
  "axegold": {
    id: 69,
    kind: "item",
    container: "objects",
    collision: false,
    equip: { slot: "hand" },
    attack: 0,
    timeBonus: 75,
    craft: { log: 1, goldbar: 1 },
    craftLvl: 40
  },
  "axediamond": {
    id: 70,
    kind: "item",
    container: "objects",
    collision: false,
    equip: { slot: "hand" },
    attack: 0,
    timeBonus: 125,
    craft: { log: 1, diamondbar: 1 },
    craftLvl: 75
  },
  "pickaxeiron": {
    kind: "item",
    id: 71,
    container: "objects",
    collision: false,
    equip: { slot: "hand" },
    craft: { log: 2, ironbar: 2 },
    attack: 0,
    timeBonus: 10,
    craftLvl: 10
  },
  "pickaxecopper": {
    kind: "item",
    id: 72,
    container: "objects",
    collision: false,
    equip: { slot: "hand" },
    craft: { log: 2, copperbar: 2 },
    attack: 0,
    timeBonus: 25,
    craftLvl: 20
  },
  "pickaxesilver": {
    kind: "item",
    id: 73,
    container: "objects",
    collision: false,
    equip: { slot: "hand" },
    craft: { log: 2, silverbar: 2 },
    attack: 0,
    timeBonus: 55,
    craftLvl: 25
  },
  "pickaxegold": {
    kind: "item",
    id: 74,
    container: "objects",
    collision: false,
    equip: { slot: "hand" },
    craft: { log: 2, goldbar: 2 },
    attack: 0,
    timeBonus: 75,
    craftLvl: 40
  },
  "pickaxediamond": {
    kind: "item",
    id: 75,
    container: "objects",
    collision: false,
    equip: { slot: "hand" },
    craft: { log: 2, diamondbar: 2 },
    attack: 0,
    timeBonus: 125,
    craftLvl: 75
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
      { name: "rock0", weight: 1000 },
      { name: "ironrock0", weight: 200 },
      { name: "coalrock0", weight: 175 },
      { name: "silverrock0", weight: 90 },
      { name: "copperrock0", weight: 90 },
      { name: "goldrock0", weight: 45},
      { name: "diamondrock0", weight: 5 }
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
      { name: "rock0", weight: 1000 },
      { name: "ironrock0", weight: 200 },
      { name: "coalrock0", weight: 175 },
      { name: "silverrock0", weight: 90 },
      { name: "copperrock0", weight: 90 },
      { name: "goldrock0", weight: 45},
      { name: "diamondrock0", weight: 5 }
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
      { name: "rock0", weight: 1000 },
      { name: "ironrock0", weight: 200 },
      { name: "coalrock0", weight: 175 },
      { name: "silverrock0", weight: 90 },
      { name: "copperrock0", weight: 90 },
      { name: "goldrock0", weight: 45},
      { name: "diamondrock0", weight: 5 }
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
      { name: "rock0", weight: 1000 },
      { name: "ironrock0", weight: 200 },
      { name: "coalrock0", weight: 175 },
      { name: "silverrock0", weight: 90 },
      { name: "copperrock0", weight: 90 },
      { name: "goldrock0", weight: 45},
      { name: "diamondrock0", weight: 5 }
    ]
  },
  "ironrock4": {
    kind: "depletedResource",
    container: "depletedResource",
    collision: false,
    regrowsTo: [
      { name: "rock0", weight: 1000 },
      { name: "ironrock0", weight: 200 },
      { name: "coalrock0", weight: 175 },
      { name: "silverrock0", weight: 90 },
      { name: "copperrock0", weight: 90 },
      { name: "goldrock0", weight: 45},
      { name: "diamondrock0", weight: 5 }
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
      { name: "rock0", weight: 1000 },
      { name: "ironrock0", weight: 200 },
      { name: "coalrock0", weight: 175 },
      { name: "silverrock0", weight: 90 },
      { name: "copperrock0", weight: 90 },
      { name: "goldrock0", weight: 45},
      { name: "diamondrock0", weight: 5 }
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
      { name: "rock0", weight: 1000 },
      { name: "ironrock0", weight: 200 },
      { name: "coalrock0", weight: 175 },
      { name: "silverrock0", weight: 90 },
      { name: "copperrock0", weight: 90 },
      { name: "goldrock0", weight: 45},
      { name: "diamondrock0", weight: 5 }
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
      { name: "rock0", weight: 1000 },
      { name: "ironrock0", weight: 200 },
      { name: "coalrock0", weight: 175 },
      { name: "silverrock0", weight: 90 },
      { name: "copperrock0", weight: 90 },
      { name: "goldrock0", weight: 45},
      { name: "diamondrock0", weight: 5 }
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
      { name: "rock0", weight: 1000 },
      { name: "ironrock0", weight: 200 },
      { name: "coalrock0", weight: 175 },
      { name: "silverrock0", weight: 90 },
      { name: "copperrock0", weight: 90 },
      { name: "goldrock0", weight: 45},
      { name: "diamondrock0", weight: 5 }
    ]
  },
  "rock4": {
    kind: "depletedResource",
    container: "depletedResource",
    collision: false,
    regrowsTo: [
      { name: "rock0", weight: 1000 },
      { name: "ironrock0", weight: 200 },
      { name: "coalrock0", weight: 175 },
      { name: "silverrock0", weight: 90 },
      { name: "copperrock0", weight: 90 },
      { name: "goldrock0", weight: 45},
      { name: "diamondrock0", weight: 5 }
    ]
  },
  "coalrock0": {
    kind: "resource",
    container: "objects",
    collision: true,
    roof: true,
    drops: { coal: 1 },
    depletesTo: "coalrock1",
    requiresTool: "pickaxe",
    regrowsTo: [
      { name: "rock0", weight: 1000 },
      { name: "ironrock0", weight: 200 },
      { name: "coalrock0", weight: 175 },
      { name: "silverrock0", weight: 90 },
      { name: "copperrock0", weight: 90 },
      { name: "goldrock0", weight: 45},
      { name: "diamondrock0", weight: 5 }
    ]
  },
  "coalrock1": {
    kind: "resource",
    container: "objects",
    collision: true,
    roof: true,
    drops: { coal: 1 },
    depletesTo: "coalrock2",
    requiresTool: "pickaxe",
    regrowsTo: [
      { name: "rock0", weight: 1000 },
      { name: "ironrock0", weight: 200 },
      { name: "coalrock0", weight: 175 },
      { name: "silverrock0", weight: 90 },
      { name: "copperrock0", weight: 90 },
      { name: "goldrock0", weight: 45},
      { name: "diamondrock0", weight: 5 }
    ]
  },
  "coalrock2": {
    kind: "resource",
    container: "objects",
    collision: true,
    roof: true,
    drops: { coal: 1 },
    depletesTo: "coalrock3",
    requiresTool: "pickaxe",
    regrowsTo: [
      { name: "rock0", weight: 1000 },
      { name: "ironrock0", weight: 200 },
      { name: "coalrock0", weight: 175 },
      { name: "silverrock0", weight: 90 },
      { name: "copperrock0", weight: 90 },
      { name: "goldrock0", weight: 45},
      { name: "diamondrock0", weight: 5 }
    ]
  },
  "coalrock3": {
    kind: "resource",
    container: "objects",
    collision: true,
    roof: true,
    drops: { coal: 1 },
    depletesTo: "coalrock4",
    requiresTool: "pickaxe",
    regrowsTo: [
      { name: "rock0", weight: 1000 },
      { name: "ironrock0", weight: 200 },
      { name: "coalrock0", weight: 175 },
      { name: "silverrock0", weight: 90 },
      { name: "copperrock0", weight: 90 },
      { name: "goldrock0", weight: 45},
      { name: "diamondrock0", weight: 5 }
    ]
  },
  "coalrock4": {
    kind: "depletedResource",
    container: "depletedResource",
    collision: false,
    regrowsTo: [
      { name: "rock0", weight: 1000 },
      { name: "ironrock0", weight: 200 },
      { name: "coalrock0", weight: 175 },
      { name: "silverrock0", weight: 90 },
      { name: "copperrock0", weight: 90 },
      { name: "goldrock0", weight: 45},
      { name: "diamondrock0", weight: 5 }
    ]
  },
  "silverrock0": {
    kind: "resource",
    container: "objects",
    collision: true,
    roof: true,
    drops: { silver: 1 },
    depletesTo: "silverrock1",
    requiresTool: "pickaxe",
    regrowsTo: [
      { name: "rock0", weight: 1000 },
      { name: "ironrock0", weight: 200 },
      { name: "coalrock0", weight: 175 },
      { name: "silverrock0", weight: 90 },
      { name: "copperrock0", weight: 90 },
      { name: "goldrock0", weight: 45},
      { name: "diamondrock0", weight: 5 }
    ]
  },
  "silverrock1": {
    kind: "resource",
    container: "objects",
    collision: true,
    roof: true,
    drops: { silver: 1 },
    depletesTo: "silverrock2",
    requiresTool: "pickaxe",
    regrowsTo: [
      { name: "rock0", weight: 1000 },
      { name: "ironrock0", weight: 200 },
      { name: "coalrock0", weight: 175 },
      { name: "silverrock0", weight: 90 },
      { name: "copperrock0", weight: 90 },
      { name: "goldrock0", weight: 45},
      { name: "diamondrock0", weight: 5 }
    ]
  },
  "silverrock2": {
    kind: "resource",
    container: "objects",
    collision: true,
    roof: true,
    drops: { silver: 1 },
    depletesTo: "silverrock3",
    requiresTool: "pickaxe",
    regrowsTo: [
      { name: "rock0", weight: 1000 },
      { name: "ironrock0", weight: 200 },
      { name: "coalrock0", weight: 175 },
      { name: "silverrock0", weight: 90 },
      { name: "copperrock0", weight: 90 },
      { name: "goldrock0", weight: 45},
      { name: "diamondrock0", weight: 5 }
    ]
  },
  "silverrock3": {
    kind: "resource",
    container: "objects",
    collision: true,
    roof: true,
    drops: { silver: 1 },
    depletesTo: "silverrock4",
    requiresTool: "pickaxe",
    regrowsTo: [
      { name: "rock0", weight: 1000 },
      { name: "ironrock0", weight: 200 },
      { name: "coalrock0", weight: 175 },
      { name: "silverrock0", weight: 90 },
      { name: "copperrock0", weight: 90 },
      { name: "goldrock0", weight: 45},
      { name: "diamondrock0", weight: 5 }
    ]
  },
  "silverrock4": {
    kind: "depletedResource",
    container: "depletedResource",
    collision: false,
    regrowsTo: [
      { name: "rock0", weight: 1000 },
      { name: "ironrock0", weight: 200 },
      { name: "coalrock0", weight: 175 },
      { name: "silverrock0", weight: 90 },
      { name: "copperrock0", weight: 90 },
      { name: "goldrock0", weight: 45},
      { name: "diamondrock0", weight: 5 }
    ]
  },
  "copperrock0": {
    kind: "resource",
    container: "objects",
    collision: true,
    roof: true,
    drops: { copper: 1 },
    depletesTo: "copperrock1",
    requiresTool: "pickaxe",
    regrowsTo: [
      { name: "rock0", weight: 1000 },
      { name: "ironrock0", weight: 200 },
      { name: "coalrock0", weight: 175 },
      { name: "silverrock0", weight: 90 },
      { name: "copperrock0", weight: 90 },
      { name: "goldrock0", weight: 45},
      { name: "diamondrock0", weight: 5 }
    ]
  },
  "copperrock1": {
    kind: "resource",
    container: "objects",
    collision: true,
    roof: true,
    drops: { copper: 1 },
    depletesTo: "copperrock2",
    requiresTool: "pickaxe",
    regrowsTo: [
      { name: "rock0", weight: 1000 },
      { name: "ironrock0", weight: 200 },
      { name: "coalrock0", weight: 175 },
      { name: "silverrock0", weight: 90 },
      { name: "copperrock0", weight: 90 },
      { name: "goldrock0", weight: 45},
      { name: "diamondrock0", weight: 5 }
    ]
  },
  "copperrock2": {
    kind: "resource",
    container: "objects",
    collision: true,
    roof: true,
    drops: { copper: 1 },
    depletesTo: "copperrock3",
    requiresTool: "pickaxe",
    regrowsTo: [
      { name: "rock0", weight: 1000 },
      { name: "ironrock0", weight: 200 },
      { name: "coalrock0", weight: 175 },
      { name: "silverrock0", weight: 90 },
      { name: "copperrock0", weight: 90 },
      { name: "goldrock0", weight: 45},
      { name: "diamondrock0", weight: 5 }
    ]
  },
  "copperrock3": {
    kind: "resource",
    container: "objects",
    collision: true,
    roof: true,
    drops: { copper: 1 },
    depletesTo: "copperrock4",
    requiresTool: "pickaxe",
    regrowsTo: [
      { name: "rock0", weight: 1000 },
      { name: "ironrock0", weight: 200 },
      { name: "coalrock0", weight: 175 },
      { name: "silverrock0", weight: 90 },
      { name: "copperrock0", weight: 90 },
      { name: "goldrock0", weight: 45},
      { name: "diamondrock0", weight: 5 }
    ]
  },
  "copperrock4": {
    kind: "depletedResource",
    container: "depletedResource",
    collision: false,
    regrowsTo: [
      { name: "rock0", weight: 1000 },
      { name: "ironrock0", weight: 200 },
      { name: "coalrock0", weight: 175 },
      { name: "silverrock0", weight: 90 },
      { name: "copperrock0", weight: 90 },
      { name: "goldrock0", weight: 45},
      { name: "diamondrock0", weight: 5 }
    ]
  },
  "goldrock0": {
    kind: "resource",
    container: "objects",
    collision: true,
    roof: true,
    drops: { gold: 1 },
    depletesTo: "goldrock1",
    requiresTool: "pickaxe",
    regrowsTo: [
      { name: "rock0", weight: 1000 },
      { name: "ironrock0", weight: 200 },
      { name: "coalrock0", weight: 175 },
      { name: "silverrock0", weight: 90 },
      { name: "copperrock0", weight: 90 },
      { name: "goldrock0", weight: 45},
      { name: "diamondrock0", weight: 5 }
    ]
  },
  "goldrock1": {
    kind: "resource",
    container: "objects",
    collision: true,
    roof: true,
    drops: { gold: 1 },
    depletesTo: "goldrock2",
    requiresTool: "pickaxe",
    regrowsTo: [
      { name: "rock0", weight: 1000 },
      { name: "ironrock0", weight: 200 },
      { name: "coalrock0", weight: 175 },
      { name: "silverrock0", weight: 90 },
      { name: "copperrock0", weight: 90 },
      { name: "goldrock0", weight: 45},
      { name: "diamondrock0", weight: 5 }
    ]
  },
  "goldrock2": {
    kind: "resource",
    container: "objects",
    collision: true,
    roof: true,
    drops: { gold: 1 },
    depletesTo: "goldrock3",
    requiresTool: "pickaxe",
    regrowsTo: [
      { name: "rock0", weight: 1000 },
      { name: "ironrock0", weight: 200 },
      { name: "coalrock0", weight: 175 },
      { name: "silverrock0", weight: 90 },
      { name: "copperrock0", weight: 90 },
      { name: "goldrock0", weight: 45},
      { name: "diamondrock0", weight: 5 }
    ]
  },
  "goldrock3": {
    kind: "resource",
    container: "objects",
    collision: true,
    roof: true,
    drops: { gold: 1 },
    depletesTo: "goldrock4",
    requiresTool: "pickaxe",
    regrowsTo: [
      { name: "rock0", weight: 1000 },
      { name: "ironrock0", weight: 200 },
      { name: "coalrock0", weight: 175 },
      { name: "silverrock0", weight: 90 },
      { name: "copperrock0", weight: 90 },
      { name: "goldrock0", weight: 45},
      { name: "diamondrock0", weight: 5 }
    ]
  },
  "goldrock4": {
    kind: "depletedResource",
    container: "depletedResource",
    collision: false,
    regrowsTo: [
      { name: "rock0", weight: 1000 },
      { name: "ironrock0", weight: 200 },
      { name: "coalrock0", weight: 175 },
      { name: "silverrock0", weight: 90 },
      { name: "copperrock0", weight: 90 },
      { name: "goldrock0", weight: 45},
      { name: "diamondrock0", weight: 5 }
    ]
  },
  "diamondrock0": {
    kind: "resource",
    container: "objects",
    collision: true,
    roof: true,
    drops: { diamond: 1 },
    depletesTo: "diamondrock1",
    requiresTool: "pickaxe",
    regrowsTo: [
      { name: "rock0", weight: 1000 },
      { name: "ironrock0", weight: 200 },
      { name: "coalrock0", weight: 175 },
      { name: "silverrock0", weight: 90 },
      { name: "copperrock0", weight: 90 },
      { name: "goldrock0", weight: 45},
      { name: "diamondrock0", weight: 5 }
    ]
  },
  "diamondrock1": {
    kind: "resource",
    container: "objects",
    collision: true,
    roof: true,
    drops: { diamond: 1 },
    depletesTo: "diamondrock2",
    requiresTool: "pickaxe",
    regrowsTo: [
      { name: "rock0", weight: 1000 },
      { name: "ironrock0", weight: 200 },
      { name: "coalrock0", weight: 175 },
      { name: "silverrock0", weight: 90 },
      { name: "copperrock0", weight: 90 },
      { name: "goldrock0", weight: 45},
      { name: "diamondrock0", weight: 5 }
    ]
  },
  "diamondrock2": {
    kind: "resource",
    container: "objects",
    collision: true,
    roof: true,
    drops: { diamond: 1 },
    depletesTo: "diamondrock3",
    requiresTool: "pickaxe",
    regrowsTo: [
      { name: "rock0", weight: 1000 },
      { name: "ironrock0", weight: 200 },
      { name: "coalrock0", weight: 175 },
      { name: "silverrock0", weight: 90 },
      { name: "copperrock0", weight: 90 },
      { name: "goldrock0", weight: 45},
      { name: "diamondrock0", weight: 5 }
    ]
  },
  "diamondrock3": {
    kind: "resource",
    container: "objects",
    collision: true,
    roof: true,
    drops: { diamond: 1 },
    depletesTo: "diamondrock4",
    requiresTool: "pickaxe",
    regrowsTo: [
      { name: "rock0", weight: 1000 },
      { name: "ironrock0", weight: 200 },
      { name: "coalrock0", weight: 175 },
      { name: "silverrock0", weight: 90 },
      { name: "copperrock0", weight: 90 },
      { name: "goldrock0", weight: 45},
      { name: "diamondrock0", weight: 5 }
    ]
  },
  "diamondrock4": {
    kind: "depletedResource",
    container: "depletedResource",
    collision: false,
    regrowsTo: [
      { name: "rock0", weight: 1000 },
      { name: "ironrock0", weight: 200 },
      { name: "coalrock0", weight: 175 },
      { name: "silverrock0", weight: 90 },
      { name: "copperrock0", weight: 90 },
      { name: "goldrock0", weight: 45},
      { name: "diamondrock0", weight: 5 }
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
  "dungeonStairs": {
    kind: "interactable",
    'roof':false,
    'collision': false,
    'container':"objects",
    toX:null,toY:null
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
    kind: "b-t",
    container: "b-t",
    collision: true,
    roof: false
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

