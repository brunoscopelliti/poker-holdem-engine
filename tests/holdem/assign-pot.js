
'use strict';

const config = require('../../config');
const status = require('../../domain/player-status');
const createPlayer = require('../../holdem/player-factory');

const sut = require('../../holdem/assign-pot');

const tape = require('tape');
const chalk = require('chalk');
const sinon = require('sinon');


tape('assign-pot', t => t.end());

tape('only one player at the showdown', function(t) {

  const gamestate = {
    pot: 100,
    players: [{ name: 'bud' }, { name: 'terence' }, { name: 'chuck' }, { name: 'silvester' }].map(createPlayer)
  };

  const winner = gamestate.players.slice(1,2); // terence
  winner[0].detail = {};
  const expectedChips = gamestate.pot + winner[0].chips;

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


  const winner = gamestate.players.slice(1,4); // terence
  winner[0].detail = {};
  const expectedChips = gamestate.pot + winner[0].chips;

  sut(gamestate, winner);

  t.equal(gamestate.pot, 0, 'pot is assigned');
  t.equal(gamestate.players[1].chips, expectedChips, 'winner received the chips from the pot');

  t.end();

});
