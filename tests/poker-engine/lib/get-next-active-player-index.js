
'use strict';

const tape = require('tape');
const tcase = require('tape-case');
const sinon = require('sinon');

const playerStatus = require('../../../poker-engine/domain/player-status');
const sut = require('../../../poker-engine/lib/get-next-active-player-index');



tape('get-next-active-player-index', t => t.end());

tcase([
  { description: 'get index of the next "active" player', args: [ 0 ], result: 2 },
  { args: [ 1 ], result: 2 },
  { args: [ 2 ], result: 0 },
  { args: [ 3 ], result: 0 },
  { args: [ 4 ], result: 2 },
  { args: [ 5 ], result: 2 }
], function(playerIndex) {
  const players = [{
    name: 'arale',
    status: playerStatus.active
  }, {
    name: 'bender',
    status: playerStatus.folded
  }, {
    name: 'marvin',
    status: playerStatus.active
  }, {
    name: 'wall-e',
    status: playerStatus.out
  }];
  return sut(players, playerIndex);
});
