/* eslint-env jest */

"use strict";

const split_ = require("./split-pot");

/**
 * A simple utility to simplify the tests.
 * @name split
 * @param {Number} bets
 */
const split =
  (bets) => {
    const gamestate = {
      players: bets.map((bet) => ({ chipsBet: bet })),
      sidepots: [],
    };

    split_(gamestate);

    return gamestate.sidepots;
  };

it("shouldn't create any sidepot", () => {
  expect(
    split([10, 10, 10, 10])
  ).toHaveLength(0);
});

it("should create two sidepots", () => {
  expect(
    split([10, 5, 10, 10])
  ).toEqual([{
    minChipsBet: 5,
    pot: 20,
  }, {
    minChipsBet: 10,
    pot: 15,
  }]);
});

it("should create three sidepots", () => {
  expect(
    split([10, 5, 20, 10, 20])
  ).toEqual([{
    minChipsBet: 5,
    pot: 25,
  }, {
    minChipsBet: 10,
    pot: 20,
  }, {
    minChipsBet: 20,
    pot: 20,
  }]);
});
