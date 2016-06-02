
'use strict';

const tape = require('tape');
const tcase = require('tape-case');
const sinon = require('sinon');

const playerStatus = require('../../../poker-engine/domain/player-status');
const enhance = require('../../test-utils/enhance-gamestate');

const sut = require('../../../poker-engine/domain-utils/assign-dealer-button');



const hasDB = Symbol.for('has-dealer-button');

tape('assign-dealer-button', t => t.end());


tape('only one player can have dealer button', function(t){

  const gs = enhance({
    handProgressiveId: 1,
    gameProgressiveId: 2,
    players: [{
      name: 'arale'
    }, {
      name: 'bender'
    }, {
      name: 'marvin',
      [hasDB]: true
    }, {
      name: 'wall-e'
    }]
  });

  sut(gs);

  const dbPlayer = gs.players.filter(player => player[hasDB]);

  t.equal(dbPlayer.length, 1);
  t.equal(dbPlayer[0].name, 'bender');

  t.end();
});


tcase([
  { description: 'handId=1, dealer button index changes on the basis of the gameId', args: [ 1 ] },
  { args: [ 2 ] },
  { args: [ 3 ] },
  { args: [ 4 ] },
  { args: [ 5 ] }
], function(gameId) {

  const gs = enhance({
    handProgressiveId: 1,
    gameProgressiveId: gameId,
    players: [{
      name: 'arale'
    }, {
      name: 'bender'
    }, {
      name: 'marvin'
    }, {
      name: 'wall-e'
    }]
  });

  sut(gs);

  const dbi = gs.initialDealerButtonIndex;
  const dbr = gs.dealerButtonRound;

  return dbr === 0 && dbi === (gameId-1)%4 && gs.players[dbi][hasDB];

});


(function() {

  const gamestate = enhance({
    gameProgressiveId: 1,
    handProgressiveId: 1,
    players: [{
      id: 0,
      name: 'arale',
      status: playerStatus.active
    }, {
      id: 1,
      name: 'bender',
      status: playerStatus.active
    }, {
      id: 2,
      name: 'marvin',
      status: playerStatus.active
    }, {
      id: 3,
      name: 'wall-e',
      status: playerStatus.active
    }]
  });

  tcase([
    { description: 'handId=1, real loop', args: [ gamestate ] },
    { args: [ gamestate ] },
    { args: [ gamestate ] },
    { args: [ gamestate ] },
    { args: [ gamestate ] },
    { args: [ gamestate ] }
  ], function(gs) {

    sut(gs);

    const caseIndex = gs.handProgressiveId;
    const player = gs.players.find(player => player[hasDB]);


    gs.handProgressiveId++;

    const dbi = gs.initialDealerButtonIndex;
    const dbr = gs.dealerButtonRound;

    return dbi === 0 && player.id === (caseIndex-1)%4 && dbr === (caseIndex <= 4 ? 0 : 1);

  });

}());


(function() {

  const gamestate = enhance({
    gameProgressiveId: 2,
    handProgressiveId: 1,
    players: [{
      id: 0,
      name: 'arale',
      status: playerStatus.active
    }, {
      id: 1,
      name: 'bender',
      status: playerStatus.active
    }, {
      id: 2,
      name: 'marvin',
      status: playerStatus.out
    }, {
      id: 3,
      name: 'wall-e',
      status: playerStatus.active
    }]
  });

  const expectedDealerButtonId = [1,3,1,3,1,3];

  tcase([
    { description: 'handId=1, real loop, with out players', args: [ gamestate ] },
    { args: [ gamestate ] },
    { args: [ gamestate ] },
    { args: [ gamestate ] },
    { args: [ gamestate ] },
    { args: [ gamestate ] }
  ], function(gs) {

    if (gs.handProgressiveId === 2){
      gs.players[0].status = playerStatus.out;
    }

    sut(gs);

    const caseIndex = gs.handProgressiveId;
    const player = gs.players.find(player => player[hasDB]);

    gs.handProgressiveId++;

    const dbi = gs.initialDealerButtonIndex;
    const dbr = gs.dealerButtonRound;


    function getRound(val){
      if (val <= 1){
        return 0;
      }
      if (val <= 3){
        return 1;
      }
      return 2;
    }

    return dbi === 1 && player.id === expectedDealerButtonId[caseIndex-1] && dbr === getRound(caseIndex-1);

  });

}());
