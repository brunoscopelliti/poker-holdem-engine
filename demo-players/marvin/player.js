
exports = module.exports = {

  VERSION: 'i am depressed',

  bet: function (gamestate) {

    'use strict';


    const marvin = gamestate.players[gamestate.me];
    const halfBuyin = gamestate.buyin * .5

    if (marvin.chips < halfBuyin){
      console.log(`Ahhhhhhhhh ! I'm doomed...`);
      return Number.MAX_SAFE_INTEGER;
    }

    console.log(`I'm sadly calling for ${gamestate.callAmount}`);
    return gamestate.callAmount;

  }

};
