"use strict";

const next = require("./next-player");

const F = () => false;

const loopFrom =
  async (players, from, shouldBreak, handler) => {
    if (handler == null) {
      handler = shouldBreak;
      shouldBreak = F;
    }

    const start = next(players, from);
    let index = start;

    do {
      const player = players[index];

      if (shouldBreak(player, index, players)) {
        break;
      }

      await handler(player, index, players);

      index = next(players, index);
    } while (start !== index);
  };

module.exports = loopFrom;
