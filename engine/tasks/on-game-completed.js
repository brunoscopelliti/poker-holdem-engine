"use strict";

const task = require("./task");
const States = require("../../domain/tournament/states");

const Task = Object.create(task);

Task.name = "Update";

Task.shouldRun =
  ({ gamestate }) =>
    gamestate.players.length === gamestate.outPlayers.length + 1;

Task.run =
  async (LOGGER, tournament) => {
    const gamestate = tournament.gamestate;

    const [winner] = gamestate.activePlayers;

    gamestate.gameRank
      .unshift({
        playerId: winner.id,
        playerName: winner.name,
      });

    const points = tournament.settings.POINTS
      .find((schema) => schema.length === gamestate.players.length);

    const finalRank = gamestate.gameRank
      .map((entry, i) => {
        return { ...entry, points: points[i] };
      });

    await tournament.update({
      type: "points",
      handId: gamestate.handUniqueId,
      gameId: gamestate.gameProgressiveId,
      rank: finalRank,
    });

    LOGGER.info(`Game ${gamestate.gameProgressiveId} completed.`, { tag: gamestate.handUniqueId });

    LOGGER.debug(`Game final rank:\n${formatFinalRank(finalRank)}`, { tag: gamestate.handUniqueId });

    // Prepare to complete the tournament,
    // or to start a new game.

    if (tournament.state === States.get("latest-game") || gamestate.gameProgressiveId === tournament.settings.MAX_GAMES) {
      tournament.state = States.get("completed");
    } else {
      delete gamestate.gameRank;

      gamestate.players
        .forEach((player) =>
          player.restore(/* toInitialCondition */ true));

      gamestate.gameProgressiveId += 1;
      gamestate.handProgressiveId = 1;
    }
  };

module.exports = Task;

const formatFinalRank =
  (rank) =>
    rank
      .reduce(
        (str, entry) =>
          `${str}* ${entry.playerName} +${entry.points}pts\n`,
        ""
      )
      .trim();
