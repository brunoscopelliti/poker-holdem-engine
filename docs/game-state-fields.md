# Gamestate fields

This document collects the properties available in the `gamestate` object,
and their meaning:

* `pid`

  Id of the thread in which the current tournament is running.


* `tournamentId`

  Id of the tournament.


* `gameProgressiveId`

  A tournament is made by one or more games, which automatically start 
  when all the players (but one) get eliminated.
  This property contains the id of the current game. 
  At the beginning of a new tournament its value is usually "1".
  In case of "tournament recovery" it can assume whatever value 
  is specified through `opts.recoveryId`.


* `handProgressiveId`

  A game is made by one or more rounds (or hands).
  If there is more than one active player, a new round starts automatically
  after the end of current round.
  This property contains the id of the current round.


* `handUniqueId`

  It uses the `pid`, `tournamentId`, `gameProgressiveId`, and `handProgressiveId`
  to generate an unique id for the current hand.
  It's generally used as a tag in the logging message.


* `players`

  It's an Array of object each one containing the data relative to a player.
  Each player has at least the following properties:

    * `id`
    * `name`
    * `serviceUrl`
    * `version`
    * `state`
    * `chips`
    * `chipsBet`
    * `cards`

  Read [player state fields](./player-state-fields.md) doc to learn more about these
  properties.


* `activePlayers`, `foldPlayers` and `outPlayers`

  These are a series of shortcuts to get only the players from the `players` array
  who are in a particular state.


* `dealerPosition`

  It's a getter for the index of the player who has the Dealer button.

  The player who is the dealer is marked with the `Symbol(Dealer)`.


* `pot`

  It's the total amount of chips bet by all the players in the current hand.


* `sidepots`

  A list of separate pot to which a certain player or multiple players did not contribute and that they are not eligible to win, as occurs when a player goes all-in and other players continue to wager more than the all-in player.

  ```js
  [{
    minChipsBet: 50,
    pot: 200
  }, {
    minChipsBet: 100,
    pot: 300
  }]
  ```

  A player should have bet at least 50, in order to be admissed to compete for the first sidepot whose value is 200.


* `callAmount`

  It's the amount of chips which the current player must bet in order to remain in the game. It depends by how much he/she bet previously; so it could change for each player.


* `commonCards`

  List of the community cards, with which players can form their best combination.


* `dealerButtonRound`

  Track how many times the dealer button has passed from its initial position in the current game. The count starts from 0.

  This information is used in order to compute the blind amount.


* `initialDealerButtonIndex`

  It's the index of the player who initially had the dealer button. It's restored everytime a new game starts.

  This information is used in order to compute the blind amount.


* `sb`

  It's the amount of the small blind. Its value depends by the `config.SMALL_BLINDS_PERIOD` setting, and the value of `dealerButtonRound` gamestate property.

  Big blind is always twice the small blind.


* `deck`

  It's the deck of poker cards.


* `session`

  The name of the phase of the game.
  One between `PREFLOP`, `FLOP`, `TURN`, and `RIVER`.


* `spinCount`

  The number of time that players had already have the possibility to bet in the current session.
  It's reset every time a new bet session starts.
  The engine doesn't neet this info, but it could be useful to the bot player, in order to determine its bet.


* `lastRaiseAmount`

  The amount of the raise.

  It's computed by applying `lastRaiseAmount = playerBetAmount - playerCallAmount`.

  It should be reset after each betting session.

* `handRank`

  It's a list containing data about the players best point. 
  
  It's ordered by the strength of their best combination, from the stronger to the weaker.

  It's filled only when after the betting session there's more than one active player.

* `winners`

  It's reset on each hand.
  It contains the info about the players who have win at least one chip in the current hand.

* `gameRank`

  Contains the rank of the current game.
