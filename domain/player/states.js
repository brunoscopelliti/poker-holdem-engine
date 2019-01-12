"use strict";

const States = new Map([
  // The player is actively playing
  // the current hand.
  ["active", "active"],

  // The player has left the current hand,
  // and won't partecipate to the final showdown.
  ["fold", "fold"],

  // The player has lost all his chips;
  // He won't partecipate to any other hand in the current game
  ["out", "out"],
]);

module.exports = States;
