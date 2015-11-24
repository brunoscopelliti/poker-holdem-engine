
var chalk = require('chalk');

exports = module.exports = {

  VERSION: "Folder player",

  bet: function (gamestate, bet) {

    console.log(chalk.red(''));
    console.log(chalk.red('***'));
    console.log(chalk.red('Folder'), gamestate);

    var betAmount = 0;

    console.log(chalk.yellow('Folder is betting '), betAmount);

    return bet(betAmount);

  }

};
