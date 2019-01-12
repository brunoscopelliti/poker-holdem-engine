"use strict";

const task = require("./task");

const Task = Object.create(task);

Task.name = "Increment handId";

Task.run =
  async (_, { gamestate }) => {
    // This is the gamestate.handProgressiveId° hand played.
    // This data is important to compute the blinds level.
    gamestate.handProgressiveId += 1;
  };

module.exports = Task;
