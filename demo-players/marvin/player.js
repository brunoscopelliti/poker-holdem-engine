
exports = module.exports = {

  VERSION: 'i am depressed',

  bet: function (gamestate) {

    'use strict';

    console.log(`Currently playing tournament ${gamestate.tournamentId}`);

    return gamestate.callAmount;

  }

};
