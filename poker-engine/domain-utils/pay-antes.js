
'use strict';

const config = require('../../config');

const playerStatus = require('../domain/player-status');



/**
 * @function
 * @name payAntes
 * @desc make each active player pay the "ante"
 *
 * @param {Object} gs:
 *  the gamestate object
 *
 * @returns {void}
 */
exports = module.exports = function payAntes(gs){

  if (!config.ENABLE_ANTE){
    return;
  }


  // ante's amount is 10% of the big blind
  const anteAmount = (2 * gs.sb) * .1

  // ante should start to be payed when their amount
  // is greater than 10% of the initial buyin
  if (anteAmount < config.BUYIN * .1){
    return;
  }

  gs.ante = anteAmount;
  gs.activePlayers.forEach(player => player.pay(gs, anteAmount));

};
