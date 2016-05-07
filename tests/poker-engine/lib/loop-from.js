
'use strict';

const tape = require('tape');
const sinon = require('sinon');

const sut = require('../../../poker-engine/lib/loop-from');



tape('loop-from', t => t.end());

tape('loop on a list starting from specified index', function(t){

  const spy = sinon.spy();

  const arale = { name: 'arale' };
  const bender = { name: 'bender' };
  const marvin = { name: 'marvin' };
  const walle = { name: 'wall-e' };

  sut([arale, bender, marvin, walle], 2, spy);

  t.equal(spy.callCount, 4);

  t.ok(spy.getCall(0).calledWith(walle, 3));
  t.ok(spy.getCall(1).calledWith(arale, 0));
  t.ok(spy.getCall(2).calledWith(bender, 1));
  t.ok(spy.getCall(3).calledWith(marvin, 2));

  t.end();

});
