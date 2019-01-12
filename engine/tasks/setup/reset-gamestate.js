"use strict";

const task = require("../task");
const isRunning = require("../utils/is-tournament-running");
const Names = require("../../../domain/game/names");

const Task = Object.create(task);

Task.name = "Reset gamestate";

Task.shouldRun = isRunning;

Task.run =
  (_, { gamestate }) => {
    gamestate.pot = gamestate.callAmount = 0;
    gamestate.sidepots = [];
    gamestate.commonCards = [];

    gamestate.session = Names.get(0);
    gamestate.spinCount = 0;

    delete gamestate.handRank;
    delete gamestate.winners;

    gamestate.players.forEach((player) => {
      player.restore();
    });
  };

module.exports = Task;
