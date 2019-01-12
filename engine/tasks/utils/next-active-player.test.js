/* eslint-env jest */

"use strict";

const next = require("./next-active-player");

it("returns next player's index", () => {
  const players = [{
    name: "arale",
    state: "active",
  }, {
    name: "bender",
    state: "fold",
  }, {
    name: "marvin",
    state: "active",
  }, {
    name: "r2d2",
    state: "active",
  }];

  expect(
    next(players, 0)
  ).toBe(2);

  expect(
    next(players, 1)
  ).toBe(2);

  expect(
    next(players, 2)
  ).toBe(3);

  expect(
    next(players, 3)
  ).toBe(0);
});

it("returns next player's index (double skip)", () => {
  const players = [{
    name: "arale",
    state: "active",
  }, {
    name: "bender",
    state: "fold",
  }, {
    name: "marvin",
    state: "fold",
  }, {
    name: "r2d2",
    state: "active",
  }];

  expect(
    next(players, 0)
  ).toBe(3);

  expect(
    next(players, 1)
  ).toBe(3);

  expect(
    next(players, 2)
  ).toBe(3);

  expect(
    next(players, 3)
  ).toBe(0);
});

it("returns next player's index (skip first)", () => {
  const players = [{
    name: "arale",
    state: "fold",
  }, {
    name: "bender",
    state: "active",
  }, {
    name: "marvin",
    state: "active",
  }, {
    name: "r2d2",
    state: "fold",
  }];

  expect(
    next(players, 0)
  ).toBe(1);

  expect(
    next(players, 1)
  ).toBe(2);

  expect(
    next(players, 2)
  ).toBe(1);

  expect(
    next(players, 3)
  ).toBe(1);
});
