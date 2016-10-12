Poker rules
===

* Assign Dealer Button (**DB**).
  Every time a poker hand ends the *DB* is passed to the active player next to the one who currently have had the *DB*.

* The player next to the *DB* pays the Small Blind (**SB**), and the player next to the *SB* pays the Big Blind (**BB**).
  The amount of the *BB* is always twice the amount of the *SB*.
  In case there are only two players, the player with the *DB* pays the *BB*.

  Every other player who wish to play the hand has to bet at least the amount of the *BB*.

  Every time the *DB* returns to the player who originally had it, or pass from his position in case he was eliminated, the value of the blinds increases following a predefined scale. (It is also possible to define that this increase occurs every N steps from the initial position).

  * In case the player who is the *BB* doesn't have enough chips to pay the whole amount, the other players neither have to pay the whole amount of the *BB*, but the maximum amount between the amount bet by the *SB*, and *BB* players.

* [Optional] Every player (even those who've already payed the blinds) pay an **ante** in order to play the game.
  This is usually required after an high number of played hands.

  * **ante**'s amount is always 10% of *BB*.

  * if enabled, **ante** should be started being payed when 10% of *BB* is greater or equal than 10% of the initial buy-in.

* Every player receive two private cards.


**PRE-FLOP**

Now starting from the player next to the *BB*, every active player has to express his bet.

A betting session ends when:

* every player but one fold, so only one player remains active;
  in this case also the whole hand is going to finish, and the active player wins the pot.

* excluding eventual player(s) who have gone all-in, there isn't a single player who have bet less than the required call amount;
  in this case the hand proceed.

When the pre-flop betting session ends three cards are showed on the table... Every player can use these cards to form his strongest combination.

**TURN**

Now starting from the player next to the *DB*, every active player has to express his bet.

When this betting session ends, if remains only an active player, the hand ends; otherwise a new card is added on the table.

**RIVER**

Again starting from the player next to the *DB*, every active player has to express his bet.

When this betting session ends, if remains only an active player, the hand ends; otherwise a new card is added on the table.


At this point there are five cards on the table, and each player has two private cards...

There will be a final betting session.
When this betting session ends, if remains only an active player, the hand ends; otherwise the game proceed with the **SHOW DOWN**

**SHOW DOWN**

During the *show down* every active player has to show his strongest combination to the other players.

* Evaluate players' combination

  If during the *RIVER* session someone has made a bet, the one who has made the first final bet is the one who has to showdown first; otherwise the showdown starts from the player next to the *DB*.

* Assign side-pot (or pot)

  Each side-pot (or the pot) is assigned to the player with the strongest combination between the active players who have the right to win that side-pot.

  In case two (or more) players have a combination of the same strength, they split the pot.

  To keep the logic of the game simple, in case the result of the split is not an integer, the decimals are ignored.

* Update players status

  The players who have folded in the current hand turn back into active state. The players who at the end of the hand lost all their chips get eliminated, and won't played any other hand in the current game.

* Update rank

  Every player takes (or loses) an amount of point(s) on the basis of his placement in the current game.

  * In case two (or more) players get eliminated at the same hand, the points they get depend on which one was the stronger of the group.


**RAISE**

A *raise* is a bet of an amount greater than the minimum required to play the hand.

All raises must be equal to or greater than the size of the previous bet or raise on that betting round, except for an all-in wager.

A player who has already acted and is not facing a full size wager may not subsequently raise an all-in bet that is less than the minimum bet (which is the amount of the minimum bring-in), or less than the full size of the last bet or raise.

Example: Player A bets $100 and Player B raises $100 more, making the total bet $200. If Player C goes all-in for less than $300 total (not a full $100 raise), and Player A calls, then Player B has no option to raise again, because he wasn't fully raised. (Player A could have raised, because Player B raised.)

The number of raises in any betting round is unlimited.



**ALL-IN**

A player can always bet all of his chips.

When a player bet all his chips, he has always the right to play the current hand till the final showdown.

In case he has the strongest card combination, he win only the part of the pot that was covered by his bet.

When a player bet all of his chips and still he has not covered the minimum call amount, a **side-pot** is created.

Each player contributes to forming the side-pot with an amount equal to the minimum value between his bet, and the amount for which the other player went all-in.
