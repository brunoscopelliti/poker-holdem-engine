
'use strict';

const config = require('../config');

exports = module.exports = function getSmallblindAmount(gs){

  let progressive = Symbol.for('hand-progressive');

  if (!gs[progressive]){
    throw new Error('Missing hand-progressive symbol from gs model');
  }

  // TODO:
  // Currently if I define config.BLINDS_PERIOD = 2
  // it means that the small blinds grow up every 2 hands.
  // Instead I would like to have that the small blind grow up
  // every 2 completed loop of the table...
  // something like:
  // let blindPeriod = config.BLINDS_PERIOD * gs.players.length || gs.players.length;

  let blindPeriod = config.BLINDS_PERIOD || gs.players.length;

  let i = Math.min(Math.floor((gs[progressive]-1) / blindPeriod), config.SMALL_BLINDS.length-1);

  return config.SMALL_BLINDS[i];

};
