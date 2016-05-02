
'use strict';

const config = require('./config');

const events = require('events');
const EventEmitter = events.EventEmitter;




const setup_ = Symbol('setup-tournament-method');
const tournaments_ = Symbol('tournament-collection');

const gamestate = Object.create(EventEmitter.prototype, {

  /**
   * @private
   * @function
   * @name setup
   * @desc configure a tournament settings, and let the game begins
   *
   * @param {string} tournamentId:
   *  unique identifier for the current tournament
   * @param {Array} players:
   *  list of the player who play the current tournament;
   *  each player is an object with at least the following properties:
   *  - player.id
   *  - player.name
   *  - player.serviceUrl
   * @param {Number} gameId:
   *  specify from which game the tournament should start;
   *  it's different from 1 when the tournament is recovered after a crash.
   *
   * @returns void
   */
  [setup_]: {
    writable: process.env.NODE_ENV === 'test',
    value: function(tournamentId, players, gameId){
      const gs = {};
      gs.pid = process.pid;
      gs.tournamentId = tournamentId;
      gs.gameProgressiveId = gameId;
      gs.handProgressiveId = 1;

      gs.handUniqueId = `${gs.pid}_${gs.tournamentId}_${gs.gameProgressiveId}-${gs.handProgressiveId}`;


      logger.info('Setup tournament %s.', tournamentId, { tag: gs.handUniqueId });


      gs.tournamentStatus = tournamentStatus.play

      gs.players = players.map(createPlayer).filter(x => x != null);

      Object.defineProperties(gs, {
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


      if (gs.players.length < 2){
        logger.info('Tournament %s cannot start cause not enough players.', tournamentId, { tag: gs.handUniqueId });
        return this.emit('tournament:aborted', { tournamentId: tournamentId });
      }

      this[tournaments_].set(tournamentId, gs);

      logger.log('debug', 'Tournament players are: %s', gs.players.map(p => p.name).toString().replace(/,/g, ', '), { tag: gs.handUniqueId });


      // start the game
      return void run(gameloop, gs)
        .then(function() {
          logger.info('Tournament %s is just finished.', tournamentId, { tag: gs.handUniqueId });
          this[tournaments_].delete(tournamentId);
          return this.emit('tournament:completed', { tournamentId: tournamentId });
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
   * @param {string} tournamentId:
   *  unique identifier for the current tournament
   * @param {Array} players:
   *  list of the player who play the current tournament;
   *  each player is an object with at least the following properties:
   *  - player.id
   *  - player.name
   *  - player.serviceUrl
   * @param {Number} gameId:
   *  specify from which game the tournament should start;
   *  it's different from 1 when the tournament is recovered after a crash.
   *
   * @returns void
   */
  start: {
    value: function(tournamentId, players, gameId = 1){

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
   * @param {string} tournamentId:
   *  unique identifier for the current tournament
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
   * @param {string} tournamentId:
   *  unique identifier for the current tournament
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




const logger = require('./storage/logger');

const run = require('./utils/generator-runner').run;
const gameloop = require('./poker-engine/game-loop');

const playerStatus = require('./poker-engine/domain/player-status');
const createPlayer = require('./poker-engine/domain-utils/player-factory');

const tournamentStatus = require('./poker-engine/domain/tournament-status');
