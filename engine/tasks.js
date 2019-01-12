"use strict";

const resetGamestate = require("./tasks/setup/reset-gamestate");
const assignDealerButton = require("./tasks/setup/assign-dealer-button");
const setBlind = require("./tasks/setup/update-small-blind");
const payAnte = require("./tasks/setup/pay-ante");
const payBlinds = require("./tasks/setup/pay-blind");
const assignPrivateCards = require("./tasks/setup/assign-private-cards");
const saveSetup = require("./tasks/setup/save-setup");

const setupTable = [
  resetGamestate,

  // Assign the dealer button;
  // only an active players can receive the button.
  assignDealerButton,

  // Update blind level.
  setBlind,

  payAnte,

  // Players next to the Dealer
  // pay small/big blind amount.
  payBlinds,

  assignPrivateCards,

  // TODO log (debug) cards assigned to each player.

  // Make sure the gamestate
  // is persisted somewhere.
  saveSetup,
];

const preFlop = require("./tasks/game/pre-flop");
const makePostFlopTask = require("./tasks/game/make-post-flop-task");
const recap = require("./tasks/game/recap");

const playHand = [
  // Ask each player to cover the big blind,
  // then uncover three common cards.
  preFlop,

  // Ask each player their bet,
  // then uncover a new common card.
  makePostFlopTask("FLOP"),

  makePostFlopTask("TURN"),

  makePostFlopTask("RIVER"),

  recap,
];

const prepareHandRank = require("./tasks/teardown/rank-hand");
const assignPot = require("./tasks/teardown/assign-pot");
const updateGameRank = require("./tasks/teardown/update-game-rank");

const showdown = [
  // Create the rank of the current hand.
  // On the basis of this ranking players
  // will get chips from the pot.
  prepareHandRank,

  assignPot,

  updateGameRank,
];

const warmup = require("./tasks/warmup-wait");
const onGameCompleted = require("./tasks/on-game-completed");
const waitOnPause = require("./tasks/wait-restart");
const waitBeforeHand = require("./tasks/throttle");
const announceCurrentHand = require("./tasks/announce-hand");
const incrementHandId = require("./tasks/next-hand");
const announceTournamentEnd = require("./tasks/announce-end");

const Tasks = [
  warmup,

  // Before a new hand starts,
  // the engine checks the active players.
  // If there is only one active player,
  // and all the others are out,
  // the current game is finished.
  // TODO
  onGameCompleted,

  // Before a new hand starts,
  // checks if game is on pause.
  waitOnPause,

  waitBeforeHand,

  announceCurrentHand,

  // It's a collection of tasks
  // focused on creating the condition
  // to play a new hand.
  // Eg. Pay blind, assign cards...
  ...setupTable,

  // It's a collection of tasks
  // focused on the dynamics of a hand.
  ...playHand,

  // It's a collection of tasks
  // focused on the completion of an hand.
  // Determine the winner, assign the pot...
  ...showdown,

  incrementHandId,

  announceTournamentEnd,
];

module.exports = Tasks;
