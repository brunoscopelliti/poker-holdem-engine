
'use strict';

//
// configure poker settings
const config = require('./config');

//
// log utilities
const tag = {};
const winston = require('./log-setup');
const gamestory = winston.loggers.get('gamestory');
const errors = winston.loggers.get('errors');



const EventEmitter = require('events').EventEmitter;
const mixin = require('merge-descriptors');

const gamestatus = require('./domain/game-status');
const createPlayer = require('./holdem/player-factory');
const run = require('./lib/generator-runner');

const dealer = require('./holdem-game-loop');



//
// gamestate contains the information about the state
// of the game.
const gamestate = exports.gamestate = mixin({}, EventEmitter.prototype, false);


const hasStarted = Symbol('has-tournament-started');
const pid = Symbol.for('process-id');

gamestate.on('game:start', function(setupData) {

  // start has a different meaning on the basis of the fact
  // that the tournament is starting for the first time, or
  // it is resuming after a break.

  if (gamestate.status == gamestatus.play)
    return;

  gamestate.status = gamestatus.play;

  if (gamestate[hasStarted])
    return;


  gamestate[pid] = process.pid;

  //
  // the unique id of the current tournament
  gamestate.tournamentId = tag.id = setupData.tournamentId;

  //
  // in order to be able to restart a tournament from a given game
  // after a system accident
  if (setupData.restore){
    gamestate.emergency = { gameId: setupData.gameId, handId: 1 };
  }

  //
  // the players
  gamestate.players = setupData.players.map(createPlayer);

  gamestate[hasStarted] = true;

  gamestory.info('Tournament %s is going to start.', gamestate.tournamentId, tag);
  gamestory.info('The number of participants is %d; they are %s.', gamestate.players.length, gamestate.players.map(p => p.name).toString().replace(/,/g, ', '), tag);

  // start the game
  return void run(dealer, gamestate).then(function() {
    // the tournament is finished
    // this thread is going to be killed :P
    return gamestate.emit('tournament-finished', { tournamentId: gamestate.tournamentId });
  }).catch(function(err) {
    //
    // an error occurred during the dealer generator execution;
    // if the exception is not handled before... there's nothing here i can do.
    errors.error('An error occurred during tournament %s: %s. Stack: %s', gamestate.tournamentId, err.message, err.stack, { id: gamestate.handId });
  });

});


gamestate.on('game:pause', function() {

  //
  // take a break!

  if (gamestate.status != gamestatus.play)
    return;

  gamestory.info('Tournament %s is going to be paused.', gamestate.tournamentId, tag);

  gamestate.status = gamestatus.pause;

});


gamestate.on('game:end', function() {

  //
  // game is over
  if (gamestate.status == gamestatus.stop || gamestate.status == gamestatus.latest)
    return;

  gamestory.info('Tournament %s is going to finish.', gamestate.tournamentId, tag);

  gamestate.status = gamestatus.latest;

});
