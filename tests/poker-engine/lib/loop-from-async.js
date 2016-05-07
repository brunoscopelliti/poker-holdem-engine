
'use strict';

const tape = require('tape');
const sinon = require('sinon');

const sut = require('../../../poker-engine/lib/loop-from-async');



tape('loop-from-async', t => t.end());

tape('loop on a list starting from specified index', function(t){

  const spy = sinon.spy();

  const arale = { name: 'arale' };
  const bender = { name: 'bender' };
  const marvin = { name: 'marvin' };
  const walle = { name: 'wall-e' };

  const iter = sut([arale, bender, marvin, walle], 2, function(player, index) {
    spy(player, index);
    return new Promise(function(res, rej){
      setTimeout(function () {
        res(42);
      }, 100);
    });
  });

  const promise = iter.next().value;

  promise.then(function() {
    return iter.next().value;
  })
  .then(function() {
    t.equal(spy.callCount, 2);
    t.ok(spy.getCall(0).calledWith({ name: 'wall-e' }, 3));
    t.ok(spy.getCall(1).calledWith({ name: 'arale' }, 0));
    t.end();
  });

});
