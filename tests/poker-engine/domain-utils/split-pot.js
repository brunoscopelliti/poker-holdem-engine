
'use strict';

const tape = require('tape');
const sinon = require('sinon');

const playerStatus = require('../../../poker-engine/domain/player-status');

const sut = require('../../../poker-engine/domain-utils/split-pot');


const isAllin_ = Symbol.for('is-all-in');



tape('split-pot', t => t.end());

tape('one all-in player', function(t) {

  const arale = { name: 'arale', status: playerStatus.folded, chipsBet: 50 };
  const bender = { name: 'bender', status: playerStatus.active, chipsBet: 200 };
  const marvin = { name: 'marvin', status: playerStatus.active, chipsBet: 100, [isAllin_]: true };
  const walle = { name: 'wall-e', status: playerStatus.active, chipsBet: 200 };

  const gamestate = {
    pot: 550,
    players: [arale, bender, marvin, walle]
  };

  sut(gamestate);

  const sidepots = gamestate.sidepots;
  const sidepotTotal = sidepots.reduce(function(all, curr) { all += curr.amount; return all; }, 0);

  t.equals(sidepots.length, 2);

  t.equals(sidepots[0].quote, 100);
  t.equals(sidepots[0].amount, 350);

  t.equals(sidepots[1].quote, 200);
  t.equals(sidepots[1].amount, 200);

  t.equals(sidepotTotal, gamestate.pot);

  t.end();

});

tape('one all-in player, who as matched the call amount', function(t) {

  const arale = { name: 'arale', status: playerStatus.folded, chipsBet: 50 };
  const bender = { name: 'bender', status: playerStatus.active, chipsBet: 200 };
  const marvin = { name: 'marvin', status: playerStatus.active, chipsBet: 200, [isAllin_]: true };
  const walle = { name: 'wall-e', status: playerStatus.active, chipsBet: 200 };

  const gamestate = {
    pot: 650,
    players: [arale, bender, marvin, walle]
  };

  sut(gamestate);

  const sidepots = gamestate.sidepots;

  t.equals(sidepots.length, 0);

  t.end();

});

tape('one all-in player, who has bet less than everyone else', function(t) {

  const arale = { name: 'arale', status: playerStatus.folded, chipsBet: 50 };
  const bender = { name: 'bender', status: playerStatus.active, chipsBet: 200 };
  const marvin = { name: 'marvin', status: playerStatus.active, chipsBet: 25, [isAllin_]: true };
  const walle = { name: 'wall-e', status: playerStatus.active, chipsBet: 200 };

  const gamestate = {
    pot: 475,
    players: [arale, bender, marvin, walle]
  };

  sut(gamestate);

  const sidepots = gamestate.sidepots;
  const sidepotTotal = sidepots.reduce(function(all, curr) { all += curr.amount; return all; }, 0);

  t.equals(sidepots.length, 2);

  t.equals(sidepots[0].quote, 25);
  t.equals(sidepots[0].amount, 100);

  t.equals(sidepots[1].quote, 200);
  t.equals(sidepots[1].amount, 375);

  t.equals(sidepotTotal, gamestate.pot);

  t.end();

});

tape('one all-in player who has a middle bet', function(t) {

  const arale = { name: 'arale', status: playerStatus.folded, chipsBet: 50 };
  const bender = { name: 'bender', status: playerStatus.active, chipsBet: 40, [isAllin_]: true };
  const marvin = { name: 'marvin', status: playerStatus.folded, chipsBet: 75 };
  const walle = { name: 'wall-e', status: playerStatus.active, chipsBet: 200 };

  const gamestate = {
    pot: 365,
    players: [arale, bender, marvin, walle]
  };

  sut(gamestate);

  const sidepots = gamestate.sidepots;
  const sidepotTotal = sidepots.reduce(function(all, curr) { all += curr.amount; return all; }, 0);

  t.equals(sidepots.length, 2);

  t.equals(sidepots[0].quote, 40);
  t.equals(sidepots[0].amount, 160);

  t.equals(sidepots[1].quote, 200);
  t.equals(sidepots[1].amount, 205);

  t.equals(sidepotTotal, gamestate.pot);

  t.end();

});

