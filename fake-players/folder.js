
var chalk = require('chalk');

exports = module.exports = {

  VERSION: "Folder player",

  bet: function (gamestate, bet) {

    console.log(chalk.red(''));
    console.log(chalk.red('***'));
    console.log(chalk.red('Folder'));
    console.log(gamestate);

    console.log(chalk.yellow('Aggressive is betting '), betAmount);

    return bet(0);

  }

};
