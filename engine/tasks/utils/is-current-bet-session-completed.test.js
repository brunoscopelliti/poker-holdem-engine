/* eslint-env jest */

"use strict";

const isCompleted = require("./is-current-bet-session-completed");

it("returns `true`, when there's only one active player", () => {
  expect(
    isCompleted([1]) /* Only one */
  ).toBe(true);
});

it("returns `true`, when everyone has bet the callAmount", () => {
  expect(
    isCompleted([{ chipsBet: 100 }, { chipsBet: 100 }], 100)
  ).toBe(true);
});

it("returns `true`, when everyone, but allin, has bet the callAmount", () => {
  expect(
    isCompleted([{
      chipsBet: 100,
    }, {
      [Symbol.for("All-in")]: true,
      chipsBet: 50,
    }, {
      chipsBet: 100,
    }], 100)
  ).toBe(true);
});

it("returns `false` otherwise", () => {
  expect(
    isCompleted([{
      chipsBet: 100,
    }, {
      chipsBet: 50,
    }, {
      chipsBet: 100,
    }], 100)
  ).toBe(false);
});
