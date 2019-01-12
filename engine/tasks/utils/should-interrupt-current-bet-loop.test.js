/* eslint-env jest */

"use strict";

const shouldInterrupt = require("./should-interrupt-current-bet-loop");

test("first loop should never be interrupted", () => {
  expect(
    shouldInterrupt({
      spinCount: 0,
    })
  ).toBe(false);
});

test("should interrupt when all players have bet call amount", () => {
  expect(
    shouldInterrupt({
      activePlayers: [{
        chipsBet: 100,
      }, {
        chipsBet: 100,
      }],
      callAmount: 100,
      spinCount: 1,
    })
  ).toBe(true);
});

test("should interrupt when all players, but all in, have bet call amount", () => {
  expect(
    shouldInterrupt({
      activePlayers: [{
        chipsBet: 100,
      }, {
        [Symbol.for("All-in")]: true,
        chipsBet: 50,
      }],
      callAmount: 100,
      spinCount: 1,
    })
  ).toBe(true);
});

test("shouldn't interrupt when not all players have bet call amount", () => {
  expect(
    shouldInterrupt({
      activePlayers: [{
        chipsBet: 100,
      }, {
        chipsBet: 50,
      }],
      callAmount: 100,
      spinCount: 1,
    })
  ).toBe(false);
});
