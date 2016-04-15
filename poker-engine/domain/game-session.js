
'use strict';

const session = Object.create(null);

session.pre = 'pre-flop';

session.flop = 'flop';

session.turn = 'turn';

session.river = 'river';

exports = module.exports = Object.freeze(session);
