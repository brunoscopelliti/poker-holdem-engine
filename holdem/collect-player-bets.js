
'use strict';

const status = require('../domain/player-status');
const eachFrom = require('../lib/loop-from');

exports = module.exports = function takeBet(gs, fromIndex) {

  return eachFrom(gs.players, fromIndex, function(player, i) {
    if (player.status == status.active){
      return player.talk(gs).then(function(betAmount) {

        return player.bet(gs, betAmount);

      }).catch(function() {

        // @todo retry in case there was a network problem

        //
        // in case of error
        // just fold!
        return player.bet(gs, 0);

      });
    }
  });

}
