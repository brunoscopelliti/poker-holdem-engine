
'use strict';

const status = require('../domain/player-status');


const isAllin = Symbol.for('allin');

function shouldSplit(showdownResults) {

  // return true
  // if at the showdown there was only one player,
  // or when there's not exequo & allin conditions

  let winner = showdownResults[0];
  return showdownResults.length > 1 && (winner[isAllin] || winner.detail.exequo);
}

exports = module.exports = function assignPot(gs, showdownResults) {

  //
  // assign the pot interely to the unique winner
  if (!shouldSplit(showdownResults)){
    let winner = showdownResults[0];
    gs.players.find(player => player.id == winner.id).chips += gs.pot;
    gs.pot = 0;
    return;
  }

};
