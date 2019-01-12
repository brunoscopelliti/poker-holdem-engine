"use strict";

const task = require("../task");
const isRunning = require("../utils/is-tournament-running");
const loop = require("../utils/loop-players");

const Task = Object.create(task);

Task.name = "Assign pot";

Task.shouldRun = isRunning;

Task.run =
  async (LOGGER, tournament) => {
    const gamestate = tournament.gamestate;
    const activePlayers = gamestate.activePlayers;

    // Shortcut:
    // When there's only one active player
    // it gets all the pot.
    if (activePlayers.length === 1) {
      assignChips(gamestate, activePlayers[0].id, gamestate.pot);
    } else {
      if (gamestate.sidepots.length === 0) {
        // When there're no sidepot
        // I create a single sidepot,
        // so that I can apply the same
        // algorithm to assign the pot.
        gamestate.sidepots
          .push({
            minChipsBet: gamestate.callAmount,
            pot: gamestate.pot,
          });
      }

      gamestate.sidepots
        .forEach((sidepot) => {
          // For each sidepot:
          // only players who have bet at least
          // `minChipsBet` have right to compete to win `sidepot.pot`
          const sidepotContenders = gamestate.handRank
            .filter(({ playerId }) => {
              const player = activePlayers.find((p) => p.id === playerId);

              return player.chipsBet >= sidepot.minChipsBet;
            });

          if (!sidepotContenders[0].bestCardsInfo.exequo) {
            return assignChips(gamestate, sidepotContenders[0].playerId, sidepot.pot);
          }

          // If execution reaches this point
          // the value of `sidepot.pot` should be
          // split between 2 or more players.
          const tag = sidepotContenders[0].bestCardsInfo.exequo;

          const exequoPlayers = sidepotContenders
            .filter(({ bestCardsInfo }) => bestCardsInfo.exequo === tag);

          const splitAmount = Math.floor(sidepot.pot / exequoPlayers.length);

          exequoPlayers
            .forEach(({ playerId }) => {
              assignChips(gamestate, playerId, splitAmount);
            });

          // In case of a split pot,
          // the chips will be split as evenly as possible,
          // with any odd chip(s) left over given out
          // to the winning player with the worst position
          // (left of the button being the worst).

          const excidingChips = sidepot.pot % exequoPlayers.length;

          if (excidingChips > 0) {
            let assigned = false;
            loop(gamestate.players, gamestate.dealerPosition,
              (player) => {
                if (assigned) {
                  return;
                }
                if (exequoPlayers.some((p) => p.id === player.id)) {
                  assignChips(gamestate, player.id, excidingChips);
                  assigned = true;
                }
              });
          }
        });
    }

    await tournament.update({
      type: "win",
      handId: gamestate.handUniqueId,
      winners: gamestate.winners,
    });

    LOGGER.info(`Hand ${gamestate.gameProgressiveId}/${gamestate.handProgressiveId} results:\n${prepareLogMessage(gamestate.winners)}`, { tag: gamestate.handUniqueId });
  };

module.exports = Task;

/**
 * @name assignChips
 * @param {Object} gamestate
 * @param {Number} playerId
 * @param {Number} amount
 */
const assignChips =
  (gamestate, playerId, amount) => {
    const player = gamestate.activePlayers
      .find((p) => p.id === playerId);

    player.chips += amount;
    gamestate.pot -= amount;

    if (!gamestate.winners) {
      gamestate.winners = [];
    }

    const winner = gamestate.winners
      .find((w) => w.playerId === player.id);

    if (winner) {
      winner.amount += amount;
    } else {
      gamestate.winners
        .push({
          amount,
          playerId,
          playerName: player.name,
        });
    }
  };

const prepareLogMessage =
  (winners) =>
    winners
      .reduce(
        (msg, winner) =>
          `${msg}* ${winner.playerName} wins ${winner.amount}.\n`,
        ""
      )
      .trim();
