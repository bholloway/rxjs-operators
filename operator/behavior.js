'use strict';

var Observable = require('rxjs').Observable;

var toObservableOperator = require('./to-observable');

/**
 * Represents a value that changes over time. Observers can subscribe to the subject to receive the last (or initial)
 * value and all subsequent notifications, unless or until the source Observable is complete.
 *
 * @this {Observable}
 * @param {*} [initialValue] Optional value to use when invalid (defaults to `undefined`)
 * @param {Scheduler} [scheduler] Optional scheduler for internal use
 * @returns {Observable} An observable with additional `clear()` method and `isValid:boolean` field
 */
function behaviorOperator(initialValue, scheduler) {
  /* jshint validthis:true */
  var currentValue,
      isDisposed;

  // shared by all subscribers
  var sourceObs = this.do(store, undefined, dispose);

  var clearObserver,
      clearObs = Observable.create(function (observer) {
        clearObserver = observer;
      });

  var sharedObs = Observable.merge(sourceObs, clearObs);

  // factory an observable for each subscriber
  var result = Observable.defer(function () {
    return isDisposed ?
      Observable.empty() :
      Observable.merge(Observable.of(currentValue || initialValue), sharedObs);
  });

  // ensure the result is the correct type
  var castResult = toObservableOperator.call(result, this.constructor);

  // composition
  return Object.defineProperties(castResult, {
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
      castResult = null;
    }
  }

  function getIsValid() {
    return !isDisposed && (currentValue !== initialValue);
  }
}

module.exports = behaviorOperator;