
'use strict';

const tape = require('tape');
const tcase = require('tape-case');
const sinon = require('sinon');

const sut = require('../../../poker-engine/lib/get-next-player-index');



const progressive = Symbol.for('hand-progressive');

tape('get-nextplayer-index', t => t.end());

tcase([
  { description: 'get index of the next player', args: [ 0 ], expectedResult: 1 },
  { args: [ 1 ], expectedResult: 2 },
  { args: [ 2 ], expectedResult: 3 },
  { args: [ 3 ], expectedResult: 0 },
  { args: [ 4 ], expectedResult: 1 },
  { args: [ 5 ], expectedResult: 2 }
], function(playerIndex) {
  const players = [{ name: 'arale' }, { name: 'bender' }, { name: 'marvin' }, { name: 'wall-e' }];
  return sut(players, playerIndex);
});
