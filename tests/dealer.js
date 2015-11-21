
'use strict';

const status = require('../domain/player-status');

const run = require('../lib/generator-runner');
const sut = require('../holdem-dealer');

const tape = require('tape');
const chalk = require('chalk');
const sinon = require('sinon');

let hasDB = Symbol.for('hasDB');
let progressive = Symbol.for('hand-progressive');

const gamestate = {
  status: 'play',
  players: [
    { id: 0, name: 'bud', status: status.active, cards: [] },
    { id: 1, name: 'terence', status: status.active, cards: [], [hasDB]: true },
    { id: 2, name: 'chuck', status: status.active, cards: [] },
    { id: 3, name: 'silvester', status: status.active, cards: [] },
    { id: 4, name: 'jean-claude', status: status.active, cards: [] }
  ]
}

// start the generator
// let hand = sut(gamestate);

tape('dealer', t => t.end());

tape('dealer loop works', function(t){

  //
  // stop the fake tournament after 6 hands
  let timer = setInterval(function() {
    if (gamestate[Symbol.for('hand-progressive')] >= 5){
      gamestate.status = 'stop';
      clearInterval(timer);
    }
  }, 250);

  //
  // run assertion after each played hand
  function assert(){

    t.equal(gamestate.sb, gamestate[progressive] >= 5 ? 20 : 10, 'smallblind check');
    t.equal(gamestate._deck.length, 42, 'cards assigned');

    let initialDB = 2 + gamestate[progressive];
    let i = initialDB >= gamestate.players.length-1 ? initialDB%gamestate.players.length : initialDB;
    t.ok(gamestate.players[i][hasDB], 'dealerbutton check');

  }

  run(sut, gamestate, assert).then(t.end);

});
