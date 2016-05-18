
'use strict';

const tape = require('tape');
const sinon = require('sinon');

const run = require('../test-utils/generator-runner');

const saveStub = require('../../storage/storage').save;


const playerStatus = require('../../poker-engine/domain/player-status');
const sut = require('../../poker-engine/bet-loop');

const engine = require('../../index');

function onGamestateUpdated(data, res) {
  res();
}
engine.on('gamestate:updated', onGamestateUpdated);

const allin_ = Symbol.for('is-all-in');
const hasBB_ = Symbol.for('has-big-blind');
const hasDB_ = Symbol.for('has-dealer-button');
const deck_ = Symbol.for('cards-deck');

function noop() {}

function createPlayer(name, talk){
  return {
    status: 'active',
    id: name+'ID',
    name: name,
    chipsBet: 0,
    talk: function(gs){
      return new Promise((res) => { talk.call(this, gs); res(); });
    },
    payBet: noop
  };
}


tape('bet-loop', t => t.end());

tape('when there is only one active player the bet session is finished', function(t){

  const gamestate = { commonCards: [], activePlayers: [{ name: 'arale' }] };
  const iter = sut(gamestate);

  const result = iter.next();

  t.ok(result.done)

  t.end();
});



tape('preflop - check betting session starts from player next to big blind', function(t){

  const talkSpy = sinon.spy();

  function talk(gs){
    if(gs.commonCards.length >= 3)
      throw new Error('I want to test only pre-flop');

    talkSpy(this.name);
  }

  const players = ['arale', 'bender', 'marvin', 'wall-e'].map(player => createPlayer(player, talk));

  players[0][hasDB_] = true;
  players[2][hasBB_] = true;

  const gamestate = {
    [deck_]: [1,2,3,4,5,6].concat(new Array(46).fill('x')),
    players: players,
    activePlayers: players,
    commonCards: [],
    callAmount: 0
  };

  run(sut, gamestate)
    .catch(function(err) {
      t.equal(err.message, 'I want to test only pre-flop');
      t.equal(talkSpy.callCount, 4);
      t.deepEqual(talkSpy.args.map(args => args[0]), ['wall-e', 'arale', 'bender', 'marvin']);
      t.end();
    });

});

tape('postflop - check betting session starts from player next to dealer button', function(t){

  const talkSpy = sinon.spy();

  function talk(gs){
    talkSpy(this.name);
  }

  const players = ['arale', 'bender', 'marvin', 'wall-e'].map(player => createPlayer(player, talk));

  players[0][hasDB_] = true;
  players[2][hasBB_] = true;

  const gamestate = {
    [deck_]: [4,5,6].concat(new Array(49).fill('x')),
    players: players,
    activePlayers: players,
    commonCards: [1,2,3],
    callAmount: 0
  };

  run(sut, gamestate)
    .then(function() {
      t.equal(talkSpy.callCount, 12);
      const expectedOrder = ['bender', 'marvin', 'wall-e', 'arale'];
      t.deepEqual(talkSpy.args.map(args => args[0]), expectedOrder.concat(expectedOrder, expectedOrder));
      t.end();
    });

});



tape('preflop betting session closes in a single round', function(t){

  const talkSpy = sinon.spy();

  function talk(gs){
    if(gs.commonCards.length >= 3)
      throw new Error('I want to test only pre-flop');

    talkSpy(gs);
    this.chipsBet += gs.callAmount;
  }

  const players = ['arale', 'bender', 'marvin', 'wall-e'].map(player => createPlayer(player, talk));

  players[1][hasDB_] = true;
  players[3][hasBB_] = true;

  const gamestate = {
    [deck_]: new Array(52).fill('x'),
    players: players,
    activePlayers: players,
    commonCards: [],
    callAmount: 50
  };

  run(sut, gamestate)
    .catch(function(err) {
      t.equal(err.message, 'I want to test only pre-flop');
      t.equal(talkSpy.callCount, 4);
      talkSpy.args.forEach((args) => t.equal(args[0].spinCount, 0));
      t.end();
    });

});

tape('preflop betting session in single round cause player is allin', function(t){

  const talkSpy = sinon.spy();

  function talk(gs){
    if(gs.commonCards.length >= 3)
      throw new Error('I want to test only pre-flop');

    talkSpy(gs.spinCount);

    if (this.name == 'bender' && gs.spinCount == 0)
      gs.callAmount *= 2;

    this.chipsBet += gs.callAmount;
  }

  const players = ['arale', 'bender', 'marvin', 'wall-e'].map(player => createPlayer(player, talk));

  players[0][allin_] = true;
  players[1][hasDB_] = true;
  players[3][hasBB_] = true;

  const gamestate = {
    [deck_]: new Array(52).fill('x'),
    players: players,
    activePlayers: players,
    commonCards: [],
    callAmount: 50
  };

  run(sut, gamestate)
    .catch(function(err) {
      t.equal(err.message, 'I want to test only pre-flop');
      t.equal(talkSpy.callCount, 3);
      t.ok(talkSpy.alwaysCalledWith(0));
      t.end();
    });

});

