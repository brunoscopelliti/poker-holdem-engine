
'use strict';

const tape = require('tape');
const sinon = require('sinon');

const createPlayer = require('../../../poker-engine/domain-utils/player-factory');

const sut = require('../../../poker-engine/domain-utils/showdown');


const players = [
  { name: 'arale', id: 'a1', serviceUrl: 'http://arale.com/' },
  { name: 'bender', id: 'b2', serviceUrl: 'http://bender.com/' },
  { name: 'marvin', id: 'm3', serviceUrl: 'http://marvin.com/' },
  { name: 'wall-e', id: 'w4', serviceUrl: 'http://walle.com/' }
];

tape('showdown', t => t.end());

tape('when there is only an active players, showdown it is not necessary', function(t){

  const gamestate = {
    activePlayers: [{ name: 'arale' }]
  };

  sut(gamestate);

  t.equal(gamestate.handChart.length, 0);

  t.end();

});

tape('only one winner', function(t){

  const activePlayers = players.map(createPlayer);

  activePlayers[0].cards = [{ rank: '7', type: 'C' }, { rank: '3', type: 'D' }]; // fullhouse 7
  activePlayers[1].cards = [{ rank: 'Q', type: 'C' }, { rank: 'Q', type: 'D' }]; // fullhouse Q
  activePlayers[1].chipsBet = 100;
  activePlayers[2].cards = [{ rank: '7', type: 'S' }, { rank: '9', type: 'D' }]; // three of a kind
  activePlayers[3].cards = [{ rank: '5', type: 'C' }, { rank: '5', type: 'D' }]; // double pair

  const gamestate = {
    activePlayers: activePlayers,
    commonCards: [
      { rank: '7', type: 'H' },
      { rank: '3', type: 'S' },
      { rank: '4', type: 'C' },
      { rank: '7', type: 'D' },
      { rank: 'Q', type: 'H' }
    ]
  };

  sut(gamestate);

  t.ok(!gamestate.handChart.find(player => !!player.bestCombinationData.exequo));
  t.equal(gamestate.handChart[0].id, 'b2');
  t.equal(gamestate.handChart[0].quote, 100);
  t.deepEqual(gamestate.handChart.map(player => player.id), ['b2','a1','m3','w4'], 'check ranks');

  t.end();

});

tape('two exequo winners', function(t){

  const activePlayers = players.map(createPlayer);

  activePlayers[0].cards = [{ rank: '7', type: 'C' }, { rank: '2', type: 'D' }]; // three-of-a-kind 7
  activePlayers[1].cards = [{ rank: '7', type: 'S' }, { rank: '3', type: 'D' }]; // three-of-a-kind 7
  activePlayers[2].cards = [{ rank: '8', type: 'S' }, { rank: '8', type: 'D' }]; // double pair
  activePlayers[3].cards = [{ rank: '6', type: 'C' }, { rank: '5', type: 'D' }]; // pair

  const gamestate = {
    activePlayers: activePlayers,
    commonCards: [
      { rank: '7', type: 'H' },
      { rank: 'A', type: 'S' },
      { rank: 'K', type: 'C' },
      { rank: '7', type: 'D' },
      { rank: 'Q', type: 'H' }
    ]
  };

  sut(gamestate);

  const exequos = gamestate.handChart.filter(player => player.bestCombinationData.exequo == '#0');

  t.equal(exequos.length, 2);
  t.deepEqual(exequos.map(x => x.id), ['a1','b2']);
  t.deepEqual(gamestate.handChart.map(player => player.id), ['a1','b2','m3','w4'], 'check ranks');

  t.end();

});

