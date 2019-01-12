const States = require("../../../domain/tournament/states");

/**
 * Determine whether a tournament is actively running;
 * Returns `true` in this case.
 * @name isRunning
 * @param {Tournament} tournament
 * @return {Boolean}
 */
const isRunning =
  (tournament) =>
    tournament.state === States.get("active") ||
      tournament.state === States.get("latest-game");

module.exports = isRunning;
