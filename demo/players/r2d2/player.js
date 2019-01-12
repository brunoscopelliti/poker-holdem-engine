"use strict";

exports = module.exports = {
  VERSION: "BIP DRIP... BIP",
  bet: function (gamestate) {
    const gs = gamestate;
    const p = gs.players;
    const me = p[gs.me];
    console.log(`Hello! My name is ${me.name}, BIP.`);
    return me.chipsBet > 0
      ? gs.callAmount
      : 0;
  },
};
