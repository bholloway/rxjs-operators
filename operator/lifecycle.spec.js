'use strict';

var VirtualTimeScheduler = require('rxjs/scheduler/VirtualTimeScheduler').VirtualTimeScheduler;

var subclassWith = require('../utility/subclass-with'),
    lifecycle    = require('./lifecycle');

describe('lifecycle', function () {
  var Observable,
      observable,
      upstream,
      scheduler;

  beforeEach(function () {
    Observable = subclassWith({
      lifecycle: lifecycle
    });
  });

  beforeEach(function () {
    observable = new Observable(function (instance) {
      upstream = instance;
    });
  });

  beforeEach(function () {
    scheduler = scheduler || new VirtualTimeScheduler();
  });

  describe('lifecycle observable', function () {
    var operated,
        lifecycleObserver,
        index         = 0,
        subscriptions = [];

    beforeEach(function () {
      operated = operated || observable.lifecycle(scheduler);
    });

    beforeEach(function () {
      lifecycleObserver = getObserver();
    });

    beforeEach(function () {
      operated.lifecycle.subscribe(lifecycleObserver.next, undefined, lifecycleObserver.complete);
      switch (index++) {
        case 0:
        case 1:
          subscriptions.push(operated.subscribe(function () {
          }));
          break;
        case 2:
        case 3:
          subscriptions.pop().unsubscribe();
          break;
      }
    });

    it('should be initially NEXT 0', function () {
      scheduler.flush();
      expect(lifecycleObserver.next).toHaveBeenCalledWith(0);
    });

    it('should increment after first subscribe', function () {
      scheduler.flush();
      expect(lifecycleObserver.next).toHaveBeenCalledWith(1);
    });

    it('should increment after second subscribe', function () {
      scheduler.flush();
      expect(lifecycleObserver.next).toHaveBeenCalledWith(2);
    });

    it('should decrement after first unsubscribe', function () {
      scheduler.flush();
      expect(lifecycleObserver.next).toHaveBeenCalledWith(1);
    });

    it('should decrement after second unsubscribe', function () {
      scheduler.flush();
      expect(lifecycleObserver.next).toHaveBeenCalledWith(0);
    });

    it('should complete when the upstream observable completes', function () {
      upstream.complete();
      expect(lifecycleObserver.complete).not.toHaveBeenCalled();
      scheduler.flush();
      expect(lifecycleObserver.next).toHaveBeenCalled();
    });
  });

  describe('downstream observable', function () {

// TODO

  });
});

function getObserver() {
  var observer = {
    next    : function () {
    },
    complete: function () {
    }
  };
  spyOn(observer, 'next');
  spyOn(observer, 'complete');
  return observer;
}