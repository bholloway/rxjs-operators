'use strict';

var Observable = require('rxjs').Observable;

var toObservable = require('./to-observable');

/**
 * Represents a value that changes over time. Observers can subscribe to the subject to receive the last (or initial)
 * value and all subsequent notifications, unless or until the source Observable is complete.
 *
 * @this {Observable}
 * @param {function():*|*} [initialValue] Optional value to use when invalid or factory thereof (default `undefined`)
 * @param {Scheduler} [scheduler] Optional scheduler for internal use
 * @returns {Observable} An observable with additional `clear()` method and `isValid:boolean` field
 */
function behavior(initialValue, scheduler) {
  /* jshint validthis:true */
  var currentValue,
      isAssigned = false,
      isDisposed = false;

  // shared by all subscribers
  var sourceObs = this.do(store, undefined, dispose);

  var clearObserver,
      clearObs = Observable.create(function (observer) {
        clearObserver = observer;
      }, scheduler);

  var sharedObs = Observable.merge(sourceObs, clearObs, scheduler);

  // factory an observable for each subscriber
  var result = Observable.defer(function () {
    return isDisposed ?
      Observable.empty() :
      Observable.merge(Observable.of(getStartValue()), sharedObs, scheduler);
  });

  // ensure the result is the correct type
  var castResult = toObservable.call(result, this.constructor);

  // composition
  return Object.defineProperties(castResult, {
    clear     : {value: clear},
    getIsValid: {value: getIsValid},
    isValid   : {get: getIsValid}
  });

  function store(value) {
    isAssigned = true;
    currentValue = value;
  }

  function clear() {
    if (!isDisposed) {
      isAssigned = false;
      currentValue = undefined;
      clearObserver.next(getInitialValue());
    }
  }

  function dispose() {
    if (!isDisposed) {
      isDisposed = true;

      isAssigned = false;
      currentValue = undefined;
      clearObserver.complete();

      sourceObs = null;
      clearObserver = clearObs = null;
      sharedObs = null;
      result = null;
      castResult = null;
    }
  }

  function getIsValid() {
    return !isDisposed && (currentValue !== getInitialValue());
  }

  function getStartValue() {
    return isDisposed ? undefined : isAssigned ? currentValue : getInitialValue();
  }

  function getInitialValue() {
    return (typeof initialValue === 'function') ? initialValue() : initialValue;
  }
}

module.exports = behavior;