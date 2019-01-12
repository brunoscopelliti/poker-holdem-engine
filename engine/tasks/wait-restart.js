"use strict";

const task = require("./task");
const States = require("../../domain/tournament/states");

const Task = Object.create(task);

Task.name = "Wait game restart";

Task.shouldRun =
  (tournament) =>
    tournament.state === States.get("paused");

Task.run =
  async (_, tournament) =>
    new Promise((resolve) => {
      const checkTournamentState =
        () => {
          if (tournament.state === States.get("active")) {
            resolve();
          } else {
            setTimeout(checkTournamentState, 10000);
          }
        };

      checkTournamentState();
    });

module.exports = Task;
