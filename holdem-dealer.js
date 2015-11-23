
'use strict';

const chalk = require('chalk');

const setup = require('./holdem-hand-setup');
const play = require('./holdem-loop');


exports = module.exports = function* dealer(gs, testFn){

  let progressive = Symbol.for('hand-progressive');
  gs[progressive] = 0;

  while (gs.status != 'stop'){

    if (gs.status == 'pause'){
      //
      // break here until the tournament is resumed
      yield gs.status;
    }


    // @todo
    // check the number of player still active
    // and eventually start with fresh chips


    if (gs.status == 'play'){

      //
      // setup the hand, so that it can be played
      let cards = yield setup(gs);

      yield save(gs, 'gs:updated');

      yield play(gs);

    }


    if (typeof testFn == 'function'){
      testFn();
    }

    //
    // this is the gs[progressive]° hand played
    // this info is important to compute the blinds level
    gs[progressive]++;

  }

  //
  // tournament is finished

  // @todo are there other operations?

};



function save(gs, data) {

  //
  // ready to save an update on mongoDB
  return new Promise(function(resolve, reject) {
    // be patient until the update is completed
    gs.emit('storage:ready', {});
    gs.once('storage:completed', function() {
      resolve();
    });
  });

}
