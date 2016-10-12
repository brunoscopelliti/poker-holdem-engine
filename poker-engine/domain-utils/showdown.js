
'use strict';

const sortByRank = require('poker-rank');



/**
 * @function
 * @name showdown
 * @desc
 *  Fill the gamestate handChart property.
 *  handChart is an array containing data about the players,
 *  sorted by the strength of their best combination.
 *
 * @param {Object} gs:
 *  the gamestate object
 *
 * @returns {void}
 */
exports = module.exports = function showdown(gs) {

  const activePlayers = gs.activePlayers;

  if (activePlayers.length === 1){
    return void (gs.handChart = []);
  }

  // it's an array containing the best combination
  // of each player
  const playersBestCombination = activePlayers.map(player => player.showdown(gs.commonCards));

  const sortedCombinations = sortByRank(playersBestCombination);

  gs.handChart = sortedCombinations.map(function(bestCombinationData) {
    const player = activePlayers[bestCombinationData.index];
    return {
      name: player.name,
      id: player.id,
      quote: player.chipsBet,
      cards: player.cards,
      bestCards: player.bestCombination,
      bestCombinationData: bestCombinationData
    };
  });

}
