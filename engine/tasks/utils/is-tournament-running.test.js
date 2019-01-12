/* eslint-env jest */

"use strict";

const isRunning = require("./is-tournament-running");

it("should return `true` when tournament state is Active", () => {
  expect(
    isRunning({ state: "active" })
  ).toBe(true);
});

it("should return `true` when tournament state is Latest game", () => {
  expect(
    isRunning({ state: "latest-game" })
  ).toBe(true);
});

it("shouldn't return `false` when tournament state is something else", () => {
  expect(
    isRunning({ state: "pause" })
  ).toBe(false);
});
