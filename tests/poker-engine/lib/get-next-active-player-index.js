
'use strict';

const tape = require('tape');
const tcase = require('tape-case');
const sinon = require('sinon');

const playerStatus = require('../../../poker-engine/domain/player-status');
const sut = require('../../../poker-engine/lib/get-next-active-player-index');



tape('get-next-active-player-index', t => t.end());

tcase([
  { description: 'get index of the next "active" player', args: [ 0 ], expectedResult: 2 },
  { args: [ 1 ], expectedResult: 2 },
  { args: [ 2 ], expectedResult: 0 },
  { args: [ 3 ], expectedResult: 0 },
  { args: [ 4 ], expectedResult: 2 },
  { args: [ 5 ], expectedResult: 2 }
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
