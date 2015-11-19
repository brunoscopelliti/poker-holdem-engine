
'use strict';

const config = require('../config');

exports = module.exports = function getSmallblindAmount(gamestate){

  let progressive = Symbol.for('hand-progressive');

  if (!progressive){
    throw new Error('Missing hand-progressive symbol from gamestate model');
  }

  let blindPeriod = config.BLINDS_PERIOD || gamestate.players.length;

  let i = Math.min(Math.floor(gamestate[progressive] / blindPeriod), config.SMALL_BLINDS.length-1);

  return config.SMALL_BLINDS[i]

};
