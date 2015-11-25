
'use strict';

const session = require('../domain/game-session');
const status = require('../domain/player-status');
const eachFrom = require('../lib/loop-from');

exports = module.exports = function takeBet(gs, fromIndex) {

  return eachFrom(gs.players, fromIndex, function(player, i) {
    if (player.status == status.active){
      return player.talk(gs).then(function(betAmount) {

        // if the current hand must be decided with the showdown,
        // the showdown procedure follows the following rule:

        // * if during the 'river' session someone has made a bet,
        // the one who has made the first final bet is the one who has
        // to showdown first.
        // * otherwise the showdown starts from the player next to
        // the dealer button

        if (gs.session === session.river && betAmount > gs.callAmount){
          let badge = Symbol.for('show-first');
          gs.players.forEach(player => delete player[badge]);
          player[badge] = true;
        }
        
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
