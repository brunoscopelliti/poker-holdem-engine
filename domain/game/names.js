"use strict";

// An object that maps the number of shared cards
// on the table with the name of the game phase.
const Sessions = new Map([
  [0, "PRE-FLOP"],
  [3, "FLOP"],
  [4, "TURN"],
  [5, "RIVER"],
]);

module.exports = Sessions;
