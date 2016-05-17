
exports = module.exports = {

  VERSION: 'beer powered better',

  bet: function (gamestate) {

    'use strict';

    console.log(`I'm calling for ${gamestate.callAmount}`);

    return gamestate.callAmount;

  }

};
