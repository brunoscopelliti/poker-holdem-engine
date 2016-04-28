
'use strict';

const tape = require('tape');
const tcase = require('tape-case');
const sinon = require('sinon');

const config = require('../../../config');
const sut = require('../../../poker-engine/domain-utils/compute-small-blind');


const blindsPeriod = config.BLINDS_PERIOD;

// expected config.SMALL_BLINDS
// [10, 20, 25, 50, 100, 125, 200, 250, 500, 750, 1000];



const gamestate = {};


tape('get-small-blind-amount', t => t.end());

tcase([
  { description: '(BLINDS_PERIOD=1)', args: [ 0 ], result: 10 },
  { args: [ 1 ], result: 20 },
  { args: [ 2 ], result: 25 },
  { args: [ 3 ], result: 50 },
  { args: [ 4 ], result: 100 },
  { args: [ 5 ], result: 125 },
  { args: [ 6 ], result: 200 },
  { args: [ 7 ], result: 250 },
  { args: [ 8 ], result: 500 },
  { args: [ 9 ], result: 750 },
  { args: [ 10 ], result: 1000 },
  { args: [ 11 ], result: 1000 },
  { args: [ 12 ], result: 1000 },
  { args: [ 42 ], result: 1000 }
], function(val) {

  // when config.BLINDS_PERIOD = 1
  // the blind should increase every time
  // the dealer button completes a loop around the table

  config.BLINDS_PERIOD = 1;
  gamestate.dealerButtonRound = val;

  sut(gamestate);

  return gamestate.sb;

});

tcase([
  { description: '(BLINDS_PERIOD=2)', args: [ 0 ], result: 10 },
  { args: [ 1 ], result: 10 },
  { args: [ 2 ], result: 20 },
  { args: [ 3 ], result: 20 },
  { args: [ 4 ], result: 25 },
  { args: [ 5 ], result: 25 },
  { args: [ 6 ], result: 50 },
  { args: [ 42 ], result: 1000 }
], function(val) {

  // when config.BLINDS_PERIOD = 2
  // the blind should increase every time
  // the dealer button completes two loops around the table

  config.BLINDS_PERIOD = 2;
  gamestate.dealerButtonRound = val;

  sut(gamestate);

  return gamestate.sb;

});

tcase([
  { description: '(BLINDS_PERIOD=5)', args: [ 0 ], result: 10 },
  { args: [ 1 ], result: 10 },
  { args: [ 2 ], result: 10 },
  { args: [ 3 ], result: 10 },
  { args: [ 4 ], result: 10 },
  { args: [ 5 ], result: 20 }
], function(val) {

  // when config.BLINDS_PERIOD = 5
  // the blind should increase every time
  // the dealer button completes two loops around the table

  config.BLINDS_PERIOD = 5;
  gamestate.dealerButtonRound = val;

  sut(gamestate);

  return gamestate.sb;

});

tape('restore config.BLINDS_PERIOD to its initial value', function(t){
  config.BLINDS_PERIOD = blindsPeriod;
  t.end();
});
