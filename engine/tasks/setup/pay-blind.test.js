/* eslint-env jest */

"use strict";

const task = require("./pay-blind");

describe("run", () => {
  it("pay blinds", () => {
    const paySB = jest.fn();
    const payBB = jest.fn();
    const gamestate = {
      dealerPosition: 0,
      players: [{
        name: "Arale",
        state: "active",
        pay: payBB,
      }, {
        name: "Bender",
        state: "fold",
      }, {
        name: "Marvin",
        state: "active",
        pay: paySB,
      }, {
        name: "R2D2",
        state: "fold",
      }],
      sb: 10,
    };

    task.run(null, { gamestate });

    expect(paySB).toHaveBeenCalledTimes(1);
    expect(paySB).toHaveBeenNthCalledWith(1, gamestate, 10);

    expect(payBB).toHaveBeenCalledTimes(1);
    expect(payBB).toHaveBeenNthCalledWith(1, gamestate, 20);
  });
});
