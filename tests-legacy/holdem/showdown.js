
'use strict';

const status = require('../../poker-engine/domain/player-status');
const createPlayer = require('../../poker-engine/holdem/player-factory');

const sut = require('../../poker-engine/holdem/showdown');

const tape = require('tape');
const chalk = require('chalk');
const sinon = require('sinon');


tape('find-winner', t => t.end());

tape('only one player', function(t){

  let players = [{ name: 'chuck' }].map(createPlayer);

  players[0].cards = [{ rank: 'A', type: 'C' }, { rank: 'A', type: 'D' }]; // royal straight flush

  const commonCards = [
    { rank: 'A', type: 'H' },
    { rank: 'K', type: 'H' },
    { rank: 'Q', type: 'H' },
    { rank: 'J', type: 'H' },
    { rank: '10', type: 'H' }
  ]

  sut(players, commonCards).then(function(sortedPlayers) {
    t.deepEqual(sortedPlayers[0], players[0], 'easy win');
    t.end();
  });

});

tape('only one winner', function(t){

  let players = [{ name: 'bud' }, { name: 'terence' }, { name: 'chuck' }, { name: 'silvester' }].map(createPlayer);

  players[0].cards = [{ rank: '7', type: 'C' }, { rank: '3', type: 'D' }]; // fullhouse 7
  players[1].cards = [{ rank: 'Q', type: 'C' }, { rank: 'Q', type: 'D' }]; // fullhouse Q
  players[2].cards = [{ rank: '7', type: 'S' }, { rank: '9', type: 'D' }]; // three of a kind
  players[3].cards = [{ rank: '5', type: 'C' }, { rank: '5', type: 'D' }]; // double pair

  const commonCards = [
    { rank: '7', type: 'H' },
    { rank: '3', type: 'S' },
    { rank: '4', type: 'C' },
    { rank: '7', type: 'D' },
    { rank: 'Q', type: 'H' }
  ]

  sut(players, commonCards).then(function(sortedPlayers) {

    t.ok(!sortedPlayers.find(player => !!player.detail.exequo), 'zero exequo');
    t.equal(sortedPlayers[0].id, 1, 'fullhouse of Q is the unique winner');
    t.deepEqual(sortedPlayers.map(player => player.id), [1,0,2,3], 'check ranks');

    t.end();

  });

});

tape('two winners', function(t){

  let players = [{ name: 'bud' }, { name: 'terence' }, { name: 'chuck' }, { name: 'silvester' }].map(createPlayer);

  players[0].cards = [{ rank: '7', type: 'C' }, { rank: '2', type: 'D' }]; // three-of-a-kind 7
  players[1].cards = [{ rank: '7', type: 'S' }, { rank: '3', type: 'D' }]; // three-of-a-kind 7
  players[2].cards = [{ rank: '8', type: 'S' }, { rank: '8', type: 'D' }]; // double pair
  players[3].cards = [{ rank: '6', type: 'C' }, { rank: '5', type: 'D' }]; // pair

  const commonCards = [
    { rank: '7', type: 'H' },
    { rank: 'A', type: 'S' },
    { rank: 'K', type: 'C' },
    { rank: '7', type: 'D' },
    { rank: 'Q', type: 'H' }
  ]

  sut(players, commonCards).then(function(sortedPlayers) {

    let exequos = sortedPlayers.filter(player => player.detail.exequo == '#0');

    t.equal(exequos.length, 2, 'one exequo');
    t.deepEqual(exequos.map(x => x.id), [0,1], 'check winners');
    t.deepEqual(sortedPlayers.map(player => player.id), [0,1,2,3], 'check ranks');

    t.end();

  });

});

