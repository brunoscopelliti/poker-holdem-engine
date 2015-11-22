
'use strict';

const config = require('../config');
const status = require('../domain/player-status');


const actions = {

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

  player.cards = [];


  // the total amount of chips the player bet
  // in the current "betting session".
  // "betting session": [preflop, flop, turn, river]
  player.chipsBet = 0;


  return player;

}
