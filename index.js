
'use strict';

//
// configure poker settings
const config = require('./config');

const EventEmitter = require('events').EventEmitter;

const mixin = require('merge-descriptors');


//
// gamestate contains the information about the state
// of the game.
const gamestate = exports.gamestate = {};
mixin(gamestate, EventEmitter.prototype, false);



const status = require('./domain/player-status');

const run = require('./lib/generator-runner');
const dealer = exports._dealer = require('./holdem-dealer');


const createPlayer = require('./holdem/player-factory');



const winston = require('./log-setup');
const gamestory = winston.loggers.get('gamestory');
const errors = winston.loggers.get('errors');



gamestate.on('game:start', function(setupData) {

  // start has a different meaning on the basis of the fact
  // that the tournament is starting for the first time, or
  // it is resuming after a break.

  if (gamestate.status == 'play'){
    return;
  }

  gamestate.status = 'play';

  if (!gamestate.started){

    //
    // the unique id of the current tournament
    gamestate.tournamentId = setupData.tournamentId;

    //
    // the players
    gamestate.players = setupData.players.map(createPlayer);

    gamestate.started = true;

  }

  gamestory.info('Tournament %s is going to start.', gamestate.tournamentId);

  // start the game
  return run(dealer, gamestate);

});


gamestate.on('game:pause', function() {

  //
  // take a break!

  if (gamestate.status == 'pause'){
    return;
  }

  gamestory.info('Tournament %s is in pause.', gamestate.tournamentId);

  gamestate.status = 'pause';

});


gamestate.on('game:end', function() {

  //
  // game is over
  if (gamestate.status == 'stop'){
    return;
  }

  gamestory.info('Tournament %s is going to finish.', gamestate.tournamentId);

  gamestate.status = 'stop';

});
