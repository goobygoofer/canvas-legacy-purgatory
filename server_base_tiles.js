
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
    prettyName: "stone sword",
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
    prettyName: "wood block",
    kind: "item",
    id: 6,
    container: "objects",
    collision: true,
    craft: { log: 10 },
    dropChange: "woodblock0"
  },
  "stoneblock": {
    prettyName: "stone block",
    kind: "item",
    id: 7,
    container: "objects",
    collision: true,
    craft: { rock: 10 },
    dropChange: "stoneblock0"
  },
  "ironore": {
    prettyName: "iron ore",
    kind: "item",
    id: 8,
    container: "objects",
    collision: false,
    smelt: "ironbar"
  },
  "ironbar": {
    prettyName: "iron bar",
    kind: "item",
    id: 9,
    container: "objects",
    collision: false,
    smelt: { ironore: 5 },
    craftLvl: 10,
  },
  "ironsword": {
    prettyName: "iron sword",
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
    prettyName: "oak log",
    kind: "item",
    id: 11,
    container: "objects",
    collision: false,
  },
  "woodplate": {
    prettyName: "wood floor",
    kind: 'item',
    id: 12,
    container:"floor",
    collision: false,
    roof: false,
    craft: { log: 5 },
    craftLvl: 10,
    owner: null
  },
  "stoneplate": {
    prettyName: "stone floor",
    kind: 'item',
    id: 13,
    container:'floor',
    collision: false,
    roof:false,
    craft: { rock: 5},
    craftLvl: 10,
    owner: null
  },
  "woodroof":{
    prettyName: "wood ceiling",
    kind: 'item',
    id: 14,
    container:"roof",
    collision: false,
    roof:true,
    craft: { log: 5},
    craftLvl: 10,
    owner: null
  },
  "stoneroof": {
    prettyName: "stone ceiling",
    kind: 'item',
    id: 15,
    container:'roof',
    collision: false,
    roof: true,
    craft: { rock: 5},
    craftLvl: 10,
    owner: null
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
    prettyName: "red flower",
    kind: 'item',
    id: 17,
    container: 'objects',
    collision: false
  },
  "flowerwhite": {
    prettyName: "white flower",
    kind: 'item',
    id: 18,
    container: 'objects',
    collision: false
  },
  "floweryellow": {
    prettyName: "yellow flower",
    kind: 'item',
    id: 19,
    container: 'objects',
    collision: false
  },
  "flowercrown":{
    prettyName: "flower crown",
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
    prettyName: "goblin sword",
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
    prettyName: "orange dust",
    kind: "item",
    id: 25,
    container: "objects",
    collision: false,
    equip: { slot: "quiver" },
    attack: 10,
    mana: 25
  },
  "bluedust": {
    prettyName: "blue dust",
    kind: "item",
    id: 26,
    container: "objects",
    collision: false,
    equip: { slot: "quiver" },
    attack: 50,
    mana: 50
  },
  "yellowdust": {
    prettyName: "yellow dust",
    kind: "item",
    id: 27,
    container: "objects",
    collision: false,
    equip: { slot: "quiver" },
    attack: 60,
    mana: 100,
    reqLvl: { type: "mageLvl", lvl: 50, pretty: "mage" }
  },
  "healthpotion":{
    prettyName: "health potion", 
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
    prettyName: "leather armor",
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
    prettyName: "leather helmet",
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
    prettyName:"iron armor",
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
    prettyName:"iron helmet",
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
    prettyName: "Old Haven teleport",
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
    prettyName: "speed boots",
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
    prettyName: "iron arrow",
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
    prettyName: "fishing pole",
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
    prettyName: "bomb arrow",
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
    collision: false,
    smelt: "silverbar"
  },
  "silverbar": {
    prettyName: "silver bar",
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
    collision: false,
    "smelt": "copperbar"
  },
  "copperbar": {
    prettyName: "copper bar",
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
    collision: false,
    smelt: "goldbar"
  },
  "goldbar": {
    prettyName: "gold bar",
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
    collision: false,
    smelt: "diamondbar"
  },
  "diamondbar": {
    prettyName: "diamond bar",
    kind: "item",
    id: 52,
    container: "objects",
    collision: false,
    smelt: { diamond: 5, coal: 10 },
    craftLvl: 75,
  },
  "copperhelmet": {
    prettyName: "copper helmet",
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
    prettyName: "silver helmet",
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
    prettyName: "gold helmet",
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
    prettyName: "diamond helmet",
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
    prettyName: "copper armor",
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
    prettyName: "silver armor",
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
    prettyName: "gold armor",
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
    prettyName: "diamond armor",
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
    prettyName: "copper sword",
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
    prettyName: "silver sword",
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
    prettyName: "gold sword",
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
    prettyName: "diamond sword",
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
    prettyName: "oak bow",
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
    prettyName: "iron axe",
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
    prettyName: "copper axe",
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
    prettyName: "silver axe",
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
    prettyName: "gold axe",
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
    prettyName: "diamond axe",
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
    prettyName: "iron pickaxe",
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
    prettyName: "copper pickaxe",
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
    prettyName: "silver pickaxe",
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
    prettyName: "gold pickaxe",
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
    prettyName: "diamond pickaxe",
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
  "arrowcopper": {
    prettyName: "copper arrow",
    kind: "item",
    id: 76,
    container: "objects",
    collision: false,
    craft: { log: 1, copperbar: 1 },
    craftAmount: 12,
    equip: { slot: "quiver" },
    attack: 15,
    craftLvl: 20
  },
  "arrowsilver": {
    prettyName: "silver arrow",
    kind: "item",
    id: 77,
    container: "objects",
    collision: false,
    craft: { log: 1, silverbar: 1 },
    craftAmount: 12,
    equip: { slot: "quiver" },
    attack: 20,
    craftLvl: 25
  },
  "arrowgold": {
    prettyName: "gold arrow",
    kind: "item",
    id: 78,
    container: "objects",
    collision: false,
    craft: { log: 1, goldbar: 1 },
    craftAmount: 12,
    equip: { slot: "quiver" },
    attack: 25,
    craftLvl: 40
  },
  "arrowdiamond": {
    prettyName: "diamond arrow",
    kind: "item",
    id: 79,
    container: "objects",
    collision: false,
    craft: { log: 1, diamondbar: 1 },
    craftAmount: 12,
    equip: { slot: "quiver" },
    attack: 35,
    craftLvl: 75
  },
  "magebook":{
    prettyName: "mage book",
    kind: "item",
    id: 80,
    container: "objects",
    collision: false,
    craft: { hide: 1 },
    equip: { slot: "hand" },
    attack: 5,
    craftLvl : 10
  },
  "manapotion":{
    prettyName: "mana potion",
    kind: "item",
    id: 81,
    container: "objects",
    collision: false,
    craft: { waterbucket: 1, bluedust: 10 },
    mana: 25,
    time: 1000,
    consume: true,
    craftLvl: 10
  },
  "waterbucket":{
    prettyName: "water bucket",
    kind: "item",
    id: 82,
    container: "objects",
    collision: false
  },
  "tools":{
    kind: "item",
    id: 83,
    container: "objects",
    collision: false,
    craft: { ironbar: 2, log: 2 },
    equip: { slot: "hand" },
    attack: 0,
    craftLvl : 1
  },
  "stairsR":{
    kind: "item",
    id: 84,
    container: "objects",
    collision: false,
    craft: { rock: 10 }
  },
  "stairsL":{
    kind: "item",
    id: 85,
    container: "objects",
    collision: false,
    craft: { rock: 10 }
  },
  "orbFinder":{
    prettyName: "locator orb",
    kind: "item",
    id:86,
    container: "objects",
    collision: false,
    craft: { amethystbar: 1},//change to purple ore which will be rare af
    equip: { slot: "hand" },
    attack: 0,
    craftLvl : 1
  },
  "spade":{
    kind: "item",
    id: 87,
    container: "objects",
    collision: false,
    craft: { log:1, ironbar: 1 },
    dig: true//lel
  },
  "xpHat":{
    kind: "item",
    id: 88,
    container: "objects",
    collision: false,
    equip: { slot: 'head' },
    defense: 0
  },
  "amethyst":{
    kind: "item",
    id: 89,
    container: "objects",
    collision: false,
    smelt: "amethystbar"
  },
  "amethystbar":{
    prettyName: "amethyst bar",
    kind: "item",
    id: 90,
    container: "objects",
    collision: false,
    smelt: { amethyst: 5 },
    craftLvl: 20
  },
  "cookedRedfish":{
    prettyName: "cooked redfish",
    kind: "item",
    id: 91,
    container: "objects",
    collision: false,
    cook: { redfish: 1 }
  },
  "wheat":{//wheatPlant will have stages later
    kind: "item",
    id: 92,
    container: "objects",
    collision: false,
    hp: 5,
    time: 1000,
    consume: true,
    seed: {item:"wheatSeed", amt: 4},
  },
  "bread":{
    kind: "item",
    id: 93,
    container: "objects",
    collision: false,
    hp: 15,
    time: 1000,
    consume: true,
    cook: { wheat: 1, waterbucket: 1 }
  },
  "tomato":{
    kind: "item",
    id: 94,
    container: "objects",
    collision: false,
    hp: 10,
    time: 2000,
    consume: true,
    seed: {item:'tomatoSeed', amt:4}
  },
  "fishSandwich":{
    prettyName: "fish sandwich",
    kind: "item",
    id: 95,
    container: "objects",
    collision: false,
    hp: 40,
    time: 2000,
    consume: true,
    cook: { bread: 1, cookedRedfish: 1, tomato: 1 }
  },
  "rawMeat":{
    prettyName: "raw meat",
    kind: "item",
    id: 96,
    container: "objects",
    collision: false,
    hp: -20,
    time: 2000,
    consume: true
  },
  "cookedMeat":{
    prettyName: "cooked meat",
    kind: "item",
    id: 97,
    container: "objects",
    collision: false,
    hp: 20,
    time: 2000,
    consume: true,
    cook: {rawMeat: 1}
  },
  "meatSandwich":{
    prettyName: "meat sandwich",
    kind: "item",
    id: 98,
    container: "objects",
    collision: false,
    hp: 45,
    time: 2000,
    consume: true,
    cook: {cookedMeat:1, bread:1, tomato:1}
  },
  "carrot":{
    kind: "item",
    id: 99,
    container: "objects",
    collision: false,
    hp: 10,
    time: 2000,
    consume: true,
    seed: {item:"carrotSeed", amt: 4}
  },
  "rawRatmeat":{//96, 144
    prettyName: "raw rat meat",
    kind: "item",
    id: 100,
    container: "objects",
    collision: false,
    hp: -25,
    time: 2000,
    consume: true
  },
  "cookedRatmeat":{
    prettyName: "cooked rat meat",
    kind: "item",
    id: 101,
    container: "objects",
    collision: false,
    hp: 5,
    time: 2000,
    consume: true,
    cook: {rawRatmeat:1}
  },
  "ratStew":{
    prettyName: "rat stew",
    kind: "item",
    id: 102,
    container: "objects",
    collision: false,
    hp: 100,
    time: 1000,
    consume: true,
    cook: {cookedRatmeat: 1, carrot: 2, tomato: 2, waterbucket: 1}
  },
  "wheatSeed":{
    prettyName: "wheat seed",
    kind: "item",
    id: 103,
    container: "objects",
    collision: false,
    dropChange: "wheatPlant0",
    containerChange: "resource",
    farm: true,
    owner: null//set by dropOwnedItem
  },
  "tomatoSeed":{
    prettyName: "tomato seed",
    kind: "item",
    id: 104,
    container: "objects",
    collision: false,
    farm: true,
    dropChange: "tomatoPlant0",
    containerChange: "resource",
    owner: null
  },
  "carrotSeed":{
    prettyName: "carrot seed",
    kind: "item",
    id: 105,
    container: "objects",
    collision: false,
    farm: true,
    dropChange: "carrotPlant0",
    containerChange: "resource",
    owner: null
  },
  "grape":{
    prettyName: "grape",
    kind: "item",
    id: 106,
    container: "objects",
    collision: false,
    mana: 10,
    time: 500,
    consume: true,
    seed: {item:"grapeSeed", amt: 4}
  },
  "grapeSeed":{
    prettyName: "grape seed",
    kind: "item",
    id: 107,
    container: "objects",
    collision: false,
    farm: true,
    dropChange: "grapePlant0",
    containerChange: "resource",
    owner: null,
    lvl: 30
  },
  "eyeLightBlue":{
    prettyName:"light blue eye",
    kind: "item",
    id: 108,
    container: "objects",
    collision: false
  },
  "eyeGreen":{
    prettyName:"green eye",
    kind: "item",
    id: 109,
    container: "objects",
    collision: false
  },
  "eyeYellow":{
    prettyName:"yellow eye",
    kind: "item",
    id: 110,
    container: "objects",
    collision: false
  },
  "eyeBlue":{
    prettyName:"blue eye",
    kind: "item",
    id: 111,
    container: "objects",
    collision: false
  },
  "eyePink":{
    prettyName:"pink eye",
    kind: "item",
    id: 112,
    container: "objects",
    collision: false
  },
  "eyeRed":{
    prettyName:"red eye",
    kind: "item",
    id: 113,
    container: "objects",
    collision: false
  },
  //LAST ADDED ITEM
  
  "cookingRange":{
    prettyName: "cooking range",
    kind: "interactable",
    container: "objects",
    collision: false
  },
  "treasure":{
    drop: [
      { name: "coin", min: 1, max: 10000, weight: 10000 },
      { name: "silver", min: 1, max: 12, weight: 1000 },
      { name: "gold", min: 1, max: 12, weight: 500 },
      { name: "diamond", min: 1, max: 12, weight: 100 },
      { name: "speedboots", min:1, max: 1, weight: 50 },
      { name: "xpHat", min:1, max:1, weight: 25 }
    ]
  },
/*------------------npc shop items-------------------*/
  "eyeGameShop":{
    container: "objects",
    kind: "interactable",
    cost: {coin: 250},
    amount: 1,
    item: 'eyeGame'
  },
  "redfishShop":{
    container: "objects",
    kind: "interactable",
    cost: {coin: 50},
    amount: 1,
    item: "redfish"
  },
  "codShop":{
    container: "objects",
    kind: "interactable",
    cost: {coin: 20},
    amount: 1,
    item: "cod"
  },
  "goldfishShop":{
    container: "objects",
    kind: "interactable",
    cost: {coin: 25},
    amount: 1,
    item: "goldfish"
  },
  "wheatShop":{
    container: "objects",
    kind: "interactable",
    cost: {coin: 25},
    amount: 1,
    item: "wheat"
  },
  "tomatoShop":{
    container: "objects",
    kind: "interactable",
    cost: {coin: 25},
    amount: 1,
    item: "tomato"
  },
  "healthpotionShop":{
    container: "objects",
    kind: "interactable",
    cost: {coin: 100},
    amount: 1,
    item: "healthpotion"
  },
  "silverswordShop":{
    container: "objects",
    kind: "interactable",
    cost: {coin: 5000},
    amount: 1,
    item: "silversword"
  },
  "arrowcopperShop":{
    container: "objects",
    kind: "interactable",
    cost: {coin: 100},
    amount: 5,
    item: "arrowcopper"
  },
  "axegoldShop":{
    container: "objects",
    kind: "interactable",
    cost: {coin: 3000},
    amount: 1,
    item: "axegold"
  },
  "pickaxeShop":{
    container: "objects",
    kind: "interactable",
    cost: {coin: 0},
    amount: 1,
    item: "pickaxe"
  },
  "axeShop":
  {
    container: "objects",
    kind: "interactable",
    cost: {coin: 0},
    amount: 1,
    item: "axe"
  },
  "bedShop":{
    container: "objects",
    kind: "interactable",
    cost: {coin: 5},
    amount: 0,
    item: null//lol
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
  "stone":{
    attack: 25
  },
  "campfire1": {
    container: "objects",
    collision: true
  },
  "lightning": {
    attack : 20
  },
  // -----------------------------------resources----------------------------------------
  //farming resources
  "wheatPlant0":{
    kind: "resource",
    container: "objects",
    collision: false,
    prettyName: "wheat",
    regrowsTo: [
      {name: "wheatPlant1", weight: 100}
    ],
    farming: true,
    owner: null
  },
  "wheatPlant1":{
    kind: "resource",
    container: "objects",
    collision: false,
    prettyName: "wheat",
    regrowsTo: [
      {name: "wheatPlant2", weight: 100}
    ],
    farming: true,
    owner: null
  },
  "wheatPlant2":{
    kind: "resource",
    container: "objects",
    collision: false,
    prettyName: "wheat",
    regrowsTo: [
      {name: "wheatPlant3", weight: 100}
    ],
    farming: true,
    owner:null
  },
  "wheatPlant3":{
    kind: "interactable",
    container: "objects",
    collision: false,
    prettyName: "wheat",
    owner: null,
    farming: true,
    drops: "wheat",
    xp: 20
  },
  "tomatoPlant0":{
    kind: "interactable",
    container: "objects",
    collision: false,
    owner: null,
    farming: true,
    prettyName: "tomato",
    regrowsTo:[
      {name: "tomatoPlant1", weight: 100}
    ]
  },
  "tomatoPlant1":{
    kind: "interactable",
    container: "objects",
    collision: false,
    owner: null,
    farming: true,
    prettyName: "tomato",
    regrowsTo:[
      {name: "tomatoPlant2", weight: 100}
    ]    
  },
  "tomatoPlant2":{
    kind: "interactable",
    container: "objects",
    collision: false,
    owner: null,
    farming: true,
    prettyName: "tomato",
    drops: "tomato",
    xp: 10
  },
  "carrotPlant0":{
    kind: "interactable",
    container: "objects",
    collision: false,
    owner: null,
    farming: true,
    prettyName: "carrot",
    regrowsTo: [
      {name: "carrotPlant1", weight: 100}
    ]
  },
  "carrotPlant1":{
    kind: "interactable",
    container: "objects",
    collision: false,
    owner: null,
    farming: true,
    prettyName: "carrot",
    regrowsTo: [
      {name: "carrotPlant2", weight: 100}
    ]
  },
  "carrotPlant2":{
    kind: "interactable",
    container: "objects",
    collision: false,
    owner: null,
    farming: true,
    prettyName: "carrot",
    drops: "carrot",
    xp: 10
  },
  "grapePlant0":{
    kind: "interactable",
    container: "objects",
    collision: false,
    owner: null,
    farming: true,
    prettyName: "grapevine",
    regrowsTo: [
      {name: "grapePlant1", weight: 100}
    ],
    lvl: 30
  },
  "grapePlant1":{
    kind: "interactable",
    container: "objects",
    collision: false,
    owner: null,
    farming: true,
    prettyName: "grapevine",
    regrowsTo: [
      {name: "grapePlant2", weight: 100}
    ]
  },
  "grapePlant2":{
    kind: "interactable",
    container: "objects",
    collision: false,
    owner: null,
    farming: true,
    prettyName: "grapevine",
    regrowsTo: [
      {name: "grapePlant3", weight: 100}
    ]
  },
  "grapePlant3":{
    kind: "interactable",
    container: "objects",
    collision: false,
    owner: null,
    farming: true,
    prettyName: "grapevine",
    regrowsTo: [
      {name: "grapePlant4", weight: 100}
    ]
  },
  "grapePlant4":{
    kind: "interactable",
    container: "objects",
    collision: false,
    owner: null,
    farming: true,
    prettyName: "grapevine",
    drops: "grape",
    xp: 50
  },
  //last farming resource
  "tree0": {
    kind: "resource",
    container: "objects",
    collision: true,
    drops: { log: 1 },
    rareDrop: { apple: 1 },
    rarity: 50,//every 50 trees by chance
    depletesTo: "tree1",
    requiresTool: "axe",
    xp: 1,
    regrowsTo: [
      { name: "tree0", weight: 1000 },
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
    xp: 1,
    regrowsTo: [
      { name: "tree0", weight: 1000 },
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
    xp: 1,
    regrowsTo: [
      { name: "tree0", weight: 1000 },
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
    xp: 1,
    regrowsTo: [
      { name: "tree0", weight: 1000 },
      { name: "oak0", weight: 50 }
    ]
  },

  "tree4": {
    kind: "depletedResource",
    container: "depletedResource",
    collision: false,
    regrowsTo: [
      { name: "tree0", weight: 1000 },
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
    prettyName: "iron",
    kind: "resource",
    container: "objects",
    collision: true,
    roof: true,
    drops: { ironore: 1 },
    depletesTo: "ironrock1",
    requiresTool: "pickaxe",
    reqLvl: 5,
    xp: 5,
    regrowsTo: [
      { name: "rock0", weight: 10000 },
      { name: "ironrock0", weight: 1500 },
      { name: "coalrock0", weight: 1000 },
      { name: "silverrock0", weight: 500 },
      { name: "copperrock0", weight: 750 },
      { name: "goldrock0", weight: 100},
      { name: "diamondrock0",weight: 5 },
      { name: "amethystrock0", weight: 1}
    ]
  },
  "ironrock1": {
    prettyName: "iron",
    reqLvl: 5,
    kind: "resource",
    container: "objects",
    collision: true,
    roof: true,
    drops: { ironore: 1 },
    depletesTo: "ironrock2",
    requiresTool: "pickaxe",
    reqLvl: 5,
    xp: 5,
    regrowsTo: [
      { name: "rock0", weight: 10000 },
      { name: "ironrock0", weight: 1500 },
      { name: "coalrock0", weight: 1000 },
      { name: "silverrock0", weight: 500 },
      { name: "copperrock0", weight: 750 },
      { name: "goldrock0", weight: 100},
      { name: "diamondrock0",weight: 5 },
      { name: "amethystrock0", weight: 1}
    ]
  },
  "ironrock2": {
    prettyName: "iron",
    kind: "resource",
    container: "objects",
    collision: true,
    roof: true,
    drops: { ironore: 1 },
    depletesTo: "ironrock3",
    requiresTool: "pickaxe",
    reqLvl: 5,
    xp: 5,
    regrowsTo: [
      { name: "rock0", weight: 10000 },
      { name: "ironrock0", weight: 1500 },
      { name: "coalrock0", weight: 1000 },
      { name: "silverrock0", weight: 500 },
      { name: "copperrock0", weight: 750 },
      { name: "goldrock0", weight: 100},
      { name: "diamondrock0",weight: 5 },
      { name: "amethystrock0", weight: 1}
    ]
  },
  "ironrock3": {
    prettyName: "iron",
    kind: "resource",
    container: "objects",
    collision: true,
    roof: true,
    drops: { ironore: 1 },
    depletesTo: "ironrock4",
    requiresTool: "pickaxe",
    reqLvl: 5,
    xp: 5,
    regrowsTo: [
      { name: "rock0", weight: 10000 },
      { name: "ironrock0", weight: 1500 },
      { name: "coalrock0", weight: 1000 },
      { name: "silverrock0", weight: 500 },
      { name: "copperrock0", weight: 750 },
      { name: "goldrock0", weight: 100},
      { name: "diamondrock0",weight: 5 },
      { name: "amethystrock0", weight: 1}
    ]
  },
  "ironrock4": {
    kind: "depletedResource",
    container: "depletedResource",
    collision: false,
    regrowsTo: [
      { name: "rock0", weight: 10000 },
      { name: "ironrock0", weight: 1500 },
      { name: "coalrock0", weight: 1000 },
      { name: "silverrock0", weight: 500 },
      { name: "copperrock0", weight: 750 },
      { name: "goldrock0", weight: 100},
      { name: "diamondrock0",weight: 5 },
      { name: "amethystrock0", weight: 1}
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
    xp: 1,
    regrowsTo: [
      { name: "rock0", weight: 10000 },
      { name: "ironrock0", weight: 1500 },
      { name: "coalrock0", weight: 1000 },
      { name: "silverrock0", weight: 500 },
      { name: "copperrock0", weight: 750 },
      { name: "goldrock0", weight: 100},
      { name: "diamondrock0",weight: 5 },
      { name: "amethystrock0", weight: 1}
    ]
  },

  "rock1": {
    kind: "resource",
    container: "objects",
    collision: true,
    drops: { rock: 1 },
    depletesTo: "rock2",
    requiresTool: "pickaxe",
    xp: 1,
    regrowsTo: [
      { name: "rock0", weight: 10000 },
      { name: "ironrock0", weight: 1500 },
      { name: "coalrock0", weight: 1000 },
      { name: "silverrock0", weight: 500 },
      { name: "copperrock0", weight: 750 },
      { name: "goldrock0", weight: 100},
      { name: "diamondrock0",weight: 5 },
      { name: "amethystrock0", weight: 1}
    ]
  },
  "rock2": {
    kind: "resource",
    container: "objects",
    collision: true,
    drops: { rock: 1 },
    depletesTo: "rock3",
    requiresTool: "pickaxe",
    xp: 1,
    regrowsTo: [
      { name: "rock0", weight: 10000 },
      { name: "ironrock0", weight: 1500 },
      { name: "coalrock0", weight: 1000 },
      { name: "silverrock0", weight: 500 },
      { name: "copperrock0", weight: 750 },
      { name: "goldrock0", weight: 100},
      { name: "diamondrock0",weight: 5 },
      { name: "amethystrock0", weight: 1}
    ]
  },
  "rock3": {
    kind: "resource",
    container: "objects",
    collision: true,
    drops: { rock: 1 },
    depletesTo: "rock4",
    requiresTool: "pickaxe",
    xp: 1,
    regrowsTo: [
      { name: "rock0", weight: 10000 },
      { name: "ironrock0", weight: 1500 },
      { name: "coalrock0", weight: 1000 },
      { name: "silverrock0", weight: 500 },
      { name: "copperrock0", weight: 750 },
      { name: "goldrock0", weight: 100},
      { name: "diamondrock0",weight: 5 },
      { name: "amethystrock0", weight: 1}
    ]
  },
  "rock4": {
    kind: "depletedResource",
    container: "depletedResource",
    collision: false,
    regrowsTo: [
      { name: "rock0", weight: 10000 },
      { name: "ironrock0", weight: 1500 },
      { name: "coalrock0", weight: 1000 },
      { name: "silverrock0", weight: 500 },
      { name: "copperrock0", weight: 750 },
      { name: "goldrock0", weight: 100},
      { name: "diamondrock0",weight: 5 },
      { name: "amethystrock0", weight: 1}
    ]
  },
  "coalrock0": {
    prettyName: "coal",
    kind: "resource",
    container: "objects",
    collision: true,
    roof: true,
    drops: { coal: 1 },
    depletesTo: "coalrock1",
    requiresTool: "pickaxe",
    reqLvl: 10,
    xp: 8,
    regrowsTo: [
      { name: "rock0", weight: 10000 },
      { name: "ironrock0", weight: 1500 },
      { name: "coalrock0", weight: 1000 },
      { name: "silverrock0", weight: 500 },
      { name: "copperrock0", weight: 750 },
      { name: "goldrock0", weight: 100},
      { name: "diamondrock0",weight: 5 },
      { name: "amethystrock0", weight: 1}
    ]
  },
  "coalrock1": {
    prettyName: "coal",
    kind: "resource",
    container: "objects",
    collision: true,
    roof: true,
    drops: { coal: 1 },
    depletesTo: "coalrock2",
    requiresTool: "pickaxe",
    reqLvl: 10,
    xp: 8,
    regrowsTo: [
      { name: "rock0", weight: 10000 },
      { name: "ironrock0", weight: 1500 },
      { name: "coalrock0", weight: 1000 },
      { name: "silverrock0", weight: 500 },
      { name: "copperrock0", weight: 750 },
      { name: "goldrock0", weight: 100},
      { name: "diamondrock0",weight: 5 },
      { name: "amethystrock0", weight: 1}
    ]
  },
  "coalrock2": {
    prettyName: "coal",
    kind: "resource",
    container: "objects",
    collision: true,
    roof: true,
    drops: { coal: 1 },
    depletesTo: "coalrock3",
    requiresTool: "pickaxe",
    reqLvl: 10,
    xp: 8,
    regrowsTo: [
      { name: "rock0", weight: 10000 },
      { name: "ironrock0", weight: 1500 },
      { name: "coalrock0", weight: 1000 },
      { name: "silverrock0", weight: 500 },
      { name: "copperrock0", weight: 750 },
      { name: "goldrock0", weight: 100},
      { name: "diamondrock0",weight: 5 },
      { name: "amethystrock0", weight: 1}
    ]
  },
  "coalrock3": {
    prettyName: "coal",
    kind: "resource",
    container: "objects",
    collision: true,
    roof: true,
    drops: { coal: 1 },
    depletesTo: "coalrock4",
    requiresTool: "pickaxe",
    reqLvl: 10,
    xp: 8,
    regrowsTo: [
      { name: "rock0", weight: 10000 },
      { name: "ironrock0", weight: 1500 },
      { name: "coalrock0", weight: 1000 },
      { name: "silverrock0", weight: 500 },
      { name: "copperrock0", weight: 750 },
      { name: "goldrock0", weight: 100},
      { name: "diamondrock0",weight: 5 },
      { name: "amethystrock0", weight: 1}
    ]
  },
  "coalrock4": {
    kind: "depletedResource",
    container: "depletedResource",
    collision: false,
    regrowsTo: [
      { name: "rock0", weight: 10000 },
      { name: "ironrock0", weight: 1500 },
      { name: "coalrock0", weight: 1000 },
      { name: "silverrock0", weight: 500 },
      { name: "copperrock0", weight: 750 },
      { name: "goldrock0", weight: 100},
      { name: "diamondrock0",weight: 5 },
      { name: "amethystrock0", weight: 1}
    ]
  },
  "silverrock0": {
    prettyName: "silver",
    kind: "resource",
    container: "objects",
    collision: true,
    roof: true,
    drops: { silver: 1 },
    depletesTo: "silverrock1",
    requiresTool: "pickaxe",
    reqLvl: 30,
    xp: 15,
    regrowsTo: [
      { name: "rock0", weight: 10000 },
      { name: "ironrock0", weight: 1500 },
      { name: "coalrock0", weight: 1000 },
      { name: "silverrock0", weight: 500 },
      { name: "copperrock0", weight: 750 },
      { name: "goldrock0", weight: 100},
      { name: "diamondrock0",weight: 5 },
      { name: "amethystrock0", weight: 1}
    ]
  },
  "silverrock1": {
    prettyName: "silver",
    kind: "resource",
    container: "objects",
    collision: true,
    roof: true,
    drops: { silver: 1 },
    depletesTo: "silverrock2",
    requiresTool: "pickaxe",
    reqLvl: 30,
    xp: 15,
    regrowsTo: [
      { name: "rock0", weight: 10000 },
      { name: "ironrock0", weight: 1500 },
      { name: "coalrock0", weight: 1000 },
      { name: "silverrock0", weight: 500 },
      { name: "copperrock0", weight: 750 },
      { name: "goldrock0", weight: 100},
      { name: "diamondrock0",weight: 5 },
      { name: "amethystrock0", weight: 1}
    ]
  },
  "silverrock2": {
    prettyName: "silver",
    kind: "resource",
    container: "objects",
    collision: true,
    roof: true,
    drops: { silver: 1 },
    depletesTo: "silverrock3",
    requiresTool: "pickaxe",
    reqLvl: 30,
    xp: 15,
    regrowsTo: [
      { name: "rock0", weight: 10000 },
      { name: "ironrock0", weight: 1500 },
      { name: "coalrock0", weight: 1000 },
      { name: "silverrock0", weight: 500 },
      { name: "copperrock0", weight: 750 },
      { name: "goldrock0", weight: 100},
      { name: "diamondrock0",weight: 5 },
      { name: "amethystrock0", weight: 1}
    ]
  },
  "silverrock3": {
    prettyName: "silver",
    kind: "resource",
    container: "objects",
    collision: true,
    roof: true,
    drops: { silver: 1 },
    depletesTo: "silverrock4",
    requiresTool: "pickaxe",
    reqLvl: 30,
    xp: 15,
    regrowsTo: [
      { name: "rock0", weight: 10000 },
      { name: "ironrock0", weight: 1500 },
      { name: "coalrock0", weight: 1000 },
      { name: "silverrock0", weight: 500 },
      { name: "copperrock0", weight: 750 },
      { name: "goldrock0", weight: 100},
      { name: "diamondrock0",weight: 5 },
      { name: "amethystrock0", weight: 1}
    ]
  },
  "silverrock4": {
    kind: "depletedResource",
    container: "depletedResource",
    collision: false,
    regrowsTo: [
      { name: "rock0", weight: 10000 },
      { name: "ironrock0", weight: 1500 },
      { name: "coalrock0", weight: 1000 },
      { name: "silverrock0", weight: 500 },
      { name: "copperrock0", weight: 750 },
      { name: "goldrock0", weight: 100},
      { name: "diamondrock0",weight: 5 },
      { name: "amethystrock0", weight: 1}
    ]
  },
  "copperrock0": {
    prettyName: "copper",
    kind: "resource",
    container: "objects",
    collision: true,
    roof: true,
    drops: { copper: 1 },
    depletesTo: "copperrock1",
    requiresTool: "pickaxe",
    reqLvl: 10,
    xp: 10,
    regrowsTo: [
      { name: "rock0", weight: 10000 },
      { name: "ironrock0", weight: 1500 },
      { name: "coalrock0", weight: 1000 },
      { name: "silverrock0", weight: 500 },
      { name: "copperrock0", weight: 750 },
      { name: "goldrock0", weight: 100},
      { name: "diamondrock0",weight: 5 },
      { name: "amethystrock0", weight: 1}
    ]
  },
  "copperrock1": {
    prettyName: "copper",
    kind: "resource",
    container: "objects",
    collision: true,
    roof: true,
    drops: { copper: 1 },
    depletesTo: "copperrock2",
    requiresTool: "pickaxe",
    reqLvl: 10,
    xp: 10,
    regrowsTo: [
      { name: "rock0", weight: 10000 },
      { name: "ironrock0", weight: 1500 },
      { name: "coalrock0", weight: 1000 },
      { name: "silverrock0", weight: 500 },
      { name: "copperrock0", weight: 750 },
      { name: "goldrock0", weight: 100},
      { name: "diamondrock0",weight: 5 },
      { name: "amethystrock0", weight: 1}
    ]
  },
  "copperrock2": {
    prettyName: "copper",
    kind: "resource",
    container: "objects",
    collision: true,
    roof: true,
    drops: { copper: 1 },
    depletesTo: "copperrock3",
    requiresTool: "pickaxe",
    reqLvl: 10,
    xp: 10,
    regrowsTo: [
      { name: "rock0", weight: 10000 },
      { name: "ironrock0", weight: 1500 },
      { name: "coalrock0", weight: 1000 },
      { name: "silverrock0", weight: 500 },
      { name: "copperrock0", weight: 750 },
      { name: "goldrock0", weight: 100},
      { name: "diamondrock0",weight: 5 },
      { name: "amethystrock0", weight: 1}
    ]
  },
  "copperrock3": {
    prettyName: "copper",
    kind: "resource",
    container: "objects",
    collision: true,
    roof: true,
    drops: { copper: 1 },
    depletesTo: "copperrock4",
    requiresTool: "pickaxe",
    reqLvl: 10,
    xp: 10,
    regrowsTo: [
      { name: "rock0", weight: 10000 },
      { name: "ironrock0", weight: 1500 },
      { name: "coalrock0", weight: 1000 },
      { name: "silverrock0", weight: 500 },
      { name: "copperrock0", weight: 750 },
      { name: "goldrock0", weight: 100},
      { name: "diamondrock0",weight: 5 },
      { name: "amethystrock0", weight: 1}
    ]
  },
  "copperrock4": {
    kind: "depletedResource",
    container: "depletedResource",
    collision: false,
    regrowsTo: [
      { name: "rock0", weight: 10000 },
      { name: "ironrock0", weight: 1500 },
      { name: "coalrock0", weight: 1000 },
      { name: "silverrock0", weight: 500 },
      { name: "copperrock0", weight: 750 },
      { name: "goldrock0", weight: 100},
      { name: "diamondrock0",weight: 5 },
      { name: "amethystrock0", weight: 1}
    ]
  },
  "goldrock0": {
    prettyName: "gold",
    kind: "resource",
    container: "objects",
    collision: true,
    roof: true,
    drops: { gold: 1 },
    depletesTo: "goldrock1",
    requiresTool: "pickaxe",
    reqLvl: 50,
    xp: 20,
    regrowsTo: [
      { name: "rock0", weight: 10000 },
      { name: "ironrock0", weight: 1500 },
      { name: "coalrock0", weight: 1000 },
      { name: "silverrock0", weight: 500 },
      { name: "copperrock0", weight: 750 },
      { name: "goldrock0", weight: 100},
      { name: "diamondrock0",weight: 5 },
      { name: "amethystrock0", weight: 1}
    ]
  },
  "goldrock1": {
    prettyName: "gold",
    kind: "resource",
    container: "objects",
    collision: true,
    roof: true,
    drops: { gold: 1 },
    depletesTo: "goldrock2",
    requiresTool: "pickaxe",
    reqLvl: 50,
    xp: 20,
    regrowsTo: [
      { name: "rock0", weight: 10000 },
      { name: "ironrock0", weight: 1500 },
      { name: "coalrock0", weight: 1000 },
      { name: "silverrock0", weight: 500 },
      { name: "copperrock0", weight: 750 },
      { name: "goldrock0", weight: 100},
      { name: "diamondrock0",weight: 5 },
      { name: "amethystrock0", weight: 1}
    ]
  },
  "goldrock2": {
    prettyName: "gold",
    kind: "resource",
    container: "objects",
    collision: true,
    roof: true,
    drops: { gold: 1 },
    depletesTo: "goldrock3",
    requiresTool: "pickaxe",
    reqLvl: 50,
    xp: 20,
    regrowsTo: [
      { name: "rock0", weight: 10000 },
      { name: "ironrock0", weight: 1500 },
      { name: "coalrock0", weight: 1000 },
      { name: "silverrock0", weight: 500 },
      { name: "copperrock0", weight: 750 },
      { name: "goldrock0", weight: 100},
      { name: "diamondrock0",weight: 5 },
      { name: "amethystrock0", weight: 1}
    ]
  },
  "goldrock3": {
    prettyName: "gold",
    kind: "resource",
    container: "objects",
    collision: true,
    roof: true,
    drops: { gold: 1 },
    depletesTo: "goldrock4",
    requiresTool: "pickaxe",
    reqLvl: 50,
    xp: 20,
    regrowsTo: [
      { name: "rock0", weight: 10000 },
      { name: "ironrock0", weight: 1500 },
      { name: "coalrock0", weight: 1000 },
      { name: "silverrock0", weight: 500 },
      { name: "copperrock0", weight: 750 },
      { name: "goldrock0", weight: 100},
      { name: "diamondrock0",weight: 5 },
      { name: "amethystrock0", weight: 1}
    ]
  },
  "goldrock4": {
    kind: "depletedResource",
    container: "depletedResource",
    collision: false,
    regrowsTo: [
      { name: "rock0", weight: 10000 },
      { name: "ironrock0", weight: 1500 },
      { name: "coalrock0", weight: 1000 },
      { name: "silverrock0", weight: 500 },
      { name: "copperrock0", weight: 750 },
      { name: "goldrock0", weight: 100},
      { name: "diamondrock0",weight: 5 },
      { name: "amethystrock0", weight: 1}
    ]
  },
  "diamondrock0": {
    prettyName: "diamond",
    kind: "resource",
    container: "objects",
    collision: true,
    roof: true,
    drops: { diamond: 1 },
    depletesTo: "diamondrock1",
    requiresTool: "pickaxe",
    reqLvl: 70,
    xp: 30,
    regrowsTo: [
      { name: "rock0", weight: 10000 },
      { name: "ironrock0", weight: 1500 },
      { name: "coalrock0", weight: 1000 },
      { name: "silverrock0", weight: 500 },
      { name: "copperrock0", weight: 750 },
      { name: "goldrock0", weight: 100},
      { name: "diamondrock0",weight: 5 },
      { name: "amethystrock0", weight: 1}
    ]
  },
  "diamondrock1": {
    prettyName: "diamond",
    kind: "resource",
    container: "objects",
    collision: true,
    roof: true,
    drops: { diamond: 1 },
    depletesTo: "diamondrock2",
    requiresTool: "pickaxe",
    reqLvl: 70,
    xp: 30,
    regrowsTo: [
      { name: "rock0", weight: 10000 },
      { name: "ironrock0", weight: 1500 },
      { name: "coalrock0", weight: 1000 },
      { name: "silverrock0", weight: 500 },
      { name: "copperrock0", weight: 750 },
      { name: "goldrock0", weight: 100},
      { name: "diamondrock0",weight: 5 },
      { name: "amethystrock0", weight: 1}
    ]
  },
  "diamondrock2": {
    prettyName: "diamond",
    kind: "resource",
    container: "objects",
    collision: true,
    roof: true,
    drops: { diamond: 1 },
    depletesTo: "diamondrock3",
    requiresTool: "pickaxe",
    reqLvl: 70,
    xp: 30,
    regrowsTo: [
      { name: "rock0", weight: 10000 },
      { name: "ironrock0", weight: 1500 },
      { name: "coalrock0", weight: 1000 },
      { name: "silverrock0", weight: 500 },
      { name: "copperrock0", weight: 750 },
      { name: "goldrock0", weight: 100},
      { name: "diamondrock0",weight: 5 },
      { name: "amethystrock0", weight: 1}
    ]
  },
  "diamondrock3": {
    prettyName: "diamond",
    kind: "resource",
    container: "objects",
    collision: true,
    roof: true,
    drops: { diamond: 1 },
    depletesTo: "diamondrock4",
    requiresTool: "pickaxe",
    reqLvl: 70,
    xp: 30,
    regrowsTo: [
      { name: "rock0", weight: 10000 },
      { name: "ironrock0", weight: 1500 },
      { name: "coalrock0", weight: 1000 },
      { name: "silverrock0", weight: 500 },
      { name: "copperrock0", weight: 750 },
      { name: "goldrock0", weight: 100},
      { name: "diamondrock0",weight: 5 },
      { name: "amethystrock0", weight: 1}
    ]
  },
  "diamondrock4": {
    kind: "depletedResource",
    container: "depletedResource",
    collision: false,
    regrowsTo: [
      { name: "rock0", weight: 10000 },
      { name: "ironrock0", weight: 1500 },
      { name: "coalrock0", weight: 1000 },
      { name: "silverrock0", weight: 500 },
      { name: "copperrock0", weight: 750 },
      { name: "goldrock0", weight: 100},
      { name: "diamondrock0",weight: 5 },
      { name: "amethystrock0", weight: 1}
    ]
  },
  "amethystrock0":{
    prettyName: "amethyst deposit",
    kind: "resource",
    container: "objects",
    collision: true,
    roof: true,
    drops: { amethyst: 1 },
    depletesTo: "amethystrock1",
    requiresTool: "pickaxe",
    reqLvl: 30,
    regrowsTo: [
      { name: "rock0", weight: 10000 },
      { name: "ironrock0", weight: 1500 },
      { name: "coalrock0", weight: 1000 },
      { name: "silverrock0", weight: 500 },
      { name: "copperrock0", weight: 750 },
      { name: "goldrock0", weight: 100},
      { name: "diamondrock0",weight: 5 },
      { name: "amethystrock0", weight: 1}
    ]
  },
  "amethystrock1":{
    prettyName: "amethyst deposit",
    kind: "resource",
    container: "objects",
    collision: true,
    roof: true,
    drops: { amethyst: 1 },
    depletesTo: "amethystrock2",
    requiresTool: "pickaxe",
    reqLvl: 30,
    regrowsTo: [
      { name: "rock0", weight: 10000 },
      { name: "ironrock0", weight: 1500 },
      { name: "coalrock0", weight: 1000 },
      { name: "silverrock0", weight: 500 },
      { name: "copperrock0", weight: 750 },
      { name: "goldrock0", weight: 100},
      { name: "diamondrock0",weight: 5 },
      { name: "amethystrock0", weight: 1}
    ]
  },
  "amethystrock2":{
    prettyName: "amethyst deposit",
    kind: "resource",
    container: "objects",
    collision: true,
    roof: true,
    drops: { amethyst: 1 },
    depletesTo: "amethystrock3",
    requiresTool: "pickaxe",
    reqLvl: 30,
    regrowsTo: [
      { name: "rock0", weight: 10000 },
      { name: "ironrock0", weight: 1500 },
      { name: "coalrock0", weight: 1000 },
      { name: "silverrock0", weight: 500 },
      { name: "copperrock0", weight: 750 },
      { name: "goldrock0", weight: 100},
      { name: "diamondrock0",weight: 5 },
      { name: "amethystrock0", weight: 1}
    ]
  },
  "amethystrock3":{
    prettyName: "amethyst deposit",
    kind: "resource",
    container: "objects",
    collision: true,
    roof: true,
    drops: { amethyst: 1 },
    depletesTo: "amethystrock4",
    requiresTool: "pickaxe",
    reqLvl: 30,
    regrowsTo: [
      { name: "rock0", weight: 10000 },
      { name: "ironrock0", weight: 1500 },
      { name: "coalrock0", weight: 1000 },
      { name: "silverrock0", weight: 500 },
      { name: "copperrock0", weight: 750 },
      { name: "goldrock0", weight: 100},
      { name: "diamondrock0",weight: 5 },
      { name: "amethystrock0", weight: 1}
    ]
  },
  "amethystrock4":{
    prettyName: "depleted amethyst deposit",
    kind: "depletedResource",
    container: "depletedResource",
    collision: false,
    regrowsTo: [
      { name: "rock0", weight: 10000 },
      { name: "ironrock0", weight: 1500 },
      { name: "coalrock0", weight: 1000 },
      { name: "silverrock0", weight: 500 },
      { name: "copperrock0", weight: 750 },
      { name: "goldrock0", weight: 100},
      { name: "diamondrock0",weight: 5 },
      { name: "amethystrock0", weight: 1}
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
      { name: "oak0", weight: 10 }
    ]
  },
  "oak0": {
    prettyName: "oak",
    kind: "resource",
    container: "objects",
    collision: true,
    drops: { oaklog: 1 },
    depletesTo: "oak1",
    requiresTool: "axe",
    reqLvl: 25,
    xp: 25,
    regrowsTo: [
      { name: "tree0", weight: 1000 },
      { name: "oak0", weight: 50 }
    ]
  },
  "oak1": {
    prettyName: "oak",
    kind: "resource",
    container: "objects",
    collision: true,
    drops: { oaklog: 1 },
    depletesTo: "oak2",
    requiresTool: "axe",
    reqLvl: 25,
    xp: 25,
    regrowsTo: [
      { name: "tree0", weight: 1000 },
      { name: "oak0", weight: 50 }
    ]
  },
  "oak2": {
    prettyName: "oak",
    kind: "resource",
    container: "objects",
    collision: true,
    drops: { oaklog: 1 },
    depletesTo: "oak3",
    requiresTool: "axe",
    reqLvl: 25,
    xp: 25,
    regrowsTo: [
      { name: "tree0", weight: 1000 },
      { name: "oak0", weight: 50 }
    ]
  },
  "oak3": {
    prettyName: "oak",
    kind: "resource",
    container: "objects",
    collision: true,
    drops: { oaklog: 1 },
    depletesTo: "tree4",
    requiresTool: "axe",
    reqLvl: 25,
    xp: 25,
    regrowsTo: [
      { name: "tree0", weight: 1000 },
      { name: "oak0", weight: 50 }
    ]
  },
  "deadtree0": {
    prettyName: "dead tree",
    kind: "resource",
    container: "objects",
    collision: true,
    drops: { coal: 1 },
    depletesTo: "deadtree1",
    requiresTool: "axe",
    reqLvl: 1
  },
  "deadtree1": {
    kind: "depletedResource",
    container: "depletedResource",
    collision: false,
    regrowsTo: [
      { name: "stump1", weight: 1000 }
    ]
  },
  "grass": {
    kind: "b-t",
    container: "b-t",
    collision: false
  },
  "stoneBT":{
    kind: "b-t",
    container: "b-t",
    collision: false
  },
  "eyeSocket":{
    kind: 'game',
    container: 'floor',
    collision:false
  },
  "eyeClue":{
    kind: 'game',
    container: 'floor',
    collision:false
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
    toX:null,toY:null,toZ:null
  },
  "upStairs": {
    kind: "interactable",
    'roof':false,
    'collision':false,
    'container': "objects",
    toX:null, toY:null
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
/*---------------NPCS----------------*/
  "peasant": {
    kind: "npc",
    container: "objects",
    collision: true,
    prettyName: "Peasant",
    quest:{
      name: "trollQuest",
      0:{
        speech: `With that troll blocking the eastern bridge, I can't get the supplies I need to fix this bridge!`
      },
      1:{
        speech: `Rumor has it some fool thinks he's going to defeat the troll...\nI'd do it myself but I -- er -- took an arrow to the knee...`
      },
      2:{
        speech: `You're telling me /you/ defeated the troll? No way...\nNo matter, I can fix the bridge now!`
      },
      3:{
        speech: `Got some flooring? I can fix this bridge up if you give me at least two pieces of wood flooring...`,
        action: async (player, query, addItem, removeItem, getItemAmount, sendMessage) => {
          const flooring = await getItemAmount(player.name, 12);
          if (flooring<2){
            sendMessage('pk message', `Retturn when you have enough flooring on you!`, player);
            return;
          }
          await removeItem(player.name, 12, 2);
          await query(
            "UPDATE players SET trollQuest = 4 WHERE player_name = ?",
            [player.name]
          );
          player.trollQuest = 4;
        }
      },
      4:{
        speech: `The western kingdom castle is south of here...\nTravel safe!`
      }
    }
  },
  "gateGuard":{
    kind: "npc",
    container: "objects",
    collision: true,
    prettyName: "Guard",
    speech: "You can't go in there right now...\nIf you break in and get stuck, I can't help you..."
  },
  "theEye":{
    kind: "npc",
    container: "objects",
    collision: true,
    prettyName: "The Eye",
    speech: "Welcome to the Eye Game...\nSlay the wandering eyes to gather their souls...\nWhen you are ready, put 250 coins into the coffer and pass the threshold to start...\nMake your guess by dropping eye souls into the eye sockets..."
  },
  "shopkeep": {
    kind: "npc",
    container: "objects",
    collision: true,
    prettyName: "Shopkeep",
    speech: "Stand on an item in the shop and press Shift to buy it!\n"
  },
  "belethor": {
    kind: "npc",
    container: "objects",
    collision: true,
    prettyName: "Belethor",
    speech: "They threw me down here for selling my sister...\nGood luck getting out of here...\n"
  },
  "merchant":{
    kind: "npc",
    container: "objects",
    collision: true,
    prettyName: "Merchant",
    quest: {
      name: "trollQuest",
      0:{
        speech:`Hello, Traveller!\n The bridge east of the mountain pass is currently blocked by an angry troll! I can't deliver my goods... If you can defeat it, I will reward you handsomely!\n`,
        action: async (player, query, addItem, removeItem, getItemAmount, sendMessage) => {
          //set trollQuest to 1
          await query(
            "UPDATE players SET trollQuest = 1 WHERE player_name = ?",
            [player.name]           
          );
          player.trollQuest = 1;
        }
      },
      1:{
        speech: `Did you defeat the troll yet?!`
      },
      2:{
        speech: `Thank you so much! Please take this.\n(The merchant hands you some strange stones!)\n`,
        action: async (player, query, addItem, removeItem, getItemAmount, sendMessage) => {
          let added = await addItem(player.name, 89, 4);
          if (added===0){
            sendMessage('pk message', "Clear some inventory space to recieve your reward!\n", player);
            return;
          }
          await query(
            "UPDATE players SET trollQuest = 3 WHERE player_name = ?",
            [player.name]           
          );
          player.trollQuest = 3;
        }
      },
      3:{
        speech: `Thank you so much! Trade will be much better without that nasty troll...\n`
      },
      4:{
        speech: `I heard the southern bridge was fixed!\nThank you again...`
      }
    }
  },
  "chef":{
    kind: "npc",
    container: "objects",
    collision: true,
    prettyName: "Chef D",
    quest: {
      name: "chefQuest",
      0:{
        speech:`Hey I need some help in the kitchen!\nCatch and cook me a redfish, but don't cook it on an open fire like a bandit... use the range over there by standing on it and pressing Shift!\n`,
        action: async (player, query, addItem, removeItem, getItemAmount, sendMessage) => {
          await query(
            "UPDATE players SET chefQuest = 1 WHERE player_name = ?",
            [player.name]           
          );
          player.chefQuest = 1;
        }
      },
      1:{
        speech:`Hurry up and get that redfish cooked!\nCatch a redfish, stand on the range, and press Shift,\n
        heard?!`//gets incremented to 2 by cooking redfish, can't trade for one!
      },
      2:{
        speech:`Finally! Now take this wheat... Get some water in a bucket and come back to the range and make some bread! Wheat's out of season, if you lose it I have some over there that you can buy...\n`,
        action: async (player, query, addItem, removeItem, getItemAmount, sendMessage) => {
          let added = await addItem(player.name, 92, 3);
          if (added === 0) {
            sendMessage('pk message', "Clear some inventory space to take the wheat!\n", player);
            return;
          }
          await query(
            "UPDATE players SET chefQuest = 3 WHERE player_name = ?",
            [player.name]
          );
          player.chefQuest = 3;
        }
      },
      3:{
        speech: `I don't smell bread baking!`
      },
      4:{
        speech: `Bout time! Take this tomato and make a delicious fish sammich!\n`,
        action: async (player, query, addItem, removeItem, getItemAmount, sendMessage) => {
          let added = await addItem(player.name, 94, 3);
          if (added === 0) {
            sendMessage('pk message', "Clear some inventory space to take the tomato!", player);
            return;
          }
          await query(
            "UPDATE players SET chefQuest = 5 WHERE player_name = ?",
            [player.name]
          );
          player.chefQuest = 5;
        }
      },
      5:{
        speech: `I'm-- er I mean -- the customer is starving, hurry it up!\n`
      },
      6:{
        speech: `Got the sammich? Give it here!`,
        action: async (player, query, addItem, removeItem, getItemAmount, sendMessage) => {
          const sammich = await getItemAmount(player.name, 95);
          if (sammich===0){
            sendMessage('pk message', `You don't even have the sammich on you!`, player);
          }
          await removeItem(player.name, 95, 1);
          await query(
            "UPDATE players SET chefQuest = 7 WHERE player_name = ?",
            [player.name]
          );
          player.chefQuest = 7;
        }
      },
      7:{
        speech: `Order up!\n(the chef eats the sammich in one bite!)\nThat was delicious! Now that you've got some cooking skills under your belt, feel free to use the range and cook whatever you want!\n`,
        action: async (player, query, addItem, removeItem, getItemAmount, sendMessage) => {
          await query(
            "UPDATE players SET chefQuest = 8 WHERE player_name = ?",
            [player.name]
          );
          player.chefQuest = 8;
        }
      },
      8:{
        speech: `I feel bad for eating that sammich... Here, it's payday!\n(the chef pays you some coin)\n`,
        action: async (player, query, addItem, removeItem, getItemAmount, sendMessage) => {
          let added = await addItem(player.name, 21, 250);
          if (added===0){
            sendMessage('pk message', "Clear some inventory space to recieve your reward!", player);
            return;
          }
          await query(
            "UPDATE players SET chefQuest = 9 WHERE player_name = ?",
            [player.name]           
          );
          player.chefQuest = 9;
        }
      },
      9:{
        speech:`I could really go for a nice rat stew right now!\n`
      }
    }
  },
  "farmer":{
    kind: "npc",
    container: "objects",
    collision: true,
    prettyName: "Olive the Farmer",
    quest: {
      name:'farmerQuest',
      0:{
        speech: `Talk to me again if you have helped Chef D!`,
        action: async (player, query, addItem, removeItem, getItemAmount, sendMessage) => {
          if (player.chefQuest<8) {
            sendMessage('pk message', `You must complete the Chef's Quest to start this quest!`, player);
            return;
          }
          await query(
            "UPDATE players SET farmerQuest = 1 WHERE player_name = ?",
            [player.name]
          );
          player.farmerQuest = 1;
        }
      },
      1:{
        speech: `Take these seeds to my brother, the Hermit... He may know how to grow plants out of season...`,
          action: async (player, query, addItem, removeItem, getItemAmount, sendMessage) => {
          let added = await addItem(player.name, 104, 1);
          if (added===0){
            sendMessage('pk message', "Clear some inventory space to take the seeds!", player);
            return;
          }
          await query(
            "UPDATE players SET farmerQuest = 2 WHERE player_name = ?",
            [player.name]
          );
          player.farmerQuest = 2;
        }
      },
      2:{
        speech: `Have you talked to my brother, the Hermit, yet?`
      },
      3:{
        speech: `Have you tried planting the seeds yet? Just find an empty patch of grass outside of town and drop the seed, it should germinate!`
      },
      4:{
        speech: `I see you've planted the seeds! Go back and check in a while... You should be able to dig up your crops with a spade when it is at it's final growth stage! Plants you own are marked for you to see...`
      },
      5:{
        speech: `Nicely done! That green thumb really helped! Now that we can grow things out of season, we can send the merchant with food for the neighboring villages!`,
        action: async (player, query, addItem, removeItem, getItemAmount, sendMessage) => {
          await query(
            "UPDATE players SET farmerQuest = 6 WHERE player_name = ?",
            [player.name]
          );
          player.farmerQuest = 6;
        }
      },
      6:{
        speech: `Here, take this for your help!`,
        action: async (player, query, addItem, removeItem, getItemAmount, sendMessage) => {
          let added = await addItem(player.name, 21, 500);
          if (added===0){
            sendMessage('pk message', "Clear some inventory space to receive your reward!", player);
            return;
          }
          await query(
            "UPDATE players SET farmerQuest = 7 WHERE player_name = ?",
            [player.name]
          );
          player.farmerQuest = 7;
        },
      },
      7:{
        speech: `How's the harvest?`
      }
    }
  },
  "hermit":{
    kind: "npc",
    container: "objects",
    collision: true,
    prettyName: "Old Hermit",
    quest: {
      name:'farmerQuest',
      0:{
        speech: `Get out of my house!`
      },
      1:{
        speech: `Didn't I tell you to scram?! I'm trying to herm it in peace!`
      },
      2:{
        speech: `My sister sent you eh?...plants out of season eh?... Here...(the hermit grabs your hand and dunks your thumb in green paint!) HAHA! Now you've got a green thumb! Go try planting something now... it should grow. Although it might take a while...`,
        action: async (player, query, addItem, removeItem, getItemAmount, sendMessage) => {
          await query(
            "UPDATE players SET farmerQuest = 3 WHERE player_name = ?",
            [player.name]
          );
          player.farmerQuest = 3;
        }
      },
      3:{
        speech: `No really, it's just paint... Tell my sister to quit sending people to bother me...`
      },
      4: {
        speech: `Hermit? I hardly know it! (incessant chortling)`
      },
      5:{
        speech: `I should quit being a hermit and come out of my shell... heheh, get it? Like a hermit crab? heheh...`
      },
      6:{
        speech: `(the hermit appears to be chewing loudly on nothing...)`
      },
      7:{
        speech: `(the hermit appears to be chewing loudly on nothing...)`
      }
    }
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
  "questTile":{
    kind: "questTile",
    container: "questTile",
    collision:false,
    questName:null,
    stagePass:null
  },
  "fenceHORIZ":{
    kind: "object",
    container: "objects",
    collision: true
  },
  "fenceVERT":{
    kind: "object",
    container: "objects",
    collision: true
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
  }
}

