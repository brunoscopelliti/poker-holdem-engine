"use strict";

const config = require("./demo.json");
const tournamentSettings = require("./tournament-settings.json");

const Tournament = require("../tournament");

const players = config.players.slice();

let tournament;

process.on("message", (msg) => {
  switch (msg.topic) {
    case "create":
      tournament = new Tournament("Demo", players, tournamentSettings, { autoStart: true });
      tournament.on("TOURNAMENT:updated", (data, done) => {
        // save data; then done();
        done();
      });
      break;

    case "pause":
      tournament.pause();
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
