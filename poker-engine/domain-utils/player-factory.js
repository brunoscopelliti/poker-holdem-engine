
'use strict';

const assign = require('merge-descriptors');
const request = require('request');


const config = require('../../config');

const playerStatus = require('../domain/player-status');


const logger = require('../../storage/logger');

const splitPot = require('./split-pot');




// const sortByRank = require('poker-rank');
// const getCombinations = require('poker-combinations');



const save = require('../../storage/storage').save;




const update_ = Symbol('internal-update-method');

const actions = {

  /**
   * @function
   * @name Symbol('internal-update-method')
   * @desc
   *  Update the gamestate, and the player chips
   *  of his last bet.
   *
   * @param {Object} gs:
   *  the gamestate object
   * @param {Number}
   *  the amount of chips the player has bet
   *
   * @returns {void}
   */
  [update_](gs, betAmount) {

    const isAllin_ = Symbol.for('is-all-in');

    this[isAllin_] = betAmount == this.chips;


    // update chip values
    // for the player, and on the gamestate
    this.chipsBet += betAmount;
    this.chips -= betAmount;

    gs.pot += betAmount;

    if (this[isAllin_] || gs.sidepots.length > 0 || gs.players.find(x => x[isAllin_]) != null){
      splitPot(gs);
    }

    gs.callAmount = Math.max(this.chipsBet, gs.callAmount);

  },


  /**
   * @function
   * @name payBet
   * @desc
   *  Validate, and eventually normalize the bet amount
   *  in order to assure that poker hold'em rules are respected,
   *  then updates the gamestate.
   *
   * @param {Object} gs:
   *  the gamestate object
   * @param {Number}
   *  the amount of chips the player has to pay
   *
   * @returns {Promise} a promise resolved when bet data is stored
   */
  payBet(gs, betAmount) {

    // normalize betAmount to the maximum value the player can pay
    betAmount = Math.min(this.chips, betAmount);


    const playerCallAmount = Math.max(gs.callAmount - this.chipsBet, 0);


    if (betAmount < playerCallAmount && betAmount < this.chips){
      // when a player bets less than the minimum required amount,
      // and he is not betting all his chips, he's folding.
      return this.fold(gs);
    }


    if (betAmount > playerCallAmount) {

      // player is betting a raise.
      // there're some necessary extra checks we've to do before consider the raise valid

      // 1) check current player player is not the last raiser,
      //    and assure "You can't raise yourself!" motto is respected.

      if (this.id === gs.lastRaiserId){
        betAmount = playerCallAmount;
      }
      else{

        // 2) check minumum raise amount,
        //    and eventually update the data about the last raise.

        const minRaise = playerCallAmount + (gs.lastRaiseAmount || 2 * gs.sb);

        if(betAmount < minRaise){

          // when the raise does not meet the minimum raise amount,
          // it's allowed only when the player is betting all his chips;
          // however even in this case, it doesn't reopen the bet f
          // for the players who have already bet in this hand,
          // that is, last raise data are not updated.

          if (betAmount < this.chips){
            betAmount = playerCallAmount;
          }
        }
        else{

          // when the raise amount is valid update
          // lastRaiseAmount, lastRaiserId gamestate properties

          gs.lastRaiseAmount = betAmount - playerCallAmount;
          gs.lastRaiserId = this.id;
        }
      }
    }


    logger.log('debug', '%s (%s) has bet %d.', this.name, this.id, betAmount, { tag: gs.handUniqueId });

    this[update_](gs, betAmount);

    return save({ type: 'bet', handId: gs.handUniqueId, session: gs.session, playerId: this.id, amount: betAmount });
  },


  /**
   * @function
   * @name fold
   * @desc
   *  Update the player status.
   *  A folded player can't bet further in the current hand.
   *
   * @param {Object} gs:
   *  the gamestate object
   *
   * @returns {Promise} a promise resolved when updated status is stored
   */
  fold(gs) {
    this.status = playerStatus.folded;

    logger.log('debug', '%s (%d) has folded.', this.name, this.id, { tag: gs.handUniqueId });
    return save({ type: 'status', handId: gs.handUniqueId, session: gs.session, playerId: this.id, status: playerStatus.folded });
  },


  /**
   * @function
   * @name pay
   * @desc
   *  Update gamestate, and player's chips.
   *  It's used when the player has not the possibility to define the amount of his bet.
   *
   * @param {Object} gs:
   *  the gamestate object
   * @param {Number}
   *  the amount of chips the player has to pay
   *
   * @returns {void}
   */
  pay(gs, amount) {
    this[update_](gs, amount);
  },


  /**
   * @function
   * @name talk
   * @desc
   *  Prepare the gamestate model with the only information
   *  each player should know, then send an http request to the service
   *  to get the bet amount
   *
   * @param {Object} gs:
   *  the gamestate object
   *
   * @returns {Promise} a promise resolved when the bot service response arrives
   */
  talk(gs){

    const state = Object.create(null);

    // unique id of the current tournament
    state.tournamentId = gs.tournamentId;

    // initial amount of chips available to each player
    state.buyin = config.BUYIN;

    // game number of the current tournament
    state.game = gs.gameProgressiveId;

    // hand number of the current game
    state.hand = gs.handProgressiveId;

    // count the number of time
    // that players had already have the possibility to bet in the current session
    state.spinCount = gs.spinCount;

    // value of the small blinds
    // ... big blind is always twice
    state.sb = gs.sb;

    // value of the pot, and eventually sidepot.
    // are updated after each bet
    state.pot = gs.pot;
    state.sidepots = gs.sidepots;

    // list of the community cards on the table
    // ... everyone is able to access this same list
    state.commonCards = gs.commonCards;

    // index of the player with the dealer button
    state.db = gs.dealerButtonIndex;

    // amount of chips the current player must bet in order to remain in the game;
    // it depends by how much he bet previously
    state.callAmount = Math.max(gs.callAmount - this.chipsBet, 0);

    // minimum amount the player has to bet
    // in case he want to raise the call amount for the other players
    state.minimumRaiseAmount = state.callAmount + (gs.lastRaiseAmount || 2 * gs.sb);

    // the list of the players...
    // make sure that the current players can see only his cards
    state.players = gs.players.map(function(player) {

      // clean player data
      let mysterious = assign({}, player);

      Object.getOwnPropertySymbols(mysterious)
        .forEach(symb => delete mysterious[symb]);

      if (this.id === player.id){
        return mysterious;
      }

      delete mysterious.cards;
      delete mysterious.bestCombination;
      return mysterious;

    }, this);

    // index of the player 'this' in the players array
    state.me = gs.players.findIndex(player => player.id == this.id);


    const requestSettings = { body: state, json: true, followAllRedirects: true, maxRedirects: 1, timeout: 5000 };

    return new Promise((resolve, reject) => {
      request.post(`${this.serviceUrl}bet`, requestSettings, (err, response, playerBetAmount) => {
        if (err){
          logger.warn('Bet request to %s failed, cause %s', this.serviceUrl, err.message, { tag: gs.handUniqueId });
          return void resolve(0);
        }
        logger.log('silly', '%s (%s) has bet %s (raw)', this.name, this.id, playerBetAmount, { tag: gs.handUniqueId });
        resolve(sanitizeAmount(playerBetAmount));
      });
    });

  }

};


