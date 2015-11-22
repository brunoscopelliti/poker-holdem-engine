
'use strict';

const config = require('../../config');
const status = require('../../domain/player-status');
const createPlayer = require('../../holdem/player-factory');

const sut = require('../../holdem/pay-blinds');

const tape = require('tape');
const chalk = require('chalk');
const sinon = require('sinon');


tape('pay-blinds', t => t.end());

tape('players next the DB pay blinds', function(t) {

  const gamestate = {
    sb: 20,
    pot: 0,
    callAmount: 0,
    players: []
  };

  gamestate.players.push(createPlayer({ name: 'bud' }, 0));
  gamestate.players.push(createPlayer({ name: 'terence' }, 1));
  gamestate.players.push(createPlayer({ name: 'chuck' }, 2));
  gamestate.players.push(createPlayer({ name: 'silvester' }, 3));
  gamestate.players.push(createPlayer({ name: 'jean-claude' }, 4));

  let hasDB = Symbol.for('hasDB');
  gamestate.players[1][hasDB] = true;

  gamestate.players[3].status = status.out;

  sut(gamestate);

  t.equal(gamestate.pot, 60, 'check pot');
  t.equal(gamestate.callAmount, 40, 'check callAmount');
  t.equal(gamestate.players[2].chips, config.BUYIN-20, 'check sb player');
  t.equal(gamestate.players[4].chips, config.BUYIN-40, 'check bb player');

  t.end();
  
});
