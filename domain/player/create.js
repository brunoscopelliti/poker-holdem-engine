"use strict";

const send = require("request");

const getAllCombination = require("poker-combinations");
const sortByRank = require("poker-rank");

const States = require("./states");
const splitPot = require("./split-pot");

const formatPoint = require("../game/format-point");

module.exports =
  /**
   * Return the player factory function
   * @name create
   * @param {Logger} LOGGER
   * @param {Function} save
   * @param {TournamentSettings} tournamentSettings
   * @returns {Function} playerFactory
   */
  (LOGGER, save, tournamentSettings) => {
    const actions = {
      /**
       * Updates the gamestate, and the player
       * according to the amount bet.
       * @name Symbol.for("pay")
       * @private
       * @param {Object} gamestate
       * @param {Number} amount
       */
      [Symbol.for("pay")] (gamestate, amount) {
        if (amount === this.chips) {
          this[Symbol.for("All-in")] = true;
        }

        this.chipsBet += amount;
        this.chips -= amount;

        gamestate.callAmount = Math.max(this.chipsBet, gamestate.callAmount);
        gamestate.pot += amount;
        if (this[Symbol.for("All-in")] ||
          gamestate.sidepots.length > 0 ||
          gamestate.players.some((player) => player[Symbol.for("All-in")])) {
          splitPot(gamestate);
        }
      },

      /**
       * Set the symbol that identify
       * the player who holds the dealer button.
       * @name assignDealerButton
       */
      assignDealerButton () {
        this[Symbol.for("Dealer")] = true;
      },

      /**
       * Update player status.
       * A player who have folded can't bet further
       * in the current hand.
       * @name
       * @name pay
       * @param {Object} gamestate
       */
      async fold (gamestate) {
        this.state = States.get("fold");

        const info = {
          handId: gamestate.handUniqueId,
          playerId: this.id,
          session: gamestate.session,
          state: this.state,
        };

        await save({
          type: "state",
          ...info,
        });

        LOGGER.info(`${this.name} has fold.`, { tag: gamestate.handUniqueId });
      },

      /**
       * Update gamestate, and player's chips.
       * It's used to make player pay for Blinds,
       * and Antes.
       * @name pay
       * @param {Object} gamestate
       * @param {Number} amount
       */
      pay (gamestate, amount) {
        this[Symbol.for("pay")](gamestate, Math.min(this.chips, amount));
      },

      /**
       * Update gamestate, and player's chips.
       * It also validates the amount.
       * @async
       * @name payBet
       * @param {Object} gamestate
       * @param {Number} amount
       */
      async payBet (gamestate, amount) {
        const playerCallAmount = Math.max(gamestate.callAmount - this.chipsBet, 0);

        if (amount > playerCallAmount) {
          // If execution reaches this point
          // player is betting a raise.
          // There're some necessary extra checks
          // to do before consider the raise valid.

          // 1) Check current player is in the position to make a raise,
          //    and assure "You can't raise yourself!" motto is respected.
          //    Specifically a player who have called for a specific amount,
          //    can't raise, unless the pot was reopened by someone else.

          if (this[Symbol.for("already-bet")]) {
            // Fallback to simple call bet
            amount = playerCallAmount;
          } else {
            // 2) Check minumum raise amount,
            //    and eventually update the data about the last raise.
            const minimumRaiseAmount = playerCallAmount +
              (gamestate.lastRaiseAmount || 2 * gamestate.sb);

            if (amount < minimumRaiseAmount) {
              // A raise that lower than the minimum raise amount,
              // is allowed only when the player is betting all his chips.
              // However even in this case, it doesn't reopen the bet
              // for the players who have already bet in this hand;
              // that is, last raise data are not updated.
              if (amount < this.chips) {
                // Fallback to simple call bet
                amount = playerCallAmount;
              }
            } else {
              // If execution reaches this point,
              // the raise amount is valid;
              // Update `lastRaiseAmount` gamestate property.
              gamestate.lastRaiseAmount = amount - playerCallAmount;
              gamestate.players.forEach((player) => {
                delete player[Symbol.for("already-bet")];
              });
            }
          }
        }

        this[Symbol.for("already-bet")] = true;

        this[Symbol.for("pay")](gamestate, amount);

        const info = {
          amount: amount,
          handId: gamestate.handUniqueId,
          playerId: this.id,
          session: gamestate.session,
        };

        await save({
          type: "bet",
          ...info,
        });

        LOGGER.debug(`${this.name} has bet ${amount}.`, { tag: gamestate.handUniqueId });
      },

      /**
       * @name restore
       * @param {Boolean} toInitialCondition
       */
      restore (toInitialCondition) {
        // Players who have folded during previous hand
        // should be re-activated at the beginning of a new hand.
        if (this.state === States.get("fold")) {
          this.state = States.get("active");
        }

        if (toInitialCondition) {
          this.chips = tournamentSettings.BUYIN;
          this.state = States.get("active");
        }

        delete this[Symbol.for("All-in")];
        delete this[Symbol.for("Big blind")];

        this.cards = [];
        this.chipsBet = 0;
      },

      /**
       * Returns a copy of the player
       * that is serializable.
       * @name serialize
       * @return {Object}
       */
      serialize () {
        // Extend with some not-serializable properties
        return Object.assign({}, this, {
          hasDealerButton: Symbol.for("Dealer"),
          id: this.id,
          isAllin: Symbol.for("All-in"),
          name: this.name,
          serviceUrl: this.serviceUrl,
        });
      },

      /**
       * Determine the player best combination.
       * @name showdown
       * @params {Object} gamestate
       * @return {Object}
       */
      showdown (gamestate) {
        const sevenCards = this.cards.concat(gamestate.commonCards);
        const combinations = getAllCombination(sevenCards, 5);

        const bestPoint =
          sortByRank(combinations)[0];

        LOGGER.info(`${this.name}: ${formatPoint(bestPoint.rank)}.`, { tag: gamestate.handUniqueId });

        return bestPoint;
      },

      /**
       * Send an HTTP request to the player bot service,
       * to get the bet amount.
       * @async
       * @name talk
       * @param {Object} gamestate
       * @return {Promise<Number>}
       */
      async talk (gamestate) {
        const payload = Object.create(null);

        payload.buyin = tournamentSettings.BUYIN;

        payload.tournamentId = gamestate.tournamentId;
        payload.game = gamestate.gameProgressiveId;
        payload.hand = gamestate.handProgressiveId;
        payload.spinCount = gamestate.spinCount;

        payload.dealer = gamestate.dealerPosition;
        payload.sb = gamestate.sb;

        payload.pot = gamestate.pot;
        payload.sidepots = gamestate.sidepots;

        payload.commonCards = gamestate.commonCards;

        // Minimum amount of chips the current player
        // must bet in order to remain in the game.
        // It depends by how much he bet previously.
        payload.callAmount =
          Math.max(gamestate.callAmount - this.chipsBet, 0);

        // Minimum amount the player has to bet
        // in case he want to raise the call amount for the other players
        payload.minimumRaiseAmount =
          payload.callAmount + (gamestate.lastRaiseAmount || 2 * gamestate.sb);

        // List of players.
        // Make sure that each bot player can see only its cards
        payload.players = gamestate.players
          .map(
            (player) => {
              const playerWithoutCards = {
                chips: player.chips,
                chipsBet: player.chipsBet,
                id: player.id,
                name: player.name,
                state: player.state,
              };

              return this.id !== player.id
                ? playerWithoutCards
                : {
                  cards: player.cards,
                  ...playerWithoutCards,
                };
            }
          );

        payload.me = gamestate.players.findIndex((player) => player.id === this.id);

        return new Promise((resolve) => {
          send.post(this.serviceUrl + "bet", {
            body: payload,
            json: true,
            followAllRedirects: true,
            maxRedirects: 1,
            timeout: 5000,
          }, (err, _, bet) => {
            if (err) {
              LOGGER.warn(`Request to ${this.serviceUrl} failed, cause ${err.message}.`, { tag: gamestate.handUniqueId });

              bet = 0;
            }

            resolve(Math.min(this.chips, sanitizeAmount(bet)));
          });
        });
      },

      /**
       * Removes the symbol that identify
       * the player who holds the dealer button.
       * @name unassignDealerButton
       */
      unassignDealerButton () {
        delete this[Symbol.for("Dealer")];
      },
    };

    /**
     * Create a new Player.
     * @name create
     * @param {PlayerData} playerData
     * @returns {Player}
     */
    const create = (playerData) => {
      if (!isValidPlayer(playerData)) {
        LOGGER.warn("Invalid player", playerData);
        return null;
      }

      const player = Object.create(actions);

      Object.keys(playerData)
        .forEach((prop) => Object.defineProperty(player, prop, { value: playerData[prop] }));

      // Every player starts as an active player.
      player.state = States.get("active");

      // Player's private cards.
      // Other players can't see this field.
      player.cards = [];

      // Set the initial amount of available chips.
      player.chips = tournamentSettings.BUYIN;

      // Total amount of chips the player bet
      // in the current hand.
      // It is the sum of the chips the player has bet
      // in each "betting session" of the current hand.
      player.chipsBet = 0;

      LOGGER.info(`${player.name} (${player.id}) has been registered as player.`);

      return player;
    };

    return create;
  };

/**
 * @typedef {Object} PlayerData
 * @property {String} id
 * @property {String} name
 * @property {string} serviceUrl
 */

/**
 * Determine whether the input parameter is a valid Player.
 * @name isValidPlayer
 * @function
 * @param {Object} player
 * @returns {Boolean}
 */
const isValidPlayer =
  (player) => player.id && player.name && player.serviceUrl;

/**
 * Check if the value is a valid bet amount,
 * and returns a valid number.
 * @name sanitizeAmount
 * @function
 * @param {Any} amount
 * @returns {Number}
 */
const sanitizeAmount =
  (amount) => {
    if (typeof amount != "number") {
      amount = Number(amount);
    }

    return amount > 0
      ? amount
      : 0;
  };
