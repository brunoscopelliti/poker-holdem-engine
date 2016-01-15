
'use strict';

const status = require('../domain/player-status');

exports = module.exports = function updateStatus(gs){

  // gs.rank contains the name of the player in the orders in which
  // they were eliminated...
  // so gs.rank[0] is the winner of the current game
  if (!Array.isArray(gs.rank)){
    gs.rank = [];
  }

  return void gs.players.forEach(function(player) {
    player.status = status.active;
    if (player.chips === 0){
      player.status = status.out;
      if (gs.rank.indexOf(player.name) == -1){
        gs.rank.unshift(player.name);
      }
    }
  });

};
