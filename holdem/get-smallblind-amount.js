
'use strict';

const config = require('../config');

exports = module.exports = function getSmallblindAmount(gs){

  let progressive = Symbol.for('hand-progressive');

  if (!gs[progressive]){
    throw new Error('Missing hand-progressive symbol from gs model');
  }

  let blindPeriod = config.BLINDS_PERIOD || gs.players.length;

  let i = Math.min(Math.floor((gs[progressive]-1) / blindPeriod), config.SMALL_BLINDS.length-1);

  return config.SMALL_BLINDS[i];

};
