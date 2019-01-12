/* eslint-env jest */

"use strict";

const task = require("./update-game-rank");

test("no player should be excluded", async () => {
  const gamestate = {
    activePlayers: [{ chips: 1 }, { chips: 2 }],
  };

  await task.run(null, { gamestate });

  expect(gamestate.gameRank).toHaveLength(0);
});

test("exclude one player", async () => {
  const playerToBeExcluded1 = {
    chips: 0,
    id: "a1",
    name: "Arale",
  };

  const gamestate = {
    activePlayers: [{ chips: 1 }, playerToBeExcluded1, { chips: 2 }],
    handUniqueId: "1/2",
    gameRank: [{
      playerId: "b1",
      playerName: "Bender",
    }],
  };

  const update = jest.fn();

  await task.run({ info: () => {} }, { gamestate, update });

  expect(playerToBeExcluded1.state).toBe("out");

  expect(gamestate.gameRank).toEqual([{
    playerId: "a1",
    playerName: "Arale",
  }, {
    playerId: "b1",
    playerName: "Bender",
  }]);

  expect(update).toBeCalledTimes(1);
  expect(update).toBeCalledWith({
    type: "state",
    handId: "1/2",
    playerId: "a1",
    state: "out",
  });
});

test("exclude two players", async () => {
  const playerToBeExcluded1 = {
    chips: 0,
    id: "a1",
    name: "Arale",
  };

  const playerToBeExcluded2 = {
    chips: 0,
    id: "m1",
    name: "Marvin",
  };

  const gamestate = {
    activePlayers: [{ chips: 1 }, playerToBeExcluded1, { chips: 2 }, playerToBeExcluded2],
    handUniqueId: "1/2",
    handRank: [{
      playerId: "a1",
    }, {
      playerId: "m1",
    }],
    gameRank: [{
      playerId: "b1",
      playerName: "Bender",
    }],
  };

  const update = jest.fn();

  await task.run({ info: () => {} }, { gamestate, update });

  expect(playerToBeExcluded1.state).toBe("out");
  expect(playerToBeExcluded2.state).toBe("out");

  expect(gamestate.gameRank).toEqual([{
    playerId: "a1",
    playerName: "Arale",
  }, {
    playerId: "m1",
    playerName: "Marvin",
  }, {
    playerId: "b1",
    playerName: "Bender",
  }]);

  expect(update).toBeCalledTimes(2);
});

test("Bug: cannot set property 'state' of undefined /update-game-rank.js:47:24", async () => {
  const gamestate = {
    gameProgressiveId: 2,
    handProgressiveId: 1,
    players: [{
      id: "arale",
      name: "Arale",
      state: "fold",
      cards: [{
        rank: "10",
        type: "C",
      }, {
        rank: "3",
        type: "D",
      }],
      chips: 150,
      chipsBet: 0,
    }, {
      id: "bender",
      name: "Bender",
      state: "active",
      cards: [{
        rank: "8",
        type: "H",
      }, {
        rank: "A",
        type: "D",
      }],
      chips: 0,
      chipsBet: 0,
    }, {
      id: "marvin",
      name: "Marvin",
      state: "active",
      cards: [{
        rank: "6",
        type: "H",
      }, {
        rank: "9",
        type: "S",
      }],
      chips: 450,
      chipsBet: 0,
    }, {
      id: "r2d2",
      name: "R2D2",
      state: "active",
      cards: [{
        rank: "5",
        type: "S",
      }, {
        rank: "A",
        type: "C",
      }],
      chips: 0,
      chipsBet: 0,
    }],
    callAmount: 100,
    pot: 150,
    sidepots: [],
    commonCards: [
      { rank: "3", type: "S" },
      { rank: "3", type: "C" },
      { rank: "6", type: "C" },
      { rank: "K", type: "D" },
      { rank: "4", type: "C" },
    ],
    dealerButtonRound: 0,
    initialDealerButtonIndex: 1,
    sb: 50,
    session: "RIVER",
    spinCount: 1,
    lastRaiseAmount: 0,
    handRank: [{
      playerId: "marvin",
      bestCardsInfo: {},
    }, {
      playerId: "bender",
      bestCardsInfo: {},
    }, {
      playerId: "r2d2",
      bestCardsInfo: {},
    }],
  };

  Object.defineProperty(gamestate, "activePlayers", {
    get () {
      return this.players.filter((player) => player.state === "active");
    },
  });

  const update = jest.fn();

  await task.run({ info: () => {} }, { gamestate, update });
});
