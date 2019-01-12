"use strict";

const task = require("../task");
const isRunning = require("../utils/is-tournament-running");

const Task = Object.create(task);

Task.name = "Save setup";

Task.shouldRun = isRunning;

Task.run =
  (LOGGER, tournament) => {
    const gamestate = tournament.gamestate;
    const state = {
      handId: gamestate.handUniqueId,
      ante: gamestate.ante || 0,
      players: gamestate.players,
      pot: gamestate.pot,
      sb: gamestate.sb,
    };

    // LOGGER.verbose("Gamestate when setup is completed:\n" +
    //   JSON.stringify(gamestate, null, 2), { tag: gamestate.handUniqueId });

    return tournament.update({
      type: "setup",
      ...state,
    });
  };

module.exports = Task;
