/* eslint-env jest */

"use strict";

const collectBets = require("./bet-loop");

const makePlayer =
  (name, chipsBet, state, allIn, actions = {}) => {
    const player = Object.create({
      fold: jest.fn(() => {
        player.state = "fold";
      }),
      payBet: jest.fn(
        actions.payBet ||
          ((gamestate) => {
            player.chipsBet = gamestate.callAmount;
          })
      ),
      talk: jest.fn(
        actions.talk ||
          ((gamestate) => {
            // Default implementation returns player call amount
            // so that player can always continue the betting session.
            return Math.max(gamestate.callAmount - player.chipsBet, 0);
          })),
    });

    player.id = player.name = name;
    player.state = state || "active";
    player.chipsBet = chipsBet;
    player.chips = 100;
    if (allIn) {
      player[Symbol.for("All-in")] = true;
    }
    return player;
  };

const makeGamestate =
  (state) => {
    const gamestate = Object.create({
      get activePlayers () {
        return this.players.filter((player) => player.state === "active");
      },
    });

    for (let k in state) {
      if (state.hasOwnProperty(k)) {
        gamestate[k] = state[k];
      }
    }

    return gamestate;
  };

test("Betting session, no raise", async () => {
  const gamestate = makeGamestate({
    callAmount: 20,
    players: [
      makePlayer("Arale", 0),
      makePlayer("Dealer", 0),
      makePlayer("Bender", 10),
      makePlayer("Marvin", 20),
    ],
    spinCount: 0,
  });

  await collectBets(gamestate, 3);

  for (const player of gamestate.players) {
    expect(
      player.payBet
    ).toHaveBeenCalledTimes(1);
  }

  expect(gamestate.spinCount).toBe(1);
});

test("Betting session, no raise, skip not active players", async () => {
  const gamestate = makeGamestate({
    callAmount: 20,
    players: [
      makePlayer("Arale", 0, "fold"),
      makePlayer("Dealer", 0),
      makePlayer("Bender", 10),
      makePlayer("Marvin", 20),
    ],
    spinCount: 0,
  });

  await collectBets(gamestate, 3);

  expect(
    gamestate.players[0].payBet
  ).toHaveBeenCalledTimes(0);

  for (const player of gamestate.players.slice(1)) {
    expect(
      player.payBet
    ).toHaveBeenCalledTimes(1);
  }

  expect(gamestate.spinCount).toBe(1);
});

test("Betting session, no raise, skip all-in players", async () => {
  const gamestate = makeGamestate({
    callAmount: 20,
    players: [
      makePlayer("Arale", 0, "active", true),
      makePlayer("Dealer", 0),
      makePlayer("Bender", 10),
      makePlayer("Marvin", 20),
    ],
    spinCount: 0,
  });

  await collectBets(gamestate, 3);

  expect(
    gamestate.players[0].payBet
  ).toHaveBeenCalledTimes(0);

  for (const player of gamestate.players.slice(1)) {
    expect(
      player.payBet
    ).toHaveBeenCalledTimes(1);
  }

  expect(gamestate.spinCount).toBe(1);
});

test("Betting session, with raise", async () => {
  const gamestate = makeGamestate({
    callAmount: 20,
    players: [
      makePlayer("Arale", 0),
      makePlayer("Dealer", 0),
      makePlayer("Bender", 10, "active", false,
        {
          payBet: (state, amount) => {
            state.callAmount = 40;
            state.players[2].chipsBet = state.callAmount;
          },
        }),
      makePlayer("Marvin", 20),
    ],
    spinCount: 0,
  });

  await collectBets(gamestate, 3);

  expect(
    gamestate.players[0].payBet
  ).toHaveBeenCalledTimes(2);

  expect(
    gamestate.players[1].payBet
  ).toHaveBeenCalledTimes(2);

  expect(
    gamestate.players[2].payBet
  ).toHaveBeenCalledTimes(1);

  expect(
    gamestate.players[3].payBet
  ).toHaveBeenCalledTimes(1);

  expect(gamestate.spinCount).toBe(2);
});

test("Betting session, with double raise", async () => {
  const gamestate = makeGamestate({
    callAmount: 20,
    players: [
      makePlayer("Arale", 0),
      makePlayer("Dealer", 0),
      makePlayer("Bender", 10, "active", false,
        {
          payBet: (state, amount) => {
            state.callAmount = Math.max(40, state.callAmount);
            state.players[2].chipsBet = state.callAmount;
          },
        }),
      makePlayer("Marvin", 20, "active", false,
        {
          payBet: (state, amount) => {
            state.callAmount = 80;
            state.players[3].chipsBet = state.callAmount;
          },
        }),
    ],
    spinCount: 0,
  });

  await collectBets(gamestate, 3);

  expect(
    gamestate.players[0].payBet
  ).toHaveBeenCalledTimes(2);

  expect(
    gamestate.players[1].payBet
  ).toHaveBeenCalledTimes(2);

  expect(
    gamestate.players[2].payBet
  ).toHaveBeenCalledTimes(2);

  expect(
    gamestate.players[3].payBet
  ).toHaveBeenCalledTimes(1);

  expect(gamestate.spinCount).toBe(2);
});

test("Betting session, active player folds", async () => {
  const gamestate = makeGamestate({
    callAmount: 20,
    players: [
      makePlayer("Arale", 0, "active", false,
        {
          talk: () => {
            // Folds
            return 0;
          },
        }),
      makePlayer("Dealer", 0),
      makePlayer("Bender", 10),
      makePlayer("Marvin", 20),
    ],
    spinCount: 0,
  });

  await collectBets(gamestate, 3);

  expect(
    gamestate.players[0].state
  ).toBe("fold");

  expect(
    gamestate.players[0].payBet
  ).toHaveBeenCalledTimes(0);

  expect(
    gamestate.players[0].fold
  ).toHaveBeenCalledTimes(1);

  for (const player of gamestate.players.slice(1)) {
    expect(
      player.payBet
    ).toHaveBeenCalledTimes(1);
  }

  expect(gamestate.spinCount).toBe(1);
});

test("Betting session, active player all-in", async () => {
  const gamestate = makeGamestate({
    callAmount: 20,
    players: [
      makePlayer("Arale", 0, "active", false,
        {
          talk: () => {
            // All-in
            return 10;
          },
        }),
      makePlayer("Dealer", 0),
      makePlayer("Bender", 10),
      makePlayer("Marvin", 20),
    ],
    spinCount: 0,
  });

  gamestate.players[0].chips = 10;

  await collectBets(gamestate, 3);

  expect(
    gamestate.players[0].state
  ).toBe("active");

  for (const player of gamestate.players) {
    expect(
      player.payBet
    ).toHaveBeenCalledTimes(1);
  }

  expect(gamestate.spinCount).toBe(1);
});

test("Clean stuff after betting session", async () => {
  const gamestate = makeGamestate({
    callAmount: 20,
    lastRaiseAmount: 1,
    players: [
      makePlayer("Arale", 0),
      makePlayer("Dealer", 0),
      makePlayer("Bender", 10),
      makePlayer("Marvin", 20),
    ],
    spinCount: 0,
  });

  const s = Symbol.for("already-bet");
  gamestate.players.forEach((player) => {
    player[s] = true;
  });

  await collectBets(gamestate, 3);

  expect(gamestate.lastRaiseAmount).toBe(0);

  gamestate.players.forEach((player) => {
    expect(player[s]).toBeUndefined();
  });
});
