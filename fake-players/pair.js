
var chalk = require('chalk');

exports = module.exports = {

  VERSION: "Pair player",

  bet: function (gamestate, bet) {

    var me = gamestate.players[gamestate.me];

    var cardA = me.cards[0];
    var cardB = me.cards[1];

    var betAmount = 0;

    if (cardA.rank == cardB.rank){
      betAmount = me.callAmount * 2;
    }

    console.log(chalk.green('Pair is betting '), betAmount);

    bet(betAmount);

  }

};
