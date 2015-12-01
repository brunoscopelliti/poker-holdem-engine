
'use strict';

const status = require('../domain/player-status');

exports = module.exports = function updateStatus(players){

  return void players.forEach(function(player) {
    player.status = status.active;
    if (player.chips === 0){
      player.status = status.out;
    }
  });

};
