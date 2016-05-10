
'use strict';

const getNextActivePlayerIndex = require('../lib/get-next-active-player-index');

const hasBB_ = Symbol.for('has-big-blind');



/**
 * @function
 * @name payBlinds
 * @desc make the players next to the dealer button pay small/big blind amount
 *
 * @param {Object} gs:
 *  the gamestate object
 *
 * @returns {void}
 */
exports = module.exports = function payBlinds(gs){

  const dealerButtonIndex = gs.dealerButtonIndex;

  // index of the player
  // who has to pay the small blind
  const smallBlindIndex = getNextActivePlayerIndex(gs.players, dealerButtonIndex);

  gs.players[smallBlindIndex].pay(gs, gs.sb);


  // index of the player
  // who has to pay the big blind
  const bigBlindIndex = getNextActivePlayerIndex(gs.players, smallBlindIndex);

  gs.players[bigBlindIndex].pay(gs, 2*gs.sb);
  gs.players[bigBlindIndex][hasBB_] = true;

};
