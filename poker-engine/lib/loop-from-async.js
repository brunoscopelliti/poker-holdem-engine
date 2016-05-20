
'use strict';

const getNextPlayerIndex = require('./get-next-player-index');

const done_ = Symbol('done');



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
 * @param {Function} shouldBreak
 *  when returns true the loop break before the callback is executed
 * @param {Function} callback
 *
 * @returns {void}
 */
exports = module.exports = function* asyncFrom(players, startIndex, shouldBreak, callback){

  if (callback == null){
    callback = shouldBreak;
    shouldBreak = () => false;
  }


  let player;
  let nextIndex = getNextPlayerIndex(players, startIndex);

  while (player = players[nextIndex], !player[done_]){

    if (shouldBreak(player, nextIndex)){
      break;
    }

    yield callback(player, nextIndex);

    player[done_] = true;
    nextIndex = getNextPlayerIndex(players, nextIndex);

  }

  players.forEach(player => delete(player[done_]));

}
