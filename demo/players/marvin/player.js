"use strict";

exports = module.exports = {
  VERSION: "I am depressed :(",
  bet: function (gamestate) {
    const marvin = gamestate.players[gamestate.me];
    console.log(`Hello! My name is ${marvin.name}. I'm sad :(`);

    const halfBuyin = gamestate.buyin * 0.5;

    if (marvin.chips < halfBuyin) {
      console.log("Ahhhhhhhhh ! I'm doomed...");
      return Number.MAX_SAFE_INTEGER;
    }

    console.log(`I'm sadly calling for ${gamestate.callAmount}`);
    return gamestate.callAmount;
  },
};
