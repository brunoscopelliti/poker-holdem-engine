
'use strict';

const sut = require('../../lib/get-first-to-showdown-index');

const tape = require('tape');
const chalk = require('chalk');
const sinon = require('sinon');


tape('get-first-to-showdown-index', t => t.end());

tape('nobody bet during river', function(t){

  let hasDB = Symbol.for('hasDB');
  let players = [{[hasDB]: false}, {[hasDB]: true}, {}, {}];

  t.equal(sut(players), 1, 'same as db index');

  t.end();

});

tape('someone bet during river', function(t){

  let hasDB = Symbol.for('hasDB');
  let badge = Symbol.for('show-first');
  let players = [{[hasDB]: false}, {[hasDB]: true}, {[badge]: true}, {}];

  t.equal(sut(players), 2, 'check index');

  t.end();

});
