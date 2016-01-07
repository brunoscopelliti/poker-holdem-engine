
'use strict';

const config = require('./config');

const winston = require('winston');
const gamestory = winston.loggers.get('gamestory');
const errors = winston.loggers.get('errors');

const run = require('./lib/generator-runner');

const computeSB = require('./holdem/get-smallblind-amount');
const assignDB = require('./holdem/assign-dealer-button');
const payBlinds = require('./holdem/pay-blinds');
const shuffleCards = require('./holdem/shuffle-cards');
const assignCards = require('./holdem/assign-player-cards');



function* setupOps(gs){

  //
  // wait a few time after an hand is completed
  // before a new one can start
  yield new Promise(res => setTimeout(res, config.HANDWAIT));


  const tag = { id: gs.handId };

  let hasBB = Symbol.for('hasBB');
  let isAllin = Symbol.for('allin');
  let badge = Symbol.for('show-first');

  //
  // 0) reset initial conditions

  // the amount of chips bet by all the players
  gs.pot = 0;

  // the amount of chips each player must bet
  // to continue to be "active" in the current hand
  gs.callAmount = 0;

  // the cards on the table
  gs.commonCards = [];

  // list of winners of the previous hand
  gs.winners = [];
  gs.rank = [];

  // reset player conditions
  gs.players.forEach(player => {
    player[hasBB] = player[isAllin] = false;
    delete player[badge];
    player.chipsBet = 0;
    player.cards = player.bestCards = [];
  });

  gamestory.info('Players: %s', JSON.stringify(gs.players.map(p => ({ name: p.name, status: p.status, chips: p.chips }))), tag);


  //
  // 1) compute the small blind level for the current hand
  // big blinds is always the double
  gs.sb = computeSB(gs);
  gamestory.info('Small blind: %d chips', gs.sb, tag);


  //
  // 2) assign to the player in turn the dealer button
  // only active player can receive the button

  let dbi = assignDB(gs);
  gamestory.info('Dealer button is assigned to %s (%d)', gs.players[dbi].name, dbi, tag);


  //
  // 3) pay small/big blinds
  // and updates players/table's chips
  payBlinds(gs);
  gamestory.info('Blinds were payed. Pot is %d; Minimum amount to play is %d.', gs.pot, gs.callAmount, tag);


  //
  // 4) prepare a random sorted deck of cards
  // i'm using Fisher–Yates algorithm to achieve 'randomness'
  let deck = gs.deck = shuffleCards();


  //
  // 5) assign two cards to each active player
  // first player who receive a card is the one next the dealer button
  return yield assignCards(gs, deck);

}


exports = module.exports = function setup(gs){

  // prepare a poker hand, so that it can be played...
  return run(setupOps, gs).catch(function(err) {
    let tag = { id: gs.handId };
    errors.error('An error occurred during the execution of the setup. Stack: %s.', err.stack, tag);
    errors.error('Game state: %s.', JSON.stringify(gs), tag);
  });

};
