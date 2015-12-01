
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
      { name: 'bud', chips: 250, status: status.folded },
      { name: 'terence', chips: 100, status: status.active },
      { name: 'chuck', chips: 200, status: status.folded },
      { name: 'silvester', chips: 0, status: status.active }
    ]
  }

  sut(gamestate.players);

  t.equal(gamestate.players.filter(x => x.status == status.active).length, 3, 'folded players become active');
  t.equal(gamestate.players.filter(x => x.status == status.out).length, 1, 'who has 0 chips is out');

  t.end();

});
