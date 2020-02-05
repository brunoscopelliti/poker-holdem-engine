/* eslint-env jest */

"use strict";

const getPlayerFactory = require("./create");

it("returns a player factory", () => {
  expect(
    typeof getPlayerFactory()
  ).toBe("function");
});

it("can't create invalid player", () => {
  const LOGGER = { warn: jest.fn() };
  expect(
    getPlayerFactory(LOGGER)({ name: "Arale" })
  ).toBe(null);

  expect(LOGGER.warn)
    .toHaveBeenCalledTimes(1);
});

it("create a new player", () => {
  const LOGGER = { info: jest.fn() };
  const save = () => {};

  const player =
    getPlayerFactory(LOGGER, save, { BUYIN: 100 })({ id: "a1", name: "Arale", serviceUrl: "http://arale.com/" });

  expect(player.id).toBe("a1");
  expect(player.name).toBe("Arale");
  expect(player.serviceUrl).toBe("http://arale.com/");

  expect(player).toEqual({
    cards: [],
    chips: 100,
    chipsBet: 0,
    state: "active",
    id: "a1",
    name: "Arale",
    serviceUrl: "http://arale.com/",
  });

  expect(LOGGER.info)
    .toHaveBeenCalledTimes(1);
});

describe("restore", () => {
  const create = getPlayerFactory({ info: jest.fn() }, () => {}, { BUYIN: 100 });
  let player;

  beforeEach(() => {
    player = create({ id: "a1", name: "Arale", serviceUrl: "http://arale.com/" });
    player.cards = [{ rank: "2", type: "H" }, { rank: "7", type: "H" }];
    player.chipsBet = 10;
    player.state = "fold";
  });

  it("restore player", () => {
    player.restore();
    expect(player.chipsBet).toBe(0);
    expect(player.cards).toHaveLength(0);
    expect(player.state).toBe("active");
  });

  it("restore special fields", () => {
    player.allin = true;
    player.bigBlind = true;
    player.restore();

    expect(player.allin).toBe(undefined);
    expect(player.bigBlind).toBe(undefined);
  });

  it("doesn't change eliminated players' state", () => {
    player.state = "out";
    player.restore();
    expect(player.chipsBet).toBe(0);
    expect(player.cards).toHaveLength(0);
    expect(player.state).toBe("out");
  });
});
