
'use strict';

const shuffle = require('knuth-shuffle').knuthShuffle;
const deck = require('poker-deck');

exports = module.exports = function shuffleCards(){

  // shuffle modifies the original array
  // calling a.slice(0) creates a copy
  return shuffle(deck.slice(0));

};
