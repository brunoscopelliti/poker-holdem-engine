
'use strict';

const tape = require('tape');
const sinon = require('sinon');

const config = require('../../../config');

const playerStatus = require('../../../poker-engine/domain/player-status');

const sut = require('../../../poker-engine/domain-utils/pay-blinds');


const hasDB = Symbol.for('has-dealer-button');


tape('pay-blinds', t => t.end());

tape('players next the dealer button pay blinds', function(t) {

  const paySpy = sinon.spy();

  const arale = { name: 'arale', status: playerStatus.active };
  const bender = { name: 'bender', status: playerStatus.active };
  const marvin = { name: 'marvin', status: playerStatus.active, pay: paySpy };
  const walle = { name: 'wall-e', status: playerStatus.active, pay: paySpy };

  const gamestate = {
    sb: 20,
    dealerButtonIndex: 1,
    players: [arale, bender, marvin, walle]
  };

  gamestate.players[1][hasDB] = true;

  sut(gamestate);

  t.ok(paySpy.calledTwice);

  const firstCall = paySpy.getCall(0);

  t.ok(firstCall.calledWith(gamestate, 20));
  t.ok(firstCall.calledOn(marvin));

  const secondCall = paySpy.getCall(1);

  t.ok(secondCall.calledWith(gamestate, 40));
  t.ok(secondCall.calledOn(walle));

  t.end();

});

tape('players next the dealer button pay blinds (check only active players)', function(t) {

  const paySpy = sinon.spy();

  const arale = { name: 'arale', status: playerStatus.active, pay: paySpy };
  const bender = { name: 'bender', status: playerStatus.active };
  const marvin = { name: 'marvin', status: playerStatus.active, pay: paySpy };
  const walle = { name: 'wall-e', status: playerStatus.out };

  const gamestate = {
    sb: 25,
    dealerButtonIndex: 1,
    players: [arale, bender, marvin, walle]
  };

  gamestate.players[1][hasDB] = true;

  sut(gamestate);

  t.ok(paySpy.calledTwice);

  const firstCall = paySpy.getCall(0);

  t.ok(firstCall.calledWith(gamestate, 25));
  t.ok(firstCall.calledOn(marvin));

  const secondCall = paySpy.getCall(1);

  t.ok(secondCall.calledWith(gamestate, 50));
  t.ok(secondCall.calledOn(arale));

  t.end();

});
