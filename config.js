
'use strict';

const config = {

  // the amount of initial chips for each player
  BUYIN: 5000,

  // the progression of small blinds
  SMALL_BLINDS: [10, 20, 25, 50, 100, 125, 200, 250, 500, 750, 1000, 1500, 2000],

  // duration of a small blind value, in terms of "table rounds"
  BLINDS_PERIOD: 1

};

if (process.env.NODE_ENV === 'production'){

  Object.assign(config, process.env);

}

exports = module.exports = Object.freeze(config);
