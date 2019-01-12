"use strict";

const States = require("../domain/tournament/states");

const TASKS = require("./tasks.js");

/**
 * @name loop
 * @this {Tournament}
 */
async function loop (LOGGER) {
  // `loop` never returns until
  // current tournament isn't complete.
  while (this.state !== States.get("completed")) {
    for (const task of TASKS) {
      if (task.shouldRun(this)) {
        LOGGER.debug("[TASK]: " + task.name);
        await task.run(LOGGER, this);
      }
    }
  }
}

module.exports = loop;
