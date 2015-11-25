
'use strict';

const getDB = require('../lib/get-dealerbutton-index');

let badge = Symbol.for('show-first');

exports = module.exports = function getFirstShowdownIndex(players){

  let i = players.findIndex(player => player[badge]);

  return i >= 0 ? i : getDB(players);

}
