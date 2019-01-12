"use strict";

const sortByRank = require("poker-rank");

const task = require("../task");
const isRunning = require("../utils/is-tournament-running");
const format = require("../../../domain/game/format-point");

const Task = Object.create(task);

Task.name = "Rank current hand";

Task.shouldRun = isRunning;

Task.run =
  async (LOGGER, tournament) => {
    const gamestate = tournament.gamestate;

    const activePlayers = gamestate.activePlayers;

    if (activePlayers.length === 1) {
      // When, after the betting session,
      // there's only one active player,
      // there's no need to showdown.

      return;
    }

    // it's an array containing the best combination
    // of each player
    const playersBestCombination =
      sortByRank(
        activePlayers
          .map((player) => player.showdown(gamestate).slice())
      );

    gamestate.handRank =
      playersBestCombination
        .map((data) => {
          const player = activePlayers[data.index];
          return {
            playerId: player.id,
            bestCards: data.slice(),
            bestCardsInfo: data.rank,
          };
        });

    await tournament.update({
      type: "showdown",
      handId: gamestate.handUniqueId,
      ranks: gamestate.handRank,
    });

    const log = gamestate.handRank
      .reduce(
        (msg, entry) =>
          `${msg}* ${format(entry.bestCardsInfo)}\n`,
        ""
      );

    LOGGER.info(`Hand rank:\n${log}`, { tag: gamestate.handUniqueId });
  };

module.exports = Task;
