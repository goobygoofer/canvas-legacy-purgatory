
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
    prettyName: "stone sword",
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
    prettyName: "wood block",
    kind: "item",
    id: 6,
    container: "objects",
    collision: true,
    craft: { log: 10 }
  },
  "stoneblock": {
    "x": 288, "y": 0,
    prettyName: "stone block",
    kind: "item",
    id: 7,
    container: "objects",
    collision: true,
    craft: { rock: 10 },
    dropChange: "stoneblock0"
  },
  "ironore": {
    "x": 272, "y": 32,
    prettyName: "iron ore",
    kind: "item",
    id: 8,
    container: "objects",
    collision: false,
    smelt: "ironbar"
  },
  "ironbar": {
    "x": 272, "y": 0,
    prettyName: "iron bar",
    kind: "item",
    id: 9,
    container: "objects",
    collision: false,
    smelt: { ironore: 5 }
  },
  "ironsword": {
    "x": 304, "y": 976,
    prettyName: "iron sword",
    kind: "item",
    id: 10,
    container: "objects",
    collision: false,
    craft: { ironbar: 4, log: 2 },
  },
  "oaklog": {
    "x": 192, "y": 1104,
    prettyName: "oak log",
    id: 11
  },
  "woodplate": {
    "x": 112,
    "y": 80,
     prettyName: "wood floor",
    id: 12,
    craft: { log: 5 }
  },
  "stoneplate": {
    "x": 128, "y": 80,
    prettyName: "stone floor",
    id: 13,
    craft: { rock: 5 }
  },
  "woodroof": {
    "x": 112,
    "y": 80,
    prettyName: "wood ceiling",
    id: 14,
    craft: { log: 5 }
  },
  "stoneroof": {
    prettyName: "stone ceiling",
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
    prettyName: "red flower",
    id:17
  },//
  "flowerwhite": {
    "x": 64, "y": 48,
    prettyName: "white flower",
    id:18
  },//
  "floweryellow": {
    "x": 112, "y": 48,
    prettyName: "yellow flower",
    id:19
  },//
  "flowercrown":{
    "x":208,"y":1120,
    prettyName: "flower crown",
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
    prettyName: "goblin sword",
    id: 24
  },
  "orangedust": {
    "x":32,"y":256,
    prettyName: "orange dust",
    id: 25
  },
  "bluedust": {
    "x":48,"y":256,
    prettyName: "blue dust",    
    id: 26
  },
  "yellowdust": {
    "x":64,"y":256, 
    prettyName: "yellow dust",   
    id: 27
  },
  "healthpotion": {
    "x":256,"y":896,
    prettyName: "health potion",
    id: 28,
    craft: { orangedust: 10 }
  },
  "leatherarmor": {
    "x":272,"y":272,
    prettyName: "leather armor",
    id: 29,
    craft: { hide: 5 }
  },
  "leatherhelmet": {
    "x":176,"y":352,
    prettyName: "leather helmet",
    id: 30,
    craft: { hide: 4 },
  },
  "ironarmor": {
    "x":286,"y":208,
    prettyName:"iron armor",
    id:31,
    craft: { hide: 2, ironbar: 5 },
  },
  "ironhelmet": {
    "x":160,"y":352,
    prettyName:"iron helmet",
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
    prettyName: "Old Haven teleport",
    id: 34,
    craft: { hide: 1, bluedust: 50 },
  },
  "speedboots": {
    "x":144,"y":448,
    prettyName: "speed boots",
    id: 35,
    craft: { hide: 4, bluedust: 100000 }
  },
  "arrow": {
    "x":48,"y":1216,
    prettyName: "iron arrow",
    id: 36,
    craft: { log: 1, ironbar: 1 }
  },
  "bow":{
    "x":32,"y":240,
    id: 37,
    craft: { log: 1, hide: 1, string: 1 },
  },
  "string": { 
    "x": 80, "y": 240,
    id: 38
  },
  "fishingpole": {
    "x":288,"y":480,
    prettyName: "fishing pole",
    id: 39,
    craft: { log: 1, hide: 1, string: 1, ironbar: 1 },
  },
  "cod":{
    "x":256,"y":480,
    id: 40
  },
  "goldfish":{
    "x":272, "y":480,
    id: 41,
  },
  "redfish":{
    "x":208,"y":480,
    id: 42,
  },
  "arrowfire": {
    "x":80, "y":962,
    prettyName: "bomb arrow",
    id: 43,
    craft: { log: 1, ironbar: 1, yellowdust: 100 },
  },
  "coal": {
    "x":256,"y":32,
    id: 44
  },
  "silver": {
    "x":288,"y":32,
    id: 45
  },
  "silverbar": {
    "x":304,"y":112,
    prettyName: "silver bar",
    id: 46,
    smelt: { silver: 1, coal: 1 },
  },
  "copper": {
    "x":272,"y":32,
    id: 47,
  },
  "copperbar": {
    "x":288,"y":128,
    prettyName: "copper bar",
    id: 48,
    smelt: { copper: 5, coal: 1 },
  },
  "gold": {
    "x":288,"y":16,
    id: 49,
  },
  "goldbar": {
    "x":288,"y":112,
    prettyName: "gold bar",
    id: 50,
    smelt: { gold: 5, coal: 5 },
  },
  "diamond": {
    "x":240,"y":720,
    id: 51,
  },
  "diamondbar": {
    "x":160,"y":720,
    prettyName: "diamond bar",
    id: 52,
    smelt: { diamond: 5, coal: 10 },
  },
  "copperhelmet": {
    "x":192,"y":352,
    prettyName: "copper helmet",
    id:53,
    craft: { copperbar: 2, ironbar: 1, hide: 1 },
  },
  "silverhelmet": {
    "x":208,"y":352,
    prettyName: "silver helmet",
    id:54,
    craft: { silverbar: 2, ironbar: 1, hide: 1 },
  },
  "goldhelmet": {
    "x":224,"y":352,
    prettyName: "gold helmet",
    id:55,
    craft: { goldbar: 2, ironbar: 1, hide: 1 },
  },
  "diamondhelmet": {
    "x":176,"y":704,
    prettyName: "diamond helmet",
    id:56,
    craft: { diamondbar: 2, ironbar: 1, hide: 1 },
  },
  "copperarmor": {
    "x":272,"y":272,
    prettyName: "copper armor",
    id:57,
    craft: { copperbar: 5, ironbar: 2, hide: 2 },
  },
  "silverarmor": {
    "x":288,"y":272,
    prettyName: "silver armor",
    id:58,
    craft: { silverbar: 5, ironbar: 2, hide: 2 },
  },
  "goldarmor": {
    "x":304,"y":224,
    prettyName: "gold armor",
    id:59,
    craft: { goldbar: 5, ironbar: 2, hide: 2 },
  },
  "diamondarmor": {
    "x":160,"y":704,
    prettyName: "diamond armor",
    id:60,
    craft: { diamondbar: 5, ironbar: 2, hide: 2 },
  },
  "coppersword": {
    "x":288,"y":144,
    prettyName: "copper sword",
    id: 61,
    craft: { copperbar: 2, log: 1, ironbar: 1 },
  },
  "silversword": {
    "x":302,"y":144,
    prettyName: "silver sword",
    id: 62,
    craft: { silverbar: 2, log: 1, ironbar: 1 }
  },
  "goldsword": {
    "x":302,"y":128,
    prettyName: "gold sword",
    id: 63,
    craft: { goldbar: 2, log: 1, ironbar: 1 },
  },
  "diamondsword": {
    "x":176,"y":720,
    prettyName: "diamond sword",
    id: 64,
    craft: { diamondbar: 2, log: 1, ironbar: 1 },
  },
  "bowoak":{
    "x":0,"y":1120,
    prettyName: "oak bow",
    id: 65,
    craft: { oaklog: 2, hide: 1, string: 1 },
  },
  "axeiron": {
    "x":80,"y":64,
    prettyName: "iron axe",
    id: 66,
    craft: { log: 1, ironbar: 1 },
  },
  "axecopper": {
    "x":288,"y":192,
    prettyName: "copper axe",
    id: 67,
    craft: { log: 1, copperbar: 1 },
  },
  "axesilver": {
    "x":302,"y":192,
    prettyName: "silver axe",
    id: 68,
    craft: { log: 1, silverbar: 1 },
  },
  "axegold": {
    "x":302,"y":208,
    prettyName: "gold axe",
    id: 69,
    craft: { log: 1, goldbar: 1 },
  },
  "axediamond": {
    "x":224,"y":720,
    prettyName: "diamond axe",
    id: 70,
    craft: { log: 1, diamondbar: 1 },
  },
  "pickaxeiron": {
    "x":48,"y":64,
    prettyName: "iron pickaxe",
    id: 71,
    craft: { log: 2, ironbar: 2 },
  },
  "pickaxecopper": {
    "x":288,"y":176,
    prettyName: "copper pickaxe",
    id: 72,
    craft: { log: 2, copperbar: 2 },
  },
  "pickaxesilver": {
    "x":272,"y":176,
    prettyName: "silver pickaxe",
    id: 73,
    craft: { log: 2, silverbar: 2 },
  },
  "pickaxegold": {
    "x":302,"y":176,
    prettyName: "gold pickaxe",
    id: 74,
    craft: { log: 2, goldbar: 2 },
  },
  "pickaxediamond": {
    "x":144,"y":720,
    prettyName: "diamond pickaxe",
    id: 75,
    craft: { log: 2, diamondbar: 2 },
  },
  "arrowcopper": {
    "x":80,"y":1216,
    prettyName: "copper arrow",
    id: 76,
    craft: { log: 1, copperbar: 1 },
  },
  "arrowsilver": {
    "x":96,"y":1216,
    prettyName: "silver arrow",
    id: 77,
    craft: { log: 1, silverbar: 1 },
  },
  "arrowgold": {
    "x":112,"y":1216,
    prettyName: "gold arrow",
    id: 78,
    craft: { log: 1, goldbar: 1 },
  },
  "arrowdiamond": {
    "x":128,"y":1216,
    prettyName: "diamond arrow",
    id: 79,
    craft: { log: 1, diamondbar: 1 },
  },
