let nextMobId = 1; // private to this module

function getNextMobId(){
    return nextMobId++;
}

const mobTypes = {
    rat: (x, y) => ({
        id: getNextMobId(),
        type: "rat",
        x, y,
        spawnX: x,
        spawnY: y,

        hp: 25,
        attack: 2,
        lastAttack:Date.now(),
        state: "idle",
        target: null,

        aggroRadius: 6,
        leashRadius: 12,

        nextThink: 0,
        baseSpeed: 500+Math.floor(Math.random()*100),
        pursuitSpeed: 500+Math.floor(Math.random()*100),
        thinkSpeed: 500+Math.floor(Math.random()*100),
        facing: "left",

        drop: [
            { name: "coin", min: 1, max: 3, weight: 100 },
            { name: "hide", min: 1, max: 1, weight: 40 },
            { name: "rawRatmeat", min:1, max:1, weight: 1}
        ]
    }),
    scorpion: (x, y) => ({
        id: getNextMobId(),
        type: "scorpion",
        x, y,
        spawnX: x,
        spawnY: y,

        hp: 100,
        attack: 25,
        lastAttack:Date.now(),
        state: "idle",
        target: null,

        aggroRadius: 6,
        leashRadius: 12,

        nextThink: 0,
        baseSpeed: 500+Math.floor(Math.random()*100),
        pursuitSpeed: 500+Math.floor(Math.random()*100),
        thinkSpeed: 500+Math.floor(Math.random()*100),
        facing: "left",

        drop: [
            { name: "coin", min: 25, max: 50, weight: 100 },
        ]
    }),
    ghast: (x, y) => ({
        id: getNextMobId(),
        type: "ghast",
        x, y,
        spawnX: x,
        spawnY: y,

        hp: 100,
        attack: 25,
        lastAttack:Date.now(),
        state: "idle",
        target: null,

        aggroRadius: 6,
        leashRadius: 12,

        nextThink: 0,
        baseSpeed: 500+Math.floor(Math.random()*100),
        pursuitSpeed: 500+Math.floor(Math.random()*100),
        thinkSpeed: 500+Math.floor(Math.random()*100),
        facing: "left",
    }),
    skeleton: (x, y) => ({
        id: getNextMobId(),
        type: "skeleton",
        x, y,
        spawnX: x,
        spawnY: y,

        hp: 45,
        attack: 5,
        lastAttack:Date.now(),
        state: "idle",
        target: null,

        aggroRadius: 6,
        leashRadius: 7,

        nextThink: 0,
        baseSpeed: 1000+Math.floor(Math.random()*100),
        pursuitSpeed: 800+Math.floor(Math.random()*100),
        thinkSpeed: 1000+Math.floor(Math.random()*100),
        facing: "left",

        drop: [
            { name: "coin", min: 1, max: 10, weight: 100 },
            { name: "ironbar", min: 1, max: 2, weight: 20 },
        ]
    }),
    goblin: (x, y) => ({
        id: getNextMobId(),
        type: "goblin",
        x, y,
        spawnX: x,
        spawnY: y,

        hp: 75,
        attack: 12,
        lastAttack:Date.now(),
        state: "idle",
        target: null,

        aggroRadius: 6,
        leashRadius: 7,

        nextThink: 0,
        baseSpeed: 500+Math.floor(Math.random()*100),
        pursuitSpeed: 400+Math.floor(Math.random()*100),
        thinkSpeed: 500+Math.floor(Math.random()*100),
        facing: "left",

        drop: [
            { name: "coin", min: 5, max: 25, weight: 1000 },
            { name: "goblinsword", min: 1, max: 1, weight: 1 },
            { name: "healthpotion", min: 1, max: 1, weight: 50 },
            { name: "grapeSeed", min: 1, max: 1, weight: 100 }
        ]
    }),
    mushroom: (x, y) => ({
        id: getNextMobId(),
        type: "mushroom",
        x, y,
        spawnX: x,
        spawnY: y,

        hp: 100,
        attack: 0,
        lastAttack:Date.now(),
        state: "idle",
        target: null,

        aggroRadius: 0,
        leashRadius: 0,

        nextThink: 10000,
        facing: "left",
        passive: true,
        baseSpeed: 0,
        pursuitSpeed: 0,
        thinkSpeed: 0,
        drop: [
            { name: "orangedust", min: 1, max: 10, weight: 100 },
            { name: "bluedust", min: 1, max: 10, weight: 50 },
            { name: "yellowdust", min: 1, max: 10, weight: 25 },
        ]
    }),
    poisonMushroom: (x, y) => ({
        id: getNextMobId(),
        type: "poisonMushroom",
        x, y,
        spawnX: x,
        spawnY: y,

        hp: 200,
        attack: 25,
        lastAttack:Date.now(),
        state: "idle",
        target: null,

        aggroRadius: 1,
        leashRadius: 0,

        nextThink: 0,
        facing: "left",
        baseSpeed: 1000,
        pursuitSpeed: 0,
        thinkSpeed: 1000,
        drop: [
            { name: "reddust", min: 1, max: 10, weight: 100 },
            { name: "purpledust", min: 1, max: 10, weight: 50 },
            { name: "greendust", min: 1, max: 10, weight: 25 },
        ]
    }),
    goat: (x, y) => ({
        id: getNextMobId(),
        type: "goat",
        x, y,
        spawnX: x,
        spawnY: y,

        hp: 20,
        attack: 0,
        lastAttack:Date.now(),
        state: "idle",
        target: null,

        aggroRadius: 0,
        leashRadius: 25,

        nextThink: 0,
        baseSpeed: 2000+Math.floor(Math.random()*100),
        pursuitSpeed: 2000+Math.floor(Math.random()*100),
        thinkSpeed: 2000+Math.floor(Math.random()*100),
        facing: "left",
        passive: true,
        drop: [
            { name: "hide", min: 1, max: 2, weight: 100 },
            { name: "rawMeat", min:1, max:1, weight: 50 }
        ]
    }),
    domesticGoat: (x, y) => ({
        id: getNextMobId(),
        type: "domesticGoat",
        x, y,
        spawnX: x,
        spawnY: y,

        hp: 20,
        attack: 0,
        lastAttack:Date.now(),
        state: "idle",
        target: null,

        aggroRadius: 0,
        leashRadius: 25,

        nextThink: 0,
        baseSpeed: 2000+Math.floor(Math.random()*100),
        pursuitSpeed: 2000+Math.floor(Math.random()*100),
        thinkSpeed: 2000+Math.floor(Math.random()*100),
        facing: "left",
        passive: true,
        drop: [
            { name: "hide", min: 1, max: 2, weight: 100 },
            { name: "rawMeat", min:1, max:1, weight: 50 }
        ]
    }),
    rabbit: (x, y) => ({
        id: getNextMobId(),
        type: "rabbit",
        x, y,
        spawnX: x,
        spawnY: y,

        hp: 10,
        attack: 0,
        lastAttack:Date.now(),
        state: "idle",
        target: null,

        aggroRadius: 0,
        leashRadius: 25,

        nextThink: 0,
        baseSpeed: 2000+Math.floor(Math.random()*100),
        pursuitSpeed: 2000+Math.floor(Math.random()*100),
        thinkSpeed: 2000+Math.floor(Math.random()*100),
        facing: "left",
        passive: true,
        drop: [
            { name: "hide", min: 1, max: 2, weight: 100 },
            { name: "carrotSeed", min: 1, max: 2, weight: 100 },
            { name: "rawMeat", min:1, max:1, weight: 1 }
        ]
    }),
    zorg: (x, y) => ({
        id: getNextMobId(),
        type: "zorg",
        x, y,
        spawnX: x,
        spawnY: y,

        spawnMinion: "minizorg",
        spawnMax: 5,
        spawnCount: 0,

        hp: 400,
        maxHp: 400,
        attack: 25,
        lastAttack:Date.now(),
        state: "idle",
        target: null,

        aggroRadius: 5,
        leashRadius: 5,

        nextThink: 0,
        baseSpeed: 1000+Math.floor(Math.random()*100),
        pursuitSpeed: 800+Math.floor(Math.random()*100),
        thinkSpeed: 1000,
        facing: "left",
        drop: [
            { name: "coin", min: 100, max: 250, weight: 10000 },
            { name: "yellowdust", min:25, max: 50, weight: 250 },
            { name: "speedboots", min:1, max: 1, weight: 1}
        ]
    }),
    minizorg: (x, y) => ({
        id: getNextMobId(),
        type: "minizorg",
        x, y,
        spawnX: x,
        spawnY: y,

        hp: 10,
        maxHp: 10,
        attack: 5,
        lastAttack:Date.now(),
        state: "idle",
        target: null,

        aggroRadius: 10,
        leashRadius: 10,

        nextThink: 0,
        baseSpeed: 500+Math.floor(Math.random()*100),
        pursuitSpeed: 500+Math.floor(Math.random()*100),
        thinkSpeed: 500+Math.floor(Math.random()*100),
        facing: "left",
    }),
    resourceMob: (x, y) => ({
        id: getNextMobId(),
        type: "resourceMob",
        x, y,
        spawnX: x,
        spawnY: y,

        hp: null,//gets set by player level
        attack: null,
        lastAttack:Date.now(),
        state: "idle",
        target: null,

        aggroRadius: 6,
        leashRadius: 15,

        nextThink: 0,
        baseSpeed: 500+Math.floor(Math.random()*100),
        pursuitSpeed: 400+Math.floor(Math.random()*100),
        thinkSpeed: 500+Math.floor(Math.random()*100),
        facing: "left",

        drop: [
            //determined by spawnMob
            //{ name: "*log or stone", min: *determined by lvl, max: *determined by lvl, weight: 100 }
        ]
    }),
    eye: (x, y) => ({
        id: getNextMobId(),
        type: "eye",//+color+L/R
        x, y,
        spawnX: x,
        spawnY: y,

        hp: 50,
        attack: 0,
        lastAttack:Date.now(),
        state: "idle",
        target: null,

        aggroRadius: 0,
        leashRadius: 15,

        nextThink: 0,
        baseSpeed: 750+Math.floor(Math.random()*100),
        pursuitSpeed: 750+Math.floor(Math.random()*100),
        thinkSpeed: 750+Math.floor(Math.random()*100),
        facing: "left",
        passive: true,
        drop: [
            //determined by randomized eye color
            //{ name: "<eye color>", min: 1, max: 5, weight: 100 }
        ]
    }),
    spider: (x, y) => ({
        id: getNextMobId(),
        type: "spider",
        x, y,
        spawnX: x,
        spawnY: y,

        hp: 40,
        attack: 5,
        lastAttack:Date.now(),
        state: "idle",
        target: null,

        rangeAttack: {
            type: "web",
            slow: true,
            slowTime: 4000
        },

        aggroRadius: 6,
        leashRadius: 7,

        nextThink: 0,
        baseSpeed: 500+Math.floor(Math.random()*100),
        pursuitSpeed: 500+Math.floor(Math.random()*100),
        thinkSpeed: 500+Math.floor(Math.random()*100),
        facing: "left",

        drop: [
            { name: "string", min:1, max: 1, weight: 100 }
        ]
    }),
    spiderQueen: (x, y) => ({
        id: getNextMobId(),
        type: "spiderQueen",
        x, y,
        spawnX: x,
        spawnY: y,

        hp: 1000,
        maxHp: 1000,
        attack: 25,
        lastAttack:Date.now(),
        state: "idle",
        target: null,

        rangeAttack: {
            type: "yellowdust",
            slow: true,
            slowTime: 4000
        },

        aggroRadius: 10,
        leashRadius: 0,

        nextThink: 0,
        baseSpeed: 500+Math.floor(Math.random()*100),
        pursuitSpeed: 500+Math.floor(Math.random()*100),
        thinkSpeed: 500+Math.floor(Math.random()*100),
        facing: "left",

        drop: [
            { name: "coin", min: 200, max: 1000, weight: 10000 },
            { name: "string", min:1, max: 10, weight: 10000 },
            { name: "speedboots", min:1, max:1, weight: 1 },
            { name: "manapotion", min:1, max: 5, weight: 500 },
            { name: "gold", min:1, max: 10, weight: 500 }
        ]
    }),
    spiderweb: (x, y) => ({
        id: getNextMobId(),
        type: "spiderweb",
        x, y,
        spawnX: x,
        spawnY: y,

        hp: 10,
        attack: 0,
        lastAttack:Date.now(),
        state: "idle",
        target: null,

        aggroRadius: 0,
        leashRadius: 0,

        nextThink: 10000,
        facing: "left",
        passive: true,
        baseSpeed: 0,
        pursuitSpeed: 0,
        thinkSpeed: 0,
        collision: true
    }),
    wolf: (x, y) => ({
        id: getNextMobId(),
        type: "wolf",
        x, y,
        spawnX: x,
        spawnY: y,

        hp: 100,
        attack: 20,
        lastAttack:Date.now(),
        state: "idle",
        target: null,

        aggroRadius: 12,
        leashRadius: 40,

        nextThink: 0,
        baseSpeed: 500+Math.floor(Math.random()*100),
        pursuitSpeed: 300+Math.floor(Math.random()*100),
        thinkSpeed: 500+Math.floor(Math.random()*100),
        facing: "left",

        drop: [
            { name: "hide", min: 1, max: 2, weight: 200 },
            { name: "rawMeat", min:1, max:1, weight: 50 },
            { name: "grapeSeed", min:1, max: 2, weight: 25 }
        ]
    }),
    troll: (x, y) => ({
        id: getNextMobId(),
        type: "troll",
        x, y,
        spawnX: x,
        spawnY: y,
        multiTile: 4,//square tiles covered by mob

        hp: 2000,
        attack: 20,
        lastAttack:Date.now(),
        state: "idle",
        target: null,

        aggroRadius: 10,
        leashRadius: 0,

        nextThink: 0,
        baseSpeed: 500+Math.floor(Math.random()*100),
        pursuitSpeed: 500+Math.floor(Math.random()*100),
        thinkSpeed: 500+Math.floor(Math.random()*100),
        facing: "left",
        rangeAttack: {
          type: "stone",
          slow: true,
          slowTime: 1000
        },
        drop: [
            { name: "coin", min: 100, max: 500, weight: 50 },
            { name: "rock", min: 100, max: 500, weight: 10 }
        ],
        quest: {
          name: "trollQuest",
          active: 1,//when player can attack it
          passive: 2//when it won't appear to player
        }
    }),
    bigSlime: (x, y) => ({
        id: getNextMobId(),
        type: "bigSlime",
        x, y,
        spawnX: x,
        spawnY: y,
        multiTile: 4,//square tiles covered by mob

        hp: 1000,
        attack: 20,
        lastAttack:Date.now(),
        state: "idle",
        target: null,

        aggroRadius: 10,
        leashRadius: 10,

        nextThink: 0,
        baseSpeed: 500+Math.floor(Math.random()*100),
        pursuitSpeed: 500+Math.floor(Math.random()*100),
        thinkSpeed: 500+Math.floor(Math.random()*100),
        facing: "left",
        drop: [
            { name: "hide", min: 1, max: 10, weight: 100 },
            { name: "coin", min: 100, max: 500, weight: 50 },
            { name: "rock", min: 100, max: 500, weight: 10 }
        ],
    }),
    guard: (x, y) => ({
        id: getNextMobId(),
        type: "guard",
        x, y,
        spawnX: x,
        spawnY: y,

        hp: 1000,
        attack: 40,
        lastAttack:Date.now(),
        state: "idle",
        target: null,
        guard: true,

        aggroRadius: 6,
        leashRadius: 12,

        nextThink: 0,
        baseSpeed: 600+Math.floor(Math.random()*100),
        pursuitSpeed: 400+Math.floor(Math.random()*100),
        thinkSpeed: 600+Math.floor(Math.random()*100),
        facing: "left",

        drop: [
            { name: "coin", min: 100, max: 500, weight: 100 },
        ]
    }),
};

