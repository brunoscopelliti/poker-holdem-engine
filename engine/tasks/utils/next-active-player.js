"use strict";

const States = require("../../../domain/player/states");
const getNext = require("./next-player");

/**
 * Find the index of the first active player
 * next to the one, whose index is passed as input.
 * @name next
 * @param {Player[]} players
 * @param {Number} from
 * @return {Number}
 */
const next =
  (players, from) => {
    let index;

    do {
      index = getNext(players, from);
      from = index;
    } while (players[index].state !== States.get("active"));

    return index;
  };

module.exports = next;
