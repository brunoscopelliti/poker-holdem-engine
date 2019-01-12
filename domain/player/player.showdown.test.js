/* eslint-env jest */

"use strict";

const getPlayerFactory = require("./create");

const card =
  (rank, type) => ({
    rank,
    type,
  });

describe("showdown", () => {
  const create = getPlayerFactory({ info: jest.fn() }, () => {}, { BUYIN: 100 });
  let player;

  beforeEach(() => {
    player = create({ id: "a1", name: "Arale", serviceUrl: "http://arale.com/" });
    player.cards = [card("2", "H"), card("7", "H")];
  });

  it("computes player best point", () => {
    const point = player.showdown({
      commonCards: [
        card("2", "C"),
        card("3", "C"),
        card("A", "D"),
        card("6", "H"),
        card("K", "D"),
      ],
    });

    expect(point).toHaveLength(5);
    expect(point.rank).toEqual({
      name: "Pair",
      kickers: ["A", "K", "7"],
      rank: "2",
      strength: 1,
    });
  });
});
