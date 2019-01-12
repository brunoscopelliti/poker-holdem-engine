"use strict";

const task = require("../task");
const next = require("../utils/next-player");
const isRunning = require("../utils/is-tournament-running");
const PlayerStates = require("../../../domain/player/states");

const Task = Object.create(task);

Task.name = "Assign Dealer button";

Task.shouldRun = isRunning;

Task.run =
  (_, { gamestate }) => {
    if (gamestate.handProgressiveId === 1) {
      // It tracks how many times the dealer button
      // has passed from its initial position
      gamestate.dealerButtonRound = 0;

      const i = gamestate.initialDealerButtonIndex =
        (gamestate.gameProgressiveId - 1) % gamestate.players.length;

      if (gamestate.dealerPosition >= 0) {
        gamestate.players[gamestate.dealerPosition].unassignDealerButton();
      }

      gamestate.players[i].assignDealerButton();
    } else {
      let newDealerPosition = gamestate.dealerPosition;

      gamestate.players[newDealerPosition].unassignDealerButton();

      do {
        newDealerPosition = next(gamestate.players, newDealerPosition);

        if (newDealerPosition === gamestate.initialDealerButtonIndex) {
          gamestate.dealerButtonRound += 1;
        }
      } while (gamestate.players[newDealerPosition].state !== PlayerStates.get("active"));

      gamestate.players[newDealerPosition].assignDealerButton();
    }
  };

module.exports = Task;
