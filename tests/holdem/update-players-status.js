
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

  sut(gamestate);

  t.equal(gamestate.players.filter(x => x.status == status.active).length, 3, 'folded players become active');
  t.equal(gamestate.players.filter(x => x.status == status.out).length, 1, 'who has 0 chips is out');
  t.equal(gamestate.rank[0], 'silvester', 'silvester is out');

  // terence is eliminated
  gamestate.players[1].chips = 0;

  sut(gamestate);

  t.equal(gamestate.players.filter(x => x.status == status.active).length, 2, 'folded players become active');
  t.equal(gamestate.players.filter(x => x.status == status.out).length, 2, 'who has 0 chips is out');
  t.deepEqual(gamestate.rank, ['terence', 'silvester'], 'terence and silvester are out');

  t.end();

});
