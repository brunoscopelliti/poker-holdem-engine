
'use strict';



/**
 * @function
 * @name getNextPlayerIndex
 * @desc find the index of the player next to the one, whose index is passed as input
 *
 * @param {Array} players:
 *  list of the player who play the current tournament;
 * @param {Number} playerIndex
 *  index of the player, of who we want to know who is next
 *
 * @returns {Number} index of the next player
 */
exports = module.exports = function getNextPlayerIndex(players, playerIndex){

  const next = playerIndex + 1;

  if (playerIndex >= players.length-1){
    return next % players.length;
  }

  return next;

}
