
'use strict';

const run = require('./generator-runner');

const getNext = require('./get-nextplayer-index');

const passed = Symbol('passed');

function* eachFrom(players, startIndex, fn){

  let i = getNext(startIndex, players.length);
  let player;

  while (player = players[i], !player[passed]){

    yield fn.call(player, player, i);

    player[passed] = true;
    i = getNext(i, players.length);

  }

  players.forEach(player => delete(player[passed]));

}


exports = module.exports = function(players, startIndex, fn) {

  return run(eachFrom, players, startIndex, fn);

}
