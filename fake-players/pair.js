
var chalk = require('chalk');

exports = module.exports = {

  VERSION: "Pair player",

  bet: function (gamestate, bet) {

    console.log(chalk.red(''));
    console.log(chalk.red('***'));
    console.log(chalk.red('Pair'), gamestate);

    var me = gamestate.players[gamestate.me];

    var cardA = me.cards[0];
    var cardB = me.cards[1];

    var betAmount = 0;

    if (me.chips > 4750){
      if (cardA.rank == cardB.rank){
        betAmount = gamestate.callAmount * 2;
      }
    }
    else {
      betAmount = gamestate.callAmount;
    }

    console.log(chalk.green('Pair is betting '), betAmount);

    return bet(betAmount);

  }

};
