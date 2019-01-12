"use strict";

/**
 * Determines whether the current bet loop
 * should be interrupted.
 * @name shouldInterruptCurrentBetLoop
 * @param {Object} gamestate
 * @return {Boolean}
 */
const shouldInterruptCurrentBetLoop =
  (gamestate) => {
    return gamestate.spinCount > 0 &&
      gamestate.activePlayers.every((player) =>
        player.chipsBet === gamestate.callAmount || player[Symbol.for("All-in")]);
  };

module.exports = shouldInterruptCurrentBetLoop;
