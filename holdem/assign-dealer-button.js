
'use strict';

const status = require('../domain/player-status');
const getNext = require('../lib/get-nextplayer-index');

exports = module.exports = function assignDB(gamestate){

  let hasDB = Symbol.for('hasDB');

  let currDB = gamestate.players.findIndex(player => player[hasDB]);

  if (currDB >= 0){
    gamestate.players[currDB][hasDB] = false;
  }

  let newDB;

  do {
    // ...
    newDB = getNext(currDB, gamestate.players.length);
    currDB = newDB;
  } while(gamestate.players[newDB].status == status.out);

  gamestate.players[newDB][hasDB] = true;

};
