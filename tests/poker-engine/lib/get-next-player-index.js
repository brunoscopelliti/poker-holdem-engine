
'use strict';

const tape = require('tape');
const tcase = require('tape-case');
const sinon = require('sinon');

const sut = require('../../../poker-engine/lib/get-next-player-index');



const progressive = Symbol.for('hand-progressive');

tape('get-nextplayer-index', t => t.end());

tcase([
  { description: 'get index of the next player', args: [ 0 ], result: 1 },
  { args: [ 1 ], result: 2 },
  { args: [ 2 ], result: 3 },
  { args: [ 3 ], result: 0 },
  { args: [ 4 ], result: 1 },
  { args: [ 5 ], result: 2 }
], function(playerIndex) {
  const players = [{ name: 'arale' }, { name: 'bender' }, { name: 'marvin' }, { name: 'wall-e' }];
  return sut(players, playerIndex);
});
