
'use strict';

const sinon = require('sinon');
const tape = require('tape');

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

  t.end();
});
