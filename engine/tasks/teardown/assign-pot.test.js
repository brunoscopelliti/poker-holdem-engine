/* eslint-env jest */

"use strict";

const task = require("./assign-pot");

describe("assign pot", () => {
  const LOGGER = {
    info: jest.fn(),
  };

  const player =
    (name, state, chips, chipsBet) => ({
      id: name.toUpperCase(),
      name,
      chips,
      chipsBet,
      state,
    });

  it("assigns the pot to the only active player", async () => {
    const gamestate = {
      activePlayers: [
        player("Arale", "active", 100, 20),
      ],
      pot: 42,
    };

    const update = jest.fn();

    await task.run(LOGGER, { gamestate, update });

    expect(
      gamestate.activePlayers[0].chips
    ).toBe(142);

    expect(
      gamestate.pot
    ).toBe(0);
  });

  it("saves the winners", async () => {
    const gamestate = {
      activePlayers: [
        player("Arale", "active", 100, 20),
      ],
      handUniqueId: "1/2",
      pot: 42,
    };

    const update = jest.fn();

    await task.run(LOGGER, { gamestate, update });

    expect(
      gamestate.winners
    ).toEqual([{
      amount: 42,
      playerId: "ARALE",
      playerName: "Arale",
    }]);

    expect(update).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith({
      type: "win",
      handId: "1/2",
      winners: [{
        amount: 42,
        playerId: "ARALE",
        playerName: "Arale",
      }],
    });
  });

  it("splits the pot between exequo players", async () => {
    const arale = player("Arale", "active", 100, 10);
    const bender = player("Bender", "active", 100, 10);
    const marvin = player("Marvin", "active", 100, 10);

    const gamestate = {
      activePlayers: [
        arale,
        bender,
        marvin,
      ],
      callAmount: 10,
      handRank: [{
        playerId: "MARVIN",
        bestCardsInfo: { exequo: "#0" },
      }, {
        playerId: "ARALE",
        bestCardsInfo: { exequo: "#0" },
      }, {
        playerId: "BENDER",
        bestCardsInfo: {},
      }],
      pot: 30,
      sidepots: [],
    };

    await task.run(LOGGER, { gamestate, update: () => {} });

    expect(arale.chips).toBe(115);
    expect(bender.chips).toBe(100);
    expect(marvin.chips).toBe(115);
    expect(gamestate.winners).toHaveLength(2);
  });

  it("assigns all the sidepots to the same player", async () => {
    const arale = player("Arale", "active", 145, 20);
    const bender = player("Bender", "active", 145, 20);
    const marvin = player("Marvin", "active", 0, 10);

    const gamestate = {
      activePlayers: [
        arale,
        bender,
        marvin,
      ],
      callAmount: 20,
      handRank: [{
        playerId: "BENDER",
        bestCardsInfo: {},
      }, {
        playerId: "ARALE",
        bestCardsInfo: {},
      }, {
        playerId: "MARVIN",
        bestCardsInfo: {},
      }],
      pot: 50,
      sidepots: [{
        minChipsBet: 10,
        pot: 30,
      }, {
        minChipsBet: 20,
        pot: 20,
      }],
    };

    await task.run(LOGGER, { gamestate, update: () => {} });

    expect(arale.chips).toBe(145);
    expect(bender.chips).toBe(195);
    expect(marvin.chips).toBe(0);
    expect(gamestate.winners).toHaveLength(1);
  });

  it("assigns sidepots to different players", async () => {
    const arale = player("Arale", "active", 145, 20);
    const bender = player("Bender", "active", 145, 20);
    const marvin = player("Marvin", "active", 0, 10);

    const gamestate = {
      activePlayers: [
        arale,
        bender,
        marvin,
      ],
      callAmount: 20,
      handRank: [{
        playerId: "MARVIN",
        bestCardsInfo: {},
      }, {
        playerId: "ARALE",
        bestCardsInfo: {},
      }, {
        playerId: "BENDER",
        bestCardsInfo: {},
      }],
      pot: 50,
      sidepots: [{
        minChipsBet: 10,
        pot: 30,
      }, {
        minChipsBet: 20,
        pot: 20,
      }],
    };

    await task.run(LOGGER, { gamestate, update: () => {} });

    expect(arale.chips).toBe(165);
    expect(bender.chips).toBe(145);
    expect(marvin.chips).toBe(30);
    expect(gamestate.winners).toHaveLength(2);
  });

  it("assigns sidepots (with exequo) to different players", async () => {
    const arale = player("Arale", "active", 145, 20);
    const bender = player("Bender", "active", 145, 20);
    const marvin = player("Marvin", "active", 0, 10);

    const gamestate = {
      activePlayers: [
        arale,
        bender,
        marvin,
      ],
      callAmount: 20,
      handRank: [{
        playerId: "MARVIN",
        bestCardsInfo: { exequo: "#0" },
      }, {
        playerId: "ARALE",
        bestCardsInfo: { exequo: "#0" },
      }, {
        playerId: "BENDER",
        bestCardsInfo: {},
      }],
      pot: 50,
      sidepots: [{
        minChipsBet: 10,
        pot: 30,
      }, {
        minChipsBet: 20,
        pot: 20,
      }],
    };

    await task.run(LOGGER, { gamestate, update: () => {} });

    expect(arale.chips).toBe(180);
    expect(bender.chips).toBe(145);
    expect(marvin.chips).toBe(15);
    expect(gamestate.winners).toHaveLength(2);
  });

  it("assigns sidepots (all exequo) to different players", async () => {
    const arale = player("Arale", "active", 145, 20);
    const bender = player("Bender", "active", 145, 20);
    const marvin = player("Marvin", "active", 0, 10);

    const gamestate = {
      activePlayers: [
        arale,
        bender,
        marvin,
      ],
      callAmount: 20,
      handRank: [{
        playerId: "MARVIN",
        bestCardsInfo: { exequo: "#0" },
      }, {
        playerId: "ARALE",
        bestCardsInfo: { exequo: "#0" },
      }, {
        playerId: "BENDER",
        bestCardsInfo: { exequo: "#0" },
      }],
      pot: 50,
      sidepots: [{
        minChipsBet: 10,
        pot: 30,
      }, {
        minChipsBet: 20,
        pot: 20,
      }],
    };

    await task.run(LOGGER, { gamestate, update: () => {} });

    expect(arale.chips).toBe(165);
    expect(bender.chips).toBe(165);
    expect(marvin.chips).toBe(10);
    expect(gamestate.winners).toHaveLength(3);
  });
});
