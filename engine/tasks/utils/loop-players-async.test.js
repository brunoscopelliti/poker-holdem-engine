/* eslint-env jest */

"use strict";

const loop = require("./loop-players-async");

it("loop over every player once", async () => {
  const handler = jest.fn();
  const players = [{
    name: "Arale",
  }, {
    name: "Bender",
  }, {
    name: "Marvin",
  }];

  await loop(players, 0, handler);

  expect(handler).toBeCalledTimes(3);
  expect(handler).toHaveBeenNthCalledWith(1, players[1], 1, players);
  expect(handler).toHaveBeenNthCalledWith(2, players[2], 2, players);
  expect(handler).toHaveBeenNthCalledWith(3, players[0], 0, players);
});

it("eventually break the loop", async () => {
  const handler = jest.fn();
  const players = [{
    name: "Arale",
  }, {
    name: "Bender",
  }, {
    name: "Marvin",
  }];

  const shouldBreak =
    (player) => player.name === "Marvin";

  await loop(players, 0, shouldBreak, handler);

  expect(handler).toBeCalledTimes(1);
  expect(handler).toHaveBeenNthCalledWith(1, players[1], 1, players);
});
