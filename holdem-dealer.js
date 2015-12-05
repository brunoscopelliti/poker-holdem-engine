
'use strict';

const chalk = require('chalk');

const save = require('./storage').save;
const handSetup = require('./holdem-hand-setup');
const play = require('./holdem-loop');
const handTeardown = require('./holdem-hand-teardown');

const winston = require('./log-setup');
const gamestory = winston.loggers.get('gamestory');
const errors = winston.loggers.get('errors');

exports = module.exports = function* dealer(gs, testFn){

  let progressive = Symbol.for('hand-progressive');
  gs[progressive] = 0;

  while (gs.status != 'stop'){

    gs.handId = `${gs.tournamentId}_${gs[progressive]}`;

    gamestory.info('Starting hand %s', gs.handId, { id: gs.handId });


    //
    // break here until the tournament is resumed
    if (gs.status == 'pause'){
      gamestory.info('Tournament %s is now in pause.', gs.tournamentId, { id: gs.handId });
      yield gs.status;
    }


    // @todo
    // check the number of player still active
    // and eventually start with fresh chips

    if (gs.status == 'play'){

      //
      // setup the hand, so that it can be played
      let cards = yield handSetup(gs);

      yield save(gs, { type: 'setup', handId: gs.handId, pot: gs.pot, sb: gs.sb, players: gs.players.map(p => Object.assign({}, p)) });

      //
      // play the game
      // each player will be asked to make a bet,
      // until only one player remains active, or
      // the hand arrive to the "river" session
      yield play(gs);

      //
      // declare the winner of the hand, and
      // updates accordingly the gamestate
      yield handTeardown(gs);

    }


    if (typeof testFn == 'function'){
      testFn();
    }

    //
    // this is the gs[progressive]° hand played
    // this info is important to compute the blinds level
    gs[progressive]++;

  }

};
