
var chalk = require('chalk');

exports = module.exports = {

  VERSION: "Caller player",

  bet: function (gamestate, bet) {

    console.log(chalk.red(''));
    console.log(chalk.red('***'));
    console.log(chalk.red('Caller'));
    console.log(gamestate);

    var me = gamestate.players[gamestate.me];

    var betAmount = me.callAmount * 4;

    console.log(chalk.blue('Caller is betting '), betAmount);

    return bet(betAmount);

  }

};
