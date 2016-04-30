
'use strict';

const config = require('../../config');



/**
 * @function
 * @name setSBAmount
 * @desc set the "sb" property on the gamestate object.
 *
 * @param {Object} gs:
 *  the gamestate object
 *
 * @returns {void}
 */
exports = module.exports = function setSBAmount(gs){

  // the amount of the small blind depends upon how many times
  // the dealer button has passed from its initial position.

  // gs.dealerButtonRound contains this information.


  // config.BLINDS_PERIOD defines how many loops around the table
  // should have been completed by the dealer button,
  // before the small blind level can be increased

  const blinds = config.SMALL_BLINDS;
  const period = config.BLINDS_PERIOD || 1;

  const blindIndex = Math.floor(gs.dealerButtonRound / period);

  const normalizedIndex = Math.min(blinds.length-1, blindIndex);


  gs.sb = blinds[normalizedIndex];

};
