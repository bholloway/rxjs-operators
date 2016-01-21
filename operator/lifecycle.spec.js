'use strict';

var Observable           = require('rxjs').Observable,
    VirtualTimeScheduler = require('rxjs/scheduler/VirtualTimeScheduler').VirtualTimeScheduler;

var subclassWith = require('../utility/subclass-with'),
    stimulus     = require('./stimulus'),
    lifecycle    = require('./lifecycle');

describe('operator.lifecycle', function () {
  var LifecycleObservable,
      observable,
      upstream,
      scheduler,
      output;

  var outputObserver,
      outputSubscriptions = [];

  beforeAll(function () {
    LifecycleObservable = subclassWith({
      lifecycle: lifecycle
    });
  });

  beforeAll(function () {
    scheduler = new VirtualTimeScheduler();
  });

  describe('lifecycle observable', function () {
    var lifecycleObserver,
        lifecycleSubscription;

    beforeAll(newInstance);

    it('should be an instance of Observable', function () {
      expect(output.lifecycle instanceof Observable).toBe(true);
    });

    it('should be an instance of RefCountObservable', function () {
      expect(constructorName(output.lifecycle)).toBe('RefCountObservable');
    });

    describe('notify NEXT', function () {

      beforeEach(subscribeToLifestyle);

      describe('without any downstream subscribers', describeSubscribers(0, 0));

      describe('with one downstream subscribe', describeSubscribers(0, 1));

      describe('with another downstream subscribe', describeSubscribers(1, 2));

      describe('with one downstream unsubscribe', describeSubscribers(2, 1));

      describe('with another downstream unsubscribe', describeSubscribers(1, 0));

      afterEach(unusbscribeToLifestyle);
    });

    describe('notify COMPLETE', function () {

      beforeEach(newInstance);

      beforeEach(subscribeToLifestyle);

      it('should occur when the upstream observable notifies COMPLETE', function () {
        subscribeToOutput();

        upstream.complete();
        scheduler.flush();

        expect(outputObserver.complete).toHaveBeenCalled();
        expect(lifecycleObserver.complete).toHaveBeenCalled();
      });

      it('should occur when the upstream observable is already COMPLETE', function () {
        upstream.complete();
        scheduler.flush();

        subscribeToOutput();

        expect(outputObserver.complete).toHaveBeenCalled();
        expect(lifecycleObserver.complete).toHaveBeenCalled();
      });

      afterEach(unusbscribeToLifestyle);
    });

    function subscribeToLifestyle() {
      lifecycleObserver = getObserver();

      lifecycleSubscription = output.lifecycle
        .subscribeOn(scheduler)
        .subscribe(lifecycleObserver.next, undefined, lifecycleObserver.complete);

      scheduler.flush();
    }

    function unusbscribeToLifestyle() {
      lifecycleObserver = null;
      lifecycleSubscription.unsubscribe();
      lifecycleSubscription = null;
    }

    function describeSubscribers(before, after) {
      return function () {

        it('should be a Behavior insofar as it notifies NEXT initial value ' + before, function () {
          expect(lifecycleObserver.next).toHaveBeenCalledWith(before);
        });

        if (after > before) {
          it('should notify NEXT with value ' + after + ' after subscribe', function assertions() {
            subscribeToOutput();

            expect(lifecycleObserver.next).toHaveBeenCalledWith(after);
          });
        }
        else if (after < before) {
          it('should notify NEXT with value ' + after + ' after unsubscribe', function assertions() {
            unsubscribeToOutput();

            expect(lifecycleObserver.next).toHaveBeenCalledWith(after);
          });
        }
      };
    }
  });

  describe('downstream observable', function () {

    beforeAll(newInstance);

    beforeEach(function () {
      outputObserver = getObserver();
    });

    it('should be an instance of Observable', function () {
      expect(output instanceof Observable).toBe(true);
    });

    describe('notify NEXT', function () {

      it('should occur when the upstream observable notifies NEXT', function () {
        subscribeToOutput();

        expect(outputObserver.next).not.toHaveBeenCalled();

        var value = Math.random();
        upstream.next(value);
        scheduler.flush();

        expect(outputObserver.next).toHaveBeenCalledWith(value);
      });

      afterEach(unsubscribeToOutput);
    });

    describe('notify COMPLETE', function () {

      beforeEach(newInstance);

      it('should occur when the upstream observable notifies COMPLETE', function () {
        subscribeToOutput();

        expect(outputObserver.complete).not.toHaveBeenCalled();

        upstream.complete();
        scheduler.flush();

        expect(outputObserver.complete).toHaveBeenCalled();
      });

      it('should occur when the upstream observable is already COMPLETE', function () {
        upstream.complete();
        scheduler.flush();

        expect(outputObserver.complete).not.toHaveBeenCalled();

        subscribeToOutput();

        expect(outputObserver.complete).toHaveBeenCalled();
      });

      afterEach(unsubscribeToOutput);
    });
  });

  function newInstance() {
    upstream = stimulus();
    observable = upstream
      .let(LifecycleObservable.from);
    output = observable.lifecycle();
  }

  function subscribeToOutput(isDebug) {
    outputObserver = getObserver(isDebug);

    outputSubscriptions.push(output
      .subscribeOn(scheduler)
      .subscribe(outputObserver.next, outputObserver.error, outputObserver.complete)
    );

    scheduler.flush();
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

function constructorName(instance) {
  var analysis = !!instance && (typeof instance === 'object') && (typeof instance.constructor === 'function') &&
    Function.prototype.toString.call(instance.constructor).match(/function\s+(\w+)/);
  return analysis ? analysis[1] : null;
}