
'use strict';

const winston = require('winston');

const config = require('../config');

const logger = new winston.Logger({
  transports: [ new winston.transports.Console() ]
});

// set the verbosity
logger.level = config.LOG_LEVEL;

exports = module.exports = logger;
