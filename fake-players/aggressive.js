
var chalk = require('chalk');

exports = module.exports = {

  VERSION: "Aggressive player",

  bet: function (gamestate, bet) {

    console.log(chalk.red(''));
    console.log(chalk.red('***'));
    console.log(chalk.red('Aggressive'), gamestate);

    var me = gamestate.players[gamestate.me];

    var cardA = me.cards[0];
    var cardB = me.cards[1];

    var betAmount = gamestate.sb * 2;
    var cards = ['A', 'K', 'Q', 'J'];

    if (gamestate.pot < 200){
      if (cardA.rank == cardB.rank){
        betAmount = gamestate.callAmount * 4;
      }
      else if (cards.indexOf(cardA.rank) >= 0 || cards.indexOf(cardB.rank) >= 0){
        betAmount = gamestate.callAmount * 2;
      }
    }
    else {
      betAmount = gamestate.callAmount;
    }


    console.log(chalk.red('Aggressive is betting '), betAmount);

    return bet(betAmount);

  }

};
