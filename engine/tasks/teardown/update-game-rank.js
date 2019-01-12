"use strict";

const task = require("../task");
const isRunning = require("../utils/is-tournament-running");
const PlayerState = require("../../../domain/player/states");

const Task = Object.create(task);

Task.name = "Update game rank";

Task.shouldRun = isRunning;

Task.run =
  async (LOGGER, tournament) => {
    const gamestate = tournament.gamestate;

    if (gamestate.gameRank == null) {
      gamestate.gameRank = [];
    }

    const playersToBeExcluded =
      gamestate.activePlayers
        .filter((player) => player.chips === 0);

    if (playersToBeExcluded.length === 0) {
      return;
    }

    if (playersToBeExcluded.length === 1) {
      playersToBeExcluded[0].state = PlayerState.get("out");

      gamestate.gameRank
        .unshift({
          playerId: playersToBeExcluded[0].id,
          playerName: playersToBeExcluded[0].name,
        });
    } else {
      // Reversing the chart
      // so that players with the weaker combination
      // results lower in the `gameRank` chart
      gamestate.handRank
        .slice()
        .reverse()
        .forEach(({ playerId }) => {
          const player = playersToBeExcluded.find((p) => p.id === playerId);

          if (player) {
            player.state = PlayerState.get("out");

            gamestate.gameRank
              .unshift({
                playerId: player.id,
                playerName: player.name,
              });
          }
        });
    }

    for (const player of playersToBeExcluded) {
      await tournament.update({
        type: "state",
        handId: gamestate.handUniqueId,
        playerId: player.id,
        state: PlayerState.get("out"),
      });

      LOGGER.info(`${player.name} is eliminated after hand ${gamestate.handProgressiveId}`, { tag: gamestate.handUniqueId });
    }
  };

module.exports = Task;
