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

    const update = jest.fn();

    await task.run(LOGGER, { gamestate, update });

    expect(
      gamestate.handRank.map((x) => x.playerId)
    ).toEqual(["a1", "m1", "b1"]);

    expect(update).toBeCalledTimes(1);
    expect(update).toBeCalledWith({
      type: "showdown",
      handId: "1/3",
      ranks: [{
        bestCards: [{
          rank: "A",
          type: "C",
        }, {
          rank: "A",
          type: "H",
        }, {
          rank: "A",
          type: "D",
        }, {
          rank: "A",
          type: "S",
        }, {
          rank: "J",
          type: "D",
        }],
        bestCardsInfo: {
          kickers: ["J"],
          name: "Poker",
          rank: "A",
          strength: 7,
        },
        playerId: "a1",
      }, {
        bestCards: [{
          rank: "4",
          type: "C",
        }, {
          rank: "4",
          type: "D",
        }, {
          rank: "A",
          type: "D",
        }, {
          rank: "A",
          type: "S",
        }, {
          rank: "4",
          type: "H",
        }],
        bestCardsInfo: {
          kickers: ["A"],
          name: "Full House",
          rank: "4",
          strength: 6,
        },
        playerId: "m1",
      }, {
        bestCards: [{
          rank: "K",
          type: "S",
        }, {
          rank: "Q",
          type: "H",
        }, {
          rank: "A",
          type: "D",
        }, {
          rank: "A",
          type: "S",
        }, {
          rank: "J",
          type: "D",
        },
        ],
        bestCardsInfo: {
          kickers: ["K", "Q", "J"],
          name: "Pair",
          rank: "A",
          strength: 1,
        },
        playerId: "b1",
      }],
    });
  });
});
