gamestate
===

`gamestate` properties, and their meaning:

* `pid`

  Id of the thread in which the current tournament is running


* `tournamentId`

  Id of the tournament.
  This usually is equal to the primary key on the db collection where the tournament data are stored.


* `gameProgressiveId`

  A tournament is made by one or more games, which automatically start when  all the players (but one) get eliminated.
  This property contains the id of the current game.
  At the beginning of a new tournament its value is usually "1";
  however in case of "tournament recovery" it can assume whatever value is specified.


* `handProgressiveId`

  A game is made by one or more rounds (or hands).
  If there is more than one active player, a new round starts automatically after the end of another round.
  This property contains the id of the current round.


* `handUniqueId`

  It uses the `pid`, `tournamentId`, `gameProgressiveId`, and `handProgressiveId` to generate an unique id for the current hand.
  It's generally used as a tag in the logging message.


* `tournamentStatus`

  Contains the status of the tournament.
  It can assume one of the following value: `play`, `pause`, `latest`, or `stop`.


* `players`

  It's an Array of object each one containing the data relative to a player.
