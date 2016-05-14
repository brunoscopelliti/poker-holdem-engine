
'use strict';

const tape = require('tape');
const sinon = require('sinon');

const enhance = require('../../test-utils/enhance-gamestate');


const playerStatus = require('../../../poker-engine/domain/player-status');



const sut = require('../../../poker-engine/domain-utils/assign-pot');



tape('assign-pot', t => t.end());

tape('only one active player at the showdown', function(t) {

  const gamestate = enhance({
    pot: 100,
    players: [
      { name: 'arale', id: 'a1', chips: 50, status: playerStatus.active },
      { name: 'bender', id: 'b2', chips: 250, status: playerStatus.folded },
      { name: 'c3p-o', id: 'c3', chips: 0, status: playerStatus.out },
      { name: 'marvin', id: 'm4', chips: 0, status: playerStatus.out },
      { name: 'wall-e', id: 'w5', chips: 120, status: playerStatus.folded }
    ]
  });

  sut(gamestate);

  t.equal(gamestate.pot, 0);
  t.equal(gamestate.players[0].chips, 150);

  t.equal(gamestate.winners.length, 1);

  t.equal(gamestate.winners[0].id, 'a1');
  t.equal(gamestate.winners[0].name, 'arale');
  t.equal(gamestate.winners[0].amount, 100);

  t.end();

});

tape('unique winner (no sidepot)', function(t) {

  const gamestate = enhance({
    pot: 100,
    callAmount: 50,
    sidepots: [],
    players: [
      { name: 'arale', id: 'a1', chips: 50, status: playerStatus.active },
      { name: 'bender', id: 'b2', chips: 250, status: playerStatus.active },
      { name: 'c3p-o', id: 'c3', chips: 0, status: playerStatus.out },
      { name: 'marvin', id: 'm4', chips: 0, status: playerStatus.out },
      { name: 'wall-e', id: 'w5', chips: 120, status: playerStatus.folded }
    ],
    handChart: [
      { id: 'b2', quote: 50, bestCombinationData: {} },
      { id: 'a1', quote: 50, bestCombinationData: {} }
    ]
  });

  sut(gamestate);

  t.equal(gamestate.pot, 0);
  t.equal(gamestate.players[0].chips, 50);
  t.equal(gamestate.players[1].chips, 350);
  t.equal(gamestate.players[2].chips, 0);
  t.equal(gamestate.players[3].chips, 0);
  t.equal(gamestate.players[4].chips, 120);

  t.equal(gamestate.winners.length, 1);

  t.equal(gamestate.winners[0].id, 'b2');
  t.equal(gamestate.winners[0].name, 'bender');
  t.equal(gamestate.winners[0].amount, 100);

  t.end();

});

tape('unique winner, exequo in the rank (no sidepot)', function(t) {

  const gamestate = enhance({
    pot: 120,
    callAmount: 40,
    sidepots: [],
    players: [
      { name: 'arale', id: 'a1', chips: 50, status: playerStatus.active },
      { name: 'bender', id: 'b2', chips: 250, status: playerStatus.active },
      { name: 'c3p-o', id: 'c3', chips: 0, status: playerStatus.out },
      { name: 'marvin', id: 'm4', chips: 0, status: playerStatus.out },
      { name: 'wall-e', id: 'w5', chips: 120, status: playerStatus.active }
    ],
    handChart: [
      { id: 'b2', quote: 40, bestCombinationData: {} },
      { id: 'a1', quote: 40, bestCombinationData: { exequo: '#0' } },
      { id: 'w5', quote: 40, bestCombinationData: { exequo: '#0' } }
    ]
  });

  sut(gamestate);

  t.equal(gamestate.pot, 0);
  t.equal(gamestate.players[0].chips, 50);
  t.equal(gamestate.players[1].chips, 370);
  t.equal(gamestate.players[2].chips, 0);
  t.equal(gamestate.players[3].chips, 0);
  t.equal(gamestate.players[4].chips, 120);

  t.equal(gamestate.winners.length, 1);

  t.equal(gamestate.winners[0].id, 'b2');
  t.equal(gamestate.winners[0].name, 'bender');
  t.equal(gamestate.winners[0].amount, 120);

  t.end();

});

