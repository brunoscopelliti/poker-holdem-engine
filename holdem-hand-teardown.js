
'use strict';

const config = require('./config');

const sortByRank = require('poker-rank');
const getCombinations = require('poker-combinations');

const status = require('./domain/player-status');

const run = require('./lib/generator-runner');
const save = require('./storage').save;

const showdown = require('./holdem/showdown');
const assignPot = require('./holdem/assign-pot');
const updatePlayersStatus = require('./holdem/update-players-status');




function* teardownOps(gs){


  //
  // in this phase of the hand only the active players can partecipate
  const activePlayers = gs.players.filter(player => player.status == status.active);

  //
  // 1) showdown
  // sort the player by the strength of their best point
  let sortedPlayers = yield showdown(activePlayers, gs.community_cards);
  yield save(gs, { type: 'showdown', handId: gs.handId, players: sortedPlayers.map(p => Object.assign({}, p)) });

  //
  // 2) assign pot to the winner(s) of the current hand
  // be careful about all-in split, exequos
  yield assignPot(gs, sortedPlayers);

  //
  // 3) update players' status
  for (let i=0; i<activePlayers.length; i++){
    let player = activePlayers[i];
    if (player.chips === 0){
      yield save(gs, { type: 'status', handId: gs.handId, playerId: player.id, status: 'out' });
    }
  }

  updatePlayersStatus(gs);

  //
  // 4) reset pot
  gs.pot = 0;

}


exports = module.exports = function teardown(gs){

  return run(teardownOps, gs).catch(function(err) {
    let tag = { id: gs.handId };
  });

};
