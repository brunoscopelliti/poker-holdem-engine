"use strict";

/**
 * @name sleep
 * @param {Number} seconds
 */
const sleep =
  (seconds) => new Promise((resolve) => setTimeout(resolve, seconds * 1000));

module.exports = sleep;
