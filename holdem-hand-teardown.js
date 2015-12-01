
'use strict';

const config = require('./config');

const sortByRank = require('poker-rank');
const getCombinations = require('poker-combinations');

const status = require('./domain/player-status');

const showdown = require('./holdem/showdown');
const assignPot = require('./holdem/assign-pot');
const updatePlayersStatus = require('./holdem/update-players-status');


exports = module.exports = function teardown(gs){

  return new Promise(function(res, rej){

    //
    // in this phase of the hand only the active players can partecipate
    let activePlayers = gs.players.filter(player => player.status == status.active);

    //
    // 1) showdown
    // sort the player by the strength of their best point
    showdown(activePlayers, gs.community_cards)
      .then(function(sortedPlayers) {

        //
        // 2) assign pot to the winner(s) of the current hand
        // be careful about all-in split, exequos
        assignPot(gs, sortedPlayers);

        //
        // 3) update players' status
        updatePlayersStatus(gs.players);

        //
        // 4) reset pot
        gs.pot = 0;

        // @todo resolve promise
        res(gs);
      });

  });

};
