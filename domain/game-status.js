
'use strict';

const status = Object.create(null);

// tournament is active,
// and the game proceed
status.play = 'play';

// tournament is active, but the game is temporarily paused
status.pause = 'pause';

// tournament is active, and the game proceed
// but the current game will be the last of the tournament
status.latest = 'latest';

// tournament has finished
status.stop = 'stop';

exports = module.exports = Object.freeze(status);