tape('preflop betting session on multiple round', function(t){

  const talkSpy = sinon.spy();

  function talk(gs){
    if(gs.commonCards.length >= 3)
      throw new Error('I want to test only pre-flop');

    talkSpy(gs.spinCount);

    if (this.name == 'bender' && gs.spinCount == 0)
      gs.callAmount *= 2;

    this.chipsBet += gs.callAmount;
  }

  const players = ['arale', 'bender', 'marvin', 'wall-e'].map(player => createPlayer(player, talk));

  players[1][hasDB_] = true;
  players[3][hasBB_] = true;

  const gamestate = {
    [deck_]: new Array(52).fill('x'),
    players: players,
    activePlayers: players,
    commonCards: [],
    callAmount: 50
  };

  run(sut, gamestate)
    .catch(function(err) {
      t.equal(err.message, 'I want to test only pre-flop');
      t.equal(talkSpy.callCount, 8);
      t.deepEqual(talkSpy.args.map(x => x[0]), [0, 0, 0, 0, 1, 1, 1, 1]);
      t.end();
    });

});












tape('When the player who act before the last raiser player folds/calls the raise, the bet loop should terminate', function(t){

  // Recap
  // 4 players.
  // arale, bender, marvin, walle.
  // bender has the dealer button.
  // arale has folded preflop.
  // post flop.
  // first to bet is marvin, who checks.
  // walle raise 20.
  // arale is skipped cause is out of this hand, and bender calls 20.

  // if marvin folds, or calls 20 the betting loops should terminate immediately.

  const araleTalkSpy = sinon.spy();
  const benderTalkSpy = sinon.spy();
  const marvinTalkSpy = sinon.spy();
  const walleTalkSpy = sinon.spy();
  const betFlowSpy = sinon.spy();

  function thrower(gs) {
    if(gs.commonCards.length >= 4)
      throw new Error('I want to test only post-flop');
  }

  function fireSpy(name, amount, playerSpy){
    betFlowSpy(name, amount);
    playerSpy(amount);
  }

  function setChipsBet(gs, name, amount){
    const player = gs.players.find(player => player.name == name);
    player.chipsBet += amount;
    gs.callAmount = Math.max(player.chipsBet, gs.callAmount);
  }

  function getChipsBet(players, name){
    return players.find(player => player.name == name).chipsBet;
  }

  function benderTalk(gs){
    thrower(gs);
    const chipsBet = getChipsBet(gs.players, 'bender');
    const betAmount = Math.max(gs.callAmount - chipsBet, 0);
    setChipsBet(gs, 'bender', betAmount);
    fireSpy('bender', betAmount, benderTalkSpy);
  }

  function marvinTalk(gs){
    thrower(gs);
    const chipsBet = getChipsBet(gs.players, 'marvin');
    const betAmount = Math.max(gs.callAmount - chipsBet, 0);
    setChipsBet(gs, 'marvin', betAmount);
    fireSpy('marvin', betAmount, marvinTalkSpy);
  }

  function walleTalk(gs){
    thrower(gs);
    gs.lastRaiserId = 'walleID'
    const betAmount = gs.minimumRaiseAmount()*2;
    setChipsBet(gs, 'walle', betAmount);
    fireSpy('walle', betAmount, walleTalkSpy);
  }


  const arale = createPlayer('arale', araleTalkSpy);
  arale.status = playerStatus.folded;

  const bender = createPlayer('bender', benderTalk);
  bender[hasDB_] = true;

  const marvin = createPlayer('marvin', marvinTalk);
  const walle = createPlayer('walle', walleTalk);
  walle[hasBB_] = true;

  const gamestate = {
    [deck_]: [4,5,6].concat(new Array(49).fill('x')),
    players: [arale, bender, marvin, walle],
    activePlayers: [bender, marvin, walle],
    commonCards: [1,2,3],
    callAmount: 0,
    minimumRaiseAmount: function() {
      return this.callAmount + 2 * this.sb
    },
    sb: 5
  };

  run(sut, gamestate)
    .catch(function(err) {

      t.equal(err.message, 'I want to test only post-flop');

      t.ok(araleTalkSpy.notCalled);
      t.ok(benderTalkSpy.calledOnce);
      t.ok(marvinTalkSpy.calledTwice);
      t.ok(walleTalkSpy.calledOnce);

      t.ok(betFlowSpy.getCall(0).calledWith('marvin', 0));
      t.ok(betFlowSpy.getCall(1).calledWith('walle', 20));
      t.ok(betFlowSpy.getCall(2).calledWith('bender', 20));
      t.ok(betFlowSpy.getCall(3).calledWith('marvin', 20));
      t.equal(betFlowSpy.callCount, 4);

      t.end();
    });

});



