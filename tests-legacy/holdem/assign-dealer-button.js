
'use strict';

const status = require('../../poker-engine/domain/player-status');

const sut = require('../../poker-engine/holdem/assign-dealer-button');

const tape = require('tape');
const chalk = require('chalk');
const sinon = require('sinon');

const gamestate = {
  players: [
    { id: 0, name: 'bud', status: status.active },
    { id: 1, name: 'terence', status: status.active },
    { id: 2, name: 'chuck', status: status.active },
    { id: 3, name: 'silvester', status: status.active },
    { id: 4, name: 'jean-claude', status: status.active }
  ]
};

let hasDB = Symbol.for('hasDB');

tape('assign dealer button', t => t.end());

tape('first time', function(t) {

  sut(gamestate);
  t.ok(gamestate.players[0][hasDB], 'the first players has the dealer button');
  t.equal(gamestate.players.filter(x=>x[hasDB]).length, 1, 'only one player can have DB');

  t.end();

});

tape('playing', function(t) {

  sut(gamestate);
  t.ok(gamestate.players[1][hasDB], 'DB assigned');
  t.equal(gamestate.players.filter(x=>x[hasDB]).length, 1, 'only one player can have DB');

  gamestate.players[2].status = status.out;
  gamestate.players[3].status = status.out;

  sut(gamestate);
  t.ok(gamestate.players[4][hasDB], 'DB assigned');
  t.equal(gamestate.players.filter(x=>x[hasDB]).length, 1, 'only one player can have DB');

  gamestate.players[0].status = status.out;

  sut(gamestate);
  t.ok(gamestate.players[1][hasDB], 'DB assigned');
  t.equal(gamestate.players.filter(x=>x[hasDB]).length, 1, 'only one player can have DB');

  t.end();

});
