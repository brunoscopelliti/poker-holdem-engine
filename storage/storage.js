
'use strict';

//
// @param data {Object}
// @param data.type: Indicates the type of update; For example "setup" contains the info to bootstrap a new hand, "bet" simply the info about a specific bet.
exports.save = function save(gs, data) {

  if (Array.isArray(data.players)){
    let hasDB = Symbol.for('hasDB');
    let allin = Symbol.for('allin');
    data.players.forEach(player => { player.hasDB = player[hasDB]; player.isAllin = player[allin]; });
  }

  //
  // ready to save an update on mongoDB
  return new Promise(function(resolve) {
    // be patient until the update is completed
    gs.emit('gamestate:updated', Object.assign({}, data));
    gs.once('storage:completed', function() {
      resolve();
    });
  });

}
