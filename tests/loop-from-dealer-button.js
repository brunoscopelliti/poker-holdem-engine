
'use strict';

const sut = require('../lib/loop-from-dealer-button');

const tape = require('tape');
const chalk = require('chalk');
const sinon = require('sinon');

tape('eachFromDB', t => t.end());

tape('loop on players starting from Dealer Button', function(t){

  let count = 0;

  const players = [
    { name: 'john', chips: 2400 },
    { name: 'mark', chips: 1250 },
    { name: 'paul', chips: 3250, hasDB: true },
    { name: 'mike', chips: 500 },
    { name: 'luis', chips: 1500 },
  ];

  sut(players, function(player) {

    return new Promise(function(res, rej){
      setTimeout(function() {
        player.count = ++count;
        res(player);
      }, 250);
    });

  }).then(function() {

    t.equal(players.filter(player => typeof player.count != 'undefined').length, players.length, 'loop over all the players');
    t.equal(players[1].count, players.length);
    t.equal(players[2].count, 1);

    t.end()
  })

});
