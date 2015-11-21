
'use strict';

const status = require('../domain/player-status');
const getNextActive = require('../lib/get-next-active-player-index');
const getDB = require('../lib/get-dealerbutton-index');

exports = module.exports = function assignDB(gamestate){

  let hasDB = Symbol.for('hasDB');
  let currDB = getDB(gamestate.players);

  if (currDB >= 0){
    gamestate.players[currDB][hasDB] = false;
  }

  let newDB = getNextActive(gamestate.players, currDB);

  gamestate.players[newDB][hasDB] = true;

};
