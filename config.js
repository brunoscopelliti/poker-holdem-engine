"use strict";

const config = {
  // configure the logger level;
  // one between { error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5 }
  LOG_LEVEL: process.env.LOG_LEVEL || (
    process.env.NODE_ENV === "production"
      ? "warn"
      : "debug"),
};

exports = module.exports = config;
