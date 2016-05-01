
'use strict';

const exec = require('child_process').exec;
const chalk = require('chalk');

const config = require('./demo-config');
const engine = require('./index');

console.log(config)

engine.on('tournament:aborted', function() {
  console.log(chalk.bold.red('Tournament aborted.'));
});

engine.on('tournament:completed', function() {
  console.log(chalk.bold.green('Tournament completed.'));
});

engine.on('gamestate:updated', function(data, done) {
  console.log(chalk.bold.green('Gamestate updated.'));
  done();
});


const tournamentID = config.tournamentId;
const players = config.players;

players.forEach(function(player) {
  const port = player.serviceUrl.match(/:([\d]{4})\/$/)[1];
  const child = exec('node ./index.js', { cwd: `./demo-players/${player.name}/`, env: { PORT: port } }, function(err, stdout, stderr) {
    if (err) {
      console.log(chalk.bold.red('An error occurred while trying to open child process'), err);
    }
  });
  child.stdout.on('data', data => console.log(chalk.bold.green(`${player.name}'s stdout:`), data));
  child.stderr.on('data', data => console.log(chalk.bold.red(`${player.name}'s stderr:`), data));
});

console.log(chalk.bold.green('Ready to start a local tournament.'))
engine.start(tournamentID, players);
