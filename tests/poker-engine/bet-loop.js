
'use strict';

const tape = require('tape');
const sinon = require('sinon');

const request = require('request');

const run = require('../test-utils/generator-runner');
const promisify = require('../test-utils/promisify');
const enhance = require('../test-utils/enhance-gamestate');

const playerStatus = require('../../poker-engine/domain/player-status');
const createPlayer = require('../../poker-engine/domain-utils/player-factory');

function createPlayerByName(name){
  return createPlayer({ name: name, id: `${name}ID`, serviceUrl: `https://${name}.com` });
}

const sut = require('../../poker-engine/bet-loop');

const engine = require('../../index');

engine.on('gamestate:updated', onGamestateUpdated);

function onGamestateUpdated(data, res) {
  res();
}


const allin_ = Symbol.for('is-all-in');
const hasBB_ = Symbol.for('has-big-blind');
const hasDB_ = Symbol.for('has-dealer-button');
const hasTalked_ = Symbol.for('has-talked');
const deck_ = Symbol.for('cards-deck');

function noop() {}
function createFakePlayer(name, talk){
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

  t.ok(result.done);

  t.end();
});



tape('preflop - check betting session starts from player next to big blind', function(t){

  const gamestate = {
    [deck_]: [1,2,3,4,5,6].concat(new Array(46).fill('x')),
    pot: 0,
    sidepots: [],
    commonCards: [],
    callAmount: 0
  };

  const talkSpy = sinon.spy();

  function talk(gs){
    if(gs.commonCards.length >= 3)
      throw new Error('I want to test only pre-flop');

    talkSpy(this.name);
    return gs.callAmount;
  }


  const players = ['arale', 'bender', 'marvin', 'wall-e']
    .map(function(name) {
      const player = createPlayerByName(name);
      player.talk = promisify(talk, player, gamestate);
      return player;
    });

  players[0][hasDB_] = true;
  players[2][hasBB_] = true;


  gamestate.players = players;

  run(sut, enhance(gamestate))
    .catch(function(err) {
      t.equal(err.message, 'I want to test only pre-flop');
      t.equal(talkSpy.callCount, 4);
      t.deepEqual(talkSpy.args.map(args => args[0]), ['wall-e', 'arale', 'bender', 'marvin']);
      t.end();
    });

});

tape('postflop - check betting session starts from player next to dealer button', function(t){

  const gamestate = {
    [deck_]: [4,5,6].concat(new Array(49).fill('x')),
    pot: 0,
    sidepots: [],
    commonCards: [1,2,3],
    callAmount: 0
  };

  const talkSpy = sinon.spy();

  function talk(gs){
    talkSpy(this.name);
  }

  const players = ['arale', 'bender', 'marvin', 'wall-e']
    .map(function(name) {
      const player = createPlayerByName(name);
      player.talk = promisify(talk, player, gamestate);
      return player;
    });

  players[0][hasDB_] = true;
  players[2][hasBB_] = true;

  gamestate.players = players;

  run(sut, enhance(gamestate))
    .then(function() {
      t.equal(talkSpy.callCount, 12);
      const expectedOrder = ['bender', 'marvin', 'wall-e', 'arale'];
      t.deepEqual(talkSpy.args.map(args => args[0]), expectedOrder.concat(expectedOrder, expectedOrder));
      t.end();
    });

});



tape('preflop betting session closes in a single round', function(t){

  const gamestate = {
    [deck_]: new Array(52).fill('x'),
    pot: 0,
    sidepots: [],
    commonCards: [],
    callAmount: 50
  };

  const talkSpy = sinon.spy();

  function talk(gs){
    if(gs.commonCards.length >= 3)
      throw new Error('I want to test only pre-flop');

    talkSpy(gs.spinCount);
    return gs.callAmount;
  }

  const players = ['arale', 'bender', 'marvin', 'wall-e']
    .map(function(name) {
      const player = createPlayerByName(name);
      player.talk = promisify(talk, player, gamestate);
      return player;
    });

  players[1][hasDB_] = true;
  players[3][hasBB_] = true;

  gamestate.players = players;

  run(sut, enhance(gamestate))
    .catch(function(err) {
      t.equal(err.message, 'I want to test only pre-flop');
      t.equal(talkSpy.callCount, 4);
      t.ok(talkSpy.alwaysCalledWith(0));
      t.end();
    });

});

tape('preflop betting session in single round cause player is allin', function(t){

  const gamestate = {
    [deck_]: new Array(52).fill('x'),
    pot: 0,
    sidepots: [],
    commonCards: [],
    callAmount: 50
  };

  const talkSpy = sinon.spy();

  function talk(gs){
    if(gs.commonCards.length >= 3)
      throw new Error('I want to test only pre-flop');

    talkSpy(gs.spinCount);

    if (this.name == 'bender' && gs.spinCount == 0)
      return gs.callAmount * 2;

    return gs.callAmount;
  }

  const players = ['arale', 'bender', 'marvin', 'wall-e']
    .map(function(name) {
      const player = createPlayerByName(name);
      player.talk = promisify(talk, player, gamestate);
      return player;
    });

  players[0][allin_] = true;
  players[1][hasDB_] = true;
  players[3][hasBB_] = true;

  gamestate.players = players;

  run(sut, enhance(gamestate))
    .catch(function(err) {
      t.equal(err.message, 'I want to test only pre-flop');
      t.equal(talkSpy.callCount, 3);
      t.ok(talkSpy.alwaysCalledWith(0));
      t.end();
    });

});

