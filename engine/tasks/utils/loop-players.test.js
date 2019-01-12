/* eslint-env jest */

"use strict";

const loop = require("./loop-players");

it("loop over every player once", () => {
  const handler = jest.fn();
  const players = [{
    name: "Arale",
  }, {
    name: "Bender",
  }, {
    name: "Marvin",
  }];

  loop(players, 0, handler);

  expect(handler).toBeCalledTimes(3);
  expect(handler).toHaveBeenNthCalledWith(1, players[1], 1, players);
  expect(handler).toHaveBeenNthCalledWith(2, players[2], 2, players);
  expect(handler).toHaveBeenNthCalledWith(3, players[0], 0, players);
});
