
'use strict';

const tape = require('tape');
const sinon = require('sinon');

const request = require('request');
const postStub = sinon.stub(request, 'post');

const engine = require('../../../index');


const config = require('../../../config');
const playerStatus = require('../../../poker-engine/domain/player-status');

const getSymbol = require('../../test-utils/get-symbol');

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

  t.strictEqual(player.status, 'active', 'player is active');
  t.strictEqual(player.chips, config.BUYIN, 'player has chips');
  t.strictEqual(player.chipsBet, 0, 'player hasnt bet anything yet')
  t.ok(Array.isArray(player.cards), 'player cards');

  t.equal(typeof player.payBet, 'function', 'player can bet');
  t.equal(typeof player.pay, 'function', 'player can pay');

  t.end();
});




tape('player#pay', t => t.end());

tape('player pay call internal bet method', function(t) {

  const gamestate = {};
  const player = sut({ name: 'arale', id: 'a1', serviceUrl: 'http:arale.com' });

  const updateStub = sinon.stub(player, getSymbol(Object.getPrototypeOf(player), 'internal-update-method'));

  player.pay(gamestate, 50);

  t.ok(updateStub.calledOnce);
  t.ok(updateStub.calledWith(gamestate, 50));

  t.end();

});




tape('player#fold', t => t.end());

tape('update player status to "folded"', function(t) {

  const gamestate = {};
  const player = sut({ name: 'arale', id: 'a1', serviceUrl: 'http:arale.com' });

  engine.once('gamestate:updated', function(data, done){
    t.equal(player.status, 'folded');
    t.equal(data.type, 'status');
    t.equal(data.playerId, 'a1');
    t.equal(data.status, 'folded');
    done();
    t.end();
  });

  player.fold(gamestate);

});
