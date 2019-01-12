/* eslint-env jest */

"use strict";

jest.mock("request", () => {
  return {
    post: jest.fn(),
  };
});

const request = require("request");

const getPlayerFactory = require("./create");

describe("talk", () => {
  const create = getPlayerFactory({ info: jest.fn(), warn: jest.fn() }, () => {}, { BUYIN: 100 });
  let player;

  beforeEach(() => {
    player = create({ id: "a1", name: "Arale", serviceUrl: "http://arale.com/" });
  });

  it("returns 0, when request fails", async () => {
    const gamestate = {
      players: [],
    };

    request.post.mockImplementation(
      (_1, _2, fn) => {
        fn({
          message: "Internal Server Error",
        });
      }
    );

    expect(
      await player.talk(gamestate)
    ).toBe(0);
  });

  it("returns 0, when response is not a positive number", async () => {
    const gamestate = {
      players: [],
    };

    request.post.mockImplementation(
      (_1, _2, fn) => {
        fn(null, {}, "-10");
      }
    );

    expect(
      await player.talk(gamestate)
    ).toBe(0);
  });

  it("returns 0, when response is not a valid number", async () => {
    const gamestate = {
      players: [],
    };

    request.post.mockImplementation(
      (_1, _2, fn) => {
        fn(null, {}, "lol");
      }
    );

    expect(
      await player.talk(gamestate)
    ).toBe(0);
  });

  it("returns the minimum between rensponse and available chips", async () => {
    const gamestate = {
      players: [],
    };

    player.chips = 10;

    request.post.mockImplementation(
      (_1, _2, fn) => {
        fn(null, {}, "20");
      }
    );

    expect(
      await player.talk(gamestate)
    ).toBe(10);
  });
});

describe("talk payload", () => {
  const create = getPlayerFactory({ info: jest.fn(), warn: jest.fn() }, () => {}, { BUYIN: 100 });
  let arale, bender;

  beforeEach(() => {
    arale = create({ id: "a1", name: "Arale", serviceUrl: "http://arale.com/" });
    bender = create({ id: "b1", name: "Bender", serviceUrl: "http://bender.com/" });
  });

  it("send gamestate with the request", async () => {
    const gamestate = {
      tournamentId: "Bot Tournament",
      gameProgressiveId: 1,
      handProgressiveId: 2,
      spinCount: 0,
      dealerPosition: 0,
      sb: 5,
      pot: 30,
      callAmount: 20,
      sidepots: [],
      commonCards: [{
        rank: "7",
        type: "H",
      }, {
        rank: "K",
        type: "C",
      }, {
        rank: "2",
        type: "H",
      }],
      players: [
        arale,
        bender,
      ],
    };

    arale.chipsBet = 20;
    arale.cards = [{
      rank: "5",
      type: "C",
    }, {
      rank: "5",
      type: "D",
    }];

    bender.chipsBet = 10;
    bender.cards = [{
      rank: "8",
      type: "D",
    }, {
      rank: "9",
      type: "H",
    }];

    request.post.mockImplementation(
      (_, settings, fn) => {
        const state = settings.body;

        expect(
          state.me
        ).toBe(0);

        expect(
          state.callAmount
        ).toBe(0);

        expect(
          state.players[0].cards
        ).toHaveLength(2);

        expect(
          state.players[1].cards
        ).toBeUndefined();

        fn(null, {}, 0);
      }
    );

    await arale.talk(gamestate);

    request.post.mockImplementation(
      (_, settings, fn) => {
        const state = settings.body;

        expect(
          state.me
        ).toBe(1);

        expect(
          state.callAmount
        ).toBe(10);

        expect(
          state.players[1].cards
        ).toHaveLength(2);

        expect(
          state.players[0].cards
        ).toBeUndefined();

        fn(null, {}, 0);
      }
    );

    await bender.talk(gamestate);
  });
});
