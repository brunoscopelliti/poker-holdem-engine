
'use strict';

const chalk = require('chalk');

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


      yield save(gamestate, 'gamestate:updated');

      // yield playHand();

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



function save(gamestate, data) {

  //
  // ready to save an update on mongoDB
  return new Promise(function(resolve, reject) {
    // be patient until the update is completed
    gamestate.emit('storage:ready', {});
    gamestate.once('storage:completed', function() {
      resolve();
    });
  });

}
