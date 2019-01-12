"use strict";

const winston = require("winston");

winston.addColors({
  error: "red",
  warn: "yellow",
  info: "green",
  verbose: "magenta",
  debug: "magenta",
  silly: "white",
});

let LOGGER;

const getLogger =
  (level) => {
    if (LOGGER) {
      return LOGGER;
    }

    LOGGER = winston.createLogger({
      level: level || "debug",
      format: winston.format.json(),
      transports: [
        new winston.transports.File({
          filename: "log/error.log",
          level: "error",
        }),
        new winston.transports.Console({
          format: winston.format.simple(),
        }),
      ],
    });

    return LOGGER;
  };

module.exports = getLogger;
