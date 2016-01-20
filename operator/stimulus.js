'use strict';

var Rx        = require('rxjs'),
    multicast = require('rxjs/operator/multicast').multicast;

var subclassWith = require('../utility/subclass-with');

/**
 * Represents a value that changes over time. Observers can subscribe to the subject to receive all subsequent
 * notifications, unless or until the source Observable (if given) is complete. May be explicitly control Observable
 * output using the exposed `next()`, `error()`, and `complete()` methods.
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
 * @returns {StimulusObservable} A RefCountObservable with additional `next()`, `error()`, and `complete()` methods
 */
function stimulus(subject) {
  /* jshint validthis:true */

  // use this where available else use nothing
  var source = !!this && (typeof this === 'object') && (this instanceof Rx.Observable) && this || Rx.Observable.never();

  // create a sub-class of RefCountObservable
  //  infer the RefCountObservable class definition by one of its instances
  var refCountObservable = getRefCountObservable(),
      StimulusObservable = subclassWith({
        next    : next,
        error   : error,
        complete: complete
      }, refCountObservable.constructor, constructor);

  return new StimulusObservable(source, subject);
}

module.exports = stimulus;

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
      multicasted        = multicast.call(source, subject);

  // super()
  refCountObservable.constructor.call(this, multicasted);

  // private members
  this._subject = subject;
}

/**
 * Notify next on the StimulusObservable instance
 */
function next(value) {
  /* jshint validthis:true */
  this._subject.next(value);
}

/**
 * Notify error on the StimulusObservable instance
 */
function error(value) {
  /* jshint validthis:true */
  this._subject.error(value);
}

/**
 * Notify complete on the StimulusObservable instance
 */
function complete() {
  /* jshint validthis:true */
  this._subject.complete();
}