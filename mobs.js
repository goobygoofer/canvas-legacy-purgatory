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
        facing: "left",

        drop: [
            { name: "coin", min: 1, max: 10, weight: 100 },
            { name: "ironbar", min: 1, max: 2, weight: 20 }
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
        facing: "left",

        drop: [
            { name: "coin", min: 5, max: 25, weight: 1000 },
            { name: "hide", min: 1, max: 2, weight: 200 },
            { name: "flowercrown", min: 1, max: 2, weight: 100},
            { name: "goblinsword", min: 1, max: 1, weight: 5}
        ]
    })
};

function createMob(type, x, y) {
    const factory = mobTypes[type];
    if (!factory) throw new Error("Unknown mob type: " + type);
    return factory(x, y);
}
module.exports = { createMob };