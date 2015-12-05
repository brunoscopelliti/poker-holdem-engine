
'use strict';

const config = require('./config');

const chalk = require('chalk');

const save = require('./storage').save;
const run = require('./lib/generator-runner');

const status = require('./domain/player-status');
const session = require('./domain/game-session');
const takeBets = require('./holdem/collect-player-bets');

const winston = require('./log-setup');
const gamestory = winston.loggers.get('gamestory');
const errors = winston.loggers.get('errors');

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

  const tag = { id: gs.handId, type: 'session' };
  const cardTag = { id: gs.handId, type: 'cards' };

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

      gamestory.info('The %s betting session is starting.', gs.session, tag);

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

        yield save(gs, { type: 'cards', handId: gs.handId, session: gs.session, commonCards: gs.community_cards });

        gamestory.info('There are still %d active players after the %s betting session.', activePlayers.length, gs.session, tag);
        gamestory.info('Flop cards are: %s', JSON.stringify(gs.community_cards), cardTag);
      }
      else {
        //
        // ... otherwise, we stop the loop immediately
        // returning the control on the runner
        gamestory.info('Only one player after the %s betting session.', gs.session, tag);
        return gs;
      }

    }
    else {

      gs.session = gs.community_cards.length == 3 ? session.flop : (gs.community_cards.length == 4 ? session.turn : session.river);

      gamestory.info('The %s betting session is starting.', gs.session, tag);

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
        const newCard = gs._deck.shift();
        gs.community_cards.push(newCard);
        yield save(gs, { type: 'cards', handId: gs.handId, session: gs.session, commonCards: [newCard] });

        gamestory.info('There are still %d active players after the %s betting session.', activePlayers.length, gs.session, tag);
        gamestory.info('%s card is: %s', gs.session, JSON.stringify(newCard), cardTag);
      }
      else {
        //
        // ... otherwise, we stop the loop immediately
        // returning the control on the runner
        gamestory.info('Only one player after the %s betting session.', gs.session, tag);
        return gs;
      }

    }

  }

  return gs;

}


exports = module.exports = function play(gs){

  return run(handLoop, gs).catch(function(err) {
    let tag = { id: gs.handId };
    errors.error('An error occurred during the execution of the loop. Stack:', err.stack, tag);
    errors.error('Game state: %s.', JSON.stringify(gs), tag);
  });

};
