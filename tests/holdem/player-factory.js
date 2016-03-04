
'use strict';

const sinon = require('sinon');
const request = require('request');

const postStub = sinon.stub(request, 'post');

const config = require('../../config');
const status = require('../../domain/player-status');

const sut = require('../../holdem/player-factory');

const tape = require('tape');
const chalk = require('chalk');


tape('player factory', t => t.end());

tape('create new player', function(t) {

  let player = sut({ name: 'bud' }, 0);

  t.equal(typeof player, 'object', 'new player was created');

  t.equal(player.chips, config.BUYIN, 'player has chips');
  t.equal(player.status, status.active, 'player is active');
  t.ok(Array.isArray(player.cards), 'player has not cards');

  t.equal(typeof player.bet, 'function', 'player can bet');

  t.end();

});

//
// player#talk

tape('player#talk', t => t.end());

tape('player#talk check json', function(t) {

  const hasDB = Symbol.for('hasDB');
  const gamestate = {
    [Symbol.for('game-progressive')]: 1,
    [Symbol.for('hand-progressive')]: 2,
    callAmount: 40,
    pot: 60,
    sb: 20,
    commonCards: [{rank:'A', type:'C'}, {rank:'A', type:'D'}, {rank:'K', type:'H'}],
    players: []
  };

  let terence = sut({ name: 'terence' }, 0);
  let bud = sut({ name: 'bud' }, 1);

  terence.cards = [{rank:'A', type:'H'}, {rank:'A', type:'S'}];
  terence.chipsBet = 40;

  bud.cards = [{rank:'2', type:'H'}, {rank:'7', type:'S'}];
  bud.chipsBet = 20;
  bud[hasDB] = true;

  gamestate.players.push(terence, bud);

  terence.talk(gamestate);
  t.ok(postStub.calledOnce, 'called terence service');

  let infoKnownByTerence = postStub.getCall(0).args[1].body;

  t.equal(infoKnownByTerence.game, 1, 'check game');
  t.equal(infoKnownByTerence.round, 2, 'check round');

  t.equal(infoKnownByTerence.me, 0, 'check index');
  t.equal(infoKnownByTerence.db, 1, 'check dealerbutton index');

  t.equal(infoKnownByTerence.callAmount, 0, 'callAmount is 0');
  t.equal(infoKnownByTerence.pot, 60, 'pot is 60');
  t.equal(infoKnownByTerence.sb, 20, 'smallblind is 20');

  t.equal(infoKnownByTerence.commonCards.length, 3), 'terence knows common cards';

  t.equal(infoKnownByTerence.players[0].cards.length, 2), 'terence knows his cards';
  t.equal(infoKnownByTerence.players[1].cards, undefined), 'terence don\'t know bud\'s cards';

  infoKnownByTerence.players.forEach(function(player) {
    ['name', 'id', 'status', 'chips', 'chipsBet']
      .forEach(prop => t.ok(player.hasOwnProperty(prop), 'check player visible property'));
  });

  postStub.reset();

  bud.talk(gamestate);
  t.ok(postStub.calledOnce, 'called bud service');

  let infoKnownByBud = postStub.getCall(0).args[1].body;

  t.equal(infoKnownByBud.game, 1, 'check game');
  t.equal(infoKnownByBud.round, 2, 'check round');

  t.equal(infoKnownByBud.me, 1, 'check index');
  t.equal(infoKnownByBud.db, 1, 'check dealerbutton index');

  t.equal(infoKnownByBud.callAmount, 20, 'callAmount is 0');
  t.equal(infoKnownByBud.pot, 60, 'pot is 60');
  t.equal(infoKnownByBud.sb, 20, 'smallblind is 20');

  t.equal(infoKnownByBud.commonCards.length, 3), 'bud knows common cards';

  t.equal(infoKnownByBud.players[1].cards.length, 2), 'bud knows his cards';
  t.equal(infoKnownByBud.players[0].cards, undefined), 'bud don\'t know bud\'s cards';

  infoKnownByBud.players.forEach(function(player) {
    ['name', 'id', 'status', 'chips', 'chipsBet']
      .forEach(prop => t.ok(player.hasOwnProperty(prop), 'check player visible property'));
  });

  t.end();

});


//
// player#bet

