
'use strict';



const engine = require('./index').engine;
const gamestate = require('./index').gamestate;

exports = module.exports = function* dealer(){

  let progressive = Symbol.for('hand-progressive');
  gamestate[progressive] = 0;

  while (gamestate.status != 'stop'){

    if (gamestate.status == 'pause'){
      //
      // break here until the tournament is resumed
      yield gamestate.status;
    }

    if (gamestate.status == 'play'){

      //
      // 1- compute small blind level
      // 2- assigns dealer button to player
      // 3- prepare the cards deck
      // 4- give 2 cards each player
      // let cards = yield* setupHand();

      // @todo update mongodb
      yield engine.emit('gamestate:updated', gamestate);

      // yield* playHand();

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
