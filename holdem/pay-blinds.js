
'use strict';

const getDB = require('../lib/get-dealerbutton-index');
const getNextActive = require('../lib/get-next-active-player-index');


exports = module.exports = function payBlinds(gs){

  let hasBB = Symbol.for('hasBB');

  let dbIndex = getDB(gs.players);

  //
  // small blind
  let sbIndex = getNextActive(gs.players, dbIndex);
  gs.players[sbIndex].bet(gs, gs.sb);

  //
  // big blind
  let bbIndex = getNextActive(gs.players, sbIndex);
  gs.players[bbIndex].bet(gs, 2 * gs.sb);
  gs.players[bbIndex][hasBB] = true;

};
