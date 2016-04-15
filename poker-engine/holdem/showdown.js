
'use strict';

const sortByRank = require('poker-rank');

const eachFrom = require('../lib/loop-from');
const getFirst = require('../lib/get-first-to-showdown-index');

exports = module.exports = function(players, commonCards) {

  if (players.length === 1){
    return Promise.resolve(players);
  }

  const id = Symbol('player-id');
  const shownCards = [];

  function showdown(player){
    let cards = player.showdown(commonCards);
    cards[id] = player.id;
    shownCards.push(cards);
  }

  return eachFrom(players, getFirst(players), showdown).then(function() {
    return sortByRank(shownCards).map(function(el) {
      return Object.assign({ detail: { strength: el.strength, rank: el.rank, kickers: el.kickers, exequo: el.exequo } },
        players.find(player => player.id === shownCards[el.index][id]));
    });
  });

}
