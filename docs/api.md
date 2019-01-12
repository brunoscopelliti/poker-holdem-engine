# Api

## Tournament

```js
const Tournament = require("poker-holdem-engine");
```

It's a constructor.

It extends node.js `EventEmitter`.

Creates a new tournament.

**Arguments**

  1. `tournamentId` (String):

  2. `players` (Player[]):
  
  3. `tournamentSettings` (Settings)

  4. `opts` (Object)

    - `opts.autoStart` (Boolean)

    - `opts.recoveryId` (Number?)

**Returns**

A new tournament.
