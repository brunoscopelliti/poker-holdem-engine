
'use strict';

const config = require('../config');

const logger = require('../storage/logger');

const playerStatus = require('./domain/player-status');

const resetGamestate = require('./domain-utils/reset-gamestate');
const assignDealerButton = require('./domain-utils/assign-dealer-button');
const computeSmallBlind = require('./domain-utils/compute-small-blind');
const payAntes = require('./domain-utils/pay-antes');
const payBlinds = require('./domain-utils/pay-blinds');
const assignCards = require('./domain-utils/assign-cards');

exports = module.exports = function setup(gs){

  resetGamestate(gs);

  logger.log('debug', 'Gamestate has been restored to hand initial condition.', { tag: gs.handUniqueId });



  // assign to the player in turn the dealer button
  // (only an active player can receive the button)
  assignDealerButton(gs);

  logger.log('debug', 'Dealer Button has been assigned (%d).', gs.dealerButtonIndex, { tag: gs.handUniqueId });



  // compute the small blind level for the current hand
  // big blinds is always the double
  computeSmallBlind(gs);

  logger.log('debug', 'Small Blind has been computed; its value is %d.', gs.sb, { tag: gs.handUniqueId });



  // make each active player pay the "ante"
  payAntes(gs);

  if (gs.ante){
    logger.log('debug', 'Players have pay the ante amount. Pot is %d.', gs.pot, { tag: gs.handUniqueId });
  }



  // make the players next to the dealer button
  // pay small/big blind amount
  payBlinds(gs);

  logger.log('debug', 'Blinds were payed. Pot is %d; Minimum amount to play is %d.', gs.pot, gs.callAmount, { tag: gs.handUniqueId });



  // assign two private cards to each active player
  assignCards(gs);

  const logMessage = gs.players.reduce(function(msg, player) {
    msg += player.status == playerStatus.active ?
      `${player.name} has ${player.cards.reduce(function(all, card){ all += `${card.rank}${card.type}, `; return all; }, '').trim().slice(0,-1)}. ` : `${player.name} is out. `;
    return msg;
  }, '');

  logger.log('debug', logMessage.trim(), { tag: gs.handUniqueId });

}
