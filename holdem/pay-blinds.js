
'use strict';

const getDB = require('../lib/get-dealerbutton-index');
const getNextActive = require('../lib/get-next-active-player-index');


exports = module.exports = function payBlinds(gamestate){

  let smallBlind = gamestate.sb;

  let dbIndex = getDB(gamestate.players);

  //
  // small blind
  let sbIndex = getNextActive(gamestate.players, dbIndex);
  gamestate.players[sbIndex].bet(gamestate, smallBlind);

  //
  // big blind
  let bbIndex = getNextActive(gamestate.players, sbIndex);
  gamestate.players[bbIndex].bet(gamestate, 2 * smallBlind);

};
