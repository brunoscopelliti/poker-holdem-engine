"use strict";

const task = require("../task");
const isRunning = require("../utils/is-tournament-running");
const Session = require("../../../domain/game/names");
const collectBets = require("./bet-loop");

const Task = Object.create(task);

Task.name = "PRE FLOP betting round";

Task.shouldRun =
  (tournament) =>
    isRunning(tournament) &&
      tournament.gamestate.commonCards.length === 0;

Task.run =
  async (LOGGER, tournament) => {
    const gamestate = tournament.gamestate;

    gamestate.session = Session.get(0);

    LOGGER.debug(`The ${gamestate.session} betting session is starting.`, { tag: gamestate.handUniqueId });

    // Count the number of time
    // that players had already have the possibility
    // to bet in the current session.
    // This info is useful to the bot player.
    gamestate.spinCount = 0;

    // PREFLOP the first player who bet is the one
    // next to the plater who have bet the Big Blind.
    const startFrom = gamestate.bigBlindPosition;

    await collectBets(gamestate, startFrom);

    // If there's more than one player
    // uncover three cards on the table.
    if (gamestate.activePlayers.length > 1) {
      gamestate.commonCards =
        gamestate.commonCards.concat(
          gamestate.deck.shift(),
          gamestate.deck.shift(),
          gamestate.deck.shift()
        );

      await tournament.update({
        type: "cards",
        cards: gamestate.commonCards,
        handId: gamestate.handUniqueId,
        session: Session.get(gamestate.commonCards.length),
      });

      const cards = gamestate.commonCards
        .reduce((str, card) => str + " " + card.rank + card.type, "");

      LOGGER.debug(`Common cards: ${cards.trim()}.`, { tag: gamestate.handUniqueId });
    }
  };

module.exports = Task;
