
'use strict';

const tape = require('tape');
const sinon = require('sinon');

const run = require('../test-utils/generator-runner');

const saveStub = require('../../storage/storage').save;



const sut = require('../../poker-engine/bet-loop');
const engine = require('../../index');


const allin_ = Symbol.for('is-all-in');
const hasBB_ = Symbol.for('has-big-blind');
const hasDB_ = Symbol.for('has-dealer-button');
const deck_ = Symbol.for('cards-deck');

function noop() {}

function createPlayer(name, talk){
  return {
    name: name,
    chipsBet: 0,
    talk: function(gs){
      return new Promise((res) => { talk.call(this, gs); res(); });
    },
    payBet: noop
  };
}


tape('bet-loop', t => t.end());

tape('when there is only one active player the bet session is finished', function(t){

  const gamestate = { commonCards: [], activePlayers: [{ name: 'arale' }] };
  const iter = sut(gamestate);

  const result = iter.next();

  t.ok(result.done)

  t.end();
});



tape('check community cards distribution', function(t){

  const talkSpy = sinon.spy();
  const cardUpdateSpy = sinon.spy();

  function talk(gs){
    talkSpy(gs);
    this.chipsBet += gs.callAmount;
  }

  const players = ['arale', 'bender', 'marvin', 'wall-e'].map(player => createPlayer(player, talk));

  players[1][hasDB_] = true;
  players[3][hasBB_] = true;

  const gamestate = {
    [deck_]: [1,2,3,4,5,6].concat(new Array(46).fill('x')),
    players: players,
    activePlayers: players,
    commonCards: [],
    callAmount: 50
  };

  engine.on('gamestate:updated', function(data, res){
    cardUpdateSpy(data.type, data.session, data.commonCards.slice(0));
    res();
  });


  run(sut, gamestate)
    .then(function() {
      t.equal(talkSpy.callCount, 16);
      t.equal(cardUpdateSpy.callCount, 3);
      t.ok(cardUpdateSpy.getCall(0).calledWith('cards', 'flop', [1,2,3]));
      t.ok(cardUpdateSpy.getCall(1).calledWith('cards', 'turn', [4]));
      t.ok(cardUpdateSpy.getCall(2).calledWith('cards', 'river', [5]));
      t.end();
    });

});



tape('preflop - check betting session starts from player next to big blind', function(t){

  const talkSpy = sinon.spy();

  function talk(gs){
    if(gs.commonCards.length >= 3)
      throw new Error('I want to test only pre-flop');

    talkSpy(this.name);
  }

  const players = ['arale', 'bender', 'marvin', 'wall-e'].map(player => createPlayer(player, talk));

  players[0][hasDB_] = true;
  players[2][hasBB_] = true;

  const gamestate = {
    [deck_]: [1,2,3,4,5,6].concat(new Array(46).fill('x')),
    players: players,
    activePlayers: players,
    commonCards: [],
    callAmount: 0
  };

  engine.on('gamestate:updated', (data, res) => res());


  run(sut, gamestate)
    .catch(function() {
      t.equal(talkSpy.callCount, 4);
      t.deepEqual(talkSpy.args.map(args => args[0]), ['wall-e', 'arale', 'bender', 'marvin']);
      t.end();
    });

});

tape('postflop - check betting session starts from player next to dealer button', function(t){

  const talkSpy = sinon.spy();

  function talk(gs){
    talkSpy(this.name);
  }

  const players = ['arale', 'bender', 'marvin', 'wall-e'].map(player => createPlayer(player, talk));

  players[0][hasDB_] = true;
  players[2][hasBB_] = true;

  const gamestate = {
    [deck_]: [4,5,6].concat(new Array(49).fill('x')),
    players: players,
    activePlayers: players,
    commonCards: [1,2,3],
    callAmount: 0
  };

  engine.on('gamestate:updated', (data, res) => res());

  run(sut, gamestate)
    .then(function() {
      t.equal(talkSpy.callCount, 12);
      const expectedOrder = ['bender', 'marvin', 'wall-e', 'arale'];
      t.deepEqual(talkSpy.args.map(args => args[0]), expectedOrder.concat(expectedOrder, expectedOrder));
      t.end();
    });

});



tape('preflop betting session closes in a single round', function(t){

  const talkSpy = sinon.spy();

  function talk(gs){
    if(gs.commonCards.length >= 3)
      throw new Error('I want to test only pre-flop');

    talkSpy(gs);
    this.chipsBet += gs.callAmount;
  }

  const players = ['arale', 'bender', 'marvin', 'wall-e'].map(player => createPlayer(player, talk));

  players[1][hasDB_] = true;
  players[3][hasBB_] = true;

  const gamestate = {
    [deck_]: new Array(52).fill('x'),
    players: players,
    activePlayers: players,
    commonCards: [],
    callAmount: 50
  };

  engine.on('gamestate:updated', (data, res) => res());

  run(sut, gamestate)
    .catch(function() {
      t.equal(talkSpy.callCount, 4);
      talkSpy.args.forEach((args) => t.equal(args[0].spinCount, 0));
      t.end();
    });

});

tape('preflop betting session in single round cause player is allin', function(t){

  const talkSpy = sinon.spy();

  function talk(gs){
    if(gs.commonCards.length >= 3)
      throw new Error('I want to test only pre-flop');

    talkSpy(gs.spinCount);

    if (this.name == 'bender' && gs.spinCount == 0)
      gs.callAmount *= 2;

    this.chipsBet += gs.callAmount;
  }

  const players = ['arale', 'bender', 'marvin', 'wall-e'].map(player => createPlayer(player, talk));

  players[0][allin_] = true;
  players[1][hasDB_] = true;
  players[3][hasBB_] = true;

  const gamestate = {
    [deck_]: new Array(52).fill('x'),
    players: players,
    activePlayers: players,
    commonCards: [],
    callAmount: 50
  };

  engine.on('gamestate:updated', (data, res) => res());

  run(sut, gamestate)
    .catch(function() {
      t.equal(talkSpy.callCount, 4);
      t.ok(talkSpy.alwaysCalledWith(0));
      t.end();
    });

});

tape('preflop betting session on multiple round', function(t){

  const talkSpy = sinon.spy();

  function talk(gs){
    if(gs.commonCards.length >= 3)
      throw new Error('I want to test only pre-flop');

    talkSpy(gs.spinCount);

    if (this.name == 'bender' && gs.spinCount == 0)
      gs.callAmount *= 2;

    this.chipsBet += gs.callAmount;
  }

  const players = ['arale', 'bender', 'marvin', 'wall-e'].map(player => createPlayer(player, talk));

  players[1][hasDB_] = true;
  players[3][hasBB_] = true;

  const gamestate = {
    [deck_]: new Array(52).fill('x'),
    players: players,
    activePlayers: players,
    commonCards: [],
    callAmount: 50
  };

  engine.on('gamestate:updated', (data, res) => res());

  run(sut, gamestate)
    .catch(function() {
      t.equal(talkSpy.callCount, 8);
      t.deepEqual(talkSpy.args.map(x => x[0]), [0, 0, 0, 0, 1, 1, 1, 1]);
      t.end();
    });

});
