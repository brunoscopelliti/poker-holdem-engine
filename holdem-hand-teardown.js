
'use strict';

const config = require('./config');

const status = require('./domain/player-status');


const sortByRank = require('poker-rank');
const getCombinations = require('poker-combinations');


function findWinner(players, commonCards){

  if (players.length == 1){
    return 'todo';
  }

  //
  // get the best combination of each player
  players.forEach(function(player) {
    let combs = getCombinations(player.cards.concat(commonCards), 5);
    let bestHand = sortByRank(combs)[0];
    player.bestCards = combs[bestHand.index];
  });


  players.map(function(player) {
    return { playerId: player.id, bestCards: player.bestCards };
  })


}

exports = module.exports = function teardown(gs){

  // ...

  let activePlayers = gs.players.filter(player => player.status == status.active);

  findWinner(activePlayers, gs.community_cards);

  // 1) find the winner

  // handle ex-equo

  // 2) updates winner chips
  // 3) reset the pot




};
