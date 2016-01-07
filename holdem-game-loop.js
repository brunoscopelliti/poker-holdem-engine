
'use strict';

const config = require('./config');

const winston = require('winston');
const gamestory = winston.loggers.get('gamestory');

const gamestatus = require('./domain/game-status');
const status = require('./domain/player-status');

const save = require('./storage').save;

const handSetup = require('./holdem-hand-setup');
const play = require('./holdem-bet-loop');
const handTeardown = require('./holdem-hand-teardown');



exports = module.exports = function* dealer(gs, testFn){

  const pid = Symbol.for('process-id');

  //
  // Usually a tournament is composed by many games.
  // Everytime a player eliminates all the others, start a new game.
  const game = Symbol.for('game-progressive');

  //
  // As a tournament is made by one or more games,
  // a game is composed by one or more "hands".
  const progressive = Symbol.for('hand-progressive');

  //
  // current game/round of the tournament.
  gs[game] = gs[progressive] = 1;

  while (gs.status != gamestatus.stop){

    const activePlayers = gs.players.filter(player => player.status == status.active);

    //
    // before a new game hand starts,
    // check the number of the active players.
    // if there is only one active player
    // we reward the winner of the current game,
    // and then start a fresh new game.
    if (activePlayers.length === 1){
      // compute the points earned by each player
      gs.rank.unshift(activePlayers[0].name);
      let awards = config.AWARDS.find(x => x.N === gs.rank.length).P;
      let playerPoints = gs.rank.map((r,i) => ({ name: r, pts: awards[i] }));
      gamestory.info('Result for game %d: %s', gs[game], JSON.stringify(playerPoints), { id: gs.handId });
      yield save(gs, { type: 'points', tournamentId: gs.tournamentId, gameId: gs[game], rank: playerPoints });

      // restore players' initial conditions
      gs.players.forEach(player => { player.status = status.active; player.chips = config.BUYIN; });

      if (gs.status == gamestatus.latest){
        // the game that has just finished was declared to be the latest
        // of the tournament.
        gs.status = gamestatus.stop;
        continue;
      }

      // start a new game
      gs[progressive] = 1;
      gs[game]++;
    }

    gs.handId = `${gs[pid]}_${gs.tournamentId}_${gs[game]}-${gs[progressive]}`;

    gamestory.info('Starting hand %s', gs.handId, { id: gs.handId });


    //
    // break here until the tournament is resumed
    if (gs.status == gamestatus.pause){
      gamestory.info('Tournament %s is now in pause.', gs.tournamentId, { id: gs.handId });
      yield new Promise(function(res) {
        let time = setInterval(function() {
          if (gs.status == gamestatus.play){
            clearInterval(time);
            res();
          }
        }, 5000);
      });
    }


    if (gs.status == gamestatus.play || gs.status == gamestatus.latest){

      //
      // setup the hand, so that it can be played
      yield handSetup(gs);

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


    if (typeof testFn == 'function'){
      testFn();
    }

    //
    // this is the gs[progressive]° hand played
    // this info is important to compute the blinds level
    gs[progressive]++;

  }

};
