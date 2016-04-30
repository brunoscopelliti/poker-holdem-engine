
'use strict';

const hasDB = Symbol.for('has-dealer-button');

/**
 * @function
 * @name getDBIndex
 * @desc find the index of the player who has the dealer button
 *
 * @param {Array} players:
 *  list of the player who play the current tournament;
 *
 * @returns {Number} index of the player who has the Symbol('has-dealer-button') = true
 */
exports = module.exports = function getDBIndex(players){

  return players.findIndex(player => player[hasDB]);

}
