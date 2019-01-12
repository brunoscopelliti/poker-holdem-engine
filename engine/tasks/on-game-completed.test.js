/* eslint-env jest */

"use strict";

const task = require("./on-game-completed");

it("runs when all players are out but one", () => {
  const gamestate = {
    players: [1, 2, 3, 4],
    outPlayers: [2, 3, 4],
  };

  expect(
    task.shouldRun({ gamestate })
  ).toBe(true);
});

it("doesn't run when more than one player is active", () => {
  const gamestate = {
    players: [1, 2, 3, 4],
    outPlayers: [4],
  };

  expect(
    task.shouldRun({ gamestate })
  ).toBe(false);
});

describe("run", () => {
  test("Save final game rank", async () => {
    const gamestate = {
      activePlayers: [{
        id: "b1",
        name: "Bender",
      }],
      handUniqueId: "1/2",
      players: [1, 2],
      gameRank: [{
        playerId: "a1",
        playerName: "Arale",
      }],
      gameProgressiveId: 1,
    };

    const settings = {
      POINTS: [
        [10, 5],
      ],
    };

    const update = jest.fn();

    const tournament = {
      gamestate,
      settings,
      state: "latest-game",
      update,
    };

    await task.run({ info: () => {}, debug: () => {} }, tournament);

    expect(tournament.state).toBe("completed");

    expect(update).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith({
      type: "points",
      handId: "1/2",
      gameId: 1,
      rank: [{
        playerId: "b1",
        playerName: "Bender",
        points: 10,
      }, {
        playerId: "a1",
        playerName: "Arale",
        points: 5,
      }],
    });
  });

  test("Reset player state", async () => {
    const restore = jest.fn();

    const gamestate = {
      activePlayers: [{
        id: "b1",
        name: "Bender",
      }],
      handUniqueId: "1/2",
      players: [{
        restore,
      }, {
        restore,
      }],
      gameRank: [{
        playerId: "a1",
        playerName: "Arale",
      }],
      gameProgressiveId: 1,
    };

    const settings = {
      POINTS: [
        [10, 5],
      ],
    };

    const tournament = {
      gamestate,
      settings,
      state: "active",
      update: () => {},
    };

    await task.run({ info: () => {}, debug: () => {} }, tournament);

    expect(tournament.state).toBe("active");

    expect(restore).toHaveBeenCalledTimes(2);
    expect(restore).toHaveBeenNthCalledWith(1, true);
    expect(restore).toHaveBeenNthCalledWith(2, true);
  });
});
