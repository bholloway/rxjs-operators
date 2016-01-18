'use strict';

var Observable = require('rxjs').Observable;

var behaviorOperator     = require('./behavior'),
    toObservableOperator = require('./to-observable'),
    hookSubscribe        = require('../utility/hook-subscribe');

/**
 * Represents a value that changes over time. Observers can subscribe to the subject to receive all subsequent
 * notifications, unless or until the source Observable is complete. It is possible to observe the number of
 * subscriptions to the Subject.
 *
 * @this {Observable}
 * @param [scheduler] Optional scheduler for internal use
 * @returns {Observable} An observable with additional `lifecycle:Observable` field
 */
function lifecycleOperator(scheduler) {
  /* jshint validthis:true */
  var isDisposed;

  // reference-count lifecycle behavior observable of the same type
  var countObserver,
      countObs         = Observable.create(function (observer) {
        countObserver = observer;
      }),
      countBehaviorObs = behaviorOperator.call(countObs, 0),
      countCastObs     = toObservableOperator.call(countBehaviorObs, this.constructor);

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
      countObserver.complete();

      countObserver = countObs = countBehaviorObs = countCastObs = null;
      result = null;
    }
  }

  function onCount(count) {
    if (countObserver) {
      countObserver.next(count);
    }
  }
}

module.exports = lifecycleOperator;