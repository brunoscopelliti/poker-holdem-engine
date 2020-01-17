"use strict";

const config = require("./config");

const LOGGER = require("./logger")(config.LOG_LEVEL);

const States = require("./domain/tournament/states");

const PlayerStates = require("./domain/player/states");
const withState = require("./domain/player/filter-by-state");
const getPlayerFactory = require("./domain/player/create");

const loop = require("./engine/loop");

const defaultOptions = {
  autoStart: false,
  async onFeed () {},
  async onGameComplete () {},
  async onTournamentComplete () {},
  recoveryId: 1,
};

/**
 * @class Tournament
 * @param {String} tournamentId
 * @param {any} players
 * @param {any} tournamentSettings
 * @param {Object} opts
 */
class Tournament {
  constructor (tournamentId, players, tournamentSettings, opts) {
    tournamentId = this.id = tournamentId || randomId();
    const processId = this.pid = process.pid;

    opts = { ...defaultOptions, ...opts };

    this.settings = tournamentSettings;

    this.onFeed = opts.onFeed;
    this.onGameComplete = opts.onGameComplete;
    this.onTournamentComplete = opts.onTournamentComplete;

    const gamestate = {};

    gamestate.gameProgressiveId = opts.recoveryId || 1;
    gamestate.handProgressiveId = 1;
    gamestate.tournamentId = tournamentId;

    const create = getPlayerFactory(LOGGER, this.onFeed.bind(this), tournamentSettings);

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

    return loop.call(this, LOGGER)
      .then(
        () => {
          this.onTournamentComplete({ tournamentId: this.id });
        }
      );
  }

  pause () {
    if (this.state === States.get("active")) {
      LOGGER.info(`Tournament ${this.id} is going to be paused.`, { tag: this.id });

      this.pendingPause = true;
    }
  }

  restart () {
    if (this.state === States.get("paused")) {
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
}

module.exports = Tournament;

const randomId =
  () => Math.random().toString(36).substring(2);
