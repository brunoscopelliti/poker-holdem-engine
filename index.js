
'use strict';


const config = require('./config');

const events = require('events');
const EventEmitter = events.EventEmitter;


const logger = require('./storage/logger');

const run = require('./utils/generator-runner');

const gameloop = require('./poker-engine/holdem-game-loop');
const tournamentStatus = require('./poker-engine/domain/tournament-status');

// TODO next step
// const createPlayer = require('./poker-engine/holdem/player-factory');



const setup_ = Symbol('setup-tournament-method');

const tournaments_ = Symbol('tournament-collection');

const gamestate = Object.create(EventEmitter.prototype, {

  /**
   * @private
   * @function
   * @name setup
   * @desc configure a tournament settings, and let the game begins
   *
   * @param {string} tournamentId
   * @param {Array} players
   * @param {Number} gameId
   *
   * @returns void
   */
  [setup_]: {
    value: function(tournamentId, players, gameId){
      const gs = {};
      gs.pid = process.pid;
      gs.tournamentId = setupData.tournamentId;
      gs.gameProgressiveId = gameId;
      gs.handProgressiveId = 1;

      gs.handUniqueId = `${gs.pid}_${gs.tournamentId}_${gs.gameProgressiveId}-${gs.handProgressiveId}`;


      logger.info('Setup tournament %s.', tournamentId, { tag: gs.handUniqueId });


      gs.tournamentStatus = tournamentStatus.play

      // TODO next step
      // gs.players = players.map(createPlayer);

      this[tournaments_].set(tournamentId, gs);

      logger.log('debug', 'Tournament players are: %s', gs.players.map(p => p.name).toString().replace(/,/g, ', '), { tag: gs.handUniqueId });


      // start the game
      return void run(gameloop, gs)
        .then(function() {
          logger.info('Tournament %s is just finished.', tournamentId, { tag: gs.handUniqueId });
          this[tournaments_].delete(tournamentId);
          return this.emit('tournament-finished', { tournamentId: tournamentId });
        }.bind(this))
        .catch(function(err) {
          // an error occurred during the gameloop generator execution;
          // if the exception is not handled before... there's nothing here i can do.
          const errorTag = { tag: gs.handUniqueId };
          logger.error('An error occurred during tournament %s.', gs.tournamentId, errorTag);
          logger.error('Error: %s.\nStacktrace: %s', err.message, err.stack, errorTag);
        });
    }
  },


  /**
   * @function
   * @name start
   * @desc it makes a new tournament start, or resume a paused tournament
   *
   * @param {string} tournamentId
   * @param {Array} players
   * @param {Number} gameId
   *
   * @returns void
   */
  start: {
    value: function(tournamentId, players, gameId){

      // TODO
      // when node.js will support "ES2015 default parameters"
      // change the signature to: start(tournamentId, players, gameId = 1)

      gameId = typeof gameId == 'undefined' ? 1 : gameId;




      // start has a different meaning on the basis of the fact
      // that the tournament is starting for the first time, or
      // it is resuming after a break.


      const gs = this[tournaments_].get(tournamentId);

      // a)
      // in case the tournament is starting for the first time
      // we've to setup the tournament.

      if (gs == null)
        return void this[setup_](tournamentId, players, gameId);

      // b)
      // in case the tournament has already started, and it'snt
      // currently running, we just have to activate it.

      if (gs.tournamentStatus != tournamentStatus.pause)
        return;

      gs.tournamentStatus = tournamentStatus.play;
    }
  },


  /**
   * @function
   * @name pause
   * @desc pause an active tournament
   *
   * @param {string} tournamentId
   *
   * @returns void
   */
  pause: {
    value: function(tournamentId) {
      const gs = this[tournaments_].get(tournamentId);

      if (gs == null)
        return;

      if (gs.tournamentStatus != tournamentStatus.play)
        return;

      logger.info('Tournament %s is going to be paused.', gs.tournamentId, { tag: gs.tournamentId });
      gs.tournamentStatus = tournamentStatus.pause;

    }
  },


  /**
   * @function
   * @name quit
   * @desc terminate an active tournament
   *
   * @param {string} tournamentId
   *
   * @returns void
   */
  quit: {
    value: function(tournamentId) {
      const gs = this[tournaments_].get(tournamentId);

      if (gs == null)
        return;

      if (gs.tournamentStatus != tournamentStatus.play)
        return;

      logger.info('Tournament %s is going to finish.', gs.tournamentId, { tag: gs.tournamentId });
      gs.tournamentStatus = tournamentStatus.latest;
    }
  }

});

// gamestate[tournaments_] contains the game information
// about the various tournaments
gamestate[tournaments_] = new Map();

exports = module.exports = gamestate;
