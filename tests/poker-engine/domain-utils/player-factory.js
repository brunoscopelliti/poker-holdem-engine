
'use strict';

const tape = require('tape');
const sinon = require('sinon');

const request = require('request');
const postStub = sinon.stub(request, 'post');

const engine = require('../../../index');


const config = require('../../../config');
const playerStatus = require('../../../poker-engine/domain/player-status');

const getSymbol = require('../../test-utils/get-symbol');
const isAllin_ = Symbol.for('is-all-in');

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

  t.equal(typeof player.fold, 'function', 'player can fold');
  t.equal(typeof player.payBet, 'function', 'player can bet');
  t.equal(typeof player.pay, 'function', 'player can pay');
  t.equal(typeof player.talk, 'function', 'player can talk');

  t.end();
});




tape('player update gamestate (internal)', t => t.end());

tape('internal gamestate update', function(t) {

  const arale = sut({ name: 'arale', id: 'a1', serviceUrl: 'http:arale.com' });

  const bender = sut({ name: 'bender', id: 'b2', serviceUrl: 'http:bender.com' });

  const marvin = sut({ name: 'marvin', id: 'm3', serviceUrl: 'http:marvin.com' });
  marvin.chips = 50;

  const gamestate = { pot: 150, sidepots: [], callAmount: 100, players: [arale, bender, marvin] };

  const update_ = getSymbol(Object.getPrototypeOf(arale), 'internal-update-method');

  arale[update_](gamestate, 100);

  t.equal(arale[isAllin_], false);
  t.equal(arale.chipsBet, 100);
  t.equal(arale.chips, 400);
  t.equal(gamestate.pot, 250);
  t.equal(gamestate.callAmount, 100);
  t.equal(gamestate.sidepots.length, 0);



  bender[update_](gamestate, 300);

  t.equal(bender[isAllin_], false);
  t.equal(bender.chipsBet, 300);
  t.equal(bender.chips, 200);
  t.equal(gamestate.pot, 550);
  t.equal(gamestate.callAmount, 300);
  t.equal(gamestate.sidepots.length, 0);



  marvin[update_](gamestate, 50);

  t.equal(marvin[isAllin_], true);
  t.equal(marvin.chipsBet, 50);
  t.equal(marvin.chips, 0);
  t.equal(gamestate.pot, 600);
  t.equal(gamestate.callAmount, 300);
  t.equal(gamestate.sidepots.length, 2);
  t.equal(gamestate.sidepots[0].quote, 50);
  t.equal(gamestate.sidepots[0].amount, 150);
  t.equal(gamestate.sidepots[1].quote, 300);
  t.equal(gamestate.sidepots[1].amount, 300);

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




tape('player#payBet', t => t.end());


tape('bet amount is less than player call amount', function(t) {

  // when the player is betting less than the required call amount
  // unless he is betting all his chips, the bet is treated as a fold.

  const gamestate = { callAmount: 100 };
  const player = sut({ name: 'arale', id: 'a1', serviceUrl: 'http:arale.com' });

  player.chips = 1000;

  const foldStub = sinon.stub(player, 'fold');

  player.payBet(gamestate, 50);

  t.ok(foldStub.calledOnce);
  t.end()

});

tape('bet amount is less than player call amount, but the player is all-in', function(t) {

  // when the player is betting all his chips,
  // he has always the right to play the hand until the final showdown

  const gamestate = { callAmount: 100 };
  const player = sut({ name: 'arale', id: 'a1', serviceUrl: 'http:arale.com' });

  player.chips = 50;

  const updateStub = sinon.stub(player, getSymbol(Object.getPrototypeOf(player), 'internal-update-method'));
  const foldStub = sinon.stub(player, 'fold');

  player.payBet(gamestate, 50);

  t.ok(!foldStub.called);
  t.ok(updateStub.calledOnce);
  t.ok(updateStub.calledWith(gamestate, 50));
  t.end()

});


tape('bet amount is a call', function(t) {

  const gamestate = { callAmount: 100, lastRaiserId: 'b2', lastRaiseAmount: 200 };
  const player = sut({ name: 'arale', id: 'a1', serviceUrl: 'http:arale.com' });

  player.chips = 1000;
  player.chipsBet = 50;

  const updateStub = sinon.stub(player, getSymbol(Object.getPrototypeOf(player), 'internal-update-method'));

  player.payBet(gamestate, 50);

  t.ok(updateStub.calledOnce);
  t.ok(updateStub.calledWith(gamestate, 50));
  t.equal(gamestate.lastRaiserId, 'b2');
  t.equal(gamestate.lastRaiseAmount, 200);
  t.end()

});

tape('a player cant raise his own bet', function(t) {

  // a player can't raise his own bet.
  // in case a player is trying to bet more then the call amount,
  // but he's also the last player who has raised,
  // the bet amount is is lowered to meet the player call amount.

  const gamestate = { callAmount: 100, lastRaiserId: 'a1' };
  const player = sut({ name: 'arale', id: 'a1', serviceUrl: 'http:arale.com' });

  player.chips = 1000;
  player.chipsBet = 80;

  const updateStub = sinon.stub(player, getSymbol(Object.getPrototypeOf(player), 'internal-update-method'));

  player.payBet(gamestate, 200);

  t.ok(updateStub.calledOnce);
  t.ok(updateStub.calledWith(gamestate, 20));
  t.end()

});

tape('bet amount is a raise, but less than min raise amount', function(t) {

  // when the player raise less than the minimum required raise amount,
  // the bet amount is lowered to meet the player call amount.

  const gamestate = { callAmount: 100, lastRaiserId: 'b2', lastRaiseAmount: 20 };
  const player = sut({ name: 'arale', id: 'a1', serviceUrl: 'http:arale.com' });

  player.chips = 1000;
  player.chipsBet = 20;

  const updateStub = sinon.stub(player, getSymbol(Object.getPrototypeOf(player), 'internal-update-method'));

  player.payBet(gamestate, 90);

  t.ok(updateStub.calledOnce);
  t.ok(updateStub.calledWith(gamestate, 80));
  t.equal(gamestate.lastRaiserId, 'b2');
  t.equal(gamestate.lastRaiseAmount, 20);
  t.end()

});

tape('bet amount is a raise, but less than min raise amount and the player is all-in', function(t) {

  // when the player raise less than the minimum required raise amount,
  // if he is all-in the bet amount is unchanged,
  // however the lastRaiserId/lastRaiseAmount properties are not updated

  const gamestate = { callAmount: 100, lastRaiserId: 'b2', lastRaiseAmount: 20 };
  const player = sut({ name: 'arale', id: 'a1', serviceUrl: 'http:arale.com' });

  player.chips = 90;
  player.chipsBet = 20;

  const updateStub = sinon.stub(player, getSymbol(Object.getPrototypeOf(player), 'internal-update-method'));

  player.payBet(gamestate, 90);

  t.ok(updateStub.calledOnce);
  t.ok(updateStub.calledWith(gamestate, 90));
  t.equal(gamestate.lastRaiserId, 'b2');
  t.equal(gamestate.lastRaiseAmount, 20);
  t.end()

});

tape('bet amount is a proper raise', function(t) {

  // when a player performs a proper raise,
  // the gamestate lastRaiserId, lastRaiseAmount properties are updated.

  // lastRaiserId: is the id of the player who has performed the last valid raise.

  // lastRaiseAmount: is the amount of the raise;
  // it's computed by applying the formula: playerChipsBet + betAmount - callAmount

  const gamestate = { callAmount: 100, lastRaiserId: 'b2', lastRaiseAmount: 20 };
  const player = sut({ name: 'arale', id: 'a1', serviceUrl: 'http:arale.com' });

  player.chips = 1000;
  player.chipsBet = 20;

  const updateStub = sinon.stub(player, getSymbol(Object.getPrototypeOf(player), 'internal-update-method'));

  player.payBet(gamestate, 200);

  t.ok(updateStub.calledOnce);
  t.ok(updateStub.calledWith(gamestate, 200));
  t.equal(gamestate.lastRaiserId, 'a1');
  t.equal(gamestate.lastRaiseAmount, 120);
  t.end()

});

tape('bet amount is a proper raise, but too high', function(t) {

  // the bet amount is always normalized to maximum amount owned by the player

  const gamestate = { callAmount: 100, lastRaiserId: 'b2', lastRaiseAmount: 20 };
  const player = sut({ name: 'arale', id: 'a1', serviceUrl: 'http:arale.com' });

  player.chips = 1000;
  player.chipsBet = 50;

  const updateStub = sinon.stub(player, getSymbol(Object.getPrototypeOf(player), 'internal-update-method'));

  player.payBet(gamestate, 2500);

  t.ok(updateStub.calledOnce);
  t.ok(updateStub.calledWith(gamestate, 1000));
  t.equal(gamestate.lastRaiserId, 'a1');
  t.equal(gamestate.lastRaiseAmount, 950);
  t.end()

});




tape('player#talk', t => t.end());

tape('check json', function(t) {

  const gamestate = {
    tournamentId: 'test-tournament',
    gameProgressiveId: 1,
    handProgressiveId: 2,
    spinCount: 1,
    callAmount: 40,
    pot: 60,
    sidepots: [],
    sb: 20,
    dealerButtonIndex: 1,
    commonCards: [{rank:'A', type:'C'}, {rank:'A', type:'D'}, {rank:'K', type:'H'}],
    players: []
  };

  const arale = sut({ name: 'arale', id: 'a1', serviceUrl: 'http:arale.com' });
  const bender = sut({ name: 'bender', id: 'b2', serviceUrl: 'http:bender.com' });


  arale.cards = [{rank:'A', type:'H'}, {rank:'A', type:'S'}];
  arale.chipsBet = 20;

  bender.cards = [{rank:'2', type:'H'}, {rank:'7', type:'S'}];
  bender.chipsBet = 40;
  bender[Symbol.for('has-dealer-button')] = true;

  gamestate.players.push(arale, bender);

  arale.talk(gamestate);

  t.ok(postStub.calledOnce, 'called arale service');


  const infoKnownByArale = postStub.getCall(0).args[1].body;

  t.equal(infoKnownByArale.tournamentId, 'test-tournament', 'check tournament');
  t.equal(infoKnownByArale.game, 1, 'check game');
  t.equal(infoKnownByArale.hand, 2, 'check round');
  t.equal(infoKnownByArale.spinCount, 1, 'check spinCount');
  t.equal(infoKnownByArale.buyin, 500, 'check buyin');

  t.equal(infoKnownByArale.me, 0, 'check index');
  t.equal(infoKnownByArale.db, 1, 'check dealerbutton index');

  t.equal(infoKnownByArale.callAmount, 20, 'callAmount is 0');
  t.equal(infoKnownByArale.minimumRaiseAmount, 60, 'minimumRaiseAmount is 60');

  t.equal(infoKnownByArale.pot, 60, 'pot is 60');
  t.equal(infoKnownByArale.sidepots.length, 0, 'pot is 60');
  t.equal(infoKnownByArale.sb, 20, 'smallblind is 20');

  t.equal(infoKnownByArale.commonCards.length, 3), 'arale knows common cards';

  t.equal(infoKnownByArale.players[0].cards.length, 2), 'arale knows his cards';
  t.equal(infoKnownByArale.players[1].cards, undefined), 'arale don\'t know bender\'s cards';

  infoKnownByArale.players.forEach(function(player) {
    ['name', 'id', 'status', 'chips', 'chipsBet']
      .forEach(prop => t.ok(player.hasOwnProperty(prop), 'check player visible property'));
  });

  postStub.reset();

  bender.talk(gamestate);
  t.ok(postStub.calledOnce, 'called bender service');

  const infoKnownByBender = postStub.getCall(0).args[1].body;

  t.equal(infoKnownByBender.tournamentId, 'test-tournament', 'check tournament');
  t.equal(infoKnownByBender.game, 1, 'check game');
  t.equal(infoKnownByBender.hand, 2, 'check round');
  t.equal(infoKnownByBender.spinCount, 1, 'check spinCount');
  t.equal(infoKnownByBender.buyin, 500, 'check buyin');

  t.equal(infoKnownByBender.me, 1, 'check index');
  t.equal(infoKnownByBender.db, 1, 'check dealerbutton index');

  t.equal(infoKnownByBender.callAmount, 0, 'callAmount is 0');

  t.equal(infoKnownByBender.minimumRaiseAmount, 40, 'minimumRaiseAmount is 40');
  t.equal(infoKnownByBender.pot, 60, 'pot is 60');
  t.equal(infoKnownByBender.sb, 20, 'smallblind is 20');

  t.equal(infoKnownByBender.commonCards.length, 3), 'bender knows common cards';

  t.equal(infoKnownByBender.players[1].cards.length, 2), 'bender knows his cards';
  t.equal(infoKnownByBender.players[0].cards, undefined), 'bender don\'t know bender\'s cards';

  infoKnownByBender.players.forEach(function(player) {
    ['name', 'id', 'status', 'chips', 'chipsBet']
      .forEach(prop => t.ok(player.hasOwnProperty(prop), 'check player visible property'));
  });

  t.end();

});

tape('when server request fail, default bet is 0', function(t) {

  const arale = sut({ name: 'arale', id: 'a1', serviceUrl: 'http:arale.com' });

  postStub.yields({ message: 'Internal Server Error' });
  arale.talk({ players: [] })
    .then(function(betAmount){
      t.equal(betAmount, 0);
      t.end();
    });

});

tape('before the promise is resolved, the amount is sanitized (negative number)', function(t) {

  const arale = sut({ name: 'arale', id: 'a1', serviceUrl: 'http:arale.com' });

  postStub.yields(null, {}, '-50');
  arale.talk({ players: [] })
    .then(function(betAmount){
      t.equal(betAmount, 0);
      t.end();
    });

});

tape('before the promise is resolved, the amount is sanitized (NaN)', function(t) {

  const arale = sut({ name: 'arale', id: 'a1', serviceUrl: 'http:arale.com' });

  postStub.yields(null, {}, 'hello');
  arale.talk({ players: [] })
    .then(function(betAmount){
      t.equal(betAmount, 0);
      t.end();
    });

});

tape('before the promise is resolved, the amount is sanitized (valid amount)', function(t) {

  const arale = sut({ name: 'arale', id: 'a1', serviceUrl: 'http:arale.com' });

  postStub.yields(null, {}, '100');
  arale.talk({ players: [] })
    .then(function(betAmount){
      t.equal(betAmount, 100);
      t.end();
    });

});




tape('player#showdown', t => t.end());

tape('return data about the strongest combination', function(t) {

  const arale = sut({ name: 'arale', id: 'a1', serviceUrl: 'http:arale.com' });

  arale.cards = [
    { rank: 'A', type: 'S' },
    { rank: 'A', type: 'D' },
  ];

  const poker = arale.showdown([
    { rank: '9', type: 'D' },
    { rank: '5', type: 'D' },
    { rank: 'K', type: 'D' },
    { rank: 'A', type: 'C' },
    { rank: 'A', type: 'H' }
  ]);

  const expectedStrongestCombination = [{ rank: 'A', type: 'S' }, { rank: 'A', type: 'D' }, { rank: 'K', type: 'D' }, { rank: 'A', type: 'C' }, { rank: 'A', type: 'H' }];

  t.deepEqual(poker, expectedStrongestCombination);

  t.end();
});
