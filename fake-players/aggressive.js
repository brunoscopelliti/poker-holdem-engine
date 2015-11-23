
var chalk = require('chalk');

exports = module.exports = {

  VERSION: "Aggressive player",

  bet: function (gamestate, bet) {

    var me = gamestate.players[gamestate.me];

    var cardA = me.cards[0];
    var cardB = me.cards[1];

    var betAmount = gamestate.sb * 2;
    var cards = ['A', 'K', 'Q', 'J'];

    if (cardA.rank == cardB.rank){
      betAmount = me.callAmount * 4;
    }
    else if (cards.indexOf(cardA) >= 0 || cards.indexOf(cardB) >= 0){
      betAmount = me.callAmount * 2;
    }

    console.log(chalk.red('Aggressive is betting '), betAmount);

    bet(betAmount);

  }

};
