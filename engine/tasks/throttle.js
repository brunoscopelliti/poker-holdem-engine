"use strict";

const task = require("./task");
const isRunning = require("./utils/is-tournament-running");
const sleep = require("./utils/sleep");

const Task = Object.create(task);

Task.name = "Wait before new hand";

Task.shouldRun =
  (tournament) =>
    isRunning(tournament) &&
      tournament.settings.HAND_THROTTLE_TIME > 0;

Task.run =
  async (_, { settings }) => sleep(settings.HAND_THROTTLE_TIME);

module.exports = Task;
