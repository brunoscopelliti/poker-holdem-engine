
'use strict';

const status = require('../domain/player-status');

exports = module.exports = function updateStatus(gs, rankedIndexes){

  // gs.rank contains the name of the player in the orders in which
  // they were eliminated...
  // so gs.rank[0] is the winner of the current game
  if (!Array.isArray(gs.rank)){
    gs.rank = [];
  }


  // rankedIndexes is an array with the active player id sorted on the basis
  // of their rank in the current hand.
  // it contains the id of the only players who played the hand
  // (without folding) till the showdown
  rankedIndexes.reverse().forEach(function(playerId){
    let player = gs.players[playerId];
    if (player.chips === 0){
      player.status = status.out;
      if (gs.rank.indexOf(player.name) == -1){
        gs.rank.unshift(player.name);
      }
    }
  });

  // TODO bruno: this should be done during the setup
  return void gs.players
    .filter(player => player.status == status.folded)
    .forEach(player => player.status = status.active);

};
