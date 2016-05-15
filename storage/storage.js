
'use strict';

const engine = require('../index');



/**
 * @function
 * @name save
 * @desc
 *  notify the "gamestate:updated" message,
 *  so that the gamestate can be eventually persisted on db
 *
 * @param {Object} updates: gamestate's properties which have changed;
 *  - updates.type: define the type of update; e.g. "setup" contains the info to bootstrap a new hand, "bet" simply the info about a specific bet.
 *
 * @returns {Promise}
 *  The promise is fulfilled when the watcher of "gamestate:updated" completes
 */
exports.save = function save(updates) {

  // TODO bruno: tests

  if (Array.isArray(updates.players)){
    const hasDB = Symbol.for('has-dealer-button');
    const isAllin = Symbol.for('is-all-in');
    updates.players = updates.players.map(function(p, i) {
      const player = Object.assign({}, p);
      player.id = p.id;
      player.name = p.name;
      player.hasDB = p[hasDB];
      player.isAllin = p[isAllin];
      return player;
    });
  }


  //
  // the promise is pending until
  // a watchers save the gamestate updates, and resolve
  return new Promise(function(resolve) {
    return engine.emit('gamestate:updated', Object.assign({}, updates), resolve);
  });

}
