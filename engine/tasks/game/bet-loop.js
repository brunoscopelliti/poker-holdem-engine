"use strict";

const States = require("../../../domain/player/states");
const loop = require("../utils/loop-players-async");
const isCurrentBetSessionCompleted = require("../utils/is-current-bet-session-completed");
const shouldInterrupt = require("../utils/should-interrupt-current-bet-loop");

/**
 * @name collectBets
 * @param {Object} gamestate
 * @param {Number} startFrom
 */
const collectBets =
  async (gamestate, startFrom) => {
    do {
      await loop(gamestate.players, startFrom,
        () => {
          // Consider the following scenario:
          // A table with five players.
          // Arale is Dealer; Bender the first to talk PREFLOP.
          // Bender call; the player next to him raises.
          // All the players call, the loop completes.
          // A new loop starts, cause Bender has the right to talk.
          // Bender calls the bet.
          // In this case the loop must be immediately interrupted.
          return shouldInterrupt(gamestate);
        },
        async (player) => {
          if (!shouldBet(player)) {
            return;
          }

          const bet = await player.talk(gamestate);

          // That is, how much the player should bet
          // to remain active in this session.
          const playerCallAmount = Math.max(gamestate.callAmount - player.chipsBet, 0);

          if (bet >= playerCallAmount || bet === player.chips) {
            await player.payBet(gamestate, bet);
          } else {
            await player.fold(gamestate);
          }
        });

      gamestate.spinCount += 1;
    } while (!isCurrentBetSessionCompleted(gamestate.activePlayers, gamestate.callAmount));

    gamestate.lastRaiseAmount = 0;

    const s = Symbol.for("already-bet");
    gamestate.players.forEach((player) => {
      delete player[s];
    });
  };

module.exports = collectBets;

/**
 * Determine whether a player has right to bet
 * in the current hand.
 * @name shouldBet
 * @param {Player} player
 * @return {Boolean}
 */
const shouldBet =
  (player) => {
    if (player.state !== States.get("active")) {
      // Only the active players
      // have the right to bet.
      return false;
    }

    if (player[Symbol.for("All-in")]) {
      // Ask a new bet to a player
      // who have already bet everything
      // does not make sense.
      return false;
    }

    return true;
  };
