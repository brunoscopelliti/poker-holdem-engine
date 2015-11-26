
'use strict';

const config = require('./config');

const sortByRank = require('poker-rank');
const getCombinations = require('poker-combinations');

const status = require('./domain/player-status');

const showdown = require('./holdem/showdown');



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
        // 2) update chips & player status
        // be careful about all-in split, exequos

        //
        // 3) reset pot
        // ...

        // @todo resolve promise
        res();

      });

  });

};
