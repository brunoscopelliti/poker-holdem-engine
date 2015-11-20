
'use strict';

const config = require('./config');

const EventEmitter = require('events').EventEmitter;

const chalk = require('chalk');
const mixin = require('merge-descriptors');

const gamestate = exports.gamestate = {};
const engine = exports.engine = {};

mixin(engine, EventEmitter.prototype, false)



const status = require('./domain/player-status');



const dealer = exports._dealer = require('./holdem-dealer');
const hand = dealer();

engine.on('game:start', function(setupData) {

  // start has a different meaning on the basis of the fact
  // that the tournament is starting for the first time, or
  // it is resuming after a break.

  if (gamestate.status == 'play'){
    return;
  }

  gamestate.status = 'play';

  if (!gamestate.started){

    gamestate.tournamentId = setupData.tournamentId;

    gamestate.players = setupData.players.map(function(player, id) {

      return {
        id: id,
        name: player.name,
        chips: config.BUYIN,
        cards: [],
        status: status.active,
        version: 'Poker folder star!'
      };

    });

    gamestate.started = true;

  }

  // start the game
  hand.next();

});


engine.on('game:pause', function() {

  //
  // take a break!

  if (gamestate.status == 'pause'){
    return;
  }

  gamestate.status = 'pause';

});


engine.on('game:end', function() {

  //
  // game is over
  if (gamestate.status == 'stop'){
    return;
  }

  gamestate.status = 'stop';

});



engine.on('storage:success', function() {

  hand.next();

});
