
'use strict';

const sut = require('../index');

const tape = require('tape');
const chalk = require('chalk');
const sinon = require('sinon');

tape('game:* listeners', t => t.end());

tape('game:start listener', function(t) {

  let dealerStub = sinon.stub(sut._dealer.prototype, 'next');

  sut.gamestate.emit('game:start', { players: [
    { name: 'Bluffers', members: [{ githubUsername: 'pok-bluffers' }] },
    { name: 'PStar', members: [{ githubUsername: 'starrr' }] }
  ] });

  t.equal(sut.gamestate.status, 'play', 'listen game:start event');
  t.equal(sut.gamestate.players.length, 2, 'players registered');
  t.equal(sut.gamestate.players[0].name, 'Bluffers', 'players data is correct');

  dealerStub.restore();

  t.end();

});

tape('game:pause listener', function(t) {

  sut.gamestate.emit('game:pause', { players: [] });

  t.equal(sut.gamestate.status, 'pause', 'listen game:pause event');
  t.end();

});

tape('game:end listener', function(t) {

  sut.gamestate.emit('game:end', { players: [] });

  t.equal(sut.gamestate.status, 'stop', 'listen game:end event');
  t.end();

});
