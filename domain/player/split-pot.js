"use strict";

/**
 * Split the pot in several side pots.
 * @name split
 * @param {Object} gamestate
 */
const split =
  (gamestate) => {
    // Array of bets,
    // sort in ascending order.
    let bets = gamestate.players
      .map((player) => player.chipsBet)
      .sort((bet1, bet2) => bet1 - bet2);

    if (bets[0] === bets[bets.length - 1]) {
      // Everyone has bet the same amount,
      // so no sidepots.
      return;
    }

    gamestate.sidepots = [];

    let bet;

    while ((bet = bets.shift()) >= 0) {
      if (bet > 0) {
        const threshold = gamestate.sidepots.length === 0
          ? bet
          : bet + gamestate.sidepots[gamestate.sidepots.length - 1].minChipsBet;

        gamestate.sidepots.push({
          minChipsBet: threshold,
          pot: bet * (bets.length + 1),
        });

        bets = bets
          .map((val) => val - bet);
      }
    }
  };

module.exports = split;
