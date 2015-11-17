
'use strict';

const status = Object.create(null);

status.active = 0;

status.folded = 1;

status.out = 2;

exports = module.exports = Object.freeze(status);
