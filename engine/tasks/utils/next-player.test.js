/* eslint-env jest */

"use strict";

const next = require("./next-player");

it("returns next player's index", () => {
  const players = [{
    name: "arale",
  }, {
    name: "bender",
  }, {
    name: "marvin",
  }];

  expect(
    next(players, 0)
  ).toBe(1);

  expect(
    next(players, 1)
  ).toBe(2);

  expect(
    next(players, 2)
  ).toBe(0);
});
