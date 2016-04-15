
'use strict';

const winston = require('../../storage/log-setup');
const gamestory = winston.loggers.get('gamestory');

const status = require('../domain/player-status');
const save = require('../../storage/storage').save;

const safeSum = require('../lib/safe-math').safeSum;
const safeDiff = require('../lib/safe-math').safeDiff;

const isAllin = Symbol.for('allin');

function assignToWinner(gs, winnerId, amount){
  amount = typeof amount == 'undefined' ? gs.pot : amount;
  let winner = gs.players.find(player => player.id == winnerId);
  winner.chips = safeSum(winner.chips, amount);
  gs.pot = safeDiff(gs.pot, amount);
  gs.winners.push({ id: winner.id, name: winner.name, amount: amount });
}



exports = module.exports = function assignPot(gs, showdownResults) {

  const tag = { id: gs.handId };

  const showdownPlayers = showdownResults.slice(0);

  //
  // if at the showdown there is only one player,
  // or the first classified player is not in all-in, or in exequo with others,
  // then this player takes all the pot amount
  if (showdownPlayers.length == 1 || (!showdownPlayers[0][isAllin] && !showdownPlayers[0].detail.exequo)){
    let winner = showdownPlayers[0];
    gamestory.info('%s wins the entire pot of %d', winner.name, gs.pot, tag);
    assignToWinner(gs, winner.id);
    return save(gs, { type: 'win', handId: gs.handId, winners: gs.winners });
  }


  //
  // create the sidepot
  // sidepots is something like
  // [ { amount: 250, competitors: [ playerId, ... ] } ]
  let sidepots = [];

  //
  const handPlayers = gs.players.filter(player => player.status != status.out);

  const sortedShowdownPlayers = showdownResults.sort((a,b) => a.chipsBet - b.chipsBet);

  while (sortedShowdownPlayers.length > 0){

    let sidepot = { amount: 0, competitors: sortedShowdownPlayers.map(player => player.id) };
    let currPlayerAmount = handPlayers.find(x => x.id == sortedShowdownPlayers[0].id).chipsBet;

    handPlayers.forEach((player) => {
      let playerContribute = Math.min(player.chipsBet, currPlayerAmount);
      player.chipsBet = safeDiff(player.chipsBet, playerContribute);
      sidepot.amount = safeSum(sidepot.amount, playerContribute);
    });

    if (sidepot.amount){
      sidepots.push(sidepot);
    }

    sortedShowdownPlayers.shift();

  }


  //
  // assign the amount of the sidepots

  sidepots.forEach(function(sidepot) {

    let assigned = false;
    let i = 0;

    //
    // loop over the list of players who are active at the showdown
    // until the sidepot is assigned.
    // !important: it works because the list is sorted so that the players
    // with an higher cards combination comes first.
    while(!assigned){

      let player = showdownPlayers[i];
      if (sidepot.competitors.indexOf(player.id) >= 0){

        if (player.detail.exequo){
          // handle wins in exequo of a sidepot
          let exequos = showdownPlayers.filter(sp => sp.detail.exequo == player.detail.exequo && sidepot.competitors.indexOf(sp.id) >= 0);
          let splitpot = Number.parseFloat((sidepot.amount / exequos.length).toFixed(2));
          exequos.forEach(sp => assignToWinner(gs, sp.id, splitpot));
        }
        else {
          assignToWinner(gs, player.id, sidepot.amount);
        }

        assigned = true;
      }

      i++;
    }

  });

  gs.winners.forEach(w => gamestory.info('%s wins a part of the pot; the amount is %d', w.name, w.amount, tag));
  return save(gs, { type: 'win', handId: gs.handId, winners: gs.winners });

};
