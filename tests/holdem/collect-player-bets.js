
'use strict';

const status = require('../../domain/player-status');
const sut = require('../../holdem/collect-player-bets');

const tape = require('tape');
const chalk = require('chalk');
const sinon = require('sinon');

let hasDB = Symbol.for('hasDB');

let betStub = sinon.stub();
let talkStub = sinon.stub();

const gamestate = {
  players: [
    { id: 0, name: 'bud', status: status.active, bet: betStub, talk: talkStub },
    { id: 1, name: 'terence', status: status.active, [hasDB]: true, bet: betStub, talk: talkStub },
    { id: 2, name: 'chuck', status: status.out, bet: betStub, talk: talkStub },
    { id: 3, name: 'silvester', status: status.folded, bet: betStub, talk: talkStub },
    { id: 4, name: 'jean-claude', status: status.active, bet: betStub, talk: talkStub }
  ]
};

tape('collect player\'s bet', t => t.end());

tape('bet round, everything goes fine', function(t) {

  talkStub.onCall(0).returns(Promise.resolve(25));
  talkStub.onCall(1).returns(Promise.resolve(50));
  talkStub.onCall(2).returns(Promise.resolve(50));

  sut(gamestate, 1).then(function() {

    t.ok(talkStub.calledThrice, 'only the three active players can talk');
    t.ok(talkStub.getCall(0).calledOn(gamestate.players[4]), 'first player to talk is the first after the one at the specified index');

    t.ok(betStub.calledThrice, 'make the bet each player expressed');

    t.ok(betStub.getCall(0).calledWith(gamestate, 25), 'check the bet amount');
    t.ok(betStub.getCall(1).calledWith(gamestate, 50), 'check the bet amount');

    t.end();

    betStub.reset();
    talkStub.reset();

  });

});

tape('bet round, with rejection', function(t) {

  talkStub.onCall(0).returns(Promise.resolve(25));
  talkStub.onCall(1).returns(new Promise((res, rej) => setTimeout(rej, 250)));
  talkStub.onCall(2).returns(Promise.resolve(50));

  sut(gamestate, 4).then(function() {

    t.ok(talkStub.calledThrice, 'only the three active players can talk');
    t.ok(talkStub.getCall(0).calledOn(gamestate.players[0]), 'first player to talk is the first after the one at the specified index');

    t.ok(betStub.calledThrice, 'make the bet each player expressed');

    t.ok(betStub.getCall(0).calledWith(gamestate, 25), 'check the bet amount');
    t.ok(betStub.getCall(1).calledWith(gamestate, 0), 'check the bet amount in case of rejection');

    t.end();

  });

});
