
'use strict';

const tape = require('tape');
const sinon = require('sinon');

const playerStatus = require('../../../poker-engine/domain/player-status');

const sut = require('../../../poker-engine/domain-utils/update-players-status');



tape('update-player-status', t => t.end());

tape('no one is eliminated', function(t) {

  const gamestate = {
    activePlayers: [{
      name: 'arale',
      id: 'a1',
      chips: 100
    }, {
      name: 'bender',
      id: 'b2',
      chips: 250
    }, {
      name: 'marvin',
      id: 'm3',
      chips: 20
    }]
  };

  sut(gamestate);

  t.equal(gamestate.gameChart.length, 0);
  t.equal(gamestate.activePlayers.find(x => x.status == 'out'), undefined);

  t.end()

});

tape('one player is eliminated', function(t) {

  const gamestate = {
    gameChart: ['wall-e'],
    activePlayers: [{
      name: 'arale',
      id: 'a1',
      chips: 140
    }, {
      name: 'bender',
      id: 'b2',
      chips: 230
    }, {
      name: 'marvin',
      id: 'm3',
      chips: 0
    }]
  };

  sut(gamestate);

  t.equal(gamestate.gameChart.length, 2);
  t.equal(gamestate.gameChart[0], 'marvin');
  t.equal(gamestate.gameChart[1], 'wall-e');

  t.equal(gamestate.activePlayers.find(x => x.status == 'out').name, 'marvin');

  t.end()

});

tape('two players eliminated in the same hand', function(t) {

  const gamestate = {
    gameChart: ['wall-e'],
    handChart: [
      { id: 'a1' },
      { id: 'm3' },
      { id: 'b2' },
    ],
    activePlayers: [{
      name: 'arale',
      id: 'a1',
      chips: 140
    }, {
      name: 'bender',
      id: 'b2',
      chips: 0
    }, {
      name: 'marvin',
      id: 'm3',
      chips: 0
    }]
  };

  sut(gamestate);

  t.equal(gamestate.gameChart.length, 3);
  t.equal(gamestate.gameChart[0], 'marvin');
  t.equal(gamestate.gameChart[1], 'bender');
  t.equal(gamestate.gameChart[2], 'wall-e');

  t.equal(gamestate.activePlayers.filter(x => x.status == 'out').length, 2);

  const bender = gamestate.activePlayers.find(x => x.id == 'b2');

  t.equal(bender.status, 'out');

  const marvin = gamestate.activePlayers.find(x => x.id == 'm3');

  t.equal(marvin.status, 'out');

  t.end()

});
