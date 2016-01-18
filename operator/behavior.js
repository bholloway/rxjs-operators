'use strict';

/**
 * Represents a value that changes over time. Observers can subscribe to the subject to receive the last (or initial)
 * value and all subsequent notifications, unless or until the source Observable is complete.
 *
 * @param {*} [initialValue] Optional value to use when invalid (defaults to `undefined`)
 * @param {Scheduler} [scheduler] Optional scheduler for internal use
 * @returns {Observable} An observable with additional `clear()` method and `isValid:boolean` field
 */
function behaviorOperator(initialValue, scheduler) {
  var currentValue,
      isDisposed;

  // shared by all subscribers
  var sourceObs = this.do(store, undefined, dispose);

  var clearObserver,
      clearObs = Rx.Observable.create(function (observer) {
        clearObserver = observer;
      });

  var sharedObs = Rx.Observable.merge(sourceObs, clearObs);

  // factory an observable for each subscriber
  var result = Rx.Observable.defer(function () {
    return isDisposed ?
      Rx.Observable.empty() :
      Rx.Observable.merge(Rx.Observable.of(currentValue || initialValue), sharedObs);
  });

  // composition
  return Object.defineProperties(result, {
    clear     : {value: clear},
    getIsValid: {value: getIsValid},
    isValid   : {get: getIsValid}
  });

  function store(value) {
    currentValue = value;
  }

  function clear() {
    currentValue = undefined;
    clearObserver.next(initialValue);
  }

  function dispose() {
    if (!isDisposed) {
      isDisposed = true;
      currentValue = null;
      clearObserver.complete();

      sourceObs = null;
      clearObserver = clearObs = null;
      sharedObs = null;
      result = null;
    }
  }

  function getIsValid() {
    return !isDisposed && (currentValue !== initialValue);
  }
}

module.exports = behaviorOperator;