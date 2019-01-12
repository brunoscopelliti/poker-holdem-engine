"use strict";

/**
 * Find the index of the player next to the one,
 * whose index is passed as input.
 * @name next
 * @param {Player[]} players
 * @param {Number} from
 * @return {Number}
 */
const next =
  (players, from) => {
    return from === players.length - 1
      ? 0
      : from + 1;
  };

module.exports = next;
