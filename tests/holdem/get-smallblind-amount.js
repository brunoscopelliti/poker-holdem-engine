
'use strict';

const sut = require('../../holdem/get-smallblind-amount');

const tape = require('tape');
const tcase = require('tape-case');
const chalk = require('chalk');
const sinon = require('sinon');

const gamestate = {
  players: [
    {
      id: 0,
      name: 'bud'
    },
    {
      id: 1,
      name: 'terence'
    }
  ]
};

const progressive = Symbol.for('hand-progressive');

tape('get-smallblind-amount', t => t.end());

tcase([
  { description: 'get correct smallblind level', args: [ 1 ], result: 10 },
  { args: [ 2 ], result: 10 },
  { args: [ 3 ], result: 20 },
  { args: [ 4 ], result: 20 },
  { args: [ 5 ], result: 25 },
  { args: [ 6 ], result: 25 },
  { args: [ 75 ], result: 2000 },
], function(val) {

  gamestate[progressive] = val;
  return sut(gamestate);

});
