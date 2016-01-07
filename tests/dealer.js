
'use strict';

process.env.NODE_ENV = 'test';


//
// browserify, and winston do not play well together...
// setup the winston object as if it was really here.
const winston = require('winston');
winston.loggers = { add: function(){}, get: function() { return { info: function() {}, error: function() {} }; } };
winston.transports = { File: function() {} };

const tape = require('tape');
const chalk = require('chalk');
const sinon = require('sinon');

const shuffle = require('knuth-shuffle');

const fakeDeck = [
  { rank: 'A', type: 'H' }, // bud
  { rank: 'J', type: 'S' }, // terence
  { rank: '9', type: 'D' }, // chuck
  { rank: '8', type: 'H' }, // silvester
  { rank: '4', type: 'S' }, // bud
  { rank: 'J', type: 'D' }, // terence
  { rank: '2', type: 'H' }, // chuck
  { rank: '4', type: 'S' }, // silvester
  { rank: '5', type: 'H' }, // flop
  { rank: '2', type: 'S' }, // flop
  { rank: '3', type: 'H' }, // flop
  { rank: 'J', type: 'H' }, // turn
  { rank: 'J', type: 'H' }  // river
];

let deckProviderStub = sinon.stub(shuffle, 'knuthShuffle');
deckProviderStub.onCall(0).returns(fakeDeck.slice(0));
deckProviderStub.onCall(1).returns(fakeDeck.slice(0));
deckProviderStub.onCall(2).returns(fakeDeck.slice(0));
deckProviderStub.onCall(3).returns(fakeDeck.slice(0));
deckProviderStub.onCall(4).returns(fakeDeck.slice(0));
deckProviderStub.onCall(5).returns(fakeDeck.slice(0));
deckProviderStub.onCall(6).returns(fakeDeck.slice(0));


const EventEmitter = require('events').EventEmitter;
const mixin = require('merge-descriptors');

const run = require('../lib/generator-runner');
const createPlayer = require('../holdem/player-factory');




const gamestate = (function setupGamestate(){

  let gs = {};
  let players = [{ name: 'silvester', lib: 'folder' }, { name: 'bud', lib: 'aggressive' }, { name: 'terence', lib: 'pair' }, { name: 'chuck', lib: 'caller' }];

  gs.status = 'play';
  gs.players = players.map(createPlayer);

  return mixin(gs, EventEmitter.prototype, false);

}());






const sut = require('../holdem-game-loop');

tape('dealer', t => t.end());

tape('game simulation', function(t){

  //
  // stop the fake tournament after 6 hands
  let timer = setInterval(function() {
    if (gamestate[Symbol.for('hand-progressive')] >= 6){
      gamestate.status = 'stop';
      clearInterval(timer);
    }
  }, 250);

  //
  // simulate the time requested to store
  // the updated gamestate on mongoDB
  gamestate.on('gamestate:updated', function(updates) {
    setTimeout(function(updates) {
      gamestate.emit('storage:completed');
    }, 250, updates);
  });




  let hasDB = Symbol.for('hasDB');
  let hasBB = Symbol.for('hasBB');
  let game = Symbol.for('game-progressive');
  let progressive = Symbol.for('hand-progressive');




  //
  // run assertion after each played hand
  function assert(){

    t.equal(gamestate.sb, gamestate[progressive]-1 >= gamestate.players.length ? 20 : 10, 'smallblind check');

    let initialBB = 2 + gamestate[progressive]-1;
    let i = initialBB >= gamestate.players.length-1 ? initialBB%gamestate.players.length : initialBB;
    t.ok(gamestate.players[i][hasBB], 'dealerbutton check');

  }

  run(sut, gamestate, assert).then(function() {
    console.log('%cTest finished', 'background: green; color: white; font-size: 10px;');
    t.end();
  });

});
