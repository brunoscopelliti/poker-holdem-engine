/* eslint-env jest */

"use strict";

const task = require("./assign-private-cards");

describe("run", () => {
  it("assign two cards to every active player", () => {
    const gamestate = {
      dealerPosition: 1,
      players: [{
        name: "Arale",
        cards: [],
        state: "active",
      }, {
        name: "Bender",
        cards: [],
        state: "active",
      }, {
        name: "Marvin",
        cards: [],
        state: "fold",
      }, {
        name: "R2D2",
        cards: [],
        state: "active",
      }],
    };

    task.run(null, { gamestate });

    expect(gamestate.deck).toHaveLength(46);

    expect(
      gamestate.players[2].cards
    ).toHaveLength(0);

    expect(
      gamestate.players[0].cards
    ).toHaveLength(2);

    expect(
      gamestate.players[1].cards
    ).toHaveLength(2);

    expect(
      gamestate.players[3].cards
    ).toHaveLength(2);
  });
});
