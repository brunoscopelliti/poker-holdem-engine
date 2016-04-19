
'use strict';

process.env.NODE_ENV = 'test';

const chalk = require('chalk');
const EventEmitter = require('events').EventEmitter;

const tape = require('tape');
const sinon = require('sinon');

const getSymbol = require('./utils/get-symbol');


//
// browserify, and winston do not play well together...
// setup the winston object as if it was really here.
const winston = require('winston');
winston.transports = { Console: function() {} };
winston.Logger = function() {
  const noop = sinon.spy();
  return { log: noop, info: noop, warn: noop, error: noop };
}


const sut = require('../index');


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



// TODO
// Complete tests

tape('start: when tournament is not found should setup a new tournament', function(t){

  const collection_ = getSymbol(sut, 'tournament-collection');
  sut[collection_] = new Map();

  const setup_ = getSymbol(sut, 'setup-tournament-method');
  const setupStub = sinon.stub(sut, setup_);

  const players = [{ name: 'arale' }];

  sut.start('x-123', players);

  sinon.assert.calledOnce(setupStub);
  sinon.assert.calledWith(setupStub, 'x-123', players, 1);

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

  sinon.assert.calledOnce(setupStub);
  sinon.assert.calledWith(setupStub, 'x-123', players, 10);

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

  sinon.assert.notCalled(setupStub);

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

  sinon.assert.notCalled(setupStub);

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
