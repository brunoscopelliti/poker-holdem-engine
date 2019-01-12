"use strict";

const task = require("../task");
const isRunning = require("../utils/is-tournament-running");

const Task = Object.create(task);

Task.name = "Pay ANTE";

Task.shouldRun =
  (tournament) =>
    Boolean(
      isRunning(tournament) &&
        tournament.settings.PAY_ANTE_AT_HAND &&
        tournament.gamestate.handProgressiveId >= tournament.settings.PAY_ANTE_AT_HAND
    );

Task.run =
  (_, { gamestate }) => {
    // Ante amount is 10% of Big Blind
    const amount = (2 * gamestate.sb) * 0.1;

    gamestate.ante = amount;

    gamestate.activePlayers
      .forEach((player) => player.pay(gamestate, amount));
  };

module.exports = Task;
