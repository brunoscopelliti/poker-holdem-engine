
'use strict';

const tape = require('tape');
const sinon = require('sinon');

const playerStatus = require('../../../poker-engine/domain/player-status');

const sut = require('../../../poker-engine/domain-utils/reset-gamestate');



tape('reset-gamestate', t => t.end());

tape('setup initial conditions for a new hand', function(t) {

  const gamestate = {
    pot: 300,
    sidepots: [{
      quote: 50,
      amount: 150
    }, {
      quote: 75,
      amount: 150
    }],
    callAmount: 50,
    commonCards: [{
      rank: 'K',
      type: 'C'
    }, {
      rank: '9',
      type: 'D'
    }, {
      rank: 'A',
      type: 'S'
    }],
    players: [{
      name: 'arale',
      status: playerStatus.out,
      chipsBet: 0
    }, {
      name: 'bender',
      status: playerStatus.folded,
      chipsBet: 50,
      cards: [{
        rank: '5',
        type: 'D'
      }, {
        rank: '4',
        type: 'S'
      }],
      bestCombination: [{
        rank: '5',
        type: 'D'
      }, {
        rank: '4',
        type: 'S'
      }, {
        rank: 'K',
        type: 'C'
      }, {
        rank: '9',
        type: 'D'
      }, {
        rank: 'A',
        type: 'S'
      }],
      bestCombinationData: {
        strength: 64,
        rank: 'A',
        kickers: ['2']
      }
    }, {
      name: 'marvin',
      status: playerStatus.active,
      [Symbol.for('is-all-in')]: true
    }]
  };


  sut(gamestate);

  t.strictEqual(gamestate.pot, 0);
  t.strictEqual(gamestate.callAmount, 0);
  t.strictEqual(gamestate.commonCards.length, 0);
  t.strictEqual(gamestate.sidepots.length, 0);

  const arale = gamestate.players.find(x => x.name == 'arale');

  t.strictEqual(arale.status, playerStatus.out);


  const bender = gamestate.players.find(x => x.name == 'bender');

  t.strictEqual(bender.chipsBet, 0);
  t.strictEqual(bender.status, playerStatus.active);
  t.strictEqual(bender.cards.length, 0);
  t.strictEqual(bender.bestCombination.length, 0);
  t.strictEqual(bender.bestCombinationData, null);


  const marvin = gamestate.players.find(x => x.name == 'marvin');

  t.strictEqual(marvin[Symbol.for('is-all-in')], undefined);

  t.end();
});