/**
 * @private
 * @function
 * @name isValidPlayer
 * @desc check if the input parameter match the "player interface".
 *
 * @param {Object} player
 *
 * @returns {Boolean} true when the input parameter is a valid "player" object; false otherwise
 */
function isValidPlayer(player){
  return player.id && player.name && player.serviceUrl;
}

/**
 * @private
 * @function
 * @name sanitizeAmount
 * @desc check if the value is a valid bet amount
 *
 * @param {Number} amount
 *
 * @returns {Number} amount (valid)
 */
function sanitizeAmount(amount){

  if (typeof amount != 'number'){
    amount = Number.parseInt(amount, 10);
  }

  return amount > 0 ? amount : 0;

}

/**
 * @function
 * @name factory
 * @desc create a new "player" object
 *
 * @param {Object} obj
 *  - player.id
 *  - player.name
 *  - player.serviceUrl
 *
 * @returns {object|null} the player object created
 */
exports = module.exports = function factory(obj){

  if (!isValidPlayer(obj)){
    logger.warn('Registered an attempt to sign an invalid player', obj);
    return null;
  }

  const player = Object.create(actions);

  ['id', 'name', 'serviceUrl']
    .forEach(prop => Object.defineProperty(player, prop, { value: obj[prop] }))

  // status of the player
  player.status = playerStatus.active;

  // amount of chips available
  player.chips = config.BUYIN;

  // two private cards of the player
  player.cards = [];

  // total amount of chips the player bet
  // in the current hand.
  // it is the sum of the chips the player has bet
  // in each "betting session" of the current hand.
  player.chipsBet = 0;


  logger.info('%s (%s), registered as player.', player.name, player.id);

  return player;

}
