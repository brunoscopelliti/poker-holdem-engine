"use strict";

const States = new Map([
  // tournament has just been created.
  ["created", "created"],

  // tournament is active,
  // and the game proceed.
  ["active", "active"],

  // tournament is active,
  // but the game is temporarily paused.
  ["paused", "paused"],

  // tournament is active,
  // and the game proceed;
  // when current game completes
  // tournament will be completed.
  ["latest-game", "latest-game"],

  // tournament is no more active.
  ["completed", "completed"],
]);

module.exports = States;
