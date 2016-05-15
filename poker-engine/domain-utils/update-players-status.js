
'use strict';

const playerStatus = require('../domain/player-status');



/**
 * @function
 * @name updatePlayerStatus
 * @desc
 *  When at the end of an hand a player has zero chips,
 *  his status should be 'out', and
 *  should be added to the chart of the current hand.
 *
 * @param {Object} gs:
 *  the gamestate object
 *
 * @returns void
 */
exports = module.exports = function updatePlayerStatus(gs) {

  if (!gs.gameChart){
    gs.gameChart = [];
  }

  const activePlayers = gs.activePlayers;
  const outPlayers = activePlayers.filter(player => player.chips == 0);

  if (outPlayers.length == 0){
    return;
  }


  if(outPlayers.length == 1){
    outPlayers[0].status = playerStatus.out;
    return void gs.gameChart.unshift(outPlayers[0].name);
  }

  // reverse the chart
  // so that players with the weaker combination come first
  gs.handChart.slice(0).reverse()
    .forEach(function(player) {
      const outPlayer = outPlayers.find(x => x.id == player.id);
      if (outPlayer){
        outPlayer.status = playerStatus.out;
        gs.gameChart.unshift(outPlayer.name);
      }
    });

};
