
exports = module.exports = {

  VERSION: 'arale folder',

  bet: function (gamestate) {

    'use strict';

    console.log(`Currently playing tournament ${gamestate.tournamentId}`);

    return gamestate.callAmount;

  }

};
