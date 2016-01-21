'use strict';

var VirtualTimeScheduler = require('rxjs/scheduler/VirtualTimeScheduler').VirtualTimeScheduler;

var subclassWith = require('../utility/subclass-with'),
    stimulus     = require('./stimulus'),
    behavior     = require('./behavior');

describe('operator.behavior', function () {
  var BehaviorObservable,
      observable,
      upstream,
      scheduler,
      output;

  var outputObserver,
      outputSubscriptions = [];

  beforeAll(function () {
    BehaviorObservable = subclassWith({
      behavior: behavior
    });
  });

  beforeAll(function () {
    scheduler = new VirtualTimeScheduler();
  });

  describe('notify NEXT', function () {

    beforeAll(newInstance);

    beforeAll(function () {
      upstream.next('missedValue');
    });

    describe('of first value', describeSubscribers('initialValue', 1));

    describe('of second value', describeSubscribers(1, 2));

    describe('of third value', describeSubscribers(2, 3));

    function describeSubscribers(value0, value1) {
      return function () {

        beforeAll(function () {
          subscribeToOutput();
          scheduler.flush();
        });

        it('should be a Behavior insofar as it notifies NEXT existing value', function () {
          expect(outputObserver.next).toHaveBeenCalledWith(value0);
        });

        it('should expose the existing value', function () {
          expect(output.value).toBe(value0);
        });

        it('should notify NEXT with value after upstream NEXT same value', function () {
          upstream.next(value1);
          scheduler.flush();

          expect(outputObserver.next).toHaveBeenCalledWith(value1);
        });

        it('should expose the new value', function () {
          expect(output.value).toBe(value1);
        });

        afterAll(unsubscribeToOutput);
      };
    }
  });

  describe('clear()', function () {
    var value;

    beforeEach(newInstance);

    beforeEach(function () {

      // subscribe so that the instance sees us emit the upstream value
      subscribeToOutput();
      scheduler.flush();

      value = Math.random();
      upstream.next(value);
      scheduler.flush();

      // unsubscribe so we don't pollute the test
      unsubscribeToOutput();
      scheduler.flush();
    });

    beforeEach(function () {
      subscribeToOutput();
      scheduler.flush();
    });

    it('should reinstate the initial value', function () {
      expect(output.value).toBe(value);

      output.clear();
      scheduler.flush();

      expect(output.value).toBe('initialValue');
    });

    it('should notify NEXT initialValue', function () {
      expect(outputObserver.next).toHaveBeenCalledWith(value);

      output.clear();
      scheduler.flush();

      expect(outputObserver.next).toHaveBeenCalledWith('initialValue');
    });
  });

  describe('notify COMPLETE', function () {

    beforeEach(newInstance);

    it('should occur when the upstream observable notifies COMPLETE', function () {
      subscribeToOutput();
      scheduler.flush();

      expect(outputObserver.complete).not.toHaveBeenCalled();

      upstream.complete();
      scheduler.flush();

      expect(outputObserver.complete).toHaveBeenCalled();
    });

    it('should occur when the upstream observable is already COMPLETE', function () {
      upstream.complete();
      scheduler.flush();

      subscribeToOutput();
      scheduler.flush();

      expect(outputObserver.complete).toHaveBeenCalled();
    });

    afterEach(unsubscribeToOutput);
  });

  function newInstance() {
    upstream = stimulus();
    observable = upstream
      .let(BehaviorObservable.from);
    output = observable.behavior('initialValue');
  }

  function subscribeToOutput(isDebug) {
    outputObserver = getObserver(isDebug);

    outputSubscriptions.push(output
      .subscribeOn(scheduler)
      .subscribe(outputObserver.next, outputObserver.error, outputObserver.complete)
    );
  }

  function unsubscribeToOutput() {
    outputObserver = null;
    outputSubscriptions.pop()
      .unsubscribe();
  }
});

function getObserver(isDebug) {
  var observer = {
    next    : function (value) {
      if (isDebug) {
        console.log('NEXT', value);
      }
    },
    error   : function (value) {
      if (isDebug) {
        console.log('NEXT', value);
      }
    },
    complete: function () {
      if (isDebug) {
        console.log('COMPLETE');
      }
    }
  };
  spyOn(observer, 'next').and.callThrough();
  spyOn(observer, 'error').and.callThrough();
  spyOn(observer, 'complete').and.callThrough();
  return observer;
}