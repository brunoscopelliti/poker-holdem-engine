
'use strict';

const config = require('./config');

const status = require('./domain/player-status');

const computeSB = require('./holdem/get-smallblind-amount');
const assignDB = require('./holdem/assign-dealer-button');
const payBlinds = require('./holdem/pay-blinds');
const shuffleCards = require('./holdem/shuffle-cards');
const assignCards = require('./holdem/assign-player-cards');

exports = module.exports = function setup(gs){

  // prepare a poker hand, so that it can be played...


  //
  // wait a few time after an hand is completed
  // before a new one can start
  return new Promise(function(res, rej){
    setTimeout(function() {

      let hasBB = Symbol.for('hasBB');
      let badge = Symbol.for('show-first');

      //
      // 0) reset initial conditions

      // the amount of chips bet by all the players
      gs.pot = 0;

      // the amount of chips each player must bet
      // to continue to be "active" in the current hand
      gs.callAmount = 0;

      // the cards on the table
      gs.community_cards = [];

      // reset player conditions
      gs.players.forEach(player => {
        player[hasBB] = false;
        delete player[badge];
        player.chipsBet = 0;
        player.cards = player.bestCards = [];
        if (player.status == status.folded){
          player.status = status.active;
        }
      });


      //
      // 1) compute the small blind level for the current hand
      // big blinds is always the double

      gs.sb = computeSB(gs);

      //
      // 2) assign to the player in turn the dealer button
      // only active player can receive the button

      assignDB(gs);


      //
      // 3) pay small/big blinds
      // and updates players/table's chips

      payBlinds(gs);


      //
      // 4) prepare a random sorted deck of cards
      // i'm using Fisher–Yates algorithm to achieve 'randomness'

      let deck = gs._deck = shuffleCards();

      //
      // 5) assign two cards to each active player
      // first player who receive a card is the one next the dealer button
      res(assignCards(gs, deck));

    }, config.HANDWAIT);
  });

};
