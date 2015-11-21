
'use strict';

const config = require('./config');

const EventEmitter = require('events').EventEmitter;

const chalk = require('chalk');
const mixin = require('merge-descriptors');

const gamestate = exports.gamestate = {};

mixin(gamestate, EventEmitter.prototype, false);



const status = require('./domain/player-status');


const run = require('./lib/generator-runner');
const dealer = exports._dealer = require('./holdem-dealer');


const createPlayer = require('./holdem/player-factory');


gamestate.on('game:start', function(setupData) {

  // start has a different meaning on the basis of the fact
  // that the tournament is starting for the first time, or
  // it is resuming after a break.

  if (gamestate.status == 'play'){
    return;
  }

  gamestate.status = 'play';

  if (!gamestate.started){

    gamestate.tournamentId = setupData.tournamentId;

    gamestate.players = setupData.players.map(createPlayer);

    gamestate.started = true;

  }

  // start the game
  return run(dealer, gamestate);

});


gamestate.on('game:pause', function() {

  //
  // take a break!

  if (gamestate.status == 'pause'){
    return;
  }

  gamestate.status = 'pause';

});


gamestate.on('game:end', function() {

  //
  // game is over
  if (gamestate.status == 'stop'){
    return;
  }

  gamestate.status = 'stop';

});
