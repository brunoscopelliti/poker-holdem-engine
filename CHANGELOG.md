## 3.0.0

20/01/2019

* A complete rewrite, featuring ES2017's `async/await`.
  Tested using node.js v10.0.0.

## 2.0.4

* Fix doc error.

* Removed unneeded `require('...')`

## 2.0.3

* Dependency: Update `request` from 2.72.0 to 2.74.0. :rocket:

## 2.0.2

* Doc: Added info about how to run a demo on the local machine.

## 2.0.1

* Fix: JSON parsing of the new WARMUP configuration key.

## 2.0.0

This was an almost complete rewrite.

* Poker Holdem Rules full compliance :tada:.

* Added multiple game support.

* Added further configuration options, such as `WARMUP`, `MAX_GAMES`, `ANTE`.

* Added demo.

* Update dependencies.

## 1.1.0

* Added this changelog.

* **Rule Change**:
When a player raises now the raise amount (that is the difference between the real bet, and the minimum call amount) must be a multiple of the small blind; otherwise the bet is treated as a simple call. This rule does not apply in case the player raises betting all his chips (allin); in this case every amount is considered a valid raise.
Previously every bet exceeding the call amount would have been considered a valid raise.

* Update unit tests dependency: sinon (1.17.3), tape (4.5.0).

## 1.0.1

* Refactoring unit test

## 1.0.0

This is the first stable release.
