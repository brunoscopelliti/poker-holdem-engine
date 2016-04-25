
'use strict';

const winston = require('../../storage/logger');
// const errors = winston.loggers.get('errors');

const session = require('../domain/game-session');
const playersStatus = require('../domain/player-status');
const eachFrom = require('../lib/loop-from');


exports = module.exports = function takeBet(gs, fromIndex) {

  let isAllin = Symbol.for('is-all-in');

  return eachFrom(gs.players, fromIndex, function(player) {

    //
    // * player.status == status.active
    // only the active players have the right to bet.

    //
    // * !player[Symbol.for('is-all-in')]
    // if the current player is already in allin,
    // ask him a new bet does not make sense


    if (player.status == playersStatus.active && !player[Symbol.for('is-all-in')]){

      //
      // * player.chipsBet < gs.callAmount
      // an active player not in allin, who have bet less than the required amount
      // should always have a chance to call.

      //
      // * gs.players.filter(x => x.id != player.id && x.status == status.active && !x[Symbol.for('is-all-in')]).length > 0
      // however for the raise to have sense there should be at least another active player (not in allin)
      // other than the current player

      if (player.chipsBet < gs.callAmount || gs.players.filter(x => x.id != player.id && x.status == playersStatus.active && !x[isAllin]).length > 0){
        return player.talk(gs)
          .then(function(betAmount) {

            // if the current hand must be decided with the showdown,
            // the showdown procedure follows the following rule:

            // * if during the 'river' session someone has made a bet,
            // the one who has made the first final bet is the one who has
            // to showdown first.
            // * otherwise the showdown starts from the player next to
            // the dealer button

            if (gs.session === session.river && betAmount > gs.callAmount){
              let badge = Symbol.for('last-raiser');
              gs.players.forEach(player => delete player[badge]);
              player[badge] = true;
            }

            return player.bet(gs, betAmount);

          })
          .catch(function(err) {
            // in case of error just fold/check!
            // errors.error('%s failed to bet. Details: %s', player.name, JSON.stringify(err));
            return player.bet(gs, 0);
          });
      }

    }
  });

}
