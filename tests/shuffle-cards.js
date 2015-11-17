
'use strict';

const sut = require('../lib/shuffle-cards');

const tape = require('tape');
const sinon = require('sinon');

tape('shuffle', t => t.end());

tape('shuffle', function(t){

  const cardsA = sut();
  const cardsB = sut();

  t.notDeepEqual(cardsA, cardsB, 'Random');

  t.end();

});
