
'use strict';

const tape = require('tape');
const sinon = require('sinon');

const getSymbol = require('../../test-utils/get-symbol');

// const request = require('request');
// const postStub = sinon.stub(request, 'post');

const config = require('../../../config');
const playerStatus = require('../../../poker-engine/domain/player-status');

const sut = require('../../../poker-engine/domain-utils/player-factory');



tape('player factory', t => t.end());

tape('cant create invalid player', function(t) {

  const player = sut({ name: 'arale' });

  t.strictEqual(player, null, '');
  t.end();
});

tape('create new player', function(t) {

  const player = sut({ name: 'arale', id: 'a1', serviceUrl: 'http:arale.com' });

  t.strictEqual(player.id, 'a1');
  t.strictEqual(player.name, 'arale');
  t.strictEqual(player.serviceUrl, 'http:arale.com');

  t.strictEqual(player.status, playerStatus.active, 'player is active');
  t.strictEqual(player.chips, config.BUYIN, 'player has chips');
  t.strictEqual(player.chipsBet, 0, 'player hasnt bet anything yet')
  t.ok(Array.isArray(player.cards), 'player cards');

  t.equal(typeof player.bet, 'function', 'player can bet');
  t.equal(typeof player.pay, 'function', 'player can pay');

  t.end();
});




tape('player pay', t => t.end());

tape('player pay call internal bet method', function(t) {

  const gamestate = {};
  const player = sut({ name: 'arale', id: 'a1', serviceUrl: 'http:arale.com' });

  const betStub = sinon.stub(player, getSymbol(Object.getPrototypeOf(player), 'internal-bet-method'));

  player.pay(gamestate, 50);

  t.ok(betStub.calledOnce);
  t.ok(betStub.calledWith(gamestate, 50));

  t.end();

});




tape('player bet', t => t.end());

tape('the amount is sanitized (negative number), than the internal bet method is called', function(t) {

  const gamestate = {};
  const player = sut({ name: 'arale', id: 'a1', serviceUrl: 'http:arale.com' });

  const betStub = sinon.stub(player, getSymbol(Object.getPrototypeOf(player), 'internal-bet-method'));

  player.bet(gamestate, -50);

  t.ok(betStub.calledOnce);
  t.ok(betStub.calledWith(gamestate, 0));

  t.end();

});

tape('the amount is sanitized (NaN), than the internal bet method is called', function(t) {

  const gamestate = {};
  const player = sut({ name: 'arale', id: 'a1', serviceUrl: 'http:arale.com' });

  const betStub = sinon.stub(player, getSymbol(Object.getPrototypeOf(player), 'internal-bet-method'));

  player.bet(gamestate, 'hello');

  t.ok(betStub.calledOnce);
  t.ok(betStub.calledWith(gamestate, 0));

  t.end();

});

tape('the amount is sanitized (valid amount), than the internal bet method is called', function(t) {

  const gamestate = {};
  const player = sut({ name: 'arale', id: 'a1', serviceUrl: 'http:arale.com' });

  const betStub = sinon.stub(player, getSymbol(Object.getPrototypeOf(player), 'internal-bet-method'));

  player.bet(gamestate, '50');

  t.ok(betStub.calledOnce);
  t.ok(betStub.calledWith(gamestate, 50));

  t.end();

});
