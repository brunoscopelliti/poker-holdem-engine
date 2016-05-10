
'use strict';



/**
 * @function
 * @name splitPot
 * @desc
 *  when there's at least a player who has gone all-in
 *  split the plot in several side pots.
 *
 * @param {Object} gs:
 *  the gamestate object
 *
 * @returns void
 */
exports = module.exports = function splitPot(gs){

  const sidepots = gs.sidepots = createSidepots(gs.players);

  if (sidepots.length == 0){
    return;
  }


  let bets = gs.players.map(player => player.chipsBet);

  const maxBet = Math.max(...bets);

  sidepots.forEach(function(pot, i, sidepots) {
    const quote = i == 0 ? pot.quote : pot.quote - sidepots[i-1].quote;
    bets = bets.map(function(bet) {
      const chips = Math.min(quote, bet);
      pot.amount += chips;
      return bet - chips;
    });
  });

  sidepots.push({ quote: maxBet, amount: bets.reduce((all, curr) => all+curr, 0) })


  // TODO bruno: remove
  if (process.env.NODE_ENV == 'demo'){
    if (sidepots.reduce(function(all, curr) { all += curr.amount; return all; }, 0) != gs.pot){
      throw new Error('Sidepot/pot mismatch')
    }
  }

}



function createSidepots(players) {

  const allin_ = Symbol.for('is-all-in');

  const sidepots = [];

  players.forEach(function(player, i, players) {

    if (!player[allin_] || sidepots.find(x => x.quote == player.chipsBet) != null){
      return;
    }

    // a sidepot should be created only
    // when the player is all-in, and there's at least another player who has bet more than him
    if (players.find(x => x.chipsBet > player.chipsBet) != null){
      sidepots.push({ quote: player.chipsBet, amount: 0 });
    }

  });

  return sidepots.sort((a,b) => a.quote - b.quote);

}
