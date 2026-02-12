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
        thinkSpeed: 500+Math.floor(Math.random()*100),
        facing: "left",

        drop: [
            { name: "coin", min: 1, max: 3, weight: 100 },
            { name: "hide", min: 1, max: 1, weight: 40 }
        ]
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
        thinkSpeed: 1000+Math.floor(Math.random()*100),
        facing: "left",

        drop: [
            { name: "coin", min: 1, max: 10, weight: 100 },
            { name: "ironbar", min: 1, max: 2, weight: 20 },
            { name: "healthpotion", min: 1, max: 1, weight: 1}
        ]
    }),
    goblin: (x, y) => ({
        id: getNextMobId(),
        type: "goblin",
        x, y,
        spawnX: x,
        spawnY: y,

        hp: 75,
        attack: 10,
        lastAttack:Date.now(),
        state: "idle",
        target: null,

        aggroRadius: 6,
        leashRadius: 7,

        nextThink: 0,
        thinkSpeed: 250+Math.floor(Math.random()*100),
        facing: "left",

        drop: [
            { name: "coin", min: 5, max: 25, weight: 1000 },
            { name: "hide", min: 1, max: 2, weight: 200 },
            { name: "flowercrown", min: 1, max: 2, weight: 100 },
            { name: "goblinsword", min: 1, max: 1, weight: 1 },
            { name: "healthpotion", min: 1, max: 2, weight: 100 }
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
        thinkSpeed: 0,
        drop: [
            { name: "orangedust", min: 1, max: 10, weight: 100 },
            { name: "bluedust", min: 1, max: 10, weight: 50 },
            { name: "yellowdust", min: 1, max: 10, weight: 25 },
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
        thinkSpeed: 2000+Math.floor(Math.random()*100),
        facing: "left",
        passive: true,
        drop: [
            { name: "hide", min: 1, max: 2, weight: 100 }
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
        thinkSpeed: 1000,
        facing: "left",
        drop: [
            { name: "coin", min: 100, max: 250, weight: 10000 },
            { name: "orangedust", min: 25, max: 50, weight: 1000 },
            { name: "bluedust", min: 25, max: 50, weight: 500 },
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
        thinkSpeed: 500,
        facing: "left",
        drop: [
            { name: "hide", min: 1, max: 1, weight: 100 },
        ]
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
        thinkSpeed: 250+Math.floor(Math.random()*100),
        facing: "left",

        drop: [
            //determined by spawnMob
            //{ name: "*log or stone", min: *determined by lvl, max: *determined by lvl, weight: 100 }
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
        thinkSpeed: 250+Math.floor(Math.random()*100),
        facing: "left",

        drop: [
            { name: "coin", min: 5, max: 50, weight: 1000 },
            { name: "string", min:1, max: 1, weight: 1000 }
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
        thinkSpeed: 0,
        collision: true
    }),
};

function createMob(type, x, y) {
    const factory = mobTypes[type];
    if (!factory) throw new Error("Unknown mob type: " + type);
    return factory(x, y);
}
module.exports = { createMob, mobTypes };