
'use strict';

const status = require('../domain/player-status');
const eachFromDB = require('../lib/loop-from-dealer-button');


exports = module.exports = function assignCards(gamestate, deck) {

  // dealer starts to assign private cards starting from the player
  // next the one who has the dealer button

  function assignCard(player){
    if (player.status == status.active){
      player.cards.push(deck.shift());
    }
  }

  // clear cards from previous hand
  gamestate.players.forEach(player => player.cards = []);

  return eachFromDB(gamestate.players, assignCard).then(function() {
    return eachFromDB(gamestate.players, assignCard);
  });

};
