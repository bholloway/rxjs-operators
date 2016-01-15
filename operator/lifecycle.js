
var behaviorOperator = require('./behavior-operator');

/**
 * Represents a value that changes over time. Observers can subscribe to the subject to receive all subsequent
 * notifications, unless or until the source Observable is complete. It is possible to observe the number of
 * subscriptions to the Subject.
 *
 * @param [scheduler] Optional scheduler for internal use
 * @returns {Observable} An observable with additional `lifecycle:Observable` field
 */
function lifecycleOperator(scheduler) {

  // reference-count lifecycle observable
  var countObserver,
      count = Rx.Observable.create(function (observer) {
          countObserver = observer;
          return function dispose() {
            countObserver = null;
          };
        })
        .takeUntil(this.last());

  var lifecycle = behaviorOperator.call(count, 0);

  // publish single observable for all subscribers
  var result = hookSubscribe(this.publish().refCount());

  // composition
  return Object.defineProperties(result, {
    lifecycle: {value: lifecycle}
  });

  function hookSubscribe(connectableObs) {
    var _subscribe = connectableObs._subscribe;

    connectableObs._subscribe = function subscribe(subscriber) {
      var subscription = _subscribe.call(connectableObs, subscriber);
      if (countObserver) {
        countObserver.next(countable.refCount);
      }

      var _unsubscribe = subscription._unsubscribe;

      subscription._unsubscribe = function unsubscribe() {
        _unsubscribe.call(connectableObs);
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