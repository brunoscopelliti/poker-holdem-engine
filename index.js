
'use strict';

const EventEmitter = require('events').EventEmitter;

const chalk = require('chalk');
const mixin = require('merge-descriptors');

const gamestate = exports.gamestate = {};
const engine = exports.engine = {};

mixin(engine, EventEmitter.prototype, false)



function playSingleHand(){

  // @todo

  setTimeout(function() {

    console.log(chalk.red('look ma, i am playing poker'));
    hand.next();

  }, 2000);

}

function* dealer(){

  while (gamestate.status != 'stop'){

    if (gamestate.status == 'pause'){
      yield gamestate.status;
    }

    if (gamestate.status == 'play'){

      let result = yield playSingleHand();

    }

  }

}

const hand = dealer();



engine.on('game:start', function(setupData) {

  // start has a different meaning on the basis of the fact
  // that the tournament is starting for the first time, or
  // it is resuming after a break.

  gamestate.status = 'play';

  if (!gamestate.started){

    console.log(chalk.bold.yellow(' -- is first time'));

    // @todo register players and other first-time stuff

    gamestate.started = true;

  }

  // start the game
  hand.next();

});


engine.on('game:pause', function() {

  //
  // take a break!
  gamestate.status = 'pause';

});


engine.on('game:end', function() {

  //
  // game is over
  gamestate.status = 'stop';

});
