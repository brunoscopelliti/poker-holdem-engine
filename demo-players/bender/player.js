
exports = module.exports = {

  VERSION: 'beer powered better',

  bet: function (gamestate) {

    'use strict';

    console.log(`Currently playing tournament ${gamestate.tournamentId}`);

    return gamestate.callAmount;

  }

};
