
'use strict';

const playerStatus = require('../domain/player-status');

const allin_ = Symbol.for('is-all-in');
const hasTalked_ = Symbol.for('has-talked');



/**
 * @function
 * @name shouldBet
 * @desc
 *  Assure the player is in the condition to make a bet,
 *  before trying to request him the bet amount.
 *
 * @param {Object} gs:
 *  the gamestate object
 *
 * @param {Object} player:
 *  the player object
 *
 * @param {Function} talkFn:
 *  the callback function to request the bet amount
 *
 * @returns {Promise}
 */
exports = module.exports = function shouldBet(gs, player, talkFn){

  // * player.status == status.active
  //    only the active players have the right to bet.

  // * !player[Symbol.for('is-all-in')]
  //    ask a new bet to an all-in player does not make sense.

  if (player.status == playerStatus.active && !player[allin_]){

    const otherPlayers = gs.players.filter(x => x.id != player.id);


    // * player.chipsBet < gs.callAmount
    //    a player who have bet less than the required amount
    //    should always have a chance to call.

    // * !player[hasTalked_] && otherPlayers.find(x => x.status == status.active && !x[Symbol.for('is-all-in')])
    //    a player can raise only when he has not previously called the same amount;
    //    however raising has sense only when there is at least another active player (not in allin).

    if (player.chipsBet < gs.callAmount || (!player[hasTalked_] && otherPlayers.find(x => x.status == playerStatus.active && !x[allin_]))){
      return talkFn(player);
    }
  }

  return Promise.resolve();

}
