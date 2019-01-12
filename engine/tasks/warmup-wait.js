"use strict";

const task = require("./task");
const sleep = require("./utils/sleep");

const Task = Object.create(task);

Task.name = "Warmup wait";

Task.shouldRun =
  ({ gamestate, settings }) =>
    settings.WARMUP && gamestate.gameProgressiveId <= settings.WARMUP_GAME;

Task.run =
  async (_, { settings }) => sleep(settings.WARMUP_TIME);

module.exports = Task;
