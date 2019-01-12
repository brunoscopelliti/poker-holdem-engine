"use strict";

const task = require("./task");
const States = require("../../domain/tournament/states");

const Task = Object.create(task);

Task.name = "Announce current hand";

Task.shouldRun =
  (tournament) =>
    tournament.state !== States.get("completed");

Task.run =
  async (LOGGER, { gamestate }) => {
    const game = gamestate.gameProgressiveId;
    const hand = gamestate.handProgressiveId;

    LOGGER.info(`Starting hand ${game}/${hand}`, { tag: gamestate.handUniqueId });
  };

module.exports = Task;
