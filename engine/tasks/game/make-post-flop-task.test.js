/* eslint-env jest */

"use strict";

jest.mock("./bet-loop");

const task = require("./make-post-flop-task")("FLOP");

it("is called 'FLOP betting round'", () => {
  expect(task.name)
    .toBe("FLOP betting round");
});

it("should run if tournament state is Active", () => {
  expect(
    task.shouldRun({
      state: "active",
      gamestate: {
        activePlayers: [1, 2],
      },
    })
  ).toBe(true);
});

it("should run if tournament state is Latest game", () => {
  expect(
    task.shouldRun({
      state: "latest-game",
      gamestate: {
        activePlayers: [1, 2],
      },
    })
  ).toBe(true);
});

it("shouldn't run if tournament state is something else", () => {
  expect(
    task.shouldRun({
      state: "pause",
      gamestate: {
        activePlayers: [1, 2],
      },
    })
  ).toBe(false);
});

it("shouldn't run if only there's only one active player", () => {
  expect(
    task.shouldRun({
      state: "active",
      gamestate: {
        activePlayers: [1],
      },
    })
  ).toBe(false);
});

it("uncover the fourth common card", async () => {
  const gamestate = {
    activePlayers: [{}, {}],
    dealerPosition: 1,
    commonCards: [1, 2, 3],
    deck: [4, 5],
    handUniqueId: "1/2",
  };

  const update = jest.fn();

  await task.run({ debug: () => {} }, { gamestate, update });

  expect(
    require("./bet-loop")
  ).toHaveBeenCalledWith(gamestate, 1);

  expect(gamestate)
    .toEqual({
      activePlayers: [{}, {}],
      dealerPosition: 1,
      commonCards: [1, 2, 3, 4],
      deck: [5],
      handUniqueId: "1/2",
      session: "FLOP",
      spinCount: 0,
    });

  expect(update).toHaveBeenCalledTimes(1);
  expect(update).toHaveBeenCalledWith({
    type: "cards",
    cards: [4],
    handId: "1/2",
    session: "TURN",
  });
});

it("doesn't uncover any cards when there's any active player", async () => {
  const gamestate = {
    activePlayers: [],
    commonCards: [1, 2, 3],
  };

  await task.run(null, { gamestate });

  expect(gamestate)
    .toEqual({
      activePlayers: [],
      commonCards: [1, 2, 3],
      session: "FLOP",
    });
});

it("doesn't uncover any cards when there're already five common cards displayed", async () => {
  const gamestate = {
    activePlayers: [1, 2],
    commonCards: [1, 2, 3, 4, 5],
  };

  await task.run({ debug: () => {} }, { gamestate });

  expect(gamestate)
    .toEqual({
      activePlayers: [1, 2],
      commonCards: [1, 2, 3, 4, 5],
      session: "RIVER",
      spinCount: 0,
    });
});
