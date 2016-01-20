'use strict';

var VirtualTimeScheduler = require('rxjs/scheduler/VirtualTimeScheduler').VirtualTimeScheduler;

var subclassWith = require('../utility/subclass-with'),
    stimulus     = require('../utility/stimulus'),
    lifecycle    = require('./lifecycle');

describe('lifecycle', function () {
  var LifecycleObservable,
      observable,
      upstream,
      scheduler,
      output;

  var outputSubscriptions = [];

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

    describe('notify NEXT', function () {

      beforeAll(newInstance);

      beforeEach(newLifecycleObserver);

      describe('without any downstream subscribers', function () {
        expectSubscribers(0, 0);
      });

      describe('with one downstream subscribe', function () {
        expectSubscribers(0, +1);
      });

      describe('with another downstream subscribe', function () {
        expectSubscribers(1, +1);
      });

      describe('with one downstream unsubscribe', function () {
        expectSubscribers(2, -1);
      });

      describe('with another downstream unsubscribe', function () {
        expectSubscribers(1, -1);
      });

      afterEach(killLifecycleObserver);
    });

    describe('notify COMPLETE', function () {

      beforeEach(newInstance);

      beforeEach(newLifecycleObserver);

      it('should occur when the upstream observable notifies COMPLETE', function () {
        var outputObserver = getObserver();
        subscribeToOutput(outputObserver);
        scheduler.flush();

        upstream.complete();
        scheduler.flush();

        expect(outputObserver.complete).toHaveBeenCalled();
        expect(lifecycleObserver.complete).toHaveBeenCalled();
      });

      it('should occur when the upstream observable is already COMPLETE', function () {
        upstream.complete();
        scheduler.flush();

        var outputObserver = getObserver();
        subscribeToOutput(outputObserver);
        scheduler.flush();

        expect(outputObserver.complete).toHaveBeenCalled();
        expect(lifecycleObserver.complete).toHaveBeenCalled();
      });

      afterEach(killLifecycleObserver);
    });

    function newLifecycleObserver() {
      lifecycleObserver = getObserver();
      lifecycleSubscription = output.lifecycle
        .subscribeOn(scheduler)
        .subscribe(lifecycleObserver.next, undefined, lifecycleObserver.complete);
      scheduler.flush();
    }

    function killLifecycleObserver() {
      lifecycleSubscription.unsubscribe();
      lifecycleSubscription = null;
    }

    function expectSubscribers(initialCount, delta) {

      it('should be a Behavior insofar as it notifies NEXT initial count ' + initialCount, function () {
        expect(lifecycleObserver.next).toHaveBeenCalledWith(initialCount);
      });

      if (delta > 0) {
        it('should notify NEXT incremented count (to ' + (initialCount + 1) + ') after subscribe', function () {
          subscribeToOutput();
          scheduler.flush();

          expect(lifecycleObserver.next).toHaveBeenCalledWith(initialCount + 1);
        });
      }
      else if (delta < 0) {
        it('should notify NEXT decremented count (to ' + (initialCount - 1) + ') after unsubscribe', function () {
          unsubscribeToOutput();
          scheduler.flush();

          expect(lifecycleObserver.next).toHaveBeenCalledWith(initialCount - 1);
        });
      }
    }
  });

  describe('downstream observable', function () {
    var outputObserver;

    beforeAll(newInstance);

    beforeEach(function () {
      outputObserver = getObserver();
    });

    describe('notify NEXT', function () {

      it('should occur when the upstream observable notifies NEXT', function () {
        subscribeToOutput(outputObserver);
        scheduler.flush();

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
        subscribeToOutput(outputObserver);
        scheduler.flush();

        upstream.complete();
        scheduler.flush();

        expect(outputObserver.complete).toHaveBeenCalled();
      });

      it('should occur when the upstream observable is already COMPLETE', function () {
        upstream.complete();
        scheduler.flush();

        subscribeToOutput(outputObserver);
        scheduler.flush();

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

  function subscribeToOutput(observer) {
    outputSubscriptions.push(output
      .subscribeOn(scheduler)
      .subscribe(
        observer && observer.next || function () {
        },
        observer && observer.error || function () {
        },
        observer && observer.complete || function () {
        }
      )
    );
  }

  function unsubscribeToOutput() {
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
    complete: function () {
      if (isDebug) {
        console.log('COMPLETE');
      }
    }
  };
  spyOn(observer, 'next').and.callThrough();
  spyOn(observer, 'complete').and.callThrough();
  return observer;
}