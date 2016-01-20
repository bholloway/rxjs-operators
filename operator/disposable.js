'use strict';

var Rx        = require('rxjs'),
    multicast = require('rxjs/operator/multicast').multicast;

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

  // use this where available else use nothing
  var source = !!this && (typeof this === 'object') && (this instanceof Rx.Observable) && this || Rx.Observable.never();

  // create a sub-class of RefCountObservable
  //  infer the RefCountObservable class definition by one of its instances
  var refCountObservable   = getRefCountObservable(),
      DisposableObservable = subclassWith({
        isDisposed: {get: getIsDisposed},
        dispose   : dispose
      }, refCountObservable.constructor, constructor);

  return new DisposableObservable(source, subject);
}

module.exports = disposable;

function getRefCountObservable() {
  return (new Rx.ConnectableObservable()).refCount();
}

/**
 * Constructor for the DisposableObservable class
 */
function constructor(source, subject) {
  /* jshint validthis:true */

  subject = subject || new Rx.Subject();

  // create the multicast instance for the RefCountObservable
  var refCountObservable = getRefCountObservable(),
      monitored          = source.do(undefined, undefined, this.dispose.bind(this)),
      multicasted        = multicast.call(monitored, subject);

  // super()
  refCountObservable.constructor.call(this, multicasted);

  // private members
  this._subject = subject;
  this._isDisposed = false;
}

/**
 * Getter for the LifecycleObservable instance `lifecycle` property
 */
function getIsDisposed() {
  /* jshint validthis:true */
  return this._isDisposed;
}

/**
 * Trigger complete() on the Observable
 */
function dispose() {
  /* jshint validthis:true */
  if (!this._isDisposed) {
    this._isDisposed = true;
    this._subject.complete();
  }
}