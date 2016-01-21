'use strict';

var Rx                 = require('rxjs'),
    multicast          = require('rxjs/operator/multicast').multicast,
    RefCountObservable = (new Rx.ConnectableObservable()).refCount().constructor;

var subclassWith = require('../utility/subclass-with');

/**
 * Represents a value that changes over time. Observers can subscribe to the subject to receive all subsequent
 * notifications, unless or until the source Observable (if given) is complete. May be explicitly completed
 * using an exposed `dispose()` method.
 *
 * May be called as an unbound closure but will not subscribe to any source Observable.
 *
 * An optional `subject` may be provided to dictate the nature of the multicast output and/or provide explicit
 * supplementary control of the Observable output. For example, pass `new Rx.BehaviorSubject()` to receive a
 * **behavior** output.
 *
 * Exposes a `dispose()` method which causes the Subject to `complete` if it has not already done so.
 *
 * Exposes an `isDisposed` flag which indicates whether the Subject has completed.
 *
 * @this {Observable|undefined}
 * @param {Subject} [subject] Optional existing Subject instance, similar to `multicast()` operator
 * @returns {DisposableObservable} A RefCountObservable with additional `dispose()` method
 */
function disposable(subject) {
  /* jshint validthis:true */

  // use a degenerate observable where bound 'this' is not observable
  var source = !!this && (typeof this === 'object') && (this instanceof Rx.Observable) && this || Rx.Observable.never();

  // create a sub-class of RefCountObservable
  //  infer the RefCountObservable class definition by one of its instances
  var DisposableObservable = subclassWith({
    isDisposed: {get: getIsDisposed},
    dispose   : dispose
  }, RefCountObservable, constructor);

  return new DisposableObservable(source, subject);
}

module.exports = disposable;

/**
 * Constructor for the DisposableObservable class
 */
function constructor(source, subject) {
  /* jshint validthis:true */
  var that = this;

  // default to vanilla subject
  subject = subject || new Rx.Subject();

  // quietly go to disposed state when the source Observable errors or completes
  var monitored = source.do(undefined, setDisposed, setDisposed);

  // super()
  RefCountObservable.call(this, multicast.call(monitored, subject));

  // private members
  this._subject = subject;
  this._isDisposed = false;

  function setDisposed() {
    that._isDisposed = true;
  }
}

/**
 * Getter for the DisposableObservable instance `lifecycle` property
 */
function getIsDisposed() {
  /* jshint validthis:true */
  return this._isDisposed;
}

/**
 * Notify complete on the DisposableObservable instance
 */
function dispose() {
  /* jshint validthis:true */
  if (!this._isDisposed) {
    this._isDisposed = true;
    this._subject.complete();
  }
}