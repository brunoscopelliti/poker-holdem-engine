
'use strict';

const status = require('../domain/player-status');

const getNext = require('./get-nextplayer-index');

exports = module.exports = function getNextActivePlayerIndex(players, currentPlayerIndex){

  let n = players.length;

  let nextIndex;

  do {
    nextIndex = getNext(currentPlayerIndex, n);
    currentPlayerIndex = nextIndex;
  } while(players[nextIndex].status != status.active);

  return nextIndex;

}
