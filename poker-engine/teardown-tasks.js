
'use strict';

// const winston = require('winston');
// const gamestory = winston.loggers.get('gamestory');
// const errors = winston.loggers.get('errors');

const status = require('./domain/player-status');

const save = require('../storage/storage').save;

// const showdown = require('./domain-utils/showdown');
// const assignPot = require('./domain-utils/assign-pot');
// const updatePlayersStatus = require('./domain-utils/update-players-status');



exports = module.exports = function* teardown(gs){


  logger.info('Hand %d/%d, starting teardown ops', gs.gameProgressiveId, gs.handProgressiveId, { tag: gs.handUniqueId });


  const activePlayers = gs.activePlayers;

  logger.log('debug', 'Active players at the showdown: %s', activePlayers.map(p => `${p.name} (${p.id})`).toString().replace(/,/g, ', '), { tag: gs.handUniqueId });





  // 1) get best combination ranking

  // 2) assign pot

  








}
