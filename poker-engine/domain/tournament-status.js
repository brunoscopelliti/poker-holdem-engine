
'use strict';

const tournamentStatus = Object.create(null);

// tournament is active,
// and the game proceed
tournamentStatus.play = 'play';

// tournament is active,
// but the game is temporarily paused
tournamentStatus.pause = 'pause';

// tournament is active, and the game proceed
// but the current game will be the last of the tournament
tournamentStatus.latest = 'latest';

// tournament has finished
tournamentStatus.stop = 'stop';

exports = module.exports = Object.freeze(tournamentStatus);
