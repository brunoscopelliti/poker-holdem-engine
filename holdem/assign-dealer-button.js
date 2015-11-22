
'use strict';

const getNextActive = require('../lib/get-next-active-player-index');
const getDB = require('../lib/get-dealerbutton-index');

exports = module.exports = function assignDB(gs){

  let hasDB = Symbol.for('hasDB');
  let currDB = getDB(gs.players);

  if (currDB >= 0){
    gs.players[currDB][hasDB] = false;
  }

  let newDB = getNextActive(gs.players, currDB);

  gs.players[newDB][hasDB] = true;

};
