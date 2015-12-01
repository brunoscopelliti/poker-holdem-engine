
'use strict';

const winston = module.exports = require('winston');

winston.loggers.add('gamestory', {
  console: {
    level: 'info',
    colorize: true,
    label: 'gamestory'
  },
  file: {
    filename: './log-gamestory.txt'
  }
});

winston.loggers.add('errors', {
  console: {
    level: 'error',
    colorize: true,
    label: 'errors'
  },
  file: {
    filename: './log-errors.txt'
  }
});