tape('player#bet', t => t.end());

tape('player checks', function(t){

  const gamestate = { callAmount: 0, pot: 100, players: [] };
  const player = sut({ name: 'terence' }, 0);

  gamestate.players.push(player);

  player.bet(gamestate, '0');

  t.strictEqual(player.status, status.active, 'check status');
  t.strictEqual(gamestate.callAmount, 0, 'check callAmount');
  t.strictEqual(gamestate.pot, 100, 'check pot');
  t.strictEqual(player.chips, config.BUYIN, 'check chips');
  t.strictEqual(player.chipsBet, 0, 'check player bet');

  t.end();

});

tape('player checks after a call', function(t){

  const gamestate = { callAmount: 20, pot: 100, players: [] };

  const player = sut({ name: 'terence' }, 0);
  player.chipsBet = 20;
  player.chips = config.BUYIN-20;

  gamestate.players.push(player);

  player.bet(gamestate, '0');

  t.strictEqual(player.status, status.active, 'check status');
  t.strictEqual(gamestate.callAmount, 20, 'check callAmount');
  t.strictEqual(gamestate.pot, 100, 'check pot');
  t.strictEqual(player.chips, config.BUYIN-20, 'check chips');
  t.strictEqual(player.chipsBet, 20, 'check player bet');

  t.end();

});

tape('negative amount is treated as a bet of zero', function(t){

  const gamestate = { callAmount: 0, pot: 100, players: [] };
  const player = sut({ name: 'terence' }, 0);

  gamestate.players.push(player);

  player.bet(gamestate, '-50');

  t.strictEqual(player.status, status.active, 'check status');
  t.strictEqual(gamestate.callAmount, 0, 'check callAmount');
  t.strictEqual(gamestate.pot, 100, 'check pot');
  t.strictEqual(player.chips, config.BUYIN, 'check chips');
  t.strictEqual(player.chipsBet, 0, 'check player bet');

  t.end();

});

tape('player calls', function(t){

  const gamestate = { callAmount: 20, pot: 100, players: [] };
  const player = sut({ name: 'terence' }, 0);

  gamestate.players.push(player);

  player.bet(gamestate, 20);

  t.equal(player.status, status.active, 'check status');
  t.equal(gamestate.callAmount, 20, 'check callAmount');
  t.equal(gamestate.pot, 120, 'check pot');
  t.equal(player.chips, config.BUYIN-20, 'check chips');
  t.equal(player.chipsBet, 20, 'check player bet');

  t.end();

});

tape('player all-in', function(t){

  const allin = Symbol.for('allin');

  const gamestate = { callAmount: 2 * config.BUYIN, pot: 0, players: [] };
  const player = sut({ name: 'terence' }, 0);

  gamestate.players.push(player);

  player.bet(gamestate, 'Infinity');

  t.strictEqual(player.status, status.active, 'check status');
  t.strictEqual(player[allin], true, 'player is allin');
  t.strictEqual(gamestate.callAmount, 2 * config.BUYIN, 'check callAmount');
  t.strictEqual(gamestate.pot, config.BUYIN, 'check pot');
  t.strictEqual(player.chips, 0, 'check chips');
  t.strictEqual(player.chipsBet, config.BUYIN, 'check player bet');

  t.end();

});

tape('player all-in, but less than the callAmount', function(t){

  const allin = Symbol.for('allin');

  const gamestate = { callAmount: 2 * config.BUYIN, pot: 0, players: [] };
  const player = sut({ name: 'terence' }, 0);

  gamestate.players.push(player);

  player.bet(gamestate, config.BUYIN.toString());

  t.strictEqual(player.status, status.active, 'check status');
  t.strictEqual(player[allin], true, 'player is allin');
  t.strictEqual(gamestate.callAmount, 2 * config.BUYIN, 'check callAmount');
  t.strictEqual(gamestate.pot, config.BUYIN, 'check pot');
  t.strictEqual(player.chips, 0, 'check chips');
  t.strictEqual(player.chipsBet, config.BUYIN, 'check player bet');

  t.end();

});

