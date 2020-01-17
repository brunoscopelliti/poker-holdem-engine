"use strict";

const config = require("./demo.json");
const tournamentSettings = require("./tournament-settings.json");

const Tournament = require("../tournament");

let tournament;

process.on("message", (msg) => {
  switch (msg.topic) {
    case "create":
      tournament = new Tournament(
        "Demo",
        config.players.slice(),
        tournamentSettings,
        {
          autoStart: true,
          async onFeed (feed) {
            console.log("****");
            console.log(JSON.stringify(feed.players, null, 2));
            console.log("****");
          },
          async onGameComplete (chart) {
            console.log("**** Game completed ****");
            console.log(chart);
            console.log("************************");
          },
          async onTournamentComplete () {
            console.log("**** Completed ****");
            quit();
          },
        }
      );
      break;

    case "pause":
    case "restart":
      tournament[msg.topic]();
      break;

    default:
      console.log(`[${msg.topic}]: ${msg.message}.`);
  }

  // Run `quit()` to quit this process.
  // quit();
});

// eslint-disable-next-line no-unused-vars
const quit =
  () => process.send({ topic: "exit" });
