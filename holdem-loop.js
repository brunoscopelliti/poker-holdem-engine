
'use strict';

const config = require('./config');

const chalk = require('chalk');

const run = require('./lib/generator-runner');

const status = require('./domain/player-status');
const session = require('./domain/game-session');
const takeBets = require('./holdem/collect-player-bets');


function isBetRoundFinished(gs){

  let allin = Symbol.for('allin');
  let activePlayers = gs.players.filter(p => p.status === status.active);

  if (activePlayers.length == 1){
    return true;
  }

  return activePlayers.filter(p => p.chipsBet < gs.callAmount && !p[allin]).length == 0;

}


function* handLoop(gs){

  const active = status.active;
  const hasBB = Symbol.for('hasBB');
  const hasDB = Symbol.for('hasDB');

  let activePlayers = gs.players.filter(p => p.status === active);

  //
  // the hand continues until
  // all the community cards are shown
  // and there are more than an active player
  while (gs.community_cards.length < 5 && activePlayers.length > 1){

    //
    // preflop session
    if (gs.community_cards.length == 0){

      gs.session = session.pre;

      // check if there are active players
      // who still have to call, or fold
      while (!isBetRoundFinished(gs)){
        let bbIndex = gs.players.findIndex(player => player[hasBB]);
        yield takeBets(gs, bbIndex);
      }

      //
      // all the players have defined their bet;
      // if only one is still active, he will be the winner of the hand,
      // otherwise game goes on with the flop session.

      activePlayers = gs.players.filter(p => p.status === active);

      if (activePlayers.length > 1){
        //
        // since there are still more than one "active" player
        // we have to continue with the flop session.
        // add three cards on the table
        gs.community_cards.push(gs._deck.shift(), gs._deck.shift(), gs._deck.shift());
      }
      else {
        //
        // ... otherwise, we stop the loop immediately
        // returning the control on the runner
        return gs;
      }

    }
    else {

      gs.session = gs.community_cards.length == 3 ? session.flop : (gs.community_cards.length == 4 ? session.turn : session.river);

      do {
        let dbIndex = gs.players.findIndex(player => player[hasDB]);
        yield takeBets(gs, dbIndex);
      } while(!isBetRoundFinished(gs));

      //
      // all the players have defined their bet;
      // if only one is still active, he will be the winner of the hand,
      // otherwise game goes on with the turn/river session.

      activePlayers = gs.players.filter(p => p.status === status.active);

      if (activePlayers.length > 1) {
        //
        // until there are more than one "active" player, and the game
        // has not reached the river session, we coninue to run the loop.
        // add another card on the table
        gs.community_cards.push(gs._deck.shift());
      }
      else {
        //
        // ... otherwise, we stop the loop immediately
        // returning the control on the runner
        return gs;
      }

    }

  }

  return gs;

}


exports = module.exports = function play(gs){

  //
  // return a promise that will be settled when the hand is completed
  return new Promise(function(resolve, reject){

    return run(handLoop, gs).then(resolve).catch(function() {

      // @todo
      // define what to to in this case;
      // ???
      console.log(chalk.bold.red('something bad happened inside the loop'));

    });

  });

};
