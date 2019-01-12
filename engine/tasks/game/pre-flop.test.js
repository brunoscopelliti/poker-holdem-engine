/* eslint-env jest */

"use strict";

jest.mock("./bet-loop");

const task = require("./pre-flop");

it("should run if tournament state is Active", () => {
  expect(
    task.shouldRun({
      state: "active",
      gamestate: {
        commonCards: [],
      },
    })
  ).toBe(true);
});

it("should run if tournament state is Latest game", () => {
  expect(
    task.shouldRun({
      state: "latest-game",
      gamestate: {
        commonCards: [],
      },
    })
  ).toBe(true);
});

it("shouldn't run if tournament state is something else", () => {
  expect(
    task.shouldRun({
      state: "pause",
      gamestate: {
        commonCards: [],
      },
    })
  ).toBe(false);
});

it("shouldn't run after pre-flop", () => {
  expect(
    task.shouldRun({
      state: "active",
      gamestate: {
        commonCards: [1, 2, 3],
      },
    })
  ).toBe(false);
});

it("uncover first three common cards", async () => {
  const gamestate = {
    activePlayers: [1, 2],
    bigBlindPosition: 1,
    commonCards: [],
    deck: [1, 2, 3, 4],
    handUniqueId: "1/2",
  };

  const update = jest.fn();

  await task.run({ debug: () => {} }, { gamestate, update });

  expect(
    require("./bet-loop")
  ).toHaveBeenCalledWith(gamestate, 1);

  expect(gamestate)
    .toEqual({
      activePlayers: [1, 2],
      bigBlindPosition: 1,
      commonCards: [1, 2, 3],
      deck: [4],
      handUniqueId: "1/2",
      session: "PRE-FLOP",
      spinCount: 0,
    });

  expect(update).toHaveBeenCalledTimes(1);
  expect(update).toHaveBeenCalledWith({
    type: "cards",
    cards: [1, 2, 3],
    handId: "1/2",
    session: "FLOP",
  });
});

it("doesn't uncover any cards when there's any active player", async () => {
  const gamestate = {
    activePlayers: [],
  };

  await task.run({ debug: () => {} }, { gamestate });

  expect(gamestate)
    .toEqual({
      activePlayers: [],
      session: "PRE-FLOP",
      spinCount: 0,
    });
});
