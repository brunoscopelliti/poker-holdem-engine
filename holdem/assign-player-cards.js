
'use strict';

const status = require('../domain/player-status');

const getDB = require('../lib/get-dealerbutton-index');
const eachFrom = require('../lib/loop-from');

const winston = require('../log-setup');
const gamestory = winston.loggers.get('gamestory');
const errors = winston.loggers.get('errors');

exports = module.exports = function assignCards(gs, deck) {

  // dealer starts to assign private cards starting from the player
  // next the one who has the dealer button

  const hasDB = Symbol.for('hasDB');

  function assignCard(player){
    if (player.status == status.active){
      player.cards.push(deck.shift());
      if (player.cards.length == 2){
        gamestory.info('%s has %s', player.name, JSON.stringify(player.cards), { id: gs.handId, type: 'cards' });
      }
    }
  }

  // clear cards from previous hand
  gs.players.forEach(player => player.cards = []);

  let dbIndex = getDB(gs.players);

  return eachFrom(gs.players, dbIndex, assignCard).then(function() {
    return eachFrom(gs.players, dbIndex, assignCard);
  });

};
