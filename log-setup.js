
'use strict';

const config = require('./config');
const winston = module.exports = require('winston');

if (winston && winston.loggers){

  // log game history

  const gamestorySettings = { console: { level: 'info', colorize: true, label: 'gamestory' } };
  if (config.SAVE_LOG){
    gamestorySettings.file = { filename: './log-gamestory.txt' };
  }
  winston.loggers.add('gamestory', gamestorySettings);


  // log errors

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

}
