
'use strict';

const config = require('../config');

const logger = require('../storage/logger');
const save = require('../storage/storage').save;

const gameStatus = require('./domain/tournament-status');
const playerStatus = require('./domain/player-status');


const runSetupTasks = require('./setup-tasks');
const runTeardownTasks = require('./teardown-tasks');

const play = require('./bet-loop');



exports = module.exports = function* dealer(gs){

  function sleep() {
    return new Promise(res => setTimeout(res, config.HANDWAIT));
  }

  function waitResume() {
    return new Promise(function(res, rej) {
      const time = setInterval(function() {
        if (gs.tournamentStatus == gameStatus.play){
          res(clearInterval(time));
        }
      }, 5000);
    });
  }

  while (gs.tournamentStatus != gameStatus.stop){

    const activePlayers = gs.activePlayers;


    // when before a new hand starts,
    // there is only one active player
    // the current game is finished.

    // each player takes points
    // on the basis of their rank...
    // then eventually a new game starts.



    if (activePlayers.length === 1){

      const playerCount = gs.gameChart.unshift(activePlayers[0].id);
      const points = config.AWARDS[playerCount-2];

      let playerPoints = gs.gameChart.map((r,i) => ({ name: r, pts: points[i] }));

      //gamestory.info('Result for game %d: %s', gs[gameProgressive], JSON.stringify(playerPoints), { id: gs.handId });
      yield save(gs, { type: 'points', tournamentId: gs.tournamentId, gameId: gs[gameProgressive], rank: playerPoints });



      // restore players' initial conditions
      gs.players.forEach(player => { player.status = playerStatus.active; player.chips = config.BUYIN; });
      gs.gameChart = null;

      if (gs.tournamentStatus == gameStatus.latest || gs.gameProgressiveId == config.MAX_GAMES){
        gs.tournamentStatus = gameStatus.stop;
        continue;
      }

      // start a new game
      gs.handProgressiveId = 1;
      gs.gameProgressiveId++;
    }






    gs.handUniqueId = `${gs.pid}_${gs.tournamentId}_${gs.gameProgressiveId}-${gs.handProgressiveId}`;

    logger.info('Starting hand %d/%d', gs.gameProgressiveId, gs.handProgressiveId, { tag: gs.handUniqueId });



    //
    // break here until the tournament is resumed
    if (gs.tournamentStatus == gameStatus.pause){
      logger.info('Pause on hand %d/%d', gs.gameProgressiveId, gs.handProgressiveId, { tag: gs.handUniqueId });
      yield waitResume();
    }


    if (gs.tournamentStatus == gameStatus.play || gs.tournamentStatus == gameStatus.latest){

      // TODO bruno: first tournaments have a default sleep time

      yield sleep();

      // setup the hand:
      // restore the initial condition for a new hand, pot,
      // blinds, ante, cards ...

      runSetupTasks(gs);

      yield save({ type: 'setup', handId: gs.handUniqueId, pot: gs.pot, sb: gs.sb, ante: gs.ante || 0, players: gs.players });


      // play the game
      // each player will be asked to make a bet,
      // until only one player remains active, or
      // the hand arrive to the "river" session

      yield* play(gs);


      // find the winner of the hand, eliminated players, ...
      // and updates accordingly the gamestate

      yield* runTeardownTasks(gs);

    }


    //
    // this is the gs.handProgressiveId° hand played
    // this info is important to compute the blinds level
    gs.handProgressiveId++;

  }

};
