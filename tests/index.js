
'use strict';

const sut = require('../index');

const tape = require('tape');
const sinon = require('sinon');


tape('game:start listener', function(t) {

  let dealerStub = sinon.stub(sut._dealer.prototype, 'next');

  sut.engine.emit('game:start', { players: [] });

  t.equal(sut.gamestate.status, 'play', 'listen game:start event');

  dealerStub.restore();

  t.end();

});



tape('game:pause listener', function(t) {

  sut.engine.emit('game:pause', { players: [] });

  t.equal(sut.gamestate.status, 'pause', 'listen game:pause event');
  t.end();

});


tape('game:end listener', function(t) {

  sut.engine.emit('game:end', { players: [] });

  t.equal(sut.gamestate.status, 'stop', 'listen game:end event');
  t.end();

});
