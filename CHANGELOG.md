# Changelog

## 1.0.0

30/04/2021

Published on npmjs under a different name - @botpoker/engine-holdem.

## 4.1.0

16/02/2021

* Updated min node version (>= 14.0).

* Updated some dev deps.

## 4.0.0

05/02/2020

* Updated dependencies.

* Breaking changes.

  - `Tournament` isn't an EventEmitter subclass anymore. Introduced `onFeed`, `onGameComplete` and `onTournamentComplete` to retrieve info about the state of the tournament.

## 4.0.0-rc6
## 4.0.0-rc5
## 4.0.0-rc4
## 4.0.0-rc3
## 4.0.0-rc2
## 4.0.0-rc1

17/01/2020

* Updated dependencies.

* Breaking changes.

## 3.0.4

24/12/2019

* Fix serialization issue.

## 3.0.3

18/07/2019

* Fix #8.

## 3.0.2

11/06/2019

* Fix #7.

## 3.0.1

18/05/2019

* Fix #6.
  
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
