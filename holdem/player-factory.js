
'use strict';

const config = require('../config');
const status = require('../domain/player-status');

const fake = Symbol('fake-test');
const progressive = Symbol.for('hand-progressive');
const hasDB = Symbol('hasDB');

const fakePlayers = {};
if (process.env.NODE_ENV === 'test'){
  fakePlayers.aggressive = require('../fake-players/aggressive');
  fakePlayers.caller = require('../fake-players/caller');
  fakePlayers.folder = require('../fake-players/folder');
  fakePlayers.pair = require('../fake-players/pair');
}


const actions = {

  talk: function talk(gs){

    //
    // the state of the game, filtered with the only information
    // available to the current player
    const ps = Object.create(null);

    // the unique id of the current tournament
    ps.tournamentId = gs.tournamentId;

    // round number of the current tournament
    ps.round = gs[progressive];

    // value of the small blinds
    // ... big blind is always twice
    ps.sb = gs.sb;

    // value of the pot
    // it's updated after each bet
    ps.pot = gs.pot;

    // list of the community cards on the table
    // everyone is able to access this same list
    ps.community_cards = gs.community_cards;

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
    ps.callAmount = gs.callAmount - this.chipsBet;

    if (this[fake]){
      let lib = fakePlayers[this[fake]];
      return Promise.resolve(lib.bet(Object.freeze(ps), x => x));
    }

    // @todo send http request
    // to get the bet amount...
    return Promise.resolve(gs.sb * 2);

  },

  bet: function bet(gs, amount){

    //
    // amount should be in the range [ 0 ... player.chips ]
    if (amount < 0){
      amount = 0;
    }
    else if (amount > this.chips){
      amount = this.chips;
    }


    if (this.chipsBet + amount < gs.callAmount){

      //
      // player is betting less than the required amount;
      // unless he is betting all the chips he owns
      // we treat this as a "fold" declaration

      if (!this.isAllin(amount)){
        return void this.fold();
      }
    }


    if (this.isAllin(amount)){
      let allin = Symbol.for('allin');
      this[allin] = true;
    }

    //
    // update chip values

    this.chipsBet += amount;
    this.chips -= amount;

    gs.pot += amount;
    gs.callAmount = Math.max(this.chipsBet, gs.callAmount);

  },


  showdown: function showdown(commonCards){
    let combs = getCombinations(this.cards.concat(commonCards), 5);
    let bestHand = sortByRank(combs)[0];
    this.bestCards = combs[bestHand.index];
  },

  isAllin: function isAllin(amount){
    return amount === this.chips;
  },

  fold: function fold(){
    this.status = status.folded
  }

}


exports = module.exports = function factory(obj, i){

  //
  // create a new player object
  let player = Object.create(actions);

  player.id = i;
  player.name = obj.name;
  player.version = 'Poker folder star!';

  player.chips = config.BUYIN;
  player.status = status.active;

  // the two private cards of the player
  player.cards = [];

  // the total amount of chips the player bet
  // in the current "betting session".
  // "betting session": [preflop, flop, turn, river]
  player.chipsBet = 0;

  if (obj.lib){
    // for test...
    // in test this is a fake bot module that simulate the player's behaviour
    player[fake] = obj.lib;
  }

  return player;

}
