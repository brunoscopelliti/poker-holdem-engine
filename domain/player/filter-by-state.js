"use strict";

/**
 * @name filter
 * @param {Player[]} players
 * @param {String} state
 * @return {{Player[]}}
 */
const filter =
  (players, state) => players.filter((player) => player.state === state);

module.exports = filter;