tape('three winners', function(t){

  let players = [{ name: 'bud' }, { name: 'terence' }, { name: 'chuck' }, { name: 'silvester' }].map(createPlayer);

  players[0].cards = [{ rank: '7', type: 'C' }, { rank: '2', type: 'D' }]; // three-of-a-kind 7
  players[1].cards = [{ rank: '7', type: 'S' }, { rank: '3', type: 'D' }]; // three-of-a-kind 7
  players[2].cards = [{ rank: '4', type: 'S' }, { rank: '5', type: 'D' }]; // high cart
  players[3].cards = [{ rank: '6', type: 'C' }, { rank: '7', type: 'D' }]; // three-of-a-kind 7

  const commonCards = [
    { rank: '7', type: 'H' },
    { rank: 'A', type: 'S' },
    { rank: 'K', type: 'C' },
    { rank: 'J', type: 'D' },
    { rank: 'Q', type: 'H' }
  ]

  sut(players, commonCards).then(function(sortedPlayers) {

    let exequos = sortedPlayers.filter(player => player.detail.exequo == '#0');

    t.equal(exequos.length, 3, 'one exequo beetween three players');
    t.deepEqual(exequos.map(x => x.id), [0,1,3], 'check winners');
    t.deepEqual(sortedPlayers.map(player => player.id), [0,1,3,2], 'check ranks');

    t.end();

  });

});

tape('one winner, and exequo on second place', function(t){

  let players = [{ name: 'bud' }, { name: 'terence' }, { name: 'chuck' }, { name: 'silvester' }].map(createPlayer);

  players[0].cards = [{ rank: '7', type: 'C' }, { rank: '3', type: 'D' }]; // three-of-a-kind 7
  players[1].cards = [{ rank: 'Q', type: 'C' }, { rank: 'Q', type: 'D' }]; // fullhouse Q
  players[2].cards = [{ rank: '7', type: 'S' }, { rank: '3', type: 'C' }]; // three of a kind 7
  players[3].cards = [{ rank: '5', type: 'C' }, { rank: '5', type: 'D' }]; // double pair

  const commonCards = [
    { rank: '7', type: 'H' },
    { rank: 'A', type: 'S' },
    { rank: '4', type: 'C' },
    { rank: '7', type: 'D' },
    { rank: 'Q', type: 'H' }
  ]

  sut(players, commonCards).then(function(sortedPlayers) {

    let exequos = sortedPlayers.filter(player => player.detail.exequo == '#0');
    t.equal(exequos.length, 2, 'one exequo');

    t.ok(sortedPlayers[0].id === 1 && !sortedPlayers[0].detail.exequo, 'fullhouse of Q is the unique winner');
    t.deepEqual(sortedPlayers.map(player => player.id), [1,0,2,3], 'check ranks');

    t.end();

  });

});

tape('two exequo', function(t){

  let players = [{ name: 'bud' }, { name: 'terence' }, { name: 'chuck' }, { name: 'silvester' }].map(createPlayer);

  players[0].cards = [{ rank: '7', type: 'C' }, { rank: '3', type: 'D' }]; // three-of-a-kind 7
  players[1].cards = [{ rank: '5', type: 'H' }, { rank: '5', type: 'S' }]; // double pair
  players[2].cards = [{ rank: '7', type: 'S' }, { rank: '3', type: 'C' }]; // three of a kind 7
  players[3].cards = [{ rank: '5', type: 'C' }, { rank: '5', type: 'D' }]; // double pair

  const commonCards = [
    { rank: '7', type: 'H' },
    { rank: 'A', type: 'S' },
    { rank: '4', type: 'C' },
    { rank: '7', type: 'D' },
    { rank: 'Q', type: 'H' }
  ]

  sut(players, commonCards).then(function(sortedPlayers) {

    let exequos = sortedPlayers.filter(player => player.detail.exequo == '#0');
    t.equal(exequos.length, 2, 'first exequo');
    t.equal(sortedPlayers.filter(player => player.detail.exequo == '#1').length, 2, 'second exequo');
    t.deepEqual(exequos.map(x => x.id), [0,2], 'check winners');
    t.deepEqual(sortedPlayers.map(player => player.id), [0,2,1,3], 'check ranks');

    t.end();

  });

});
