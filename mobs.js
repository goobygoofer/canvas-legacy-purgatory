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

        drop: "coin"
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

        drop: "ironbar"
    })
};

function createMob(type, x, y) {
    const factory = mobTypes[type];
    if (!factory) throw new Error("Unknown mob type: " + type);
    return factory(x, y);
}
module.exports = { createMob };