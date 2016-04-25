
'use strict';

const playerStatus = require('../domain/player-status');

exports = module.exports = function reset(gs){

  gs.pot = gs.callAmount = 0;

  gs.commonCards = [];


  const isAllin = Symbol.for('is-all-in');
  const hasBB = Symbol.for('has-big-blind');
  const badge = Symbol.for('last-raiser');

  gs.players.forEach(function(player){

    [hasBB, isAllin, badge].forEach(function(symb) { delete player[symb]; });

    if (player.status == playerStatus.folded){
      player.status = playerStatus.active;
    }

    player.chipsBet = 0;

    player.cards = [];
    player.bestCombination = [];

  });

};
