
'use strict';

const run = require('./generator-runner');


const passed = Symbol('passed');

function* eachFromDB(players, fn){

  let i = players.findIndex(player => player.hasDB);
  let player;

  while (player = players[i], !player[passed]){

    yield fn.call(player, player, i);

    player[passed] = true;
    i = i >= players.length-1 ? (i+1)%players.length : i+1;

  }

  players.forEach(player => delete(player[passed]));

}


exports = module.exports = function(players, fn) {

  return run(eachFromDB, players, fn);

}
