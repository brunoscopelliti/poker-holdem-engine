"use strict";

const task = require("../task");
const isRunning = require("../utils/is-tournament-running");

const Task = Object.create(task);

Task.name = "Set Small Blind";

Task.shouldRun = isRunning;

Task.run =
  (_, tournament) => {
    // The amount of the SMALL BLIND depends by how many times
    // the dealer button has passed from its initial position.
    // See gamestate.dealerButtonRound.

    // SMALL_BLINDS_PERIOD defines how many loops around the table
    // should have been completed by the dealer button,
    // before the small blind level can be increased

    const { gamestate, settings } = tournament;

    const blinds = settings.SMALL_BLINDS;
    const period = settings.SMALL_BLINDS_PERIOD || 1;

    const blindIndex = Math.floor(gamestate.dealerButtonRound / period);

    const normalizedIndex = Math.min(blinds.length - 1, blindIndex);

    gamestate.sb = blinds[normalizedIndex];
  };

module.exports = Task;
