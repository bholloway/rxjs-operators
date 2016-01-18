'use strict';

var Observable = require('rxjs').Observable;

var behavior      = require('./behavior'),
    toObservable  = require('./to-observable'),
    hookSubscribe = require('../utility/hook-subscribe');

/**
 * Represents a value that changes over time. Observers can subscribe to the subject to receive all subsequent
 * notifications, unless or until the source Observable is complete. It is possible to observe the number of
 * subscriptions to the Subject.
 *
 * @this {Observable}
 * @param [scheduler] Optional scheduler for internal use
 * @returns {Observable} An observable with additional `lifecycle:Observable` field
 */
function lifecycle(scheduler) {
  /* jshint validthis:true */
  var isDisposed,
      count = 0;

  // reference-count lifecycle behavior observable of the same type
  var countObserver,
      countObs         = Observable.create(function (observer) {
        if (isDisposed) {
          observer.complete();
        } else {
          countObserver = observer;
        }
      }, scheduler),
      countBehaviorObs = behavior.call(countObs, getCount, scheduler),
      countCastObs     = toObservable.call(countBehaviorObs, this.constructor);

  // publish single observable for all subscribers
  var result = this
    .do(undefined, undefined, dispose)
    .publish()
    .refCount();

  // hook the subscribe/unsubscribe methods to get a live reference count
  hookSubscribe(result, onCount);

  // composition
  return Object.defineProperties(result, {
    lifecycle: {value: countCastObs}
  });

  function dispose() {
    if (!isDisposed) {
      isDisposed = true;
      if (countObserver) {
        countObserver.complete();
      }

      countObserver = countObs = countBehaviorObs = countCastObs = null;
      result = null;
    }
  }

  function onCount(value) {
    if (value !== count) {
      count = value;
      if (countObserver) {
        countObserver.next(count);
      }
    }
  }

  function getCount() {
    return count;
  }
}

module.exports = lifecycle;