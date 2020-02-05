"use strict";

const task = require("../task");
const isRunning = require("../utils/is-tournament-running");

const Task = Object.create(task);

Task.name = "Save setup";

Task.shouldRun = isRunning;

Task.run =
  (LOGGER, tournament) => {
    const gamestate = tournament.gamestate;

    gamestate.actions = [{
      type: "setup",
    }];

    return tournament.onFeed(gamestate);
  };

module.exports = Task;
