
'use strict';

const status = require('../domain/player-status');


const isAllin = Symbol.for('allin');

function shouldSplit(showdownResults) {

  // return true
  // if at the showdown there was only one player,
  // or when there's not exequo & allin conditions

  let winner = showdownResults[0];
  return showdownResults.length > 1 && (winner[isAllin] || winner.detail.exequo);
}

function assignToWinner(gs, winnerId){
  gs.players.find(player => player.id == winnerId).chips += gs.pot;
  gs.pot = 0;
}

exports = module.exports = function assignPot(gs, showdownResults) {

  const showdownPlayers = showdownResults.slice(0);

  //
  // assign the pot interely to the unique winner
  if (!shouldSplit(showdownPlayers)){
    let winner = showdownPlayers[0];
    return void assignToWinner(gs, winner.id);
  }

  //
  // it's an array of players who already
  // received part of the pot
  let servedWinners = [];

  while(showdownPlayers.length > 0 && gs.pot > 0){
    let winner = showdownPlayers[0];
    if (winner[isAllin]){
      let previousWinnerChipsBet = servedWinners.length == 0 ? 0 : servedWinners[servedWinners.length-1].chipsBet;

      let sidepot = gs.players
        // to compute the sidepot we have to exclude players who received
        // already part of the pot ("previous winners")
        .filter(player => servedWinners.find(winner => winner.id == player.id) == null)
        // normalize the players bet amount in function of the amount
        // bet from the previous winner (if any)
        .map(player => (player.chipsBet -= previousWinnerChipsBet, player))
        .reduce((tot, player) => tot += Math.max(Math.min(player.chipsBet, winner.chipsBet), 0), 0);

      servedWinners.push(winner);

      gs.players.find(player => player.id == winner.id).chips += sidepot;
      gs.pot = gs.pot - sidepot;
    }
    else {
      assignToWinner(gs, winner.id);
    }

    showdownPlayers.shift();
  }

};
