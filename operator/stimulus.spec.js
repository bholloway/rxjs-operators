'use strict';

var VirtualTimeScheduler = require('rxjs/scheduler/VirtualTimeScheduler').VirtualTimeScheduler;

var subclassWith = require('../utility/subclass-with'),
    stimulus     = require('./stimulus');

describe('operator.stimulus', function () {
  var StimulusObservable,
      observable,
      upstream,
      scheduler,
      output;

  var outputObserver,
      outputSubscriptions = [];

  beforeAll(function () {
    StimulusObservable = subclassWith({
      stimulus: stimulus
    });
  });

  beforeAll(function () {
    scheduler = new VirtualTimeScheduler();
  });

  beforeEach(function () {
    upstream = stimulus();
    observable = upstream
      .let(StimulusObservable.from);
    output = observable.stimulus();
  });

  beforeEach(function () {
    outputObserver = getObserver();
  });

  describe('notify NEXT', function () {

    it('should occur when the upstream observable notifies NEXT', function () {
      subscribeToOutput(outputObserver);
      scheduler.flush();

      expect(outputObserver.next).not.toHaveBeenCalled();

      var value = Math.random();
      upstream.next(value);
      scheduler.flush();

      expect(outputObserver.next).toHaveBeenCalledWith(value);
    });

    it('should occur when the next() method is explicitly called', function () {
      subscribeToOutput(outputObserver);
      scheduler.flush();

      expect(outputObserver.next).not.toHaveBeenCalled();

      var value = Math.random();
      output.next(value);
      scheduler.flush();

      expect(outputObserver.next).toHaveBeenCalledWith(value);
    });

    afterEach(unsubscribeToOutput);
  });

  describe('notify COMPLETE', function () {

    it('should occur when the upstream observable notifies COMPLETE', function () {
      subscribeToOutput(outputObserver);
      scheduler.flush();

      expect(outputObserver.complete).not.toHaveBeenCalled();

      upstream.complete();
      scheduler.flush();

      expect(outputObserver.complete).toHaveBeenCalled();
    });

    it('should occur when the upstream observable is already COMPLETE', function () {
      upstream.complete();
      scheduler.flush();

      expect(outputObserver.complete).not.toHaveBeenCalled();

      subscribeToOutput(outputObserver);
      scheduler.flush();

      expect(outputObserver.complete).toHaveBeenCalled();
    });

    it('should occur on explicit complete()', function () {
      subscribeToOutput(outputObserver);
      scheduler.flush();

      expect(outputObserver.complete).not.toHaveBeenCalled();

      output.complete();
      scheduler.flush();

      expect(outputObserver.complete).toHaveBeenCalled();
    });

    afterEach(unsubscribeToOutput);
  });

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