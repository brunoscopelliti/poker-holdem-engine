
'use strict';

const status = require('../domain/player-status');

const getDB = require('../lib/get-dealerbutton-index');
const eachFrom = require('../lib/loop-from');


exports = module.exports = function assignCards(gs, deck) {

  // dealer starts to assign private cards starting from the player
  // next the one who has the dealer button

  const hasDB = Symbol.for('hasDB');

  function assignCard(player){
    if (player.status == status.active){
      player.cards.push(deck.shift());
    }
  }

  // clear cards from previous hand
  gs.players.forEach(player => player.cards = []);

  let dbIndex = getDB(gs.players);

  return eachFrom(gs.players, dbIndex, assignCard).then(function() {
    return eachFrom(gs.players, dbIndex, assignCard);
  });

};
