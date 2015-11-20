
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
    // make sure the dealer button reached a player
    // who wasn't eliminated (player.status == status.out)
    newDB = getNext(currDB, gamestate.players.length);
    currDB = newDB;
  } while(gamestate.players[newDB].status != status.active);

  gamestate.players[newDB][hasDB] = true;

};
