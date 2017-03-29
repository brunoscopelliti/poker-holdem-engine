
'use strict';

const mongoose = require('mongoose');

const player = new mongoose.Schema({
  name: String,
  pts: Number
});

exports = module.exports = new mongoose.Schema({
  tournamentId: String,
  gameId: Number,
  rank: [player]
});
