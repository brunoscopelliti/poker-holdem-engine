/* eslint-env jest */

"use strict";

const getPlayerFactory = require("./create");

describe("payBet", () => {
  const save = jest.fn();
  const create = getPlayerFactory({ debug: jest.fn(), info: jest.fn() }, save, { BUYIN: 100 });
  let player;

  beforeEach(() => {
    player = create({ id: "a1", name: "Arale", serviceUrl: "http://arale.com/" });
    player.cards = [{ rank: "2", type: "H" }, { rank: "7", type: "H" }];
    player.chips = 100;
    player.chipsBet = 0;
    player.state = "active";

    save.mockClear();
  });

  it("calls", async () => {
    const gamestate = {
      callAmount: 20,
      players: [
        player,
      ],
      sidepots: [],
    };

    player.chipsBet = 10;

    const spy = jest.spyOn(player, Symbol.for("pay"));

    await player.payBet(gamestate, 10);

    expect(spy).toBeCalledTimes(1);
    expect(spy).toBeCalledWith(gamestate, 10);
  });

  it("cannot raise itself", async () => {
    const gamestate = {
      callAmount: 20,
      lastRaiseAmount: 10,
      players: [
        player,
        {
          [Symbol.for("already-bet")]: true,
        },
      ],
      sidepots: [],
    };

    player.chipsBet = 10;
    player[Symbol.for("already-bet")] = true;

    const spy = jest.spyOn(player, Symbol.for("pay"));

    await player.payBet(gamestate, 10);

    expect(spy).toBeCalledTimes(1);
    expect(spy).toBeCalledWith(gamestate, 10);

    expect(
      gamestate.players[1][Symbol.for("already-bet")]
    ).toBe(true);
  });

  it("calls, if amount is less than minimum raise amount", async () => {
    const gamestate = {
      callAmount: 20,
      lastRaiseAmount: 10,
      players: [
        player,
        {
          [Symbol.for("already-bet")]: true,
        },
      ],
      sidepots: [],
    };

    player.chipsBet = 10;

    const spy = jest.spyOn(player, Symbol.for("pay"));

    await player.payBet(gamestate, 18);

    expect(spy).toBeCalledTimes(1);
    expect(spy).toBeCalledWith(gamestate, 10);

    expect(
      gamestate.players[1][Symbol.for("already-bet")]
    ).toBe(true);
  });

  it("bet everything, but it's still not a valid raise", async () => {
    const gamestate = {
      callAmount: 20,
      lastRaiseAmount: 10,
      players: [
        player,
        {
          [Symbol.for("already-bet")]: true,
        },
      ],
      sidepots: [],
    };

    player.chipsBet = 10;
    player.chips = 18;

    const spy = jest.spyOn(player, Symbol.for("pay"));

    await player.payBet(gamestate, 18);

    expect(spy).toBeCalledTimes(1);
    expect(spy).toBeCalledWith(gamestate, 18);

    expect(
      gamestate.players[1][Symbol.for("already-bet")]
    ).toBe(true);

    expect(
      gamestate.lastRaiseAmount
    ).toBe(10);
  });

  it("raises", async () => {
    const gamestate = {
      callAmount: 20,
      lastRaiseAmount: 10,
      players: [
        player,
        {
          [Symbol.for("already-bet")]: true,
        },
      ],
      sidepots: [],
    };

    player.chipsBet = 10;

    const spy = jest.spyOn(player, Symbol.for("pay"));

    await player.payBet(gamestate, 22);

    expect(spy).toBeCalledTimes(1);
    expect(spy).toBeCalledWith(gamestate, 22);

    expect(
      gamestate.players[1][Symbol.for("already-bet")]
    ).toBeUndefined();

    expect(
      gamestate.lastRaiseAmount
    ).toBe(12);
  });

  it("save the bet", async () => {
    const gamestate = {
      callAmount: 20,
      handUniqueId: "foo",
      players: [{
        player,
      }],
      session: "FLOP",
      sidepots: [],
    };

    player.chipsBet = 10;

    await player.payBet(gamestate, 10);

    expect(save).toBeCalledTimes(1);
    expect(save).toBeCalledWith({
      type: "bet",
      amount: 10,
      handId: "foo",
      playerId: "a1",
      session: "FLOP",
    });
  });
});