tape('exequo winner (no sidepot)', function(t) {

  const gamestate = enhance({
    pot: 200,
    callAmount: 50,
    sidepots: [],
    players: [
      { name: 'arale', id: 'a1', chips: 50, status: playerStatus.active },
      { name: 'bender', id: 'b2', chips: 250, status: playerStatus.active },
      { name: 'c3p-o', id: 'c3', chips: 300, status: playerStatus.active },
      { name: 'marvin', id: 'm4', chips: 280, status: playerStatus.folded },
      { name: 'wall-e', id: 'w5', chips: 120, status: playerStatus.active }
    ],
    handChart: [
      { id: 'c3', quote: 50, bestCombinationData: { exequo: '#0' } },
      { id: 'b2', quote: 50, bestCombinationData: { exequo: '#0' } },
      { id: 'w5', quote: 50, bestCombinationData: {} },
      { id: 'a1', quote: 50, bestCombinationData: {} }
    ]
  });

  sut(gamestate);

  t.equal(gamestate.pot, 0);
  t.equal(gamestate.players[0].chips, 50);
  t.equal(gamestate.players[1].chips, 350);
  t.equal(gamestate.players[2].chips, 400);
  t.equal(gamestate.players[3].chips, 280);
  t.equal(gamestate.players[4].chips, 120);

  t.equal(gamestate.winners.length, 2);

  t.equal(gamestate.winners[0].id, 'c3');
  t.equal(gamestate.winners[0].name, 'c3p-o');
  t.equal(gamestate.winners[0].amount, 100);

  t.equal(gamestate.winners[1].id, 'b2');
  t.equal(gamestate.winners[1].name, 'bender');
  t.equal(gamestate.winners[1].amount, 100);

  t.end();

});

tape('three exequo winner (no sidepot)', function(t) {

  const gamestate = enhance({
    pot: 160,
    callAmount: 40,
    sidepots: [],
    players: [
      { name: 'arale', id: 'a1', chips: 50, status: playerStatus.active },
      { name: 'bender', id: 'b2', chips: 250, status: playerStatus.active },
      { name: 'c3p-o', id: 'c3', chips: 300, status: playerStatus.active },
      { name: 'marvin', id: 'm4', chips: 280, status: playerStatus.folded },
      { name: 'wall-e', id: 'w5', chips: 120, status: playerStatus.active }
    ],
    handChart: [
      { id: 'c3', quote: 40, bestCombinationData: { exequo: '#0' } },
      { id: 'b2', quote: 40, bestCombinationData: { exequo: '#0' } },
      { id: 'w5', quote: 40, bestCombinationData: { exequo: '#0' } },
      { id: 'a1', quote: 40, bestCombinationData: {} }
    ]
  });

  sut(gamestate);

  t.equal(gamestate.pot, 0);
  t.equal(gamestate.players[0].chips, 50);
  t.equal(gamestate.players[1].chips, 303);
  t.equal(gamestate.players[2].chips, 353);
  t.equal(gamestate.players[3].chips, 280);
  t.equal(gamestate.players[4].chips, 173);

  t.equal(gamestate.winners.length, 3);

  t.equal(gamestate.winners[0].id, 'c3');
  t.equal(gamestate.winners[0].name, 'c3p-o');
  t.equal(gamestate.winners[0].amount, 53);

  t.equal(gamestate.winners[1].id, 'b2');
  t.equal(gamestate.winners[1].name, 'bender');
  t.equal(gamestate.winners[1].amount, 53);

  t.equal(gamestate.winners[2].id, 'w5');
  t.equal(gamestate.winners[2].name, 'wall-e');
  t.equal(gamestate.winners[2].amount, 53);

  t.end();

});

tape('unique winner for all sidepots', function(t) {

  const gamestate = enhance({
    pot: 500,
    callAmount: 200,
    sidepots: [
      { quote: 100, amount: 300 },
      { quote: 200, amount: 200 }
    ],
    players: [
      { name: 'arale', id: 'a1', chips: 50, status: playerStatus.active },
      { name: 'bender', id: 'b2', chips: 250, status: playerStatus.active },
      { name: 'c3p-o', id: 'c3', chips: 0, status: playerStatus.out },
      { name: 'marvin', id: 'm4', chips: 0, status: playerStatus.out },
      { name: 'wall-e', id: 'w5', chips: 120, status: playerStatus.active }
    ],
    handChart: [
      { id: 'b2', quote: 200, bestCombinationData: {} },
      { id: 'a1', quote: 200, bestCombinationData: {} },
      { id: 'w5', quote: 100, bestCombinationData: {} }
    ]
  });

  sut(gamestate);

  t.equal(gamestate.pot, 0);
  t.equal(gamestate.players[0].chips, 50);
  t.equal(gamestate.players[1].chips, 750);
  t.equal(gamestate.players[2].chips, 0);
  t.equal(gamestate.players[3].chips, 0);
  t.equal(gamestate.players[4].chips, 120);

  t.equal(gamestate.winners.length, 1);

  t.equal(gamestate.winners[0].id, 'b2');
  t.equal(gamestate.winners[0].name, 'bender');
  t.equal(gamestate.winners[0].amount, 500);

  t.end();

});

