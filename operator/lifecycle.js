var behaviorOperator = require('./behavior');

/**
 * Represents a value that changes over time. Observers can subscribe to the subject to receive all subsequent
 * notifications, unless or until the source Observable is complete. It is possible to observe the number of
 * subscriptions to the Subject.
 *
 * @param [scheduler] Optional scheduler for internal use
 * @returns {Observable} An observable with additional `lifecycle:Observable` field
 */
function lifecycleOperator(scheduler) {
  var isDisposed;

  // reference-count lifecycle observable
  var countObserver,
      countObs         = Rx.Observable.create(function (observer) {
        countObserver = observer;
      }),
      countBehaviorObs = behaviorOperator.call(countObs, 0);

  // publish single observable for all subscribers
  var result = this
    .do(undefined, undefined, dispose)
    .publish()
    .refCount();

  // composition
  return Object.defineProperties(hookSubscribe(result), {
    lifecycle: {value: countBehaviorObs}
  });

  function dispose() {
    if (!isDisposed) {
      isDisposed = true;
      countObserver.complete();

      countObserver = countObs = countBehaviorObs = null;
      result = null;
    }
  }

  function hookSubscribe(connectableObs) {
    var _subscribe = connectableObs._subscribe;

    connectableObs._subscribe = function subscribe(subscriber) {
      var subscription = _subscribe.call(connectableObs, subscriber);
      if (countObserver) {
        countObserver.next(countable.refCount);
      }

      var _unsubscribe = subscription._unsubscribe;

      subscription._unsubscribe = function unsubscribe() {
        _unsubscribe.call(subscription);
        if (countObserver) {
          countObserver.next(countable.refCount - 1);
        }
      };
      return subscription;
    };

    return connectableObs;
  }
}

module.exports = lifecycleOperator;