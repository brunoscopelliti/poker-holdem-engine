"use strict";

const config = require("./demo.json");
const tournamentSettings = require("./tournament-settings.json");

const Tournament = require("../tournament");

const players = config.players.slice();

const startTournament =
  () => {
    let tournament = new Tournament("Demo", players, tournamentSettings, { autoStart: true });

    tournament.on("TOURNAMENT:updated", (data, done) => {
      // save data; then done();
      console.log("************");
      console.log(data);
      console.log("************");
      done();
    });
  };

startTournament();
