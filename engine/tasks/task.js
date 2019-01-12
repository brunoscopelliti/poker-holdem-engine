"use strict";

const taskBase = Object.create(null);

// By default every task should run.
taskBase.shouldRun = () => true;

module.exports = taskBase;
