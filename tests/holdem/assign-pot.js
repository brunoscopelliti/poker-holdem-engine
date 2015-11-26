
'use strict';

const config = require('../../config');
const status = require('../../domain/player-status');
const createPlayer = require('../../holdem/player-factory');

const sut = require('../../holdem/assign-pot');

const tape = require('tape');
const chalk = require('chalk');
const sinon = require('sinon');

const isAllin = Symbol.for('allin');

tape('assign-pot', t => t.end());

tape('only one player at the showdown', function(t) {

  const gamestate = {
    pot: 100,
    players: [{ name: 'bud' }, { name: 'terence' }, { name: 'chuck' }, { name: 'silvester' }].map(createPlayer)
  };

  const winner = gamestate.players.slice(1,2); // terence
  winner[0].detail = {};
  const expectedChips = gamestate.pot + config.BUYIN;

  sut(gamestate, winner);

  t.equal(gamestate.pot, 0, 'pot is assigned');
  t.equal(gamestate.players[1].chips, expectedChips, 'winner received the chips from the pot');

  t.end();

});

tape('winner is not all-in, and there are not ex-equo', function(t) {

  const gamestate = {
    pot: 100,
    players: [{ name: 'bud' }, { name: 'terence' }, { name: 'chuck' }, { name: 'silvester' }].map(createPlayer)
  };


  const winner = gamestate.players.slice(1,4); // terence, chuck, silvester
  winner[0].detail = {};
  const expectedChips = gamestate.pot + config.BUYIN;

  sut(gamestate, winner);

  t.equal(gamestate.pot, 0, 'pot is assigned');
  t.equal(gamestate.players[1].chips, expectedChips, 'winner received the chips from the pot');

  t.end();

});

tape('winner is all in', function(t) {

  const gamestate = {
    pot: 2600,
    players: [{ name: 'bud' }, { name: 'terence' }, { name: 'chuck' }, { name: 'silvester' }].map(createPlayer)
  };

  gamestate.players[0].chipsBet = 100;
  gamestate.players[1].chipsBet = 500;
  gamestate.players[2].chipsBet = 1000;
  gamestate.players[3].chipsBet = 1000;

  const winner = gamestate.players.slice(1,4); // terence, chuck, silvester

  winner[0].detail = {};
  winner[0][isAllin] = true;

  const mainPot = 1600;
  const sidePot = 1000;

  sut(gamestate, winner);

  t.equal(gamestate.pot, 0, 'pot is assigned');
  t.equal(gamestate.players[1].chips, config.BUYIN + mainPot, 'winner received the chips from the pot');
  t.equal(gamestate.players[2].chips, config.BUYIN + sidePot, 'chuck, as second player, wins the side pot');

  t.end();

});
