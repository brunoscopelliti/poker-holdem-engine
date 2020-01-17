/* eslint-env jest */

"use strict";

const task = require("./rank-hand");
const getPlayerFactory = require("../../../domain/player/create");

describe("showdown", () => {
  const LOGGER = {
    info: jest.fn(),
  };

  const create = getPlayerFactory(LOGGER, () => {}, { BUYIN: 100 });

  it("does nothing when there's only one active player", async () => {
    const gamestate = {
      activePlayers: [
        create({ id: "a1", name: "Arale", serviceUrl: "http://arale.com/" }),
      ],
    };

    await task.run(null, { gamestate });

    expect(gamestate.handRank).toBeUndefined();
  });

  const card =
    (rank, type) => ({
      rank,
      type,
    });

  it("create the rank of the current hand", async () => {
    // Poker
    const arale = create({ id: "a1", name: "Arale", serviceUrl: "http://arale.com/" });
    arale.cards = [card("A", "C"), card("A", "H")];

    // Pair
    const bender = create({ id: "b1", name: "Bender", serviceUrl: "http://bender.com/" });
    bender.cards = [card("K", "S"), card("Q", "H")];

    // Full House
    const marvin = create({ id: "m1", name: "Marvin", serviceUrl: "http://marvin.com/" });
    marvin.cards = [card("4", "C"), card("4", "D")];

    const gamestate = {
      activePlayers: [
        bender,
        marvin,
        arale,
      ],
      commonCards: [
        card("A", "D"),
        card("A", "S"),
        card("J", "D"),
        card("4", "H"),
        card("9", "H"),
      ],
      handUniqueId: "1/3",
    };

    const onFeed = jest.fn();

    await task.run(LOGGER, { gamestate, onFeed });

    expect(
      gamestate.handRank.map((x) => x.playerId)
    ).toEqual(["a1", "m1", "b1"]);

    expect(onFeed).toBeCalledTimes(1);
    expect(onFeed).toBeCalledWith(gamestate);
  });
});
