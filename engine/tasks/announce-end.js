"use strict";

const task = require("./task");
const States = require("../../domain/tournament/states");

const Task = Object.create(task);

Task.name = "Announce end of the tournament";

Task.shouldRun =
  (tournament) => tournament.state === States.get("completed");

Task.run =
  (LOGGER, { gamestate }) => {
    LOGGER.info(`***\nThe tournament ${gamestate.tournamentId} is finished!\n***`, { tag: gamestate.handUniqueId });
  };

module.exports = Task;