tape('three winners', function(t){

  const activePlayers = players.map(createPlayer);

  activePlayers[0].cards = [{ rank: '7', type: 'C' }, { rank: '2', type: 'D' }]; // three-of-a-kind 7
  activePlayers[1].cards = [{ rank: '7', type: 'S' }, { rank: '3', type: 'D' }]; // three-of-a-kind 7
  activePlayers[2].cards = [{ rank: '4', type: 'S' }, { rank: '5', type: 'D' }]; // high cart
  activePlayers[3].cards = [{ rank: '6', type: 'C' }, { rank: '7', type: 'D' }]; // three-of-a-kind 7

  const gamestate = {
    activePlayers: activePlayers,
    commonCards: [
      { rank: '7', type: 'H' },
      { rank: 'A', type: 'S' },
      { rank: 'K', type: 'C' },
      { rank: 'J', type: 'D' },
      { rank: 'Q', type: 'H' }
    ]
  };

  sut(gamestate);

  const exequos = gamestate.handChart.filter(player => player.bestCombinationData.exequo == '#0');

  t.equal(exequos.length, 3);
  t.deepEqual(exequos.map(x => x.id), ['a1','b2','w4']);
  t.deepEqual(gamestate.handChart.map(player => player.id), ['a1','b2','w4','m3'], 'check ranks');

  t.end();

});

tape('one winner, and exequo on second place', function(t){

  const activePlayers = players.map(createPlayer);

  activePlayers[0].cards = [{ rank: '7', type: 'C' }, { rank: '3', type: 'D' }]; // three-of-a-kind 7
  activePlayers[1].cards = [{ rank: 'Q', type: 'C' }, { rank: 'Q', type: 'D' }]; // fullhouse Q
  activePlayers[2].cards = [{ rank: '7', type: 'S' }, { rank: '3', type: 'C' }]; // three of a kind 7
  activePlayers[3].cards = [{ rank: '5', type: 'C' }, { rank: '5', type: 'D' }]; // double pair

  const gamestate = {
    activePlayers: activePlayers,
    commonCards: [
      { rank: '7', type: 'H' },
      { rank: 'A', type: 'S' },
      { rank: '4', type: 'C' },
      { rank: '7', type: 'D' },
      { rank: 'Q', type: 'H' }
    ]
  };

  sut(gamestate);

  const exequos = gamestate.handChart.filter(player => player.bestCombinationData.exequo == '#0');

  t.equal(exequos.length, 2);
  t.ok(gamestate.handChart[0].id === 'b2' && !gamestate.handChart[0].bestCombinationData.exequo);
  t.deepEqual(gamestate.handChart.map(player => player.id), ['b2','a1','m3','w4'], 'check ranks');

  t.end();

});

tape('double exequo', function(t){

  const activePlayers = players.map(createPlayer);

  activePlayers[0].cards = [{ rank: '7', type: 'C' }, { rank: '3', type: 'D' }]; // three-of-a-kind 7
  activePlayers[1].cards = [{ rank: '5', type: 'H' }, { rank: '5', type: 'S' }]; // double pair
  activePlayers[2].cards = [{ rank: '7', type: 'S' }, { rank: '3', type: 'C' }]; // three of a kind 7
  activePlayers[3].cards = [{ rank: '5', type: 'C' }, { rank: '5', type: 'D' }]; // double pair

  const gamestate = {
    activePlayers: activePlayers,
    commonCards: [
      { rank: '7', type: 'H' },
      { rank: 'A', type: 'S' },
      { rank: '4', type: 'C' },
      { rank: '7', type: 'D' },
      { rank: 'Q', type: 'H' }
    ]
  };

  sut(gamestate);

  const exequos1 = gamestate.handChart.filter(player => player.bestCombinationData.exequo == '#0');
  const exequos2 = gamestate.handChart.filter(player => player.bestCombinationData.exequo == '#1');

  t.equal(exequos1.length, 2);
  t.equal(exequos2.length, 2);
  t.deepEqual(exequos1.map(x => x.id), ['a1','m3']);
  t.deepEqual(gamestate.handChart.map(player => player.id), ['a1','m3','b2','w4'], 'check ranks');

  t.end();

});