tape('exequo winner on first sidepots', function(t) {

  const gamestate = enhance({
    pot: 500,
    callAmount: 200,
    sidepots: [
      { quote: 100, amount: 300 },
      { quote: 200, amount: 200 }
    ],
    players: [
      { name: 'arale', id: 'a1', chips: 50, status: playerStatus.active },
      { name: 'bender', id: 'b2', chips: 250, status: playerStatus.active },
      { name: 'c3p-o', id: 'c3', chips: 0, status: playerStatus.out },
      { name: 'marvin', id: 'm4', chips: 0, status: playerStatus.out },
      { name: 'wall-e', id: 'w5', chips: 120, status: playerStatus.active }
    ],
    handChart: [
      { id: 'b2', quote: 200, bestCombinationData: { exequo: '#0' } },
      { id: 'w5', quote: 100, bestCombinationData: { exequo: '#0' } },
      { id: 'a1', quote: 200, bestCombinationData: {} },
    ]
  });

  sut(gamestate);

  t.equal(gamestate.pot, 0);
  t.equal(gamestate.players[0].chips, 50);
  t.equal(gamestate.players[1].chips, 600);
  t.equal(gamestate.players[2].chips, 0);
  t.equal(gamestate.players[3].chips, 0);
  t.equal(gamestate.players[4].chips, 270);

  t.equal(gamestate.winners.length, 2);

  t.equal(gamestate.winners[0].id, 'b2');
  t.equal(gamestate.winners[0].name, 'bender');
  t.equal(gamestate.winners[0].amount, 350);

  t.equal(gamestate.winners[1].id, 'w5');
  t.equal(gamestate.winners[1].name, 'wall-e');
  t.equal(gamestate.winners[1].amount, 150);

  t.end();

});

tape('exequos and sidepots', function(t) {

  const gamestate = enhance({
    pot: 2050,
    callAmount: 600,
    sidepots: [
      { quote: 50, amount: 250 },
      { quote: 300, amount: 1000 },
      { quote: 500, amount: 600 },
      { quote: 600, amount: 200 },
    ],
    players: [
      { name: 'arale', id: 'a1', chips: 0, status: playerStatus.active }, // all-in 500
      { name: 'bender', id: 'b2', chips: 0, status: playerStatus.active }, // all-in 50
      { name: 'c3p-o', id: 'c3', chips: 200, status: playerStatus.active },
      { name: 'marvin', id: 'm4', chips: 500, status: playerStatus.active },
      { name: 'wall-e', id: 'w5', chips: 0, status: playerStatus.active } // all-in 300
    ],
    handChart: [
      { id: 'b2', quote: 50, bestCombinationData: { exequo: '#0' } },
      { id: 'w5', quote: 300, bestCombinationData: { exequo: '#0' } },
      { id: 'm4', quote: 600, bestCombinationData: { exequo: '#1' } },
      { id: 'c3', quote: 600, bestCombinationData: { exequo: '#1' } },
      { id: 'a1', quote: 500, bestCombinationData: { exequo: '#1' } }
    ]
  });

  sut(gamestate);

  t.equal(gamestate.pot, 0);
  t.equal(gamestate.players[0].chips, 200);
  t.equal(gamestate.players[1].chips, 125);
  t.equal(gamestate.players[2].chips, 500);
  t.equal(gamestate.players[3].chips, 800);
  t.equal(gamestate.players[4].chips, 1125);

  t.equal(gamestate.winners.length, 5);

  t.equal(gamestate.winners[0].id, 'b2');
  t.equal(gamestate.winners[0].name, 'bender');
  t.equal(gamestate.winners[0].amount, 125);

  t.equal(gamestate.winners[1].id, 'w5');
  t.equal(gamestate.winners[1].name, 'wall-e');
  t.equal(gamestate.winners[1].amount, 1125);

  t.equal(gamestate.winners[2].id, 'm4');
  t.equal(gamestate.winners[2].name, 'marvin');
  t.equal(gamestate.winners[2].amount, 300);

  t.equal(gamestate.winners[3].id, 'c3');
  t.equal(gamestate.winners[3].name, 'c3p-o');
  t.equal(gamestate.winners[3].amount, 300);

  t.equal(gamestate.winners[4].id, 'a1');
  t.equal(gamestate.winners[4].name, 'arale');
  t.equal(gamestate.winners[4].amount, 200);

  t.end();

});
