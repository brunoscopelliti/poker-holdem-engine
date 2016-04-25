
'use strict';

const tape = require('tape');
const sinon = require('sinon');

const hasDB = Symbol.for('has-dealer-button');
const sut = require('../../../poker-engine/lib/get-dealer-button-index');



tape('get-dealer-button-index', t => t.end());

tape('check dealer button index is computed properly', function(t){

  const players = [{ [hasDB]: false }, { [hasDB]: true }, {}, {}];

  t.strictEqual(sut(players), 1, 'check db index');

  t.end();

});

tape('check dealer button is not assigned', function(t){

  const players = [{ [hasDB]: false }, {}, {}, {}];

  t.strictEqual(sut(players), -1, 'check db index');

  t.end();

});
