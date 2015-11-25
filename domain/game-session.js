
'use strict';

const session = Object.create(null);

session.pre = 0;

session.flop = 1;

session.turn = 2;

session.river = 3;

exports = module.exports = Object.freeze(session);
