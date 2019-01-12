/* eslint-env jest */

"use strict";

const task = require("./assign-dealer-button");

describe("run", () => {
  const create = require("../../../domain/player/create")({ info: jest.fn() }, () => {}, { BUYIN: 100 });

  it("assign dealer button on the first hand", () => {
    const gamestate = {
      handProgressiveId: 1,
      gameProgressiveId: 1,
      players: [
        create({ id: "a", name: "Arale", serviceUrl: "/" }),
        create({ id: "b", name: "Bender", serviceUrl: "/" }),
      ],
    };

    task.run(null, { gamestate });

    expect(
      gamestate.dealerButtonRound
    ).toBe(0);

    expect(
      gamestate.initialDealerButtonIndex
    ).toBe(0);

    expect(
      gamestate.players
        .find((player) => player[Symbol.for("Dealer")]).name
    ).toBe("Arale");
  });

  it("assign dealer to the next active player", () => {
    const gamestate = {
      handProgressiveId: 4,
      gameProgressiveId: 1,
      initialDealerButtonIndex: 2,
      dealerButtonRound: 2,
      players: [
        create({ id: "a", name: "Arale", serviceUrl: "/" }),
        create({ id: "b", name: "Bender", serviceUrl: "/" }),
        create({ id: "c", name: "Marvin", serviceUrl: "/" }),
      ],
    };

    gamestate.players[0].assignDealerButton();
    gamestate.dealerPosition = 0;
    gamestate.players[1].state = "fold";

    task.run(null, { gamestate });

    expect(
      gamestate.dealerButtonRound
    ).toBe(3);

    expect(
      gamestate.initialDealerButtonIndex
    ).toBe(2);

    expect(
      gamestate.players
        .find((player) => player[Symbol.for("Dealer")]).name
    ).toBe("Marvin");
  });
});
