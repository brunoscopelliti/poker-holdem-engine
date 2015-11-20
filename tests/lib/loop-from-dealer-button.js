
'use strict';

const sut = require('../../lib/loop-from-dealer-button');

const tape = require('tape');
const chalk = require('chalk');
const sinon = require('sinon');

tape('eachFromDB', t => t.end());

tape('loop on players starting from Dealer Button', function(t){

  let count = 0;

  const players = [
    { name: 'john', chips: 2400 },
    { name: 'mark', chips: 1250 },
    { name: 'paul', chips: 3250 },
    { name: 'mike', chips: 500 },
    { name: 'luis', chips: 1500 },
  ];

  players[2][Symbol.for('hasDB')] = true;

  sut(players, function(player) {

    return new Promise(function(res, rej){
      setTimeout(function() {
        player.count = ++count;
        res(player);
      }, 100);
    });

  }).then(function() {
    t.equal(players.filter(player => typeof player.count != 'undefined').length, players.length, 'loop over all the players');
    t.ok(players[3].count === 1 && players[2].count === players.length, 'check the loop order');
    t.equal(Object.getOwnPropertySymbols(players[3]).length, 0, '[passed] symbol is deleted');
    t.end()
  })

});
