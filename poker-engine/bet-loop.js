
'use strict';

const config = require('../config');

const logger = require('../storage/logger');
const save = require('../storage/storage').save;


const gameSession = require('./domain/game-session');
const playerStatus = require('./domain/player-status');

const shouldBet = require('./domain-utils/should-bet');
const shouldBreak = require('./domain-utils/should-break');


const asyncFrom = require('./lib/loop-from-async');



/**
 * @function
 * @name betLoop
 * @desc
 *  It's the generator that controls the betting loop.
 *  It's completed after the "river", or when all the players but one have folded
 *
 * @param {Object} gs:
 *  the gamestate object
 *
 * @returns {void}
 */
exports = module.exports = function* betLoop(gs){

  logger.info('Hand %d/%d, starting betting session', gs.gameProgressiveId, gs.handProgressiveId, { tag: gs.handUniqueId });


  const deck_ = Symbol.for('cards-deck');
  const hasBB_ = Symbol.for('has-big-blind');
  const hasDB_ = Symbol.for('has-dealer-button');
  const hasTalked_ = Symbol.for('has-talked');



  // the betting loop continues until
  // all the community cards are shown
  // and there are more than an active player
  while (gs.commonCards.length <= 5 && gs.activePlayers.length > 1){



    // track the current hand session
    gs.session = getGameSession(gs.commonCards.length);



    logger.log('debug', 'Hand %d/%d, %s', gs.gameProgressiveId, gs.handProgressiveId, gs.session, { tag: gs.handUniqueId });
    logger.log('debug', getPlayerStatusLogMessage(gs.players), { tag: gs.handUniqueId });



    // count the number of time that players had already have the possibility
    // to bet in the current session.
    gs.spinCount = 0;

    const starterButton = gs.session == gameSession.pre ? hasBB_ : hasDB_;
    const startIndex = gs.players.findIndex(player => player[starterButton]);

    do {

      yield* asyncFrom(gs.players, startIndex, shouldBreak.bind(null, gs),
        player => shouldBet(gs, player, player => player.talk(gs).then(player.payBet.bind(player, gs))));

      gs.spinCount++;

    } while(!isBetRoundFinished(gs.activePlayers, gs.callAmount));


    // when a betting round ends
    // raise data should be cleared
    gs.lastRaiseAmount = 0;

    // ... and the pot should be re-opened
    // for the next iteration
    gs.players.forEach(player => delete(player[hasTalked_]));





    // when execution reach this line,
    // all players have defined their bet for the current session.

    const activePlayers = gs.activePlayers;

    if (activePlayers.length == 1){

      // only one active player.
      // the betting loop is completed

      const winner = activePlayers[0];

      return void logger.info('Hand %d/%d, after the %s session, the only active player is %s',
        gs.gameProgressiveId, gs.handProgressiveId, gs.session, winner.name, { tag: gs.handUniqueId });

    }
    else if (gs.commonCards.length < 5){

      do { gs.commonCards.push(gs[deck_].shift()); } while(gs.commonCards.length < 3);


      // update hand session
      gs.session = getGameSession(gs.commonCards.length);


      logger.log('debug', 'Hand %d/%d, common cards (%s) are %s',
        gs.gameProgressiveId, gs.handProgressiveId, gs.session, getCommonCardsLogMessage(gs.commonCards), { tag: gs.handUniqueId });

      yield save({ type: 'cards', handId: gs.handUniqueId, session: gs.session,
        commonCards: gs.session == gameSession.flop ? gs.commonCards : gs.commonCards.slice(-1) });

    }
    else {

      logger.log('debug', 'Hand %d/%d, after the %s session', gs.gameProgressiveId, gs.handProgressiveId, gs.session, { tag: gs.handUniqueId });
      logger.log('debug', getPlayerStatusLogMessage(gs.players), { tag: gs.handUniqueId });

      return void logger.info('Hand %d/%d, betting session is finished.',
        gs.gameProgressiveId, gs.handProgressiveId, { tag: gs.handUniqueId });
    }


  }

};





/**
 * @private
 * @function
 * @name getGameSession
 * @desc
 *  return the current game session
 *
 * @param {Number} commonCards
 *  number of common cards
 *
 * @returns {GameSession}
 */
function getGameSession(commonCards){
  switch(commonCards){
    case 0:
      return gameSession.pre;
    case 3:
      return gameSession.flop;
    case 4:
      return gameSession.turn;
    case 5:
      return gameSession.river;
  }
}




/**
 * @private
 * @function
 * @name isBetRoundFinished
 * @desc
 *  return true when the current bet round is finished,
 *  that is all the players have bet the required minimum amount
 *  to stay active, or folded;
 *  false otherwise
 *
 * @param {Array} activePlayers
 *  list of the players who are active
 *
 * @param {Number} callAmount
 *  the amount each player should have bet in order to stay active
 *
 * @returns {Boolean} true when the bet round is finished
 */
function isBetRoundFinished(activePlayers, callAmount) {

  if (activePlayers.length == 1){
    return true;
  }

  const allin_ = Symbol.for('is-all-in');

  // search for active players who are not all in,
  // and still have bet less than the minimum amount to stay active
  return activePlayers.find(player => !player[allin_] && player.chipsBet < callAmount) == null;
}




/**
 * @private
 * @function
 * @name getPlayerStatusLogMessage
 * @desc
 *  return a log of the player' status, and bet
 *
 * @param {Array} players
 *  list of the players
 *
 * @returns {String}
 */
function getPlayerStatusLogMessage(players){
  return players.reduce(function(msg, player) {
    msg += player.status == playerStatus.out ?
      `${player.name} is out. ` : `${player.name} has bet ${player.chipsBet} (${player.status}). `;
    return msg;
  }, '').trim().slice(0,-1);
}




/**
 * @private
 * @function
 * @name getCommonCardsLogMessage
 * @desc
 *  return a log of the community cards
 *
 * @param {Array} cards
 *  list of the cards
 *
 * @returns {String}
 */
function getCommonCardsLogMessage(cards){
  return cards.reduce(function(msg, card){
    return msg += `${card.rank}${card.type}, `, msg;
  }, '').trim().slice(0,-1);
}
