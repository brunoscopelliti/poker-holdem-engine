
'use strict';

let hasDB = Symbol.for('has-dealer-button');

exports = module.exports = function getDBIndex(players){

  return players.findIndex(player => player[hasDB]);

}
