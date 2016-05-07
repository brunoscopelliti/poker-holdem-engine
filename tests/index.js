
'use strict';

process.env.NODE_ENV = 'test';

const chalk = require('chalk');
const EventEmitter = require('events').EventEmitter;

const tape = require('tape');
const sinon = require('sinon');

const genRunner = require('../utils/generator-runner');
const runStub = sinon.stub(genRunner, 'run').returns(Promise.resolve());


const getSymbol = require('./test-utils/get-symbol');


//
// browserify, and winston do not play well together...
// setup the winston object as if it was really here.
const winston = require('winston');
winston.addColors = function() {};
winston.transports = { Console: function() {} };
winston.Logger = function() {
  const noop = sinon.spy();
  return { log: noop, info: noop, warn: noop, error: noop };
}


const sut = require('../index');
const gameloop = require('../poker-engine/game-loop');


tape('holdem engine controller', t => t.end());

tape('controller has EventEmitter prototype', function(t){
  t.equal(Object.getPrototypeOf(sut), EventEmitter.prototype);
  t.end();
});


tape('controller has the methods needed to control the game flow', function(t){

  const setup_ = getSymbol(sut, 'setup-tournament-method');
  t.equal(typeof sut[setup_], 'function');

  t.ok(sut.hasOwnProperty('start'));
  t.equal(typeof sut.start, 'function');

  t.ok(sut.hasOwnProperty('pause'));
  t.equal(typeof sut.pause, 'function');

  t.ok(sut.hasOwnProperty('quit'));
  t.equal(typeof sut.quit, 'function');

  t.end();
});



tape('setup: should notify "tournament:aborted" in case not enough players', function(t){

  const players = [
    { name: 'arale', id: 'a1', serviceUrl: 'http://x1-heroku-app.com/' }
  ];

  const setup_ = getSymbol(sut, 'setup-tournament-method');
  const tournaments_ = getSymbol(sut, 'tournament-collection');

  sut.once('tournament:aborted', function(data){
    t.ok(!sut[tournaments_].has('n-123'), 'tournament data never created');
    t.end();
  });

  sut[setup_]('n-123', players, 1);
});

tape('setup: should initialize the gamestate, and start the game loop', function(t){

  const players = [
    { name: 'arale', id: 'a1', serviceUrl: 'http://x1-heroku-app.com/' },
    { name: 'bender', id: 'b2', serviceUrl: 'http://y2-heroku-app.com/' },
    { name: 'marvin', id: 'c3', serviceUrl: 'http://z3-heroku-app.com/' },
    { id: 'w4', serviceUrl: 'http://ww-heroku-app.com/' }
  ];

  const setup_ = getSymbol(sut, 'setup-tournament-method');
  const tournaments_ = getSymbol(sut, 'tournament-collection');

  sut.once('tournament:completed', function(data){
    t.ok(!sut[tournaments_].has('a-123'), 'tournament data is deleted');
    t.equal(data.tournamentId, 'a-123');
    t.end();
  });

  sut[setup_]('a-123', players, 1);

  const gamestate = sut[tournaments_].get('a-123');

  t.ok(gamestate.hasOwnProperty('pid'));
  t.equal(gamestate.tournamentId, 'a-123');
  t.equal(gamestate.gameProgressiveId, 1);
  t.equal(gamestate.handProgressiveId, 1);
  t.ok(gamestate.handUniqueId.endsWith('a-123_1-1'));
  t.equal(gamestate.tournamentStatus, 'play');
  t.equal(gamestate.players.length, 3);

  t.ok(runStub.calledOnce);
  t.ok(runStub.calledWith(gameloop, gamestate));
});



tape('start: when tournament is not found should setup a new tournament', function(t){

  const collection_ = getSymbol(sut, 'tournament-collection');
  sut[collection_] = new Map();

  const setup_ = getSymbol(sut, 'setup-tournament-method');
  const setupStub = sinon.stub(sut, setup_);

  const players = [{ name: 'arale' }];

  sut.start('x-123', players);

  t.ok(setupStub.calledOnce);
  t.ok(setupStub.calledWith('x-123', players, 1));


  setupStub.restore();

  t.end();
});

