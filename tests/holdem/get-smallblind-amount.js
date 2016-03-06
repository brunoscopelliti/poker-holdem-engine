
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
    },
    {
      id: 2,
      name: 'chuck'
    }
  ]
};

const progressive = Symbol.for('hand-progressive');

tape('get-smallblind-amount', t => t.end());

tcase([
  { description: '(BLINDS_PERIOD=0) get correct smallblind level', args: [ 1 ], result: 10 },
  { args: [ 2 ], result: 10 },
  { args: [ 3 ], result: 10 },
  { args: [ 4 ], result: 20 },
  { args: [ 5 ], result: 20 },
  { args: [ 6 ], result: 20 },
  { args: [ 7 ], result: 25 },
  { args: [ 8 ], result: 25 },
  { args: [ 9 ], result: 25 },
  { args: [ 10 ], result: 50 },
  { args: [ 11 ], result: 50 },
  { args: [ 75 ], result: 2000 },
], function(val) {

  // when BLINDS_PERIOD is 0,
  // the blind should increase after a number of hands
  // equal to the number of players

  gamestate[progressive] = val;
  return sut(gamestate);

});


// tcase([
//   { description: '(BLINDS_PERIOD!=0) get correct smallblind level', args: [ 1 ], result: 10 },
//   { args: [ 2 ], result: 10 },
//   { args: [ 3 ], result: 10 },
//   { args: [ 4 ], result: 10 },
//   { args: [ 5 ], result: 10 },
//   { args: [ 6 ], result: 10 },
//   { args: [ 7 ], result: 20 },
//   { args: [ 8 ], result: 20 },
//   { args: [ 9 ], result: 20 },
//   { args: [ 10 ], result: 20 },
//   { args: [ 75 ], result: 2000 },
// ], function(val) {
//
//   // BLINDS_PERIOD = 2
//   // when BLINDS_PERIOD is different than 0,
//   // the blind should increase after a number of hands
//   // equal to the number of players multiplied by the BLINDS_PERIOD factor
//
//   gamestate[progressive] = val;
//   return sut(gamestate);
//
// });
