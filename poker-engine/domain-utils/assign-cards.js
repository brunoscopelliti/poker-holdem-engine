
'use strict';

const pokerCards = require('poker-deck');
const shuffle = require('knuth-shuffle').knuthShuffle;


const playerStatus = require('../domain/player-status');

const loopFrom = require('../lib/loop-from');

const deck_ = Symbol.for('cards-deck');



/**
 * @function
 * @name assignCards
 * @desc assigns two private cards to each active player
 *
 * @param {Object} gs:
 *  the gamestate object
 *
 * @returns {void}
 */
exports = module.exports = function assignCards(gs) {

  const deck = gs[deck_] = shuffle(pokerCards.slice(0));

  const dealerButtonIndex = gs.dealerButtonIndex;

  function assignCard(player){
    if (player.status == playerStatus.active){
      player.cards.push(deck.shift());
    }
  }


  // dealer starts to assign private cards
  // starting from the player next the one who has the dealer button

  for(let i=0; i<2; i++){
    loopFrom(gs.players, dealerButtonIndex, assignCard);
  }

};
