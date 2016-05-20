
'use strict';

const tape = require('tape');
const sinon = require('sinon');

const run = require('../../test-utils/generator-runner');

const sut = require('../../../poker-engine/lib/loop-from-async');

tape('loop-from-async', t => t.end());

tape('loop on a list starting from specified index', function(t){

  const spy = sinon.spy();

  const arale = { name: 'arale' };
  const bender = { name: 'bender' };
  const marvin = { name: 'marvin' };
  const walle = { name: 'wall-e' };

  function callback(player, index){
    spy(player, index);
    return new Promise(function(res, rej){
      setTimeout(res, 100);
    });
  }

  run(sut, [arale, bender, marvin, walle], 2, callback)
    .then(function() {
      t.equal(spy.callCount, 4);
      t.ok(spy.getCall(0).calledWith({ name: 'wall-e' }, 3));
      t.ok(spy.getCall(1).calledWith({ name: 'arale' }, 0));
      t.ok(spy.getCall(2).calledWith({ name: 'bender' }, 1));
      t.ok(spy.getCall(3).calledWith({ name: 'marvin' }, 2));
      t.end();
    });

});

tape('loop on a list starting with a break condition', function(t){

  const spy = sinon.spy();
  const shouldBreakSpy = sinon.spy();

  const arale = { name: 'arale' };
  const bender = { name: 'bender' };
  const marvin = { name: 'marvin' };
  const walle = { name: 'wall-e' };

  function shouldBreak(player, index){
    shouldBreakSpy(player, index);
    return player.name == 'marvin';
  }

  function callback(player, index){
    spy(player, index);
    return new Promise(function(res, rej){
      setTimeout(res, 100);
    });
  }

  run(sut, [arale, bender, marvin, walle], 2, shouldBreak, callback)
    .then(function() {
      t.equal(spy.callCount, 3);
      t.ok(spy.getCall(0).calledWith({ name: 'wall-e' }, 3));
      t.ok(spy.getCall(1).calledWith({ name: 'arale' }, 0));
      t.ok(spy.getCall(2).calledWith({ name: 'bender' }, 1));

      t.equal(shouldBreakSpy.callCount, 4);
      t.ok(shouldBreakSpy.getCall(0).calledWith({ name: 'wall-e' }, 3));
      t.ok(shouldBreakSpy.getCall(1).calledWith({ name: 'arale' }, 0));
      t.ok(shouldBreakSpy.getCall(2).calledWith({ name: 'bender' }, 1));
      t.ok(shouldBreakSpy.getCall(3).calledWith({ name: 'marvin' }, 2));

      t.end();
    });

});
