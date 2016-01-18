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
        index         = 0,
        subscriptions = [];

    beforeEach(function () {
      output = output || observable.lifecycle(scheduler);
    });

    beforeEach(function () {
      lifecycleObserver = getObserver();
    });

    beforeEach(function () {
      output.lifecycle.subscribe(lifecycleObserver.next, undefined, lifecycleObserver.complete);
      switch (index++) {
        case 0:
        case 1:
          subscriptions.push(output.subscribe(function () {
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
      stimulus.complete();
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