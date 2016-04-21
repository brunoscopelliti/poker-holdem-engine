
'use strict';

const status = Object.create(null);

// player is actively playing the current hand
status.active = 'active';

// player has left the current hand,
// and won't partecipate to the final showdown
status.folded = 'folded';

// player has lost all his chips;
// he won't partecipate to any other hand in the current game
status.out = 'out';

exports = module.exports = Object.freeze(status);
