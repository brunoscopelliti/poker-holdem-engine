
'use strict';

const sut = require('../../lib/get-dealerbutton-index');

const tape = require('tape');
const chalk = require('chalk');
const sinon = require('sinon');


tape('get-dealerbutton-index', t => t.end());

tape('check dealer button index is computed properly', function(t){

  let hasDB = Symbol.for('hasDB');
  let players = [{[hasDB]: false}, {[hasDB]: true}, {}, {}];

  t.equal(sut(players), 1, 'check db index');

  t.end();

});
