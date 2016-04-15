
'use strict';

const sut = require('../../poker-engine/lib/get-nextplayer-index');

const tape = require('tape');
const tcase = require('tape-case');
const chalk = require('chalk');
const sinon = require('sinon');


const progressive = Symbol.for('hand-progressive');

tape('get-nextplayer-index', t => t.end());

tcase([
  { description: 'get index of the next player', args: [ 0, 5 ], result: 1 },
  { args: [ 1, 5 ], result: 2 },
  { args: [ 4, 5 ], result: 0 },
  { args: [ 4, 6 ], result: 5 },
  { args: [ 5, 6 ], result: 0 },
], function(current, total) {

  return sut(current, total);

});
