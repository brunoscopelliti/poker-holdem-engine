
'use strict';

const sut = require('../../poker-engine/lib/safe-math');

const tape = require('tape');
const chalk = require('chalk');
const sinon = require('sinon');


tape('safe-math', t => t.end());

tape('safe sum', function(t){

  t.equal(sut.safeSum(0.1, 0.2), 0.3, 'Sum is correct');
  t.equal(sut.safeSum(0.001, 0.002), 0.0, 'Only first 2 decimal digits are important');

  t.end();

});

tape('safe diff', function(t){

  t.equal(sut.safeDiff(0.4, 0.1), 0.3, 'Sum is correct');
  t.equal(sut.safeDiff(0.4, 0.001), 0.4, 'Only first 2 decimal digits are important');

  t.end();

});
