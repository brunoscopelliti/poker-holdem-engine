
'use strict';

const config = require('./config');

const chalk = require('chalk');

const status = require('./domain/player-status');
const run = require('./lib/generator-runner');
const eachFrom = require('./lib/loop-from');


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

      console.log(chalk.green('pre-flop'));

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

      if (activePlayers.length == 1){
        // @todo define hand winner
      }
      else {
        //
        // flop
        // add three cards on the table
        gs.community_cards.push(gs._deck.shift(), gs._deck.shift(), gs._deck.shift());
      }

    }
    else {

      let phase = gs.community_cards.length == 3 ? 'flop' : (gs.community_cards.length == 4 ? 'turn' : 'river');
      console.log(chalk.green(phase));

      do {
        let dbIndex = gs.players.findIndex(player => player[hasDB]);
        yield takeBets(gs, dbIndex);
      } while(!isBetRoundFinished(gs));

      //
      // all the players have defined their bet;
      // if only one is still active, he will be the winner of the hand,
      // otherwise game goes on with the turn/river session.

      activePlayers = gs.players.filter(p => p.status === status.active);

      if (activePlayers.length == 1){
        // @todo define hand winner
      }
      else if (gs.community_cards.length < 5){
        //
        // turn/river
        // add another card on the table
        gs.community_cards.push(gs._deck.shift());
      }
      else {
        // @todo showdown
      }

    }

  }

}


function takeBets(gs, fromIndex){

  return eachFrom(gs.players, fromIndex, function(player, i) {
    if (player.status == status.active){
      return player.talk(gs).then(function(betAmount) {

        return player.bet(gs, betAmount);

      }).catch(function() {

        // @todo
        // handle request's error

      });
    }
  });

}


function isBetRoundFinished(gs){

  let allin = Symbol.for('allin');
  let activePlayers = gs.players.filter(p => p.status === status.active);

  if (activePlayers.length == 1){
    return true;
  }

  return activePlayers.filter(p => p.chipsBet < gs.callAmount && !p[allin]).length == 0;

}




exports = module.exports = function play(gs){

  //
  // ..
  return new Promise(function(resolve, reject){

    return run(handLoop, gs).then(function() {

      resolve();

    }).catch(function() {

      console.log(chalk.bold.red('something bad happened inside the loop'));

    });

  });

};
