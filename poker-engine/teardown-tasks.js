
'use strict';

const status = require('./domain/player-status');

const logger = require('../storage/logger');
const save = require('../storage/storage').save;

const showdown = require('./domain-utils/showdown');
const assignPot = require('./domain-utils/assign-pot');
// const updatePlayersStatus = require('./domain-utils/update-players-status');



exports = module.exports = function* teardown(gs){


  logger.info('Hand %d/%d, starting teardown ops', gs.gameProgressiveId, gs.handProgressiveId, { tag: gs.handUniqueId });


  const activePlayers = gs.activePlayers;

  logger.log('debug', 'Active players at the showdown: %s', activePlayers.map(p => `${p.name} (${p.id})`).toString().replace(/,/g, ', ').trim(), { tag: gs.handUniqueId });


  showdown(gs);

  yield save({ type: 'showdown', handId: gs.handUniqueId, players: gs.handChart });



  assignPot(gs);

  // TODO bruno: check how data is saved
  yield save({ type: 'win', handId: gs.handUniqueId, winners: gs.winners });



  // TODO bruno:
  //  - update status






}
