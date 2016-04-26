
'use strict';

// const playerStatus = require('../domain/player-status');


const getNextActive = require('../lib/get-next-active-player-index');
const getDB = require('../lib/get-dealer-button-index');

exports = module.exports = function assignDB(gs){

  const hasDB = Symbol.for('has-dealer-button');

  if (gs.handProgressiveId == 1){

    const dbIndex = gs.initialDealerButtonIndex = (gs.gameProgressiveId - 1) % gs.players.length;

    return gs.players[dbIndex][hasDB] = true;
  }



  //
  // const currDB = getDB(gs.players);
  //
  // if (currDB >= 0){
  //   gs.players[currDB][hasDB] = false;
  // }
  //
  // let newDB = getNextActive(gs.players, currDB);
  //
  // gs.players[newDB][hasDB] = true;
  // return newDB;

};
