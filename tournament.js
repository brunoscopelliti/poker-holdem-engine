"use strict";

const events = require("events");
const EventEmitter = events.EventEmitter;

const config = require("./config");

const LOGGER = require("./logger")(config.LOG_LEVEL);

const States = require("./domain/tournament/states");

const PlayerStates = require("./domain/player/states");
const withState = require("./domain/player/filter-by-state");
const getPlayerFactory = require("./domain/player/create");

const loop = require("./engine/loop");

/**
 * @class Tournament
 * @param {String} tournamentId
 * @param {any} players
 * @param {any} tournamentSettings
 * @param {Boolean} autoStart
 */
class Tournament extends EventEmitter {
  constructor (tournamentId, players, tournamentSettings, opts = { autoStart: false, recoveryId: 1 }) {
    super();

    tournamentId = this.id = tournamentId || randomId();
    const processId = this.pid = process.pid;

    this.settings = tournamentSettings;

    const gamestate = {};

    gamestate.gameProgressiveId = opts.recoveryId || 1;
    gamestate.handProgressiveId = 1;

    const SAVER = this.update.bind(this);

    const create = getPlayerFactory(LOGGER, SAVER, tournamentSettings);

    gamestate.players = players
      .map(create)
      .filter(Boolean);

    Object.defineProperties(gamestate, {
      handUniqueId: {
        get () {
          return `[${processId}] ${tournamentId}: ${this.gameProgressiveId}/${this.handProgressiveId}`;
        },
      },
      activePlayers: {
        get () {
          return withState(this.players, PlayerStates.get("active"));
        },
      },
      foldPlayers: {
        get () {
          return withState(this.players, PlayerStates.get("fold"));
        },
      },
      outPlayers: {
        get () {
          return withState(this.players, PlayerStates.get("out"));
        },
      },
      dealerPosition: {
        get () {
          return this.players
            .findIndex((player) => player[Symbol.for("Dealer")]);
        },
      },
      bigBlindPosition: {
        get () {
          return this.players
            .findIndex((player) => player[Symbol.for("Big blind")]);
        },
      },
    });

    if (gamestate.players.length < 2) {
      LOGGER.error(`Tournament ${tournamentId} cannot start 'cause there're not enough players.`, { tag: this.id });

      throw new Error("Cannot create tournament.");
    }

    this.gamestate = gamestate;

    this.state = States.get("created");

    LOGGER.info(`Tournament ${this.id} has been created.`, { tag: this.id });

    LOGGER.info(`Currently playing: ${JSON.stringify(gamestate.players.map(p => p.name))}`, { tag: this.id });

    if (opts.autoStart) {
      this.start();
    }
  }

  async start () {
    if (this.state !== States.get("created")) {
      return;
    }

    LOGGER.info(`Tournament ${this.id} is going to start.`, { tag: this.id });

    this.state = States.get("active");

    return loop.call(this, LOGGER);
  }

  pause () {
    if (this.state === States.get("active")) {
      LOGGER.info(`Tournament ${this.id} is going to be paused.`, { tag: this.id });

      this.state = States.get("paused");
    }
  }

  restart () {
    if (this.state === States.get("pause")) {
      LOGGER.info(`Tournament ${this.id} is going to restart.`, { tag: this.id });

      this.state = States.get("active");
    }
  }

  quit () {
    if (this.state === States.get("active")) {
      LOGGER.info(`Tournament ${this.id} is going to finish soon.`, { tag: this.id });

      this.state = States.get("latest-game");
    }
  }

  /**
   * @name update
   */
  update (msg) {
    // The capability to resolve the returned Promise
    // is delegated to the watcher.
    return new Promise((resolve) => {
      if (msg.players) {
        msg.players = msg.players
          .map((player) => player.serialize());
      }

      this.emit("TOURNAMENT:updated",
        Object.assign({}, msg), resolve);
    });
  }
}

module.exports = Tournament;

const randomId =
  () => Math.random().toString(36).substring(2);
