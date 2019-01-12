/* eslint-env jest */

"use strict";

const task = require("./update-small-blind");

describe("run", () => {
  test("round: 0", () => {
    const gamestate = {
      dealerButtonRound: 0,
    };
    const settings = {
      SMALL_BLINDS: [5, 10, 20, 25, 50],
    };

    task.run(null, { gamestate, settings });

    expect(gamestate.sb).toBe(5);
  });

  test("round: 1", () => {
    const gamestate = {
      dealerButtonRound: 1,
    };
    const settings = {
      SMALL_BLINDS: [5, 10, 20, 25, 50],
    };

    task.run(null, { gamestate, settings });

    expect(gamestate.sb).toBe(10);
  });

  test("round: 10", () => {
    const gamestate = {
      dealerButtonRound: 10,
    };
    const settings = {
      SMALL_BLINDS: [5, 10, 20, 25, 50],
    };

    task.run(null, { gamestate, settings });

    expect(gamestate.sb).toBe(50);
  });

  test("round: 4", () => {
    const gamestate = {
      dealerButtonRound: 4,
    };
    const settings = {
      SMALL_BLINDS: [5, 10, 20, 25, 50],
      SMALL_BLINDS_PERIOD: 3,
    };

    task.run(null, { gamestate, settings });

    expect(gamestate.sb).toBe(10);
  });
});
