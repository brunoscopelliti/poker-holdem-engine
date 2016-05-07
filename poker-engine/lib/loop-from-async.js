
'use strict';

const getNextPlayerIndex = require('./get-next-player-index');

const done = Symbol('done');



/**
 * @function
 * @name asyncFrom
 * @desc
 *  Loop over the list passed as first parameter, and
 *  executes the given function.
 *  The loop starts from the element next to "startIndex".
 *
 *  The generator execution breaks after each collback execution.
 *
 * @param {Array} players:
 *  list of the player who play the current tournament;
 * @param {Number} startIndex
 * @param {Function} fn
 *
 * @returns {void}
 */
exports = module.exports = function* asyncFrom(players, startIndex, fn){

  let player;
  let nextIndex = getNextPlayerIndex(players, startIndex);

  while (player = players[nextIndex], !player[done]){

    yield fn(player, nextIndex);

    player[done] = true;
    nextIndex = getNextPlayerIndex(players, nextIndex);

  }

  players.forEach(player => delete(player[done]));

}
