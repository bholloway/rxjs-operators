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
      isAssigned  = false,
      isDisposed  = false,
      upstreamObs = this;

  // shared by all subscribers
  var sourceObs = upstreamObs
    .do(store, undefined, dispose);

  var clearStim,
      clearObs = Observable.create(function (instance) {
        if (isDisposed) {
          instance.complete();
        }
        else {
          clearStim = instance;
        }
      }, scheduler);

  var sharedObs = Observable.merge(sourceObs, clearObs, scheduler);

  // ensure that new subscribers are notified COMPLETE if the instance is disposed
  var resultObs = Observable.defer(function () {
    return isDisposed ?
      Observable.empty() :
      Observable.merge(Observable.of(getStartValue()), sharedObs, scheduler);
  });

  // ensure the result is the correct type
  var castResultObs = toObservable.call(resultObs, upstreamObs.constructor);

  // composition
  return Object.defineProperties(castResultObs, {
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
      clearStim.next(getInitialValue());
    }
  }

  function dispose() {
    if (!isDisposed) {
      isDisposed = true;

      isAssigned = false;
      currentValue = undefined;
      if (clearStim) {
        clearStim.complete();
      }

      upstreamObs = null;
      sourceObs = null;
      clearStim = clearObs = null;
      sharedObs = null;
      resultObs = null;
      castResultObs = null;
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