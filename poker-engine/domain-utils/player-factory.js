
'use strict';

const config = require('../../config');

const playerStatus = require('../domain/player-status');


const logger = require('../../storage/logger');

const splitPot = require('./split-pot');

// const request = require('request');

// const sortByRank = require('poker-rank');
// const getCombinations = require('poker-combinations');



const save = require('../../storage/storage').save;



// const hasDB = Symbol.for('has-dealer-button');


const bet_ = Symbol('internal-bet-method');

const actions = {

  [bet_](gs, amount) {

    // TODO should be tested

    if (amount > this.chips){
      amount = this.chips;
    }

    const isAllin_ = Symbol.for('is-all-in');

    if (amount == this.chips) {
      this[isAllin_] = true;
    }
    else {

      // the total amount of chips which the player
      // has bet in the current hand
      const chipsBet = this.chipsBet + amount

      if (chipsBet < gs.callAmount){

        // // player is betting less than the required amount;
        // // since he is not betting all the chips he owns
        // // we treat this as a "fold" declaration
        // // gamestory.info('%s (%d) folded', this.name, this.id, { id: gs.handId, type: 'status' });
        // return this.fold(gs);

      }
      else if (chipsBet > gs.callAmount) {
        // // player is betting a raise;
        // // since the player is not going allin,
        // // we accept only raise of an amount that is multiple of the small blind.
        // const raiseAmount = safeDiff(chipsBet, gs.callAmount);
        // if (raiseAmount % gs.sb != 0){
        //   // in case the raise amount is not a multiple of the small blind
        //   // the raise, is treated as a simple call.
        //   amount = safeDiff(amount, raiseAmount);
        // }
      }

    }



    // update chip values
    // for the player, and on the gamestate
    this.chipsBet += amount;
    this.chips -= amount;

    gs.pot += amount;

    if (this[isAllin_] || gs.sidepots.length > 0 || gs.players.find(x => x[isAllin_]) != null){
      splitPot(gs);
    }

    gs.callAmount = Math.max(this.chipsBet, gs.callAmount);

    // gamestory.info('Game state after %s (%d)\'s bet: %s', this.name, this.id, JSON.stringify({ pot:gs.pot, callAmount: gs.callAmount, player: { name: this.name, chips: this.chips, chipsBet: this.chipsBet } }), { id: gs.handId, type: 'bet' });

    // return save(gs, { type: 'bet', handId: gs.handId, session: gs.session, playerId: this.id, amount: amount });




  },


  /**
   * @function
   * @name bet
   * @desc TODO
   *
   * @param {Object} gs:
   *  the gamestate object
   * @param {Number}
   *  the amount of chips the player has to pay
   *
   * @returns {Promise} a promise resolved when bet data is stored
   */
  bet(gs, betAmount) {

    // since bet is called with the amount returned by
    // the player's web service,
    // it's important to sanitize the amount

    const amount = sanitizeAmount(betAmount);


    // when the amount is safe ... TODO

    this[bet_](gs, amount);

    // TODO
    // save data & return a promise!

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
    this[bet_](gs, amount);
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

  // meta information about the service
  // that responds at "serviceUrl"
  // TODO: it should be updated at the beginning of each new game
  player.version = 'Poker folder star!';

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
