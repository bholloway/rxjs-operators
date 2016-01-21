'use strict';

var VirtualTimeScheduler = require('rxjs/scheduler/VirtualTimeScheduler').VirtualTimeScheduler;

var subclassWith = require('../utility/subclass-with'),
    stimulus     = require('./stimulus'),
    disposable   = require('./disposable');

describe('operator.disposable', function () {
  var DisposableObservable,
      observable,
      upstream,
      scheduler,
      output;

  var outputObserver,
      outputSubscriptions = [];

  beforeAll(function () {
    DisposableObservable = subclassWith({
      disposable: disposable
    });
  });

  beforeAll(function () {
    scheduler = new VirtualTimeScheduler();
  });

  beforeEach(function () {
    upstream = stimulus();
    observable = upstream
      .let(DisposableObservable.from);
    output = observable.disposable();
  });

  describe('notify NEXT', function () {

    it('should occur when the upstream observable notifies NEXT', function () {
      subscribeToOutput();
      scheduler.flush();

      expect(outputObserver.next).not.toHaveBeenCalled();

      var value = Math.random();
      upstream.next(value);
      scheduler.flush();

      expect(outputObserver.next).toHaveBeenCalledWith(value);
    });

    afterEach(unsubscribeToOutput);
  });

  describe('notify COMPLETE', function () {

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

    it('should occur on explicit dispose()', function () {
      subscribeToOutput();
      scheduler.flush();

      expect(outputObserver.complete).not.toHaveBeenCalled();

      output.dispose();
      scheduler.flush();

      expect(outputObserver.complete).toHaveBeenCalled();
    });

    afterEach(unsubscribeToOutput);
  });

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