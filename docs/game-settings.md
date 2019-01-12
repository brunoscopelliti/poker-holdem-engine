# Game settings

This document describes the possible tournament settings.

* `BUYIN` (Number):

  The amount of initial chips for each player.


* `WARMUP` (Boolean?):

  At the beginning the tournament procedes more slowly, so
  that human players can start adding some sort of custom behaviour to
  their bot counterparts, and early results don't affect too much
  the final chart.


* `WARMUP_GAME` (Number?):

  It determines for how many *games* the tournament is slowed.


* `WARMUP_TIME` (Number [seconds]?):

  It determines how much time the engine waits before starting a new game, during the warm up phase.


* `HAND_THROTTLE_TIME` (Number [seconds]?):

  It determines how much time the engine waits before starting a new game.


* `SMALL_BLINDS` (Number[]):

  Defines the progression of the small blind. Big blind is always twice.


* `SMALL_BLINDS_PERIOD` (Number):

  Determine the frequency of small blind increase. It's expressed in terms of "Dealer Button turns of the table"


* `PAY_ANTE_AT_HAND`: (Number?)

  Antes are a set amount put in the pot by every player in the game prior to cards being dealt.
  Ante amount is always 10% of bigblind.


* `MAX_GAMES`: (Number?)

  Maximum number of games that will be played in the current tournament.

* `POINTS`: (Number[][])

  Determines how points each player get at the end of a game on the basis of its rank position.

  ```js
  POINTS: [
    [1, 0],
    [2, 0, -1],
    [2, 1, 0, -1], // Points in case of a game with 4 players
    [3, 1, 0, 0, -1],
  ]
  ```
