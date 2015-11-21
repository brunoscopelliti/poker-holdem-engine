
'use strict';

let hasDB = Symbol.for('hasDB');

exports = module.exports = function getDBIndex(players){

  return players.findIndex(player => player[hasDB]);

}