tape('start: when tournament is not found should setup a new tournament starting from the given "gameId" (tournament recovery)', function(t){

  const collection_ = getSymbol(sut, 'tournament-collection');
  sut[collection_] = new Map();

  const setup_ = getSymbol(sut, 'setup-tournament-method');
  const setupStub = sinon.stub(sut, setup_);

  const players = [{ name: 'arale' }];

  sut.start('x-123', players, 10);

  t.ok(setupStub.calledOnce);
  t.ok(setupStub.calledWith('x-123', players, 10));

  setupStub.restore();

  t.end();
});

tape('start: when tournament is not paused (status != "pause") should do nothing', function(t){

  const gs = { tournamentStatus: 'latest' };
  const collection_ = getSymbol(sut, 'tournament-collection');

  sut[collection_] = new Map([['x-123', gs]]);

  const setup_ = getSymbol(sut, 'setup-tournament-method');
  const setupStub = sinon.stub(sut, setup_);

  const players = [{ name: 'arale' }];

  sut.start('x-123', players);

  t.ok(!setupStub.called);

  t.equal(gs.tournamentStatus, 'latest');

  setupStub.restore();

  t.end();
});

tape('start: when tournament is paused (status = "pause") should set tournament status to "play"', function(t){

  const gs = { tournamentStatus: 'pause' };
  const collection_ = getSymbol(sut, 'tournament-collection');

  sut[collection_] = new Map([['x-123', gs]]);

  const setup_ = getSymbol(sut, 'setup-tournament-method');
  const setupStub = sinon.stub(sut, setup_);

  const players = [{ name: 'arale' }];

  sut.start('x-123', players);

  t.ok(!setupStub.called);

  t.equal(gs.tournamentStatus, 'play');

  setupStub.restore();

  t.end();
});



tape('pause: when tournament is not found should do nothing', function(t){

  const collection_ = getSymbol(sut, 'tournament-collection');
  sut[collection_] = new Map();

  t.strictEqual(sut.pause('x-123'), undefined);

  t.end();
});

tape('pause: when tournament is not active (status != "play") should do nothing', function(t){

  const gs = { tournamentStatus: 'pause' };
  const collection_ = getSymbol(sut, 'tournament-collection');

  sut[collection_] = new Map([['x-123', gs]]);

  sut.pause('x-123');

  t.equal(gs.tournamentStatus, 'pause');

  t.end();
});

tape('pause: when tournament is active (status = "play") should set tournament status to "pause"', function(t){

  const gs = { tournamentStatus: 'play' };
  const collection_ = getSymbol(sut, 'tournament-collection');

  sut[collection_] = new Map([['x-123', gs]]);

  sut.pause('x-123');

  t.equal(gs.tournamentStatus, 'pause');

  t.end();
});



tape('quit: when tournament is not found should do nothing', function(t){

  const collection_ = getSymbol(sut, 'tournament-collection');
  sut[collection_] = new Map();

  t.strictEqual(sut.quit('x-123'), undefined);

  t.end();
});

tape('quit: when tournament is not active (status != "play") should do nothing', function(t){

  const gs = { tournamentStatus: 'pause' };
  const collection_ = getSymbol(sut, 'tournament-collection');

  sut[collection_] = new Map([['x-123', gs]]);

  sut.quit('x-123');

  t.equal(gs.tournamentStatus, 'pause');

  t.end();
});

tape('quit: when tournament is active (status = "play") should set tournament status to "latest"', function(t){

  const gs = { tournamentStatus: 'play' };
  const collection_ = getSymbol(sut, 'tournament-collection');

  sut[collection_] = new Map([['x-123', gs]]);

  sut.quit('x-123');

  t.equal(gs.tournamentStatus, 'latest');

  t.end();
});
