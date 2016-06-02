
'use strict';

const playerStatus = require('../domain/player-status');

const getNextPlayer = require('../lib/get-next-player-index');

const hasDB_ = Symbol.for('has-dealer-button');



/**
 * @function
 * @name assignDealerButton
 * @desc assign the dealer button to the correct player
 *
 * @param {Object} gs:
 *  the gamestate object
 * @param {Number} playerIndex
 *
 * @returns void
 */
exports = module.exports = function assignDealerButton(gs){

  let dealerButtonIndex = gs.dealerButtonIndex;

  if (dealerButtonIndex >= 0){
    delete gs.players[dealerButtonIndex][hasDB_];
  }


  if (gs.handProgressiveId == 1){

    gs.dealerButtonRound = 0;

    const dbIndex = gs.initialDealerButtonIndex = (gs.gameProgressiveId - 1) % gs.players.length;

    return void (gs.players[dbIndex][hasDB_] = true);
  }


  do {
    dealerButtonIndex = getNextPlayer(gs.players, dealerButtonIndex);
    if (dealerButtonIndex === gs.initialDealerButtonIndex) {
      gs.dealerButtonRound++;
    }
  } while(gs.players[dealerButtonIndex].status != playerStatus.active);

  gs.players[dealerButtonIndex][hasDB_] = true;

};
