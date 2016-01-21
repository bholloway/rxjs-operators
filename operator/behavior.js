'use strict';

var Rx                 = require('rxjs'),
    multicast          = require('rxjs/operator/multicast').multicast,
    RefCountObservable = (new Rx.ConnectableObservable()).refCount().constructor;

var subclassWith = require('../utility/subclass-with');

/**
 * Represents a value that changes over time. Observers can subscribe to the subject to receive the last (or initial)
 * value and all subsequent notifications, unless or until the source Observable is complete.
 *
 * Exposes a `clear()` method that will re-instate the `initialValue`.
 *
 * Exposes an `isValid` flag which negates any time the current value is the `initialValue` (by strict equality).
 *
 * @this {Observable}
 * @param {*} [initialValue] Optional value to use when invalid (default `undefined`)
 * @returns {BehaviorObservable} A RefCountObservable with additional `clear()` method, and `isValid:boolean` and
 * `value:*` fields
 */
function behavior(initialValue) {
  /* jshint validthis:true */

  // create a sub-class of RefCountObservable
  //  infer the RefCountObservable class definition by one of its instances
  var BehaviorObservable = subclassWith({
    isValid   : {get: getIsValid},
    value     : {get: getValue},
    clear     : clear,
    lift      : lift
  }, RefCountObservable, constructor);

  return new BehaviorObservable(this, initialValue);

  function lift(operator) {
    /* jshint validthis:true */
    var observable = new Rx.Observable();
    observable.source = this;
    observable.operator = operator;
    return observable;
  }
}

module.exports = behavior;

/**
 * Constructor for the BehaviorObservable class
 */
function constructor(source, initialValue) {
  /* jshint validthis:true */
  var that = this;

  // create the subject
  var subject = new Rx.BehaviorSubject(initialValue);

  // quietly go to disposed state when the source Observable errors or completes
  var monitored = source.do(undefined, setDisposed, setDisposed);

  // super()
  RefCountObservable.call(this, multicast.call(monitored, subject));

  // private members
  this._initialValue = initialValue;
  this._subject = subject;
  this._isDisposed = false;

  function setDisposed() {
    that._isDisposed = true;
  }
}

/**
 * Flag negates any time the current value on the StimulusObservable instance is the `initialValue` (by strict equality)
 */
function getIsValid() {
  /* jshint validthis:true */
  return !this._isDisposed && (this._subject.getValue() !== this._initialValue);
}

/**
 * The current value of the instance.
 */
function getValue() {
  /* jshint validthis:true */
  return this._subject.getValue();
}

/**
 * Re-instate the `initialValue` on the StimulusObservable instance
 */
function clear() {
  /* jshint validthis:true */
  if (this.isValid) {
    this._subject.next(this._initialValue);
  }
}