tape('player raises (the raise amount is multiple of the small blind)', function(t){

  const gamestate = { callAmount: 20, pot: 100, sb: 10, players: [] };
  const player = sut({ name: 'terence' }, 0);

  gamestate.players.push(player);

  player.bet(gamestate, '40');

  t.strictEqual(player.status, status.active, 'check status');
  t.strictEqual(gamestate.callAmount, 40, 'check callAmount');
  t.strictEqual(gamestate.pot, 140, 'check pot');
  t.strictEqual(player.chips, config.BUYIN-40, 'check chips');
  t.strictEqual(player.chipsBet, 40, 'check player bet');

  t.end();

});

tape('player raises (the raise amount is not multiple of the small blind)', function(t){

  // in this case the bet is treated as a simple call.

  const gamestate = { callAmount: 20, pot: 100, sb: 10, players: [] };
  const player = sut({ name: 'terence' }, 0);

  gamestate.players.push(player);

  player.bet(gamestate, '45');

  t.strictEqual(player.status, status.active, 'check status');
  t.strictEqual(gamestate.callAmount, 20, 'check callAmount');
  t.strictEqual(gamestate.pot, 120, 'check pot');
  t.strictEqual(player.chips, config.BUYIN-20, 'check chips');
  t.strictEqual(player.chipsBet, 20, 'check player bet');

  t.end();

});


tape('player folds', function(t){

  const gamestate = {
    callAmount: 20,
    pot: 100,
    players: []
  };

  let player = sut({ name: 'terence' }, 0);

  gamestate.players.push(player);

  player.bet(gamestate, '10');

  t.strictEqual(player.status, status.folded, 'check status');
  t.strictEqual(gamestate.callAmount, 20, 'check callAmount');
  t.strictEqual(gamestate.pot, 100, 'check pot');
  t.strictEqual(player.chips, config.BUYIN, 'check chips');
  t.strictEqual(player.chipsBet, 0, 'check player bet');

  t.end();

});

tape('two players fake game till showdown', function(t){

  const gamestate = {
    callAmount: 0,
    pot: 0,
    players: []
  };

  let bud = sut({ name: 'bud' }, 0);
  let terence = sut({ name: 'terence' }, 1);

  gamestate.players.push(bud);
  gamestate.players.push(terence);

  bud.bet(gamestate, '0');
  t.strictEqual(bud.status, status.active, 'check status');

  terence.bet(gamestate, '250');
  t.strictEqual(gamestate.callAmount, 250, 'check callAmount');

  bud.bet(gamestate, '500');
  t.strictEqual(gamestate.callAmount, 500, 'check callAmount');

  terence.bet(gamestate, '250');
  t.strictEqual(terence.status, status.active, 'check status');

  t.strictEqual(gamestate.pot, 1000, 'check pot');

  t.end();

});

tape('two players fake game, bud folds', function(t){

  const gamestate = {
    callAmount: 0,
    pot: 0,
    players: []
  };

  let bud = sut({ name: 'bud' }, 0);
  let terence = sut({ name: 'terence' }, 1);

  gamestate.players.push(bud);
  gamestate.players.push(terence);

  bud.bet(gamestate, '250');
  t.strictEqual(gamestate.callAmount, 250, 'check callAmount');

  terence.bet(gamestate, config.BUYIN.toString());
  t.strictEqual(gamestate.callAmount, config.BUYIN, 'check callAmount');

  bud.bet(gamestate, '250');
  t.strictEqual(bud.status, status.folded, 'check status');

  t.strictEqual(gamestate.pot, config.BUYIN+250, 'check pot');

  t.end();

});


//
// player#showdown

tape('player#showdown', t => t.end());

tape('player has three-of-a-kind', function(t){

  const commonCards = [
    { rank: '7', type: 'H' },
    { rank: '3', type: 'S' },
    { rank: '4', type: 'C' },
    { rank: '7', type: 'D' },
    { rank: 'Q', type: 'H' }
  ];

  const expectedBestCards = [{ rank: '7', type: 'S' }, { rank: 'A', type: 'S' }, { rank: '7', type: 'H' }, { rank: '7', type: 'D' }, { rank: 'Q', type: 'H' }];

  let player = sut({ name: 'bud' }, 0);

  player.cards = [{ rank: '7', type: 'S' }, { rank: 'A', type: 'S' }];
  player.showdown(commonCards);
  t.deepEqual(player.bestCards, expectedBestCards, 'check best cards computation');

  t.end();

});
