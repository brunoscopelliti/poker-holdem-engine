
'use strict';

const winston = require('winston');

const config = require('../config');

const logger = new winston.Logger({
  transports: [ new winston.transports.Console({ colorize: true }) ]
});

winston.addColors({ error: 'red', warn: 'yellow', info: 'green', verbose: 'magenta', debug: 'magenta', silly: 'white' });


// set the verbosity
// i am using the default levels: { error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5 }
logger.level = config.LOG_LEVEL;

exports = module.exports = logger;
