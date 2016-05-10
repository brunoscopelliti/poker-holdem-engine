
'use strict';

const tape = require('tape');
const sinon = require('sinon');

const playerStatus = require('../../../poker-engine/domain/player-status');

const sut = require('../../../poker-engine/domain-utils/should-bet');


tape('should-bet', t => t.end());

tape('only active player can bet', function(t) {

  const spy = sinon.spy();

  sut({}, { status: playerStatus.folded }, spy);
  sut({}, { status: playerStatus.out }, spy);

  t.ok(!spy.called);

  t.end();
});

tape('all-in player cant bet anymore', function(t) {

  const spy = sinon.spy();

  sut({}, { status: playerStatus.active, [Symbol.for('is-all-in')]: true }, spy);

  t.ok(!spy.called);

  t.end();
});

tape('a player who has bet less than the callAmount, has always the right to call', function(t) {

  const spy = sinon.spy();

  sut({ callAmount: 100, players:[] }, { status: playerStatus.active, chipsBet: 50 }, spy);

  t.ok(spy.calledOnce);
  t.ok(spy.calledWith({ status: playerStatus.active, chipsBet: 50 }));

  t.end();
});

tape('a player who has bet the callAmount, cant bet more when he is the last raiser', function(t) {

  const spy = sinon.spy();

  sut({ callAmount: 50, lastRaiserId: 1, players:[] }, { id: 1, status: playerStatus.active, chipsBet: 50 }, spy);

  t.ok(!spy.called);

  t.end();
});

tape('a player who has bet the callAmount, cant bet more when there arent other active players', function(t) {

  const spy = sinon.spy();

  sut({ callAmount: 50, lastRaiserId: 1, players: [{status: playerStatus.active, [Symbol.for('is-all-in')]: true}, {status: playerStatus.folded}, {status: playerStatus.out}] }, { id: 2, status: playerStatus.active, chipsBet: 50 }, spy);

  t.ok(!spy.called);

  t.end();
});

tape('a player who has bet the callAmount, can eventually raise when he is not the last raiser, and there are others active players', function(t) {

  const spy = sinon.spy();

  sut({ callAmount: 50, lastRaiserId: 1, players: [{status: playerStatus.active}] }, { id: 2, status: playerStatus.active, chipsBet: 50 }, spy);

  t.ok(spy.calledOnce);
  t.ok(spy.calledWith({ id: 2, status: playerStatus.active, chipsBet: 50 }));

  t.end();
});
