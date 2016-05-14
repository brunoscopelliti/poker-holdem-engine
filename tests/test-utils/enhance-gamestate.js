
'use strict';

const playerStatus = require('../../poker-engine/domain/player-status');

exports = module.exports = function enhance(gs){

  return Object.defineProperties(gs, {
    'activePlayers': {
      get() {
        return this.players.filter(x => x.status == playerStatus.active);
      }
    },
    'dealerButtonIndex': {
      get() {
        return this.players.findIndex(player => player[Symbol.for('has-dealer-button')]);
      }
    }
  });

};
