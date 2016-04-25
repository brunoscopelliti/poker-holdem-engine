
'use strict';

const getDB = require('../lib/get-dealerbutton-index');
const getNextActive = require('../lib/get-next-active-player-index');

const safeSum = require('../lib/safe-math').safeSum;
const safeDiff = require('../lib/safe-math').safeDiff;


function pay(gs, playerId, amount) {

  let player = gs.players[playerId];

  if (amount > player.chips){
    amount = player.chips;
  }

  if (amount === player.chips){
    let allin = Symbol.for('is-all-in');
    player [allin] = true;
  }

  //
  // update chip values
  player.chipsBet = safeSum(amount, player.chipsBet);
  player.chips = safeDiff(player.chips, amount);

  gs.pot = safeSum(gs.pot, amount);
  gs.callAmount = Math.max(player.chipsBet, gs.callAmount);

}


exports = module.exports = function payBlinds(gs){

  let hasBB = Symbol.for('has-big-blind');

  let dbIndex = getDB(gs.players);

  //
  // small blind
  let sbIndex = getNextActive(gs.players, dbIndex);
  pay(gs, sbIndex, gs.sb);

  //
  // big blind
  let bbIndex = getNextActive(gs.players, sbIndex);
  gs.players[bbIndex][hasBB] = true;
  pay(gs, bbIndex, 2 * gs.sb);

};