function createMob(type, x, y) {
    const factory = mobTypes[type];
    if (!factory) throw new Error("Unknown mob type: " + type);
    return factory(x, y);
}

const mobSpawns = [
  {
    type: "guard",
    x:769, y:275,
    count: 12,
    respawnTime: 5000,
    kingdom: 'east'
  },
  {
    type:"guard",
    x:16, y:303,
    count: 12,
    respawnTime: 5000,
    kingdom: 'west'
  },
  {
    type: "guard",
    x:49, y:52,
    count: 1,
    respawnTime: 5000
  },
  {
    type: "eye",
    x:524, y:361,
    count: 1,
    respawnTime: 5000
  },
  {
    type: "eye",
    x:524, y:358,
    count: 1,
    respawnTime: 5000
  },
  {
    type: "eye",
    x:524, y:355,
    count: 1,
    respawnTime: 5000
  },
  {
    type: "eye",
    x:520, y:361,
    count: 1,
    respawnTime: 5000
  },
  {
    type: "eye",
    x:520, y:358,
    count: 1,
    respawnTime: 5000
  },
  {
    type: "eye",
    x:520, y:355,
    count: 1,
    respawnTime: 5000
  },
  {
    type: "eye",
    x:528, y:361,
    count: 1,
    respawnTime: 5000
  },
  {
    type: "eye",
    x:528, y:358,
    count: 1,
    respawnTime: 5000
  },
  {
    type: "eye",
    x:528, y:355,
    count: 1,
    respawnTime: 5000
  },
  {
    type: "spider",
    x:515, y:312,
    count: 3,
    respawnTime: 10000
  },
  {
    type: "domesticGoat",
    x:98, y:44,
    count: 2,
    respawnTime: 20000
  },
  {
    type: "troll",
    x: 249, y:76,
    count: 1,
    respawnTime: 20000
  },
  {//rats south of Old Haven
    type: "rat",
    x: 35,
    y: 76,
    count: 5,
    respawnTime: 20000 // ms
  },
  {
    type: "skeleton",
    x: 40, y: 35,
    count: 1,
    respawnTime: 20000
  },
  {
    type: "skeleton",
    x: 44, y: 35,
    count: 1,
    respawnTime: 20000
  },
  {
    type: "skeleton",
    x: 40, y: 33,
    count: 1,
    respawnTime: 20000
  },
  {
    type: "skeleton",
    x: 44, y: 33,
    count: 1,
    respawnTime: 20000
  },
  {
    type: "goblin",
    x: 77, y: 17,
    count: 1,
    respawnTime: 30000
  },
  {
    type: "goblin",
    x: 121, y: 46,
    count: 1,
    respawnTime: 30000
  },
  {
    type: "goblin",
    x: 70, y: 36,
    count: 1,
    respawnTime: 30000
  },
  {
    type: "goblin",
    x: 98, y: 9,
    count: 1,
    respawnTime: 30000
  },
  {//goblins in mountain pass room
    type: "goblin",
    x: 160, y: 71,
    count: 2,
    respawnTime: 30000
  },
  {//goblins outside of shop
    type: "goblin",
    x: 223, y: 79,
    count: 4,
    respawnTime: 30000
  },
  {//rats northeast of shop
    type: "rat",
    x: 229,
    y: 66,
    count: 8,
    respawnTime: 20000 // ms
  },
  //zorg mini-boss!
  {//south of mountains south of Old Haven
    type: "zorg",
    x: 42,
    y: 135,
    count: 1,
    respawnTime: 30000
  },
  {
    type: "spider",
    x: 131,
    y: 108,
    count: 2,
    respawnTime: 5000
  },
  {
    type: "spider",
    x: 150,
    y: 98,
    count: 3,
    respawnTime: 5000
  },
  {
    type: "spiderweb",
    x: 97, y: 111,
    count: 1,
    respawnTime: 30000
  },
  {
    type: "spiderweb",
    x: 110, y: 118,
    count: 1,
    respawnTime: 30000
  },
  {
    type: "spiderweb",
    x: 123, y: 114,
    count: 1,
    respawnTime: 30000
  },
  {
    type: "spiderweb",
    x: 135, y: 106,
    count: 1,
    respawnTime: 30000
  },
  {
    type: "spiderweb",
    x: 144, y: 101,
    count: 1,
    respawnTime: 30000
  },
  {
    type: "spiderQueen",
    x: 518, y: 312,
    count: 1,
    respawnTime: 30000
  }
];

module.exports = { createMob, mobTypes, mobSpawns };