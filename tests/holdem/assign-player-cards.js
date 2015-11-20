
'use strict';

const status = require('../../domain/player-status');
const sut = require('../../holdem/assign-player-cards');

const tape = require('tape');
const chalk = require('chalk');
const sinon = require('sinon');

let hasDB = Symbol.for('hasDB');

const gamestate = {
  players: [
    {
      id: 0,
      name: 'bud',
      status: status.active,
      cards: []
    },
    {
      id: 1,
      name: 'terence',
      status: status.active,
      cards: [],
      [hasDB]: true
    },
    {
      id: 2,
      name: 'chuck',
      status: status.active,
      cards: []
    },
    {
      id: 3,
      name: 'silvester',
      status: status.active,
      cards: []
    },
    {
      id: 4,
      name: 'jean-claude',
      status: status.active,
      cards: []
    }
  ]
};


tape('assign player cards', t => t.end());

tape('all players are active', function(t) {

  let deck = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20];
  let deckSize = deck.length;

  sut(gamestate, deck).then(function() {
    t.equal(gamestate.players.filter(player => player.cards.length != 2).length, 0, 'all players received two cards');
    t.deepEqual(gamestate.players[2].cards, [1,6], 'first player who receives cards is the one next to the db');
    t.equal(deck.length, deckSize-2*gamestate.players.length, 'deck changed');
    t.end();
  });

});

tape('some players are out', function(t) {

  let deck = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20];
  let deckSize = deck.length;

  gamestate.players[0].status = gamestate.players[2].status = status.out;

  sut(gamestate, deck).then(function() {
    t.equal(gamestate.players.filter(player => player.cards.length == 0).length, 2, 'eliminated players did not receive cards');
    t.deepEqual(gamestate.players[3].cards, [1,6], 'first player who receives cards is the one next to the db');
    t.equal(deck.length, deckSize-2*gamestate.players.filter(player => player.status == status.active).length, 'deck changed');
    t.end();
  });

});
