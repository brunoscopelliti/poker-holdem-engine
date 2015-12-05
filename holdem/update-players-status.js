
'use strict';

const status = require('../domain/player-status');

exports = module.exports = function updateStatus(gs){

  return void gs.players.forEach(function(player) {
    player.status = status.active;
    if (player.chips === 0){
      player.status = status.out;
      if (gs.rank.indexOf(player.id) == -1){
        gs.rank.unshift(player.id);
      }
    }
  });

};
