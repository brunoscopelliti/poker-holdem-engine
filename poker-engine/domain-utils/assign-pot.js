
'use strict';

const loopFrom = require('../lib/loop-from');



/**
 * @function
 * @name assignPot
 * @desc assign the pot to the player with strongest combination
 *
 * @param {Object} gs:
 *  the gamestate object
 *
 * @returns void
 */
exports = module.exports = function assignPot(gs) {


  function assignChips(playerId, amount = gs.pot){
    const player = gs.players.find(player => player.id == playerId);

    player.chips += amount;
    gs.pot -= amount;

    const winner = gs.winners.find(player => player.id == playerId);

    if (winner){
      return void (winner.amount += amount);
    }

    gs.winners.push({ id: player.id, name: player.name, amount: amount });
  }



  // setup the empty array of the players
  // who receive at least a chip
  gs.winners = [];



  const activePlayers = gs.activePlayers;



  //  shortcut
  //  when there is only an active player,
  //  he takes the full pot

  if (activePlayers.length == 1){
    return void assignChips(activePlayers[0].id);
  }



  if (gs.sidepots.length == 0){
    gs.sidepots.push({ quote: gs.callAmount, amount: gs.pot });
  }


  gs.sidepots.forEach(function(sidepot){

    // players who have the right to get this sidepot
    const sidepotContenders = gs.handChart.filter(x => x.quote >= sidepot.quote);

    const firstContender = sidepotContenders[0];
    const exequoTag = firstContender.bestCombinationData.exequo;

    if (sidepotContenders.length == 1 || !exequoTag){
      return void assignChips(firstContender.id, sidepot.amount);
    }

    const exequoContenders = sidepotContenders.filter(x => x.bestCombinationData.exequo == exequoTag);
    const sidepotSplittedAmount = sidepot.amount / exequoContenders.length;

    exequoContenders.forEach(contender => assignChips(contender.id, Math.floor(sidepotSplittedAmount)));



    // in the case of a split pot,
    // the chip(s) will be split as evenly as possible,
    // with any odd chip(s) left over given out to the winning player
    // with the worst position (left of the button being the worst).

    const excidingChips = sidepot.amount % exequoContenders.length;

    if (excidingChips > 0){
      let assigned = false;
      loopFrom(gs.players, gs.dealerButtonIndex, function(player) {
        if (!assigned && exequoContenders.find(contender => contender.id == player.id)){
          assignChips(player.id, excidingChips);
          assigned = true;
        }
      });
    }

  });

};
