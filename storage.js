
'use strict';

//
// @param data {Object}
// @param data.type: Indicates the type of update; For example "setup" contains the info to bootstrap a new hand, "bet" simply the info about a specific bet.
exports.save = function save(gs, data) {

  if (Array.isArray(data.players)){
    let hasDB = Symbol.for('hasDB');
    data.players.forEach(player => player.hasDB = player[hasDB]);
  }

  //
  // ready to save an update on mongoDB
  return new Promise(function(resolve, reject) {
    // be patient until the update is completed
    gs.emit('gamestate:updated', data);
    gs.once('storage:completed', function(info) {
      resolve();
    });
  });

}
