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

  Each player has the following properties: `id`, `name`, `serviceUrl`, `version`, `status`, `chips`, `chipsBet`, and `cards`.

  + `id`
    A unique id of the player

  + `name`
    The name of the player

  + `serviceUrl`
    Url of the api endpoint on which the player web service responds.

  + `status`
    Player's status. One of `active`, `folded`, or `out`

  + `chips`
    Amount of chips owned by the player

  + `chipsBet`
    Total amount of chips the player has bet in the current hand

  + `cards`
    List of the cards assigned to the player in the current hand

  + `bestCombination`
  + `bestCombinationData`
    It's added during the showdown.
    It contains information about the strongest point of the player.

  + `Symbol('has-big-blind')`
    True when the player has bet the big blind

  + `Symbol('is-all-in')`
    True when the player has gone all-in in the current hand

  + `Symbol('has-talked')`
    A player who has talked, cannot raise anymore.
    It should be reset after each betting session, and every time another player makes a valid raise.


* `activePlayers`

  It's a shortcut to get only the active players from the `players` array.


* `dealerButtonIndex`

  It's a getter for the index of the player who has the dealer button,
  that is Symbol('has-dealer-button') equals true.


* `initialDealerButtonIndex`

  It's the index of the first position in a game of the Dealer Button.

  This information is used in order to compute the blind amount.


* `dealerButtonRound`

  Track how many times the dealer button has passed from its initial position in the current game.

  The count starts from 0.

  This information is used in order to compute the blind amount.


* `lastRaiseAmount`

  The amount of the raise.

  It's computed by applying `lastRaiseAmount = playerBetAmount - playerCallAmount`.

  It should be reset after each session.


* `sb`

  It's the amount of the small blind.

  It's value depends by the `config.BLINDS_PERIOD` setting, and the value of `dealerButtonRound` gamestate property.

  Big blind is always twice the small blind.


* `ante`

  It's the amount of "ante" quote.

  It's populated only when the ante should be effectively paid by the players.


* `pot`

  It's the amount of chips bet by all the players in the current hand.


* `sidepots`

    ```js
    [{
      quote: 50,
      amount: 200
    },
    {
      quote: 100,
      amount: 300
    }]
    ```

* `callAmount`

  It's the amount of chips which the current player must bet in order to remain in the game.

  It depends by how much he bet previously; so it can change for each player.


* `commonCards`

  List of the community cards, with which players can form their best combination.



* `handChart`

  It's an array containing data about the players, sorted by the strength of their best combination.
  It contains objects with the following properties: `name`, `id`, `quote`, `bestCombination`, `bestCombinationData`.