tape('preflop betting session on multiple round', function(t){

  const gamestate = {
    [deck_]: new Array(52).fill('x'),
    pot: 30,
    sb: 10,
    sidepots: [],
    commonCards: [],
    callAmount: 50
  };

  const talkSpy = sinon.spy();

  function talk(gs){
    if(gs.commonCards.length >= 3)
      throw new Error('I want to test only pre-flop');

    talkSpy(gs.spinCount);

    if (this.name == 'bender' && gs.spinCount == 0)
      return gs.callAmount * 2;

    return Math.max(gs.callAmount - this.chipsBet, 0);
  }

  const players = ['arale', 'bender', 'marvin', 'wall-e']
    .map(function(name) {
      const player = createPlayerByName(name);
      player.talk = promisify(talk, player, gamestate);
      return player;
    });

  players[1][hasDB_] = true;
  players[3][hasBB_] = true;

  gamestate.players = players;

  run(sut, enhance(gamestate))
    .catch(function(err) {
      t.equal(err.message, 'I want to test only pre-flop');
      t.equal(talkSpy.callCount, 5);
      t.deepEqual(talkSpy.args.map(x => x[0]), [0, 0, 0, 0, 1]);
      t.end();
    });

});



tape('the bet loop should terminate', function(t){

  t.comment('when the player who act before the last raiser player folds/calls the raise');

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

  const gamestate = {
    [deck_]: [4,5,6].concat(new Array(49).fill('x')),
    sidepots: [],
    pot: 0,
    commonCards: [1,2,3],
    callAmount: 0,
    sb: 5
  };

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


  function marvinTalk(gs){
    thrower(gs);
    const betAmount = Math.max(gs.callAmount - this.chipsBet, 0);
    fireSpy('marvin', betAmount, marvinTalkSpy);
    return betAmount;
  }

  function walleTalk(gs){
    thrower(gs);
    const betAmount = 20;
    fireSpy('walle', betAmount, walleTalkSpy);
    return betAmount;
  }

  function benderTalk(gs){
    thrower(gs);
    const betAmount = Math.max(gs.callAmount - this.chipsBet, 0);
    fireSpy('bender', betAmount, benderTalkSpy);
    return betAmount;
  }


  const arale = createPlayerByName('arale');
  arale.status = playerStatus.folded;
  arale.talk = araleTalkSpy;

  const bender = createPlayerByName('bender');
  bender[hasDB_] = true;
  bender.talk = promisify(benderTalk, bender, gamestate);

  const marvin = createPlayerByName('marvin');
  marvin.talk = promisify(marvinTalk, marvin, gamestate);

  const walle = createPlayerByName('walle');
  walle[hasBB_] = true;
  walle.talk = promisify(walleTalk, walle, gamestate);

  gamestate.players = [arale, bender, marvin, walle];

  run(sut, enhance(gamestate))
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


tape('the bet loop shouldnt terminate', function(t){

  t.comment('when the player who act before the last raiser player folds/calls the raise, if there are still active (and not all-in) players who have bet less than the minimum call amount.');

  // Recap
  // 4 active players.
  // arale, bender, marvin, walle.
  // bender has the dealer button.

  // post flop.
  // first to bet is marvin, who bets 20.
  // walle calls.

  // arale goes all in with 30.
  // * this is not a full raise; so the bet is accepted but lastRaiserId does not change.

  // bender calls.
  // marvin should only be able to fold/call betting 10.
  // walle should only be able to fold/call betting 10.

  const gamestate = {
    [deck_]: [4,5,6].concat(new Array(49).fill('x')),
    pot: 0,
    sidepots: 0,
    commonCards: [1,2,3],
    callAmount: 0,
    sb: 5
  };

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


  function marvinTalk(gs){
    thrower(gs);
    let betAmount;
    if (gs.spinCount === 0){
      betAmount = 20;
    }
    else if (gs.spinCount === 1){
      betAmount = Math.max(gs.callAmount - this.chipsBet, 0);
    }
    else {
      throw new Error('gs.spinCount is not expected to be greater than 1 in this hand.');
    }
    fireSpy('marvin', betAmount, marvinTalkSpy);
    return betAmount;
  }

  function walleTalk(gs){
    thrower(gs);
    const betAmount = Math.max(gs.callAmount - this.chipsBet, 0);
    fireSpy('walle', betAmount, walleTalkSpy);
    return betAmount;
  }

  function araleTalk(gs){
    thrower(gs);
    const betAmount = 30;
    fireSpy('arale', betAmount, araleTalkSpy);
    return betAmount;
  }

  function benderTalk(gs){
    thrower(gs);
    const betAmount = Math.max(gs.callAmount - this.chipsBet, 0);
    fireSpy('bender', betAmount, benderTalkSpy);
    return betAmount;
  }

  const arale = createPlayerByName('arale');
  arale.chips = 30;
  arale.talk = promisify(araleTalk, arale, gamestate);

  const bender = createPlayerByName('bender');
  bender.talk = promisify(benderTalk, bender, gamestate);
  bender[hasDB_] = true;

  const marvin = createPlayerByName('marvin');
  marvin.talk = promisify(marvinTalk, marvin, gamestate);

  const walle = createPlayerByName('walle');
  walle.talk = promisify(walleTalk, walle, gamestate);
  walle[hasBB_] = true;

  gamestate.players = [arale, bender, marvin, walle];

  run(sut, enhance(gamestate))
    .catch(function(err) {

      t.equal(err.message, 'I want to test only post-flop');

      t.ok(araleTalkSpy.calledOnce);
      t.ok(benderTalkSpy.calledOnce);
      t.ok(marvinTalkSpy.calledTwice);
      t.ok(walleTalkSpy.calledTwice);

      t.ok(betFlowSpy.getCall(0).calledWith('marvin', 20));
      t.ok(betFlowSpy.getCall(1).calledWith('walle', 20));
      t.ok(betFlowSpy.getCall(2).calledWith('arale', 30));
      t.ok(betFlowSpy.getCall(3).calledWith('bender', 30));
      t.ok(betFlowSpy.getCall(4).calledWith('marvin', 10));
      t.ok(betFlowSpy.getCall(5).calledWith('walle', 10));
      t.equal(betFlowSpy.callCount, 6);

      t.end();
    });

});

tape('the bet loop shouldnt terminate', function(t){

  t.comment('when the player who act before the last raiser player re-raise');

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

  const gamestate = {
    [deck_]: [4,5,6].concat(new Array(49).fill('x')),
    pot: 0,
    sidepots: 0,
    commonCards: [1,2,3],
    callAmount: 0,
    sb: 5
  };


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


  function marvinTalk(gs){
    thrower(gs);
    let betAmount;
    if (gs.spinCount === 0){
      betAmount = Math.max(gs.callAmount - this.chipsBet, 0);
    }
    else if (gs.spinCount === 1){
      betAmount = 100;
    }
    else {
      throw new Error('gs.spinCount is not expected to be greater than 1 in this hand.');
    }
    fireSpy('marvin', betAmount, marvinTalkSpy);
    return betAmount;
  }

  function walleTalk(gs){
    thrower(gs);
    let betAmount;
    if (gs.spinCount === 0){
      betAmount = 20;
    }
    else if (gs.spinCount === 1){
      betAmount = Math.max(gs.callAmount - this.chipsBet, 0);
    }
    else {
      throw new Error('gs.spinCount is not expected to be greater than 1 in this hand.');
    }
    fireSpy('walle', betAmount, walleTalkSpy);
    return betAmount;
  }

  function benderTalk(gs){
    thrower(gs);
    const betAmount = Math.max(gs.callAmount - this.chipsBet, 0);
    fireSpy('bender', betAmount, benderTalkSpy);
    return betAmount;
  }

  const arale = createPlayerByName('arale');
  arale.talk = araleTalkSpy;
  arale.status = playerStatus.folded;

  const bender = createPlayerByName('bender');
  bender.talk = promisify(benderTalk, bender, gamestate);
  bender[hasDB_] = true;

  const marvin = createPlayerByName('marvin');
  marvin.talk = promisify(marvinTalk, marvin, gamestate);

  const walle = createPlayerByName('walle', walleTalk);
  walle.talk = promisify(walleTalk, walle, gamestate);
  walle[hasBB_] = true;


  gamestate.players = [arale, bender, marvin, walle];

  run(sut, enhance(gamestate))
    .catch(function(err) {

      t.equal(err.message, 'I want to test only post-flop');

      t.ok(araleTalkSpy.notCalled);
      t.ok(benderTalkSpy.calledTwice);
      t.ok(marvinTalkSpy.calledTwice);
      t.ok(walleTalkSpy.calledTwice);

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

  const gamestate = {
    [deck_]: [1,2,3,4,5,6].concat(new Array(46).fill('x')),
    commonCards: [],
    sidepots: [],
    pot: 0,
    callAmount: 20
  };

  const talkSpy = sinon.spy();
  const cardUpdateSpy = sinon.spy();

  function talk(gs){
    talkSpy(gs);
    return gs.callAmount;
  }

  const players = ['arale', 'bender', 'marvin', 'wall-e']
    .map(function(name) {
      const player = createPlayerByName(name);
      player.talk = promisify(talk, player, gamestate);
      return player;
    });

  players[1][hasDB_] = true;
  players[3][hasBB_] = true;

  gamestate.players = players;


  engine.removeListener('gamestate:updated', onGamestateUpdated);
  engine.on('gamestate:updated', onGamestateUpdatedCustom);

  function onGamestateUpdatedCustom(data, res){
    if(data.type === 'cards'){
      cardUpdateSpy(data.type, data.session, data.commonCards.slice(0));
    }
    res();
  }

  run(sut, enhance(gamestate))
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
