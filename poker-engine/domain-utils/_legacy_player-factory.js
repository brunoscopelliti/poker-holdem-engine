
'use strict';

const config = require('../../config');

const winston = require('../../storage/logger');
// const gamestory = winston.loggers.get('gamestory');

const request = require('request');
const sortByRank = require('poker-rank');
const getCombinations = require('poker-combinations');

const status = require('../domain/player-status');

const save = require('../../storage/storage').save;
const safeSum = require('../lib/safe-math').safeSum;
const safeDiff = require('../lib/safe-math').safeDiff;

const herokuService = Symbol('heroku-service');

const hasDB = Symbol.for('has-dealer-button');
const gameProgressive = Symbol.for('game-progressive');
const roundProgressive = Symbol.for('hand-progressive');



const actions = {

  //
  // prepare the gamestate model with the only information
  // each player should know
  // then send an http request to the bot service
  // to get the bet amount
  talk: function talk(gs){

    //
    // the state of the game, filtered with the only information
    // available to the current player
    const ps = Object.create(null);

    // the unique id of the current tournament
    ps.tournamentId = gs.tournamentId;

    // game number of the current tournament
    ps.game = gs[gameProgressive];

    // round number of the current tournament
    ps.round = gs[roundProgressive];

    // count the number of time
    // that players had already have the possibility to bet in the current session.
    ps.spinCount = gs.spinCount;

    // value of the small blinds
    // ... big blind is always twice
    ps.sb = gs.sb;

    // value of the pot
    // it's updated after each bet
    ps.pot = gs.pot;

    // list of the community cards on the table
    // everyone is able to access this same list
    ps.commonCards = gs.commonCards;

    // the list of the players...
    // make sure that the current players can see only its cards
    ps.players = gs.players.map((player, id) => {
      // clean player data
      let mysterious = Object.assign({}, player);
      Object.getOwnPropertySymbols(mysterious).forEach(symb => delete mysterious[symb]);
      if (this.id === id){
        return mysterious;
      }
      delete mysterious.cards;
      delete mysterious.bestCards;
      return mysterious;
    });

    // index of the player with the dealer button
    ps.db = Math.max(gs.players.findIndex(player => player[hasDB]), 0);

    // index of the player 'this' in the players array
    ps.me = this.id;

    // amount of chips the current player must bet
    // in order to remain in the game;
    // it depends by how much he bet previously;
    // so it can change for each player
    ps.callAmount = Math.max(safeDiff(gs.callAmount, this.chipsBet), 0);

    const tag = { id: gs.handId, type: 'bet' };

    // gamestory.info('We\'re asking to %s (%d) the amount of his bet on the basis of %s', this.name, this.id, JSON.stringify(ps), tag);


    // send a network request to the Heroku's service
    // to get the bot's bet amount
    const service = `${this[herokuService]}bet`
    return new Promise((resolve, reject) => {
      request.post(service, { body: ps, json: true, followAllRedirects: true, maxRedirects: 1, timeout: 5000 }, (err, response, playerBetAmount) => {
        if (err){
          return void reject(err);
        }
        // gamestory.info('%s (%d) bets %d', this.name, this.id, playerBetAmount, tag);
        resolve(playerBetAmount);
      });
    });

  },


  //
  // updates the player state, and the game state
  // accordingly to the player bet
  bet: function bet(gs, amount){

    //
    // sanitization
    if (typeof amount != 'number'){
      // yep, i really mean parseFloat.
      // a player usually does not own, or bet a decimal amount;
      // however after a plot split it's possible that a player has
      // a not-integer amount of chips.
      amount = Number.parseFloat(amount);
    }

    if (Number.isNaN(amount)){
      amount = 0;
    }

    //
    // amount should be in the range [ 0 ... player.chips ]
    if (amount < 0){
      amount = 0;
    }
    else if (amount > this.chips){
      amount = this.chips;
    }


    if (this.isAllin(amount)){
      // gamestory.info('%s (%d) is allin', this.name, this.id, { id: gs.handId, type: 'status' });
      this[Symbol.for('is-all-in')] = true;
    }
    else {

      // the total amount of chips which the player
      // has bet in the current hand
      const chipsBet = safeSum(this.chipsBet, amount);

      if (chipsBet < gs.callAmount){
        // player is betting less than the required amount;
        // since he is not betting all the chips he owns
        // we treat this as a "fold" declaration
        // gamestory.info('%s (%d) folded', this.name, this.id, { id: gs.handId, type: 'status' });
        return this.fold(gs);
      }
      else if (chipsBet > gs.callAmount) {
        // player is betting a raise;
        // since the player is not going allin,
        // we accept only raise of an amount that is multiple of the small blind.
        const raiseAmount = safeDiff(chipsBet, gs.callAmount);
        if (raiseAmount % gs.sb != 0){
          // in case the raise amount is not a multiple of the small blind
          // the raise, is treated as a simple call.
          amount = safeDiff(amount, raiseAmount);
        }
      }

    }


    //
    // update chip values
    this.chipsBet = safeSum(amount, this.chipsBet);
    this.chips = safeDiff(this.chips, amount);

    gs.pot = safeSum(gs.pot, amount);
    gs.callAmount = Math.max(this.chipsBet, gs.callAmount);

    // gamestory.info('Game state after %s (%d)\'s bet: %s', this.name, this.id, JSON.stringify({ pot:gs.pot, callAmount: gs.callAmount, player: { name: this.name, chips: this.chips, chipsBet: this.chipsBet } }), { id: gs.handId, type: 'bet' });

    return save(gs, { type: 'bet', handId: gs.handId, session: gs.session, playerId: this.id, amount: amount });

  },


  //
  // compute the player best combination
  showdown: function showdown(commonCards){
    let combs = getCombinations(this.cards.concat(commonCards), 5);
    let bestHand = sortByRank(combs)[0];
    this.bestCards = combs[bestHand.index];
    // gamestory.info('%s (%d)\'s best combination is: %s', this.name, this.id, JSON.stringify(this.bestCards));
    return this.bestCards;
  },


  //
  // return true if the specified amount
  // is equal to the player total number of chips
  isAllin: function isAllin(amount){
    return amount === this.chips;
  },


  //
  // change the player status to folded
  fold: function fold(gs){
    this.status = status.folded;
    return save(gs, { type: 'status', handId: gs.handId, session: gs.session, playerId: this.id, status: 'folded' });
  }

}


exports = module.exports = function factory(obj, i){

  //
  // create a new player object
  let player = Object.create(actions);

  player.id = i;
  player.name = obj.name;
  player.version = 'Poker folder star!';

  // url of the host where the bot is running
  player[herokuService] = obj.url;

  player.chips = config.BUYIN;
  player.status = status.active;

  // the two private cards of the player
  player.cards = [];

  // the total amount of chips the player bet
  // in the current "hand".
  // it is the sum of the chips the player bet
  // in each "betting session" of the current hand.
  // "betting session": [preflop, flop, turn, river]
  player.chipsBet = 0;

  return player;

}
