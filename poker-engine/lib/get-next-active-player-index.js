
'use strict';

const playerStatus = require('../domain/player-status');

const getNextPlayerIndex = require('./get-next-player-index');



/**
 * @function
 * @name getNextActivePlayerIndex
 * @desc find the index of the first "active" player next to the one, whose index is passed as input
 *
 * @param {Array} players:
 *  list of the player who play the current tournament;
 * @param {Number} playerIndex
 *
 * @returns {Number} index of the next player
 */
exports = module.exports = function getNextActivePlayerIndex(players, currentPlayerIndex){

  let nextIndex;

  do {
    nextIndex = getNextPlayerIndex(players, currentPlayerIndex);
    currentPlayerIndex = nextIndex;
  } while(players[nextIndex].status != playerStatus.active);

  return nextIndex;

};
