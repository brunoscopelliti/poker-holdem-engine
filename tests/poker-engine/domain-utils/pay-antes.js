
'use strict';

const tape = require('tape');
const sinon = require('sinon');

const config = require('../../../config');
const sut = require('../../../poker-engine/domain-utils/pay-antes');

const paySpy = sinon.spy();

function prepareGamestate(smallblind = 10){
  const buyin = 300;
  return {
    sb: smallblind,
    activePlayers: [{
      id: 1,
      name: 'arale',
      chips: buyin,
      chipsBet: 0,
      pay: paySpy
    }, {
      id: 2,
      name: 'bender',
      chips: buyin,
      chipsBet: 0,
      pay: paySpy
    }, {
      id: 3,
      name: 'marvin',
      chips: buyin,
      chipsBet: 0,
      pay: paySpy
    }]
  };
}

const enabled = config.ENABLE_ANTE;


tape('pay-antes', t => t.end());

tape('when ENABLE_ANTE is false, ante shouldnt be payed', function(t) {

  config.ENABLE_ANTE = false;

  const gamestate = prepareGamestate();

  sut(gamestate);

  gamestate.activePlayers.forEach(function(player) {
    t.equal(player.chipsBet, 0);
    t.equal(player.chips, 300);
  });

  t.ok(!paySpy.called);

  t.end();

});

tape('when ENABLE_ANTE is true, and ante amount is not 10% of buyin, ante shouldnt be payed', function(t) {

  // ante's amount is 10% of the big blind.

  // ante should start to be payed when their amount
  // is greater than 10% of the initial buyin.

  config.ENABLE_ANTE = true;

  const gamestate = prepareGamestate();

  sut(gamestate);

  gamestate.activePlayers.forEach(function(player) {
    t.equal(player.chipsBet, 0);
    t.equal(player.chips, 300);
  });

  t.ok(!paySpy.called);

  t.end();

});

tape('when ENABLE_ANTE is true, and ante amount is greater than 10% of buyin, ante should be payed', function(t) {

  // ante's amount is 10% of the big blind.

  // ante should start to be payed when their amount
  // is greater than 10% of the initial buyin.

  config.ENABLE_ANTE = true;

  const gamestate = prepareGamestate(500);

  sut(gamestate);

  t.ok(paySpy.calledThrice);

  gamestate.activePlayers.forEach(function(player, i) {
    const call = paySpy.getCall(i);
    t.ok(call.calledWith(gamestate, 100));
    t.ok(call.calledOn(player));
  });

  t.end();

});

tape('restore config.ENABLE_ANTE to its initial value', function(t){
  config.ENABLE_ANTE = enabled;
  t.end();
});
