
'use strict';

const playerStatus = require('./domain/player-status');

const logger = require('../storage/logger');
const save = require('../storage/storage').save;

const showdown = require('./domain-utils/showdown');
const assignPot = require('./domain-utils/assign-pot');
const updatePlayersStatus = require('./domain-utils/update-players-status');



exports = module.exports = function* teardown(gs){


  logger.info('Hand %d/%d, starting teardown ops', gs.gameProgressiveId, gs.handProgressiveId, { tag: gs.handUniqueId });


  const activePlayers = gs.activePlayers;

  logger.log('debug', 'Active players at the showdown: %s', activePlayers.map(p => `${p.name} (${p.id})`).toString().replace(/,/g, ', ').trim(), { tag: gs.handUniqueId });


  showdown(gs);

  logger.log('debug', getRankingLogMessage(gs.handChart), { tag: gs.handUniqueId });

  yield save({ type: 'showdown', handId: gs.handUniqueId, players: gs.handChart });



  assignPot(gs);

  logger.log('debug', getWinsLogMessage(gs.winners), { tag: gs.handUniqueId });

  yield save({ type: 'win', handId: gs.handUniqueId, winners: gs.winners });



  for (let i=0; i<activePlayers.length; i++){
    let player = activePlayers[i];
    if (player.chips === 0){
      logger.info('%s (%s) is out', player.name, player.id, { tag: gs.handUniqueId });
      yield save({ type: 'status', handId: gs.handUniqueId, playerId: player.id, status: playerStatus.out });
    }
  }

  updatePlayersStatus(gs);



  gs.handChart = gs.winners = null;

}




/**
 * @private
 * @function
 * @name getRankingLogMessage
 * @desc
 *  return a log of the player ranks in the current hand
 *
 * @param {Array} ranks
 *  sorted list of players
 *
 * @returns {String}
 */
function getRankingLogMessage(chart){
  let rank = 0;
  return chart.reduce(function(msg, curr) {
    rank++;
    return msg += `${rank} - ${curr.name} (${curr.id}), `, msg;
  }, '').trim().slice(0,-1);
}




/**
 * @private
 * @function
 * @name getWinsLogMessage
 * @desc
 *  return a log about the player(s) who have won chips in the current hand.
 *
 * @param {Array} winners
 *  list of players
 *
 * @returns {String}
 */
function getWinsLogMessage(winners){
  return winners.reduce(function(msg, winner) {
    return msg += `${winner.name} (${winner.id}) wins ${winner.amount}, `, msg;
  }, '').trim().slice(0,-1);
}
