
'use strict';

//
// configure poker settings
const config = require('./config');

const chalk = require('chalk');
const EventEmitter = require('events').EventEmitter;

const mixin = require('merge-descriptors');


//
// gamestate contains the information about the state
// of the game.
const gamestate = exports.gamestate = {};
mixin(gamestate, EventEmitter.prototype, false);



const status = require('./domain/player-status');

const run = require('./lib/generator-runner');
const dealer = exports._dealer = require('./holdem-game-loop');


const createPlayer = require('./holdem/player-factory');



const winston = require('./log-setup');
const tag = {};
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

  tag.pid = process.pid;

  if (!gamestate.started){

    //
    // the unique id of the current tournament
    gamestate.tournamentId = tag.id = setupData.tournamentId;

    //
    // the players
    gamestate.players = setupData.players.map(createPlayer);

    gamestate.started = true;

    gamestory.info('Tournament %s is going to start.', gamestate.tournamentId, tag);
    gamestory.info('The number of participants is %d; they are %s.', gamestate.players.length, gamestate.players.map(p => p.name).toString().replace(/,/g, ', '), tag);

    // start the game
    return void run(dealer, gamestate).then(function() {

      //
      // the tournament is finished
      return gamestate.emit('tournament-finished', { tournamentId: gamestate.tournamentId });

    }).catch(function(err) {
      //
      // an error occurred during the dealer generator execution;
      // if the exception is not handled before... there's nothing here i can do.
      errors.error('An error occurred during tournament %s: %s. Stack: %s', gamestate.tournamentId, err.message, err.stack, { id: gamestate.handId, pid: process.pid });
    });

  }

});


gamestate.on('game:pause', function() {

  //
  // take a break!

  if (gamestate.status == 'pause'){
    return;
  }

  gamestory.info('Tournament %s is going to be paused.', gamestate.tournamentId, tag);

  gamestate.status = 'pause';

});


gamestate.on('game:end', function() {

  //
  // game is over
  if (gamestate.status == 'stop'){
    return;
  }

  gamestory.info('Tournament %s is going to finish.', gamestate.tournamentId, tag);

  gamestate.status = 'stop';

});
