/* eslint-env jest */

"use strict";

const getPlayerFactory = require("./create");

describe("pay", () => {
  const create = getPlayerFactory({ info: jest.fn() }, () => {}, { BUYIN: 100 });
  let player;

  beforeEach(() => {
    player = create({ id: "a1", name: "Arale", serviceUrl: "http://arale.com/" });
    player.cards = [{ rank: "2", type: "H" }, { rank: "7", type: "H" }];
    player.chips = 100;
    player.chipsBet = 0;
    player.state = "active";
  });

  it("updates gamestate and player state", () => {
    const gamestate = {
      callAmount: 0,
      players: [
        player,
      ],
      pot: 0,
      sidepots: [],
    };

    player.pay(gamestate, 20);

    expect(player.chips).toBe(80);
    expect(player.chipsBet).toBe(20);

    expect(gamestate.callAmount).toBe(20);
    expect(gamestate.pot).toBe(20);
    expect(gamestate.sidepots).toHaveLength(0);
  });

  it("doesn't take more than available", () => {
    const gamestate = {
      callAmount: 0,
      players: [
        player,
      ],
      pot: 0,
      sidepots: [],
    };

    player.pay(gamestate, 120);

    expect(player[Symbol.for("All-in")]).toBe(true);

    expect(player.chips).toBe(0);
    expect(player.chipsBet).toBe(100);

    expect(gamestate.callAmount).toBe(100);
    expect(gamestate.pot).toBe(100);
    expect(gamestate.sidepots).toHaveLength(0);
  });
});
