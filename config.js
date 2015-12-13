
'use strict';

const config = {

  // define if the log should be saved on file
  SAVE_LOG: false,

  // time (expressed in ms) to wait after an hand ends,
  // before a new one can start
  HANDWAIT: 1000,

  // the amount of initial chips for each player
  BUYIN: 300,

  // the progression of small blinds
  SMALL_BLINDS: [10, 20, 25, 50, 100, 125, 150],

  // duration of a small blind value, in terms of "played hands"
  // if 0, the value is equal to the number of players
  BLINDS_PERIOD: 0,

  // points the players receive on the basis of their placement in a game;
  // the value of a placement changes in function of the number of players
  AWARDS: [ { N: 3, P: [2, 0, -1] }, { N: 4, P: [2, 1, 0, -1] }, { N: 5, P: [3, 1, 0, 0, -1] }, { N: 6, P: [4, 2, 1, 0, -1, -2] } ]

};

if (process.env.NODE_ENV === 'production'){

  Object.assign(config, process.env);

}
else if (process.env.NODE_ENV === 'test'){

  // the progression of small blinds
  // as the unit tests expect it to be
  const unitBlinds = [10, 20, 25, 50, 100, 125, 200, 250, 500, 750, 1000, 1500, 2000];
  const unitBlindsPeriod = 0;

  // the amount of initial chips for each player
  // as the unit tests expect it to be
  const unitBuyin = 5000;

  config.BLINDS_PERIOD = unitBlindsPeriod;
  config.SMALL_BLINDS = unitBlinds;
  config.BUYIN = unitBuyin;

}

exports = module.exports = Object.freeze(config);
