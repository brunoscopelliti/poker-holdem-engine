/* eslint-env jest */

"use strict";

const task = require("./reset-gamestate");

it("reset game state", () => {
  expect.assertions(7);
  const restore = jest.fn();
  const gamestate = {
    callAmount: 50,
    commonCards: [{ rank: "K", type: "C" }, { rank: "Q", type: "C" }, { rank: "8", type: "H" }],
    players: [{
      restore: restore,
    }, {
      restore: restore,
    }],
    pot: 250,
    sidepots: [{ quote: 50, amount: 250 }],
  };

  task.run(null, { gamestate });

  expect(gamestate.callAmount).toBe(0);
  expect(gamestate.commonCards).toHaveLength(0);
  expect(gamestate.pot).toBe(0);
  expect(gamestate.session).toBe("PRE-FLOP");
  expect(gamestate.sidepots).toHaveLength(0);
  expect(gamestate.spinCount).toBe(0);
  expect(restore).toHaveBeenCalledTimes(2);
});
