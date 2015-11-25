
'use strict';

const config = require('../../config');
const status = require('../../domain/player-status');

const sut = require('../../holdem/player-factory');

const tape = require('tape');
const chalk = require('chalk');
const sinon = require('sinon');


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

// @todo


//
// player#bet

tape('player#bet', t => t.end());

tape('player checks', function(t){

  const gamestate = {
    callAmount: 0,
    pot: 100,
    players: []
  };

  let player = sut({ name: 'terence' }, 0);

  gamestate.players.push(player);

  player.bet(gamestate, 0);

  t.equal(player.status, status.active, 'check status');
  t.equal(gamestate.callAmount, 0, 'check callAmount');
  t.equal(gamestate.pot, 100, 'check pot');
  t.equal(player.chips, config.BUYIN, 'check chips');
  t.equal(player.chipsBet, 0, 'check player bet');

  t.end();

});

tape('player checks after a call', function(t){

  const gamestate = {
    callAmount: 20,
    pot: 100,
    players: []
  };

  let player = sut({ name: 'terence' }, 0);
  player.chipsBet = 20;
  player.chips = config.BUYIN-20;

  gamestate.players.push(player);

  player.bet(gamestate, 0);

  t.equal(player.status, status.active, 'check status');
  t.equal(gamestate.callAmount, 20, 'check callAmount');
  t.equal(gamestate.pot, 100, 'check pot');
  t.equal(player.chips, config.BUYIN-20, 'check chips');
  t.equal(player.chipsBet, 20, 'check player bet');

  t.end();

});

tape('negative amount is treated as a bet of zero', function(t){

  const gamestate = {
    callAmount: 0,
    pot: 100,
    players: []
  };

  let player = sut({ name: 'terence' }, 0);

  gamestate.players.push(player);

  player.bet(gamestate, -50);

  t.equal(player.status, status.active, 'check status');
  t.equal(gamestate.callAmount, 0, 'check callAmount');
  t.equal(gamestate.pot, 100, 'check pot');
  t.equal(player.chips, config.BUYIN, 'check chips');
  t.equal(player.chipsBet, 0, 'check player bet');

  t.end();

});

tape('player calls', function(t){

  const gamestate = {
    callAmount: 20,
    pot: 100,
    players: []
  };

  let player = sut({ name: 'terence' }, 0);

  gamestate.players.push(player);

  player.bet(gamestate, 20);

  t.equal(player.status, status.active, 'check status');
  t.equal(gamestate.callAmount, 20, 'check callAmount');
  t.equal(gamestate.pot, 120, 'check pot');
  t.equal(player.chips, config.BUYIN-20, 'check chips');
  t.equal(player.chipsBet, 20, 'check player bet');

  t.end();

});

tape('player all-in, but less than the callAmount', function(t){

  const gamestate = {
    callAmount: 2 * config.BUYIN,
    pot: 0,
    players: []
  };

  let allin = Symbol.for('allin');
  let player = sut({ name: 'terence' }, 0);

  gamestate.players.push(player);

  player.bet(gamestate, config.BUYIN);

  t.equal(player.status, status.active, 'check status');
  t.equal(player[allin], true, 'player is allin');
  t.equal(gamestate.callAmount, 2 * config.BUYIN, 'check callAmount');
  t.equal(gamestate.pot, config.BUYIN, 'check pot');
  t.equal(player.chips, 0, 'check chips');
  t.equal(player.chipsBet, config.BUYIN, 'check player bet');

  t.end();

});

tape('player raises', function(t){

  const gamestate = {
    callAmount: 20,
    pot: 100,
    players: []
  };

  let player = sut({ name: 'terence' }, 0);

  gamestate.players.push(player);

  player.bet(gamestate, 40);

  t.equal(player.status, status.active, 'check status');
  t.equal(gamestate.callAmount, 40, 'check callAmount');
  t.equal(gamestate.pot, 140, 'check pot');
  t.equal(player.chips, config.BUYIN-40, 'check chips');
  t.equal(player.chipsBet, 40, 'check player bet');

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

  player.bet(gamestate, 10);

  t.equal(player.status, status.folded, 'check status');
  t.equal(gamestate.callAmount, 20, 'check callAmount');
  t.equal(gamestate.pot, 100, 'check pot');
  t.equal(player.chips, config.BUYIN, 'check chips');
  t.equal(player.chipsBet, 0, 'check player bet');

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

  bud.bet(gamestate, 0);
  t.equal(bud.status, status.active, 'check status');

  terence.bet(gamestate, 250);
  t.equal(gamestate.callAmount, 250, 'check callAmount');

  bud.bet(gamestate, 500);
  t.equal(gamestate.callAmount, 500, 'check callAmount');

  terence.bet(gamestate, 250);
  t.equal(terence.status, status.active, 'check status');

  t.equal(gamestate.pot, 1000, 'check pot');

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

  bud.bet(gamestate, 250);
  t.equal(gamestate.callAmount, 250, 'check callAmount');

  terence.bet(gamestate, config.BUYIN);
  t.equal(gamestate.callAmount, config.BUYIN, 'check callAmount');

  bud.bet(gamestate, 250);
  t.equal(bud.status, status.folded, 'check status');

  t.equal(gamestate.pot, config.BUYIN+250, 'check pot');

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