tape('...', function(t){

  // Recap
  // 4 players.
  // arale, bender, marvin, walle.
  // bender has the dealer button.
  // arale has folded preflop.
  // post flop.
  // first to bet is marvin, who checks.
  // walle raise 20.
  // arale is skipped cause is out of this hand, and bender calls 20.
  // marvin raise to 100 (raise amount is 80);
  // walle calls by betting 80.
  // when bender bets 80 too, the betting loop ends.


  const araleTalkSpy = sinon.spy();
  const benderTalkSpy = sinon.spy();
  const marvinTalkSpy = sinon.spy();
  const walleTalkSpy = sinon.spy();
  const betFlowSpy = sinon.spy();

  function thrower(gs) {
    if(gs.commonCards.length >= 4)
      throw new Error('I want to test only post-flop');
  }

  function fireSpy(name, amount, playerSpy){
    betFlowSpy(name, amount);
    playerSpy(amount);
  }

  function setChipsBet(gs, name, amount){
    const player = gs.players.find(player => player.name == name);
    player.chipsBet += amount;
    gs.callAmount = Math.max(player.chipsBet, gs.callAmount);
  }

  function getChipsBet(players, name){
    return players.find(player => player.name == name).chipsBet;
  }

  function benderTalk(gs){
    thrower(gs);
    const chipsBet = getChipsBet(gs.players, 'bender');
    const betAmount = Math.max(gs.callAmount - chipsBet, 0);
    setChipsBet(gs, 'bender', betAmount);
    fireSpy('bender', betAmount, benderTalkSpy);
  }

  function marvinTalk(gs){
    thrower(gs);
    const chipsBet = getChipsBet(gs.players, 'marvin');
    // TODO bruno: betAmount should change on the basis of the spinCount (?)
    // const betAmount = Math.max(gs.callAmount - chipsBet, 0);
    setChipsBet(gs, 'marvin', betAmount);
    fireSpy('marvin', betAmount, marvinTalkSpy);
  }

  function walleTalk(gs){
    thrower(gs);
    gs.lastRaiserId = 'walleID'
    // TODO bruno: betAmount should change on the basis of the spinCount (?)
    // const betAmount = gs.minimumRaiseAmount()*2;
    setChipsBet(gs, 'walle', betAmount);
    fireSpy('walle', betAmount, walleTalkSpy);
  }


  const arale = createPlayer('arale', araleTalkSpy);
  arale.status = playerStatus.folded;

  const bender = createPlayer('bender', benderTalk);
  bender[hasDB_] = true;

  const marvin = createPlayer('marvin', marvinTalk);
  const walle = createPlayer('walle', walleTalk);
  walle[hasBB_] = true;

  const gamestate = {
    [deck_]: [4,5,6].concat(new Array(49).fill('x')),
    players: [arale, bender, marvin, walle],
    activePlayers: [bender, marvin, walle],
    commonCards: [1,2,3],
    callAmount: 0,
    minimumRaiseAmount: function() {
      return this.callAmount + 2 * this.sb
    },
    sb: 5
  };

  run(sut, gamestate)
    .catch(function(err) {

      t.equal(err.message, 'I want to test only post-flop');

      t.ok(araleTalkSpy.notCalled);
      t.ok(benderTalkSpy.calledOnce);
      t.ok(marvinTalkSpy.calledTwice);
      t.ok(walleTalkSpy.calledOnce);

      t.ok(betFlowSpy.getCall(0).calledWith('marvin', 0));
      t.ok(betFlowSpy.getCall(1).calledWith('walle', 20));
      t.ok(betFlowSpy.getCall(2).calledWith('bender', 20));
      t.ok(betFlowSpy.getCall(3).calledWith('marvin', 100));
      t.ok(betFlowSpy.getCall(4).calledWith('walle', 80));
      t.ok(betFlowSpy.getCall(5).calledWith('bender', 80));
      t.equal(betFlowSpy.callCount, 6);

      t.end();
    });

});














tape('check community cards distribution', function(t){

  const talkSpy = sinon.spy();
  const cardUpdateSpy = sinon.spy();

  function talk(gs){
    talkSpy(gs);
    this.chipsBet += gs.callAmount;
  }

  const players = ['arale', 'bender', 'marvin', 'wall-e'].map(player => createPlayer(player, talk));

  players[1][hasDB_] = true;
  players[3][hasBB_] = true;

  const gamestate = {
    [deck_]: [1,2,3,4,5,6].concat(new Array(46).fill('x')),
    players: players,
    activePlayers: players,
    commonCards: [],
    callAmount: 50
  };

  engine.removeListener('gamestate:updated', onGamestateUpdated);
  engine.on('gamestate:updated', onGamestateUpdatedCustom);

  function onGamestateUpdatedCustom(data, res){
    cardUpdateSpy(data.type, data.session, data.commonCards.slice(0));
    res();
  }

  run(sut, gamestate)
    .then(function() {
      t.equal(talkSpy.callCount, 16);
      t.equal(cardUpdateSpy.callCount, 3);
      t.ok(cardUpdateSpy.getCall(0).calledWith('cards', 'flop', [1,2,3]));
      t.ok(cardUpdateSpy.getCall(1).calledWith('cards', 'turn', [4]));
      t.ok(cardUpdateSpy.getCall(2).calledWith('cards', 'river', [5]));

      engine.removeListener('gamestate:updated', onGamestateUpdatedCustom);
      t.end();
    });

});
