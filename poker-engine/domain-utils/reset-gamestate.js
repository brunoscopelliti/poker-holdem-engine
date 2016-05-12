
'use strict';

const playerStatus = require('../domain/player-status');



/**
 * @function
 * @name resetGamestate
 * @desc reset the gamestate to the initial conditions
 *
 * @param {Object} gs:
 *  the gamestate object
 *
 * @returns void
 */
exports = module.exports = function resetGamestate(gs){

  gs.pot = gs.callAmount = 0;

  gs.sidepots = [];
  gs.commonCards = [];


  const allin_ = Symbol.for('is-all-in');
  const hasBB_ = Symbol.for('has-big-blind');

  gs.players.forEach(function(player){

    [hasBB_, allin_].forEach(function(symb) { delete player[symb]; });

    // players who have folded in the previous hand
    // should be re-activated
    if (player.status == playerStatus.folded){
      player.status = playerStatus.active;
    }

    player.chipsBet = 0;

    player.cards = [];
    player.bestCombination = [];
    player.bestCombinationData = null;

  });

};
