"use strict";

/**
 * Determines whether the current bet round is completed;
 * that is when it remains only one active player, or
 * all the active players, but the ones in All in,
 * have bet the call amount.
 * @name isCurrentBetSessionCompleted
 * @param {Player[]} activePlayers
 * @param {Number} callAmount
 * @return {Boolean}
 */
const isCurrentBetSessionCompleted =
  (activePlayers, callAmount) => {
    return activePlayers.length === 1 ||
      activePlayers.every((player) =>
        player.chipsBet === callAmount || player[Symbol.for("All-in")]);
  };

module.exports = isCurrentBetSessionCompleted;
