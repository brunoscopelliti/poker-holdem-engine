
'use strict';

const run = require('./generator-runner');

const getNext = require('./get-nextplayer-index');

const passed = Symbol('passed');
const hasBB = Symbol.for('hasBB');

function* eachFromBB(players, fn){

  let bbIndex = players.findIndex(player => player[hasBB]);

  let i = getNext(bbIndex, players.length);
  let player;

  while (player = players[i], !player[passed]){

    yield fn.call(player, player, i);

    player[passed] = true;
    i = getNext(i, players.length);

  }

  players.forEach(player => delete(player[passed]));

}


exports = module.exports = function(players, fn) {

  return run(eachFromBB, players, fn);

}
