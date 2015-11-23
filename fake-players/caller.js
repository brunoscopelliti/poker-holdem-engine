
var chalk = require('chalk');

exports = module.exports = {

  VERSION: "Caller player",

  bet: function (gamestate, bet) {

    var me = gamestate.players[gamestate.me];

    var betAmount = me.callAmount * 4;

    console.log(chalk.blue('Caller is betting '), betAmount);

    bet(betAmount);

  }

};
