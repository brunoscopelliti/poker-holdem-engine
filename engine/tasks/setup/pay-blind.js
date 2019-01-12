"use strict";

const task = require("../task");
const nextActive = require("../utils/next-active-player");
const isRunning = require("../utils/is-tournament-running");

const Task = Object.create(task);

Task.name = "Pay Blinds";

Task.shouldRun = isRunning;

Task.run =
  (_, { gamestate }) => {
    const indexSB = nextActive(gamestate.players, gamestate.dealerPosition);

    gamestate.players[indexSB].pay(gamestate, gamestate.sb);

    const indexBB = nextActive(gamestate.players, indexSB);

    gamestate.players[indexBB].pay(gamestate, 2 * gamestate.sb);
    gamestate.players[indexBB][Symbol.for("Big blind")] = true;
  };

module.exports = Task;
