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

  await player.fold({
    handUniqueId: 1,
    session: "FLOP",
  });

  expect(player.state).toBe("fold");
  expect(save).toHaveBeenCalledTimes(1);
  expect(save).toHaveBeenCalledWith({
    type: "state",
    handId: 1,
    playerId: "a1",
    session: "FLOP",
    state: "fold",
  });
});
