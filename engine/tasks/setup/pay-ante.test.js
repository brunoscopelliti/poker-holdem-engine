/* eslint-env jest */

"use strict";

const task = require("./pay-ante");

it("should never run if Ante is disabled", () => {
  expect(
    task.shouldRun({
      state: "active",
      gamestate: {
        handProgressiveId: Infinity,
      },
      settings: {},
    })
  ).toBe(false);
});

it("shouldn't run during initial phase of a game", () => {
  expect(
    task.shouldRun({
      state: "active",
      gamestate: {
        handProgressiveId: 4,
      },
      settings: {
        PAY_ANTE_AT_HAND: 10,
      },
    })
  ).toBe(false);
});

it("should run if tournament state is Active", () => {
  expect(
    task.shouldRun({
      state: "active",
      gamestate: {
        handProgressiveId: 10,
      },
      settings: {
        PAY_ANTE_AT_HAND: 10,
      },
    })
  ).toBe(true);
});

it("should run if tournament state is Latest game", () => {
  expect(
    task.shouldRun({
      state: "latest-game",
      gamestate: {
        handProgressiveId: 10,
      },
      settings: {
        PAY_ANTE_AT_HAND: 10,
      },
    })
  ).toBe(true);
});

it("shouldn't run if tournament state is something else", () => {
  expect(
    task.shouldRun({
      state: "pause",
      gamestate: {
        handProgressiveId: 10,
      },
      settings: {
        PAY_ANTE_AT_HAND: 10,
      },
    })
  ).toBe(false);
});

describe("run", () => {
  const pay = jest.fn();
  const gamestate = {
    activePlayers: [{
      name: "Arale",
      pay,
    }],
    sb: 10,
  };

  task.run(null, { gamestate });

  expect(pay).toHaveBeenCalledTimes(1);
  expect(pay).toHaveBeenNthCalledWith(1, gamestate, 2);
});