tape('one all-in player and no competitors for the main pot', function(t) {

  const arale = { name: 'arale', status: playerStatus.folded, chipsBet: 50 };
  const bender = { name: 'bender', status: playerStatus.active, chipsBet: 100, [isAllin_]: true };
  const marvin = { name: 'marvin', status: playerStatus.folded, chipsBet: 75 };
  const walle = { name: 'wall-e', status: playerStatus.active, chipsBet: 200 };

  const gamestate = {
    pot: 425,
    players: [arale, bender, marvin, walle]
  };

  sut(gamestate);

  const sidepots = gamestate.sidepots;
  const sidepotTotal = sidepots.reduce(function(all, curr) { all += curr.amount; return all; }, 0);

  t.equals(sidepots.length, 2);

  t.equals(sidepots[0].quote, 100);
  t.equals(sidepots[0].amount, 325);

  t.equals(sidepots[1].quote, 200);
  t.equals(sidepots[1].amount, 100);

  t.equals(sidepotTotal, gamestate.pot);

  t.end();

});

tape('two all-in players for the same amount', function(t) {

  const arale = { name: 'arale', status: playerStatus.active, chipsBet: 100, [isAllin_]: true };
  const bender = { name: 'bender', status: playerStatus.folded, chipsBet: 50 };
  const marvin = { name: 'marvin', status: playerStatus.active, chipsBet: 100, [isAllin_]: true };
  const walle = { name: 'wall-e', status: playerStatus.active, chipsBet: 200 };

  const gamestate = {
    pot: 450,
    players: [arale, bender, marvin, walle]
  };

  sut(gamestate);

  const sidepots = gamestate.sidepots;
  const sidepotTotal = sidepots.reduce(function(all, curr) { all += curr.amount; return all; }, 0);

  t.equals(sidepots.length, 2);

  t.equals(sidepots[0].quote, 100);
  t.equals(sidepots[0].amount, 350);

  t.equals(sidepots[1].quote, 200);
  t.equals(sidepots[1].amount, 100);

  t.equals(sidepotTotal, gamestate.pot);

  t.end();

});

tape('two all-in players', function(t) {

  const arale = { name: 'arale', status: playerStatus.folded, chipsBet: 50 };
  const bender = { name: 'bender', status: playerStatus.active, chipsBet: 75, [isAllin_]: true };
  const marvin = { name: 'marvin', status: playerStatus.active, chipsBet: 25, [isAllin_]: true };
  const walle = { name: 'wall-e', status: playerStatus.active, chipsBet: 200 };

  const gamestate = {
    pot: 350,
    players: [arale, bender, marvin, walle]
  };

  sut(gamestate);

  const sidepots = gamestate.sidepots;
  const sidepotTotal = sidepots.reduce(function(all, curr) { all += curr.amount; return all; }, 0);

  t.equals(sidepots.length, 3);

  t.equals(sidepots[0].quote, 25);
  t.equals(sidepots[0].amount, 100);

  t.equals(sidepots[1].quote, 75);
  t.equals(sidepots[1].amount, 125);

  t.equals(sidepots[2].quote, 200);
  t.equals(sidepots[2].amount, 125);

  t.equals(sidepotTotal, gamestate.pot);

  t.end();

});

tape('all in all-in', function(t) {

  const arale = { name: 'arale', status: playerStatus.active, chipsBet: 125, [isAllin_]: true };
  const bender = { name: 'bender', status: playerStatus.active, chipsBet: 75, [isAllin_]: true };
  const marvin = { name: 'marvin', status: playerStatus.active, chipsBet: 25, [isAllin_]: true };
  const walle = { name: 'wall-e', status: playerStatus.active, chipsBet: 200, [isAllin_]: true };

  const gamestate = {
    pot: 425,
    players: [arale, bender, marvin, walle]
  };

  sut(gamestate);

  const sidepots = gamestate.sidepots;
  const sidepotTotal = sidepots.reduce(function(all, curr) { all += curr.amount; return all; }, 0);

  t.equals(sidepots.length, 4);

  t.equals(sidepots[0].quote, 25);
  t.equals(sidepots[0].amount, 100);

  t.equals(sidepots[1].quote, 75);
  t.equals(sidepots[1].amount, 150);

  t.equals(sidepots[2].quote, 125);
  t.equals(sidepots[2].amount, 100);

  t.equals(sidepots[3].quote, 200);
  t.equals(sidepots[3].amount, 75);

  t.equals(sidepotTotal, gamestate.pot);

  t.end();

});
