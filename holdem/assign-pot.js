
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
  // ...

  while(showdownPlayers.length > 0 && gs.pot > 0){

    let winner = showdownPlayers[0];

    if (winner[isAllin]){

      let sidepot = gs.players.reduce((tot, player) => tot += Math.min(player.chipsBet, winner.chipsBet), 0);

      gs.players.find(player => player.id == winner.id).chips += sidepot;
      gs.pot = gs.pot - sidepot;

    }
    else {

      assignToWinner(gs, winner.id);

    }

    showdownPlayers.shift();

  }

};
