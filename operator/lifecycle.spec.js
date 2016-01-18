'use strict';

var VirtualTimeScheduler = require('rxjs/scheduler/VirtualTimeScheduler').VirtualTimeScheduler;

var subclassWith = require('../utility/subclass-with'),
    lifecycle    = require('./lifecycle');

describe('lifecycle', function () {
  var Observable,
      observable,
      stimulus,
      scheduler;

  beforeEach(function () {
    Observable = subclassWith({
      lifecycle: lifecycle
    });
  });

  beforeEach(function () {
    observable = new Observable(function (instance) {
      stimulus = instance;
    });
  });

  beforeEach(function () {
    scheduler = scheduler || new VirtualTimeScheduler();
  });

  describe('lifecycle observable', function () {
    var output,
        lifecycleObserver,
        lifecycleSubscription,
        outputSubscriptions = [];

    beforeEach(function () {
      output = output || observable.lifecycle(scheduler);
    });

    beforeEach(function () {
      lifecycleObserver = getObserver();
    });

    beforeEach(function () {
      lifecycleSubscription = output.lifecycle.subscribe(lifecycleObserver.next, undefined, lifecycleObserver.complete);
    });

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

    it('should COMPLETE when the upstream observable COMPLETE', function () {
      stimulus.complete();
      subscribeToOutput();
      scheduler.flush();
      expect(lifecycleObserver.complete).toHaveBeenCalled();
    });

    afterEach(function () {
      lifecycleSubscription.unsubscribe();
      lifecycleSubscription = null;
    });

    function expectSubscribers(initialCount, delta) {

      it('should be a Behavior and NEXT initial count ' + initialCount, function () {
        scheduler.flush();
        expect(lifecycleObserver.next).toHaveBeenCalledWith(initialCount);
      });

      if (delta > 0) {
        it('should NEXT incremented count after subscribe', function () {
          scheduler.flush();
          subscribeToOutput();
          scheduler.flush();
          expect(lifecycleObserver.next).toHaveBeenCalledWith(initialCount + 1);
        });
      }
      else if (delta < 0) {
        it('should NEXT decremented count after unsubscribe', function () {
          scheduler.flush();
          unsubscribeToOutput();
          scheduler.flush();
          expect(lifecycleObserver.next).toHaveBeenCalledWith(initialCount - 1);
        });
      }
    }

    function subscribeToOutput() {
      outputSubscriptions.push(output.subscribe(function () {
      }));
    }

    function unsubscribeToOutput() {
      outputSubscriptions.pop()
        .unsubscribe();
    }
  });

  describe('downstream observable', function () {
    var output,
        downstreamObserver,
        outputSubscription;

    beforeEach(function () {
      output = output || observable.lifecycle(scheduler);
    });

    beforeEach(function () {
      downstreamObserver = getObserver();
    });

    beforeEach(function () {
      outputSubscription = output.subscribe(downstreamObserver.next, undefined, downstreamObserver.complete);
    });

    it('should NEXT when the upstream observable NEXT', function () {
      var value = Math.random();
      stimulus.next(value);
      expect(downstreamObserver.next).toHaveBeenCalledWith(value);
    });

    it('should COMPLETE when the upstream observable COMPLETE', function () {
      stimulus.complete();
      expect(downstreamObserver.complete).toHaveBeenCalled();
    });

    afterEach(function () {
      outputSubscription.unsubscribe();
      outputSubscription = null;
    });
  });
});

function getObserver() {
  var observer = {
    next    : function (value) {
    },
    complete: function () {
    }
  };
  spyOn(observer, 'next').and.callThrough();
  spyOn(observer, 'complete').and.callThrough();
  return observer;
}