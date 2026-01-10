const db = require("./db.js");
var handleInput = (user, data) => {
    console.log(`Handling input from ${user}`);
}
module.exports = {
    handlePlayerInput: handleInput
}