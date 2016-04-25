
'use strict';

const getDB = require('../lib/get-dealer-button-index');

let badge = Symbol.for('last-raiser');

exports = module.exports = function getFirstShowdownIndex(players){

  let i = players.findIndex(player => player[badge]);

  return i >= 0 ? i : getDB(players);

}
