
exports = module.exports = {

  VERSION: 'bip drip bip',

  bet: function (gamestate) {

    'use strict';

    const gs = gamestate;
    const p = gs.players;
    const me = p[gs.me];

    if (me.chipsBet > 0){
      return gs.callAmount;
    }

    return 0;

  }

};
