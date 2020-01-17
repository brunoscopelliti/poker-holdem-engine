"use strict";

const config = require("./demo.json");
const tournamentSettings = require("./tournament-settings.json");

const Tournament = require("../tournament");

const players = config.players.slice();

const startTournament =
  () => {
    // eslint-disable-next-line no-new
    new Tournament(
      "Demo",
      players,
      tournamentSettings,
      {
        autoStart: true,
        async onFeed (data) {
          console.log("****");
          console.log(JSON.stringify(data, null, 2));
          console.log("****");
        },
        async onTournamentComplete () {
          console.log("**** Completed ****");
        },
      }
    );
  };

startTournament();
