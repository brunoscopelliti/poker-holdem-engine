
'use strict';

const config = {

  // configure the logger level;
  // one between { error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5 }
  LOG_LEVEL: 'silly',

  // time (expressed in ms) to wait after an hand ends,
  // before a new one can start
  HANDWAIT: 500,

  // define the max number of different game after which a tournament
  // automatically finishes
  MAX_GAMES: Infinity,

  // the amount of initial chips for each player
  BUYIN: 1000,

  // the progression of small blinds
  SMALL_BLINDS: [25, 50, 75, 100, 150, 200, 250, 500, 750, 1000, 1500, 2000, 2500, 5000, 7500, 10000],

  // duration of a small blind value,
  // expressed in terms of "DB turns of the table"
  BLINDS_PERIOD: 1,

  // antes are a set amount put in the pot by every player in the game
  // prior to cards being dealt.
  // ante amount is always 10% of bigblind;
  // if enabled, antes should be started being payed
  // when 10% of bigblind amount is greater equal than
  // 10% of the initial buy-in.
  ENABLE_ANTE: true,

  // points the players receive on the basis of their placement in a game;
  // the value of a placement changes in function of the number of players
  AWARDS: [
    [1, 0],
    [2, 0, -1],
    [2, 1, 0, -1],
    [3, 1, 0, -1, -2],
    [5, 2, 0, -1, -2, -3],
    [7, 3, 0, -1, -2, -3, -4],
    [10, 4, 1, 0, -1, -2, -4, -6]
  ]

};

if (process.env.NODE_ENV === 'production'){

  Object.assign(config, process.env);

  if ('SMALL_BLINDS' in process.env){
    config.SMALL_BLINDS = JSON.parse(process.env.SMALL_BLINDS);
  }

  if ('AWARDS' in process.env){
    config.AWARDS = JSON.parse(process.env.AWARDS);
  }

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
