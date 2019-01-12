"use strict";

const next = require("./next-player");

const loopFrom =
  (players, from, handler) => {
    const start = next(players, from);
    let index = start;

    do {
      const player = players[index];

      handler(player, index, players);

      index = next(players, index);
    } while (start !== index);
  };

module.exports = loopFrom;
