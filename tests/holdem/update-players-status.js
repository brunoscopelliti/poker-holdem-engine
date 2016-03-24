
'use strict';

const status = require('../../domain/player-status');

const sut = require('../../holdem/update-players-status');

const tape = require('tape');
const chalk = require('chalk');
const sinon = require('sinon');



tape('update-player-status', t => t.end());

tape('folded players become active, and who has zero chips goes out', function(t) {

  const gamestate = {
    players: [
      { id: 0, name: 'bud', chips: 250, status: status.folded },
      { id: 1, name: 'terence', chips: 100, status: status.active },
      { id: 2, name: 'chuck', chips: 200, status: status.folded },
      { id: 3, name: 'silvester', chips: 0, status: status.active }
    ],
    rank: []
  }

  sut(gamestate, [1, 3]);

  t.deepEqual(gamestate.players.map(x=>x.status), ['active', 'active', 'active', 'out'], 'check status');
  t.equal(gamestate.rank[0], 'silvester', 'silvester is out');

  // terence is eliminated
  gamestate.players[0].status = status.active;
  gamestate.players[1].chips = 0;

  sut(gamestate, [0, 1]);

  t.deepEqual(gamestate.players.map(x=>x.status), ['active', 'out', 'active', 'out'], 'check status');
  t.deepEqual(gamestate.rank, ['terence', 'silvester'], 'terence and silvester are out');

  t.end();

});

tape('ranks is filled on the basis of the order', function(t) {

  const gamestate = {
    players: [
      { id: 0, name: 'bud', chips: 250, status: status.active },
      { id: 1, name: 'terence', chips: 0, status: status.active },
      { id: 2, name: 'chuck', chips: 0, status: status.active },
      { id: 3, name: 'silvester', chips: 0, status: status.active }
    ],
    rank: []
  }

  sut(gamestate, [0, 3, 1, 2]);

  t.deepEqual(gamestate.rank, ['silvester', 'terence', 'chuck'], 'order matters for the rankings');
  t.deepEqual(gamestate.players.map(x=>x.status), ['active', 'out', 'out', 'out'], 'check status');
  t.end();

});
