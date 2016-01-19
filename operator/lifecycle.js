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
      upstreamObs = this,
      count       = 0;

  // reference-count lifecycle behavior observable of the same type
  var countStim,
      countObs         = Observable.create(function (instance) {
        if (isDisposed) {
          instance.complete();
        }
        else {
          countStim = instance;
        }
      }, scheduler),
      countBehaviorObs = behavior.call(countObs, getCount, scheduler),
      countCastObs     = toObservable.call(countBehaviorObs, this.constructor);

  // publish single observable for all subscribers
  var sharedObs = upstreamObs.do(undefined, undefined, dispose).publish().refCount();

  // hook the subscribe/unsubscribe methods to get a live reference count
  hookSubscribe(sharedObs, onCount);

  // ensure that new subscribers are notified COMPLETE if the instance is disposed
  var resultObs = Observable.defer(function () {
    return isDisposed ? Observable.empty() : sharedObs;
  });

  // ensure the result is the correct type
  var castResultObs = toObservable.call(resultObs, upstreamObs.constructor);

  // composition
  return Object.defineProperties(castResultObs, {
    lifecycle: {value: countCastObs}
  });

  function dispose() {
    if (!isDisposed) {
      isDisposed = true;

      if (countStim) {
        countStim.complete();
      }

      upstreamObs = null;
      countStim = countObs = countBehaviorObs = countCastObs = null;
      resultObs = null;
    }
  }

  function onCount(value) {
    if (value !== count) {
      count = value;
      if (countStim) {
        countStim.next(count);
      }
    }
  }

  function getCount() {
    return count;
  }
}

module.exports = lifecycle;