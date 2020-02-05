/* eslint-env jest */

"use strict";

const getPlayerFactory = require("./create");

it("updates player state", async () => {
  const LOGGER = {
    info: jest.fn(),
  };
  const save = jest.fn();
  const create = getPlayerFactory(LOGGER, save, { BUYIN: 100 });

  const player = create({ id: "a1", name: "Arale", serviceUrl: "http://arale.com/" });

  const gamestate = {
    handUniqueId: 1,
    session: "FLOP",
  };

  await player.fold(gamestate);

  expect(player.state).toBe("fold");
  expect(save).toHaveBeenCalledTimes(1);
  expect(save).toHaveBeenCalledWith(gamestate);
});
