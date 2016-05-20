
'use strict';

const playerStatus = require('../domain/player-status');

const allin_ = Symbol.for('is-all-in');



/**
 * @function
 * @name shouldBreak
 * @desc
 *  TODO bruno: test & docs
 *
 * @param {Object} gs:
 *  the gamestate object
 *
 * @param {Object} player:
 *  the player object
 *
 * @param {Number} playerIdx:
 *  the index of the player in the gs.players array
 *
 * @returns {Boolean}
 */
exports = module.exports = function shouldBreak(gs, player, playerIdx){

  if (gs.spinCount == 0){
    return false;
  }

  // after all the players have talked at least once,
  // the bet loop terminates immediately when there aren't
  // players who have bet less than the required minimum amount.

  return gs.activePlayers
    .find(x => !x[allin_] && x.chipsBet < gs.callAmount) == null;

}