/*-----------shop items-----------------*/
  "healthpotionShop":{
    "x":256,"y":896,
    container: "objects",
    kind: "interactable",
    cost: {coin:1},
    item: "healthpotion"
  },
  "silverswordShop":{
    "x":302,"y":144,
    container: "objects",
    kind: "interactable",
    cost: {coin: 5000},
    item: "silversword"
  },
  "arrowcopperShop":{
    "x":80,"y":1216,
    container: "objects",
    kind: "interactable",
    cost: {coin: 100},
    amount: 5,
    item: "arrowcopper"
  },
  "axegoldShop":{
    "x":302,"y":208,
    container: "objects",
    kind: "interactable",
    cost: {coin: 3000},
    amount: 1,
    item: "axegold"
  },
  "pickaxeShop":{
    "x": 32, "y": 64,
    container: "objects",
    kind: "interactable",
    cost: {coin: 0},
    amount: 1,
    item: "pickaxe"
  },
  "axeShop":{
    "x": 64, "y": 64,
    container: "objects",
    kind: "interactable",
    cost: {coin: 0},
    amount: 1,
    item: "axe"
  },
  "bedShop":{
    "x": 128, "y": 112,
    container: "objects",
    kind: "interactable",
    cost: {coin: 5},
    amount: 0,
    item: "coin"//lol
  },
  "arrowdiamondUp": { "x": 16, "y": 1008 },
  "arrowdiamondDown": { "x": 32, "y": 1008 },
  "arrowdiamondLeft": { "x": 48, "y": 1008 },
  "arrowdiamondRight": { "x": 64, "y": 1008 },

  "arrowgoldUp": { "x": 16, "y": 992 },
  "arrowgoldDown": { "x": 32, "y": 992 },
  "arrowgoldLeft": { "x": 48, "y": 992 },
  "arrowgoldRight": { "x": 64, "y": 992 },

  "arrowsilverUp": { "x": 16, "y": 976 },
  "arrowsilverDown": { "x": 32, "y": 976 },
  "arrowsilverLeft": { "x": 48, "y": 976 },
  "arrowsilverRight": { "x": 64, "y": 976 },

  "arrowcopperUp": { "x": 16, "y": 960 },
  "arrowcopperDown": { "x": 32, "y": 960 },
  "arrowcopperLeft": { "x": 48, "y": 960 },
  "arrowcopperRight": { "x": 64, "y": 960 },
  "pickaxediamondL":{
    "x":272,"y":704,
  },
  "pickaxediamondR":{
    "x":256,"y":704,
  },
  "pickaxegoldL":{
    "x":272,"y":208,
  },
  "pickaxegoldR":{
    "x":256,"y":208,
  },
  "pickaxesilverL":{
    "x":240,"y":208,
  },
  "pickaxesilverR":{
    "x":224,"y":208,
  },
  "pickaxecopperL":{
    "x":208,"y":208,
  },
  "pickaxecopperR":{
    "x":192,"y":208,
  },
  "pickaxeironL":{
    "x":224,"y":192,
  },
  "pickaxeironR":{
    "x":48,"y":192,
  },
  "axediamondL":{
    "x":272,"y":720,
  },
  "axediamondR":{
    "x":256,"y":720,
  },
  "axegoldL":{
    "x":272,"y":224,
  },
  "axegoldR":{
    "x":256,"y":224,
  },
  "axesilverL":{
    "x":240,"y":224,
  },
  "axesilverR":{
    "x":224,"y":224,
  },
  "axecopperL":{
    "x":208,"y":224,
  },
  "axecopperR":{
    "x":192,"y":224,
  },
  "axeironL":{
    "x":240,"y":192,
  },
  "axeironR":{
    "x":32,"y":192,
  },
  "bowoakL":{
    "x":32,"y":1120,
  },
  "bowoakR":{
    "x":16,"y":1120,
  },
  "diamondswordL":{
    "x":128,"y":720,    
  },
  "diamondswordR":{
    "x":112,"y":720,
  },
  "goldswordL":{
    "x":144,"y":192,    
  },
  "goldswordR":{
    "x":128,"y":192,
  },
  "silverswordL":{
    "x":160,"y":192,    
  },
  "silverswordR":{
    "x":112,"y":192,
  },
  "copperswordL":{
    "x":144,"y":192,    
  },
  "copperswordR":{
    "x":96,"y":192,
  },
  "diamondarmorL":{
    "x":241,"y":704,
  },
  "diamondarmorR":{
    "x":191,"y":704,
  },
  "goldarmorL":{
    "x":49,"y":288,
  },
  "goldarmorR":{
    "x":-1,"y":288,
  },
  "silverarmorL":{
    "x":177,"y":288,
  },
  "silverarmorR":{
    "x":127,"y":288,
  },
  "copperarmorL":{
    "x":113,"y":288,
  },
  "copperarmorR":{
    "x":63,"y":288,
  },
  "diamondhelmetL":{
    "x":209,"y":720
  },
  "diamondhelmetR":{
    "x":191,"y":720
  },
  "goldhelmetL":{
    "x":113,"y":368
  },
  "goldhelmetR":{
    "x":95,"y":368
  },
  "silverhelmetL":{
    "x":145,"y":368
  },
  "silverhelmetR":{
    "x":127,"y":368
  },
  "copperhelmetL":{
    "x":177,"y":368
  },
  "copperhelmetR":{
    "x":159,"y":368
  },
  "arrowfireUp":{
    "x":96,"y":962,
  },
  "arrowfireDown":{
    "x":112,"y":962,
  },
  "arrowfireLeft":{
    "x":128,"y":962,
  },
  "arrowfireRight":{
    "x":144,"y":962,
  },
  "fishingspot":{
    "x":272,"y":1264,
  },
  "fishingpoleL":{
    "x":16,"y":496
  },
  "fishingpoleR":{
    "x":0,"y":496
  },
  "campfire1": {
    "x":48, "y":1072
  },
  "campfire2": {
    "x":160,"y":1072
  },
  "bowL":{
    "x":144,"y":240
  },
  "bowR":{
    "x":128,"y":240
  },
  "arrowUp": { "x": 208, "y": 240 },
  "arrowDown": { "x": 224, "y": 240 },
  "arrowLeft": { "x": 240, "y": 240 },
  "arrowRight": { "x": 256, "y": 240 },
  "speedbootsL": {
    "x":161,"y":448
  },
  "speedbootsR": {
    "x":159,"y":432
  },
  "criminalL": {
    "x":97,"y":176
  },
  "criminalR": {
    "x":79,"y":176
  },
  "combatIcon":{
    "x":128, "y":832
  },
  "goatR":{
    "x":192,"y":288
  },
  "goatL":{
    "x":208,"y":288
  },
  "zorgR":{
    "x":80,"y":144
  },
  "zorgL":{
    "x":208,"y":128
  },
  "minizorgR":{
    "x":256,"y":400
  },
  "minizorgL":{
    "x":240,"y":400
  },
  "treeEntL":{
    "x":288,"y":1216,
  },
  "rockGolemR":{
    "x":304,"y":1200
  },
  "rockGolemL":{
    "x":304,"y":1200
  },
  "treeEntR":{
    "x":288,"y":1216
  },
  "spiderL":{
    "x":112,"y":240
  },
  "spiderR":{
    "x":96,"y":240
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
  "grass": { "x": 0, "y": 0, 'roof': false, 'type': 'b-t', 'collision': false },//plain, "y":green grass
  "grass2": { "x": 160, "y": 608 },
  "cutGrass": { "x": 128, "y": 48 },//when grass2 gets cut
  "snow": { "x": 208, "y": 528, 'roof': false, 'type': 'b-t', 'collision': false },//
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
  "coalrock0": {
    "x": 176, "y": 0,
  },
  "coalrock1": {
    "x": 192, "y": 32,
  },
  "coalrock2": {
    "x": 208, "y": 32,
  },
  "coalrock3": {
    "x": 224, "y": 32,
  },
  "coalrock4": {
    "x": 240, "y": 32,
  },
  "silverrock0": {
    "x":176,"y":0
  },
  "silverrock1": {
    "x":192,"y":160
  },
  "silverrock2": {
    "x":208,"y":160
  },
  "silverrock3": {
    "x":224,"y":160
  },
  "silverrock4": {
    "x":240,"y":160
  },
  "copperrock0": {
    "x":176,"y":0
  },
  "copperrock1": {
    "x":192,"y":176
  },
  "copperrock2": {
    "x":208,"y":176
  },
  "copperrock3": {
    "x":224,"y":176
  },
  "copperrock4": {
    "x":240,"y":176
  },
  "goldrock0": {
    "x":176,"y":0
  },
  "goldrock1": {
    "x":192,"y":144
  },
  "goldrock2": {
    "x":208,"y":144
  },
  "goldrock3": {
    "x":224,"y":144
  },
  "goldrock4": {
    "x":240,"y":144
  },
  "diamondrock0": {
    "x":176,"y":0
  },
  "diamondrock1": {
    "x":48,"y":720
  },
  "diamondrock2": {
    "x":64,"y":720
  },
  "diamondrock3": {
    "x":80,"y":720
  },
  "diamondrock4": {
    "x":96,"y":720
  },
  "web": { "x": 208, "y": 400 },
  "webRight": { "x": 208, "y": 400 },
  "webUp": { "x": 208, "y": 400 },
  "webDown": { "x": 208, "y": 400 },
  "webLeft": { "x": 208, "y": 400 },
  "spiderwebL":{
    "x": 208, "y": 400
  },
  "spiderwebR":{
    "x": 208, "y": 400
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
  "water": { "x": 0, "y": 48, "collision": true, 'roof': false, 'type': 'b-t' },//
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
  "rain": { "x": 144, "y": 432 },//
  "fenceV": { "x": 0, "y": 160 },
  "fenceH": { "x": 16, "y": 160 },
  "sand": { "x": 16, "y": 64, 'roof': false, 'type': 'b-t', 'collision': false },
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
  "fPoleR": { "x": 0, "y": 496 },
  "fPoleL": { "x": 16, "y": 495 },
  "fPole": { "x": 288, "y": 480 },
  "craftTable": { "x": 192, "y": 528, 'roof': false, 'type': 'objects', 'collision': false },//just this for now as a click point
  "lootbag": { "x": 192, "y": 240 },
  "abyss": { "x": 176, "y": 32, 'roof': false, 'type': 'b-t', 'collision': true },
  "void": { "x": 240, "y": 1232, 'roof': false, 'type': 'b-t', 'collision': true },//just blank space for event tiles (like map e"x"it or dungeon stairs)
  "dungeonStairs": { "x": 0, "y": 352 },
  "upStairs": {
     "x": 32, "y": 352 
  },
  "fish": { "x": 256, "y": 480 },
  "portalfish": { "x": 224, "y": 480 },
  "cookedfish": { "x": 272, "y": 480 },
  "bobber": { "x": 304, "y": 480 },
  "chest2": { "x": 240, "y": 816 },
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
  "shopkeep": { "x": 16, "y": 128 },//no shopkeepL "y"et
  "gnollR": { "x": 224, "y": 576 },
  "gnollL": { "x": 240, "y": 576 },
  "rangeGoblinR": { "x": 80, "y": 336 },
  "rangeGoblinL": { "x": 96, "y": 336 },
  "mageLichR": { "x": 80, "y": 160, "collision": true },
  "mageLichL": { "x": 64, "y": 160, "collision": true },//to here
  "goblinR": {//for draw and sprite size to work, need a drawqueue  type thing...
    "x":80,"y":16,
    //"drawSize":64,//test
    //"spriteSize":16//bigger if bigger mob sprite on sheet
  },
  "goblinL": {
    "x":80,"y":32,
    //"drawSize":64,//test
    //"spriteSize":16//bigger if bigger mob sprite on sheet
  }
}

