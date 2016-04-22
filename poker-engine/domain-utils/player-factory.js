
'use strict';

const config = require('../../config');

const logger = require('../../storage/logger');



// const request = require('request');

// const sortByRank = require('poker-rank');
// const getCombinations = require('poker-combinations');

const status = require('../domain/player-status');

const save = require('../../storage/storage').save;



// const hasDB = Symbol.for('hasDB');
// const gameProgressive = Symbol.for('game-progressive');
// const roundProgressive = Symbol.for('hand-progressive');


const actions = {
  bet() {}
};


/**
 * @private
 * @function
 * @name isValidPlayer
 * @desc check if the input parameter match the "player interface".
 *
 * @param {object} player
 *
 * @returns {bool} true when the input parameter is a valid "player" object; false otherwise
 */
function isValidPlayer(player){
  return player.id && player.name && player.serviceUrl;
}



/**
 * @function
 * @name factory
 * @desc create a new "player" object
 *
 * @param {object} obj
 *  - player.id
 *  - player.name
 *  - player.serviceUrl
 *
 * @returns {object|null} the player object created
 */
exports = module.exports = function factory(obj){

  if (!isValidPlayer(obj)){
    logger.warn('Registered an attempt to sign an invalid player', obj);
    return null;
  }

  const player = Object.create(actions);

  ['id', 'name', 'serviceUrl']
    .forEach(prop => Object.defineProperty(player, prop, { value: obj[prop] }))

  // meta information about the service
  // that responds at "serviceUrl"
  // TODO: it should be updated at the beginning of each new game
  player.version = 'Poker folder star!';

  // status of the player
  player.status = status.active;

  // amount of chips available
  player.chips = config.BUYIN;

  // two private cards of the player
  player.cards = [];

  // total amount of chips the player bet
  // in the current hand.
  // it is the sum of the chips the player has bet
  // in each "betting session" of the current hand.
  player.chipsBet = 0;


  logger.info('%s (%s), registered as player.', player.name, player.id);

  return player;

}
