
'use strict';

const config = require('../config');
const status = require('../domain/player-status');

const actions = {

  bet: function bet(gamestate, amount){

    //let player = gamestate.players.find(player => id === playerId);

    // player is betting less than the required amount
    // we treat this as a "fold" declaration
    if (this.bet + amount < gamestate.callAmount){
      return void this.fold();
    }





  },

  hasEnough: function hasEnough(amount){
    return amount < this.chips;
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
  player.bet = player.handBet = 0;


  return player;

}
