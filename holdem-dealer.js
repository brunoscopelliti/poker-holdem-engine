
'use strict';

const chalk = require('chalk');

const engine = require('./index').engine;


const setup = require('./holdem-hand-setup');


exports = module.exports = function* dealer(gamestate, testFn){

  let progressive = Symbol.for('hand-progressive');
  gamestate[progressive] = 0;

  console.log(chalk.bold.green('dealer is starting'));
  console.log(gamestate);

  while (gamestate.status != 'stop'){

    if (gamestate.status == 'pause'){
      //
      // break here until the tournament is resumed
      yield gamestate.status;
    }

    if (gamestate.status == 'play'){


      //
      // setup the hand, so that it can be played
      let cards = yield setup(gamestate);

      // @todo update mongodb

      console.log(chalk.bold.green('gamestate updated'));
      console.log(gamestate);

      yield engine.emit('gamestate:updated', gamestate);

      // yield* playHand();

    }


    if (typeof testFn == 'function'){
      testFn();
    }

    //
    // this is the gamestate[progressive]° hand played
    // this info is important to compute the blinds level
    gamestate[progressive]++;

  }

  //
  // tournament is finished

  // @todo are there other operations?

};
