
const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
  rank: { type: String, required: true },
  type: { type: String, required: true }
});

const playerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  id: { type: String, required: true },
  hasDB: Boolean,
  isAllin: Boolean,
  chipsBet: Number,
  chips: Number,
  cards: [cardSchema],
  bestCards: [cardSchema],
  point: String,
  status: String
});

const winnerSchema = new mongoose.Schema({
  id: { type: String, required: true },
  amount: { type: Number, required: true }
});



exports = module.exports = new mongoose.Schema({
  tournamentId: { type: String, required: true },
  gameId: { type: Number, required: true },
  handId: { type: Number, required: true },
  type: { type: String, required: true, enum: ['setup', 'bet', 'cards', 'status', 'showdown', 'win'] },
  pot: Number,
  sb: Number,
  players: [playerSchema],
  session: { type: String, enum: ['pre-flop', 'flop', 'turn', 'river'] },
  commonCards: [cardSchema],
  playerId: String,
  amount: Number,
  status: { type: String, enum: ['folded', 'out'] },
  winners: [winnerSchema],
  playerName: String
});
