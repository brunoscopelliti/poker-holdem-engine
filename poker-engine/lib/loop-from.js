
'use strict';

const getNextPlayerIndex = require('./get-next-player-index');

const done_ = Symbol('done');



/**
 * @function
 * @name loopFrom
 * @desc
 *  Loop over the list passed as first parameter, and
 *  executes the given function.
 *  The loop starts from the element next to "startIndex".
 *
 * @param {Array} players:
 *  list of the player who play the current tournament;
 * @param {Number} startIndex
 * @param {Function} fn
 *
 * @returns {void}
 */
exports = module.exports = function loopFrom(players, startIndex, fn) {

  let player;
  let nextIndex = getNextPlayerIndex(players, startIndex);

  while (player = players[nextIndex], !player[done_]){

    fn(player, nextIndex);

    player[done_] = true;
    nextIndex = getNextPlayerIndex(players, nextIndex);

  }

  players.forEach(player => delete(player[done_]));

}
