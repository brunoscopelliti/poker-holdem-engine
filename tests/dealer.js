
'use strict';

const EventEmitter = require('events').EventEmitter;
const mixin = require('merge-descriptors');

const status = require('../domain/player-status');
const createPlayer = require('../holdem/player-factory');

const run = require('../lib/generator-runner');
const sut = require('../holdem-dealer');

const tape = require('tape');
const chalk = require('chalk');
const sinon = require('sinon');

let hasDB = Symbol.for('hasDB');
let progressive = Symbol.for('hand-progressive');

const gamestate = {
  status: 'play',
  pot: 0,
  callAmount: 0,
  players: []
}

gamestate.players.push(createPlayer({ name: 'bud' }, 0));
gamestate.players.push(createPlayer({ name: 'terence' }, 1));
gamestate.players[1][hasDB] = true;
gamestate.players.push(createPlayer({ name: 'chuck' }, 2));
gamestate.players.push(createPlayer({ name: 'silvester' }, 3));
gamestate.players.push(createPlayer({ name: 'jean-claude' }, 4));

mixin(gamestate, EventEmitter.prototype, false);


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
  // simulate the time requested to store
  // the updated gamestate on mongoDB
  gamestate.on('storage:ready', function() {
    setTimeout(function() {
      gamestate.emit('storage:completed');
    }, 250);
  });


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
