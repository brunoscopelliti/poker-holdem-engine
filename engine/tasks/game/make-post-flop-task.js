"use strict";

const task = require("../task");
const isRunning = require("../utils/is-tournament-running");
const Session = require("../../../domain/game/names");
const collectBets = require("./bet-loop");

const makePostFlopTask =
  (name) => {
    const Task = Object.create(task);

    Task.name = name + " betting round";

    Task.shouldRun =
      (tournament) =>
        isRunning(tournament) &&
          tournament.gamestate.activePlayers.length > 1;

    Task.run =
      async (LOGGER, tournament) => {
        const gamestate = tournament.gamestate;

        gamestate.session = Session.get(gamestate.commonCards.length);

        const playerWhoCanBetCount = gamestate.activePlayers
          .filter((player) => !player[Symbol.for("All-in")])
          .length;

        if (playerWhoCanBetCount > 1) {
          LOGGER.debug(`The ${gamestate.session} betting session is starting.`, { tag: gamestate.handUniqueId });

          // Count the number of time
          // that players had already have the possibility
          // to bet in the current session.
          // This info is useful to the bot player.
          gamestate.spinCount = 0;

          // After PREFLOP the first player who bet is the one
          // next to the plater who have bet the dealer button.
          const startFrom = gamestate.dealerPosition;

          await collectBets(gamestate, startFrom);
        }

        // If there's more than one player
        // uncover another cards on the table.
        if (gamestate.activePlayers.length > 1 && gamestate.commonCards.length < 5) {
          const card = gamestate.deck.shift();

          gamestate.commonCards =
            gamestate.commonCards.concat(card);

          await tournament.update({
            type: "cards",
            cards: gamestate.commonCards.slice(-1),
            handId: gamestate.handUniqueId,
            session: Session.get(gamestate.commonCards.length),
          });

          LOGGER.debug(`New common card: ${card.rank + card.type}.`, { tag: gamestate.handUniqueId });
        }
      };

    return Task;
  };

module.exports = makePostFlopTask;
