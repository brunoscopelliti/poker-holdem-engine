# Gamestate payload

This document collects the properties available of the gamestate, which are available to each single bot player.

* `tournamentId`
* `game` (see `gameProgressiveId`)
* `hand` (see `handProgressiveId`)
* `spinCount`
* `sb`
* `pot`
* `sidepots`
* `commonCards`
* `callAmount`
* `dealer` (see `dealerPosition`)
* `players`

* `buyin`

  Initial amount of chips available to each player.

* `minimumRaiseAmount`

  Minimum amount a player has to bet in case he want to raise the call amount for the other players.

* `me`

  Index of the current player.

To find out what each of these fields means look at this [document]("./game-state-fields.md").
