
'use strict';

const status = require('../../domain/player-status');
const sut = require('../../lib/get-next-active-player-index');

const tape = require('tape');
const tcase = require('tape-case');
const chalk = require('chalk');
const sinon = require('sinon');

const gamestate = {
  players: [
    { id: 0, name: 'bud', status: status.active},
    { id: 1, name: 'terence', status: status.active},
    { id: 2, name: 'chuck', status: status.out},
    { id: 3, name: 'silvester', status: status.active}
  ]
};


tape('get-next-active-player-index', t => t.end());

tcase([
  { description: 'get index of the next active player', args: [ gamestate.players, 0 ], result: 1 },
  { args: [ gamestate.players, 1 ], result: 3 },
  { args: [ gamestate.players, 3 ], result: 0 }
], function(players, currentIndex) {

  return sut(players, currentIndex);

});
