
'use strict';

const tape = require('tape');
const sinon = require('sinon');

const playerStatus = require('../../../poker-engine/domain/player-status');

const sut = require('../../../poker-engine/domain-utils/assign-cards');


const hasDB = Symbol.for('has-dealer-button');



tape('assign-cards', t => t.end());

tape('assign two cards to each active player', function(t) {

  const arale = { name: 'arale', status: playerStatus.active, cards: [] };
  const bender = { name: 'bender', status: playerStatus.active, cards: [] };
  const marvin = { name: 'marvin', status: playerStatus.out, cards: [] };
  const walle = { name: 'wall-e', status: playerStatus.active, cards: [] };

  arale[hasDB] = true;

  const gamestate = {
    dealerButtonIndex: 0,
    players: [arale, bender, marvin, walle]
  };

  sut(gamestate);

  gamestate.players
    .filter(player => player.status == playerStatus.active)
    .forEach(function(player) {
      t.equal(player.cards.length, 2);
    });

  t.equal(marvin.cards.length, 0);

  const deck_ = Symbol.for('cards-deck');
  t.equal(gamestate[deck_].length, 46);

  t.end();

});
