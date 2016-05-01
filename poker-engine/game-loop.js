
'use strict';

const config = require('../config');

const logger = require('../storage/logger');
const save = require('../storage/storage').save;

const gameStatus = require('./domain/tournament-status');
const playerStatus = require('./domain/player-status');



const setupTasks = require('./setup-tasks');

const play = require('./holdem-bet-loop');
const handTeardown = require('./holdem-hand-teardown');



exports = module.exports = function* dealer(gs){

  function sleep() {
    return new Promise(res => setTimeout(res, config.HANDWAIT));
  }

  function waitResume() {
    return new Promise(function(res, rej) {
      const time = setInterval(function() {
        if (gs.status == gameStatus.play){
          res(clearInterval(time));
        }
      }, 5000);
    });
  }

  while (gs.status != gameStatus.stop){


    // const activePlayers = gs.players.filter(player => player.status == playerStatus.active);

    // before a new game hand starts,
    // check the number of the active players.
    // if there is only one active player
    // we reward the winner of the current game,
    // and then start a fresh new game.

    // TODO this section was far too complex than how it could be...

    // if (gs.activePlayers.length === 1){
    //
    //   // compute the points earned by each player
    //   let playerCount = gs.rank.unshift(gs.activePlayers[0].name);
    //
    //   let awards = config.AWARDS[playerCount-2];
    //   let playerPoints = gs.rank.map((r,i) => ({ name: r, pts: awards[i] }));
    //
    //   //gamestory.info('Result for game %d: %s', gs[gameProgressive], JSON.stringify(playerPoints), { id: gs.handId });
    //   yield save(gs, { type: 'points', tournamentId: gs.tournamentId, gameId: gs[gameProgressive], rank: playerPoints });
    //
    //   // restore players' initial conditions
    //   gs.players.forEach(player => { player.status = playerStatus.active; player.chips = config.BUYIN; });
    //   gs.rank = [];
    //
    //   if (gs.status == gameStatus.latest){ // or gameID == config.MAX_GAMES-1
    //     // the game that has just finished was declared to be the latest
    //     // of the tournament.
    //     gs.status = gameStatus.stop;
    //     continue;
    //   }
    //
    //   // start a new game
    //   gs[handProgressive] = 1;
    //   gs[gameProgressive]++;
    // }

    gs.handUniqueId = `${gs.pid}_${gs.tournamentId}_${gs.gameProgressiveId}-${gs.handProgressiveId}`;

    logger.info('Starting hand %d/%d', gs.gameProgressiveId, gs.handProgressiveId, { tag: gs.handUniqueId });




    //
    // break here until the tournament is resumed
    if (gs.status == gameStatus.pause){
      logger.info('Pause on hand %d/%d', gs.gameProgressiveId, gs.handProgressiveId, { tag: gs.handUniqueId });
      yield waitResume();
    }


    if (gs.status == gameStatus.play || gs.status == gameStatus.latest){

      yield sleep();


      // setup the hand:
      // restore the initial condition for a new hand, pot,
      // blinds, ante, cards ...

      // TODO this do not need to be yielded, do not need to be a generator
      yield *setupTasks(gs);

      yield save(gs, { type: 'setup', handId: gs.handId, pot: gs.pot, sb: gs.sb, players: gs.players.map(p => Object.assign({}, p)) });

      //
      // play the game
      // each player will be asked to make a bet,
      // until only one player remains active, or
      // the hand arrive to the "river" session
      yield play(gs);

      //
      // declare the winner of the hand, and
      // updates accordingly the gamestate
      yield handTeardown(gs);

    }


    //
    // this is the gs.handProgressiveId° hand played
    // this info is important to compute the blinds level
    gs.handProgressiveId++;

  }

};
