'use strict';

var Rx                 = require('rxjs'),
    multicast          = require('rxjs/operator/multicast').multicast,
    RefCountObservable = (new Rx.ConnectableObservable()).refCount().constructor;

var subclassWith = require('../utility/subclass-with');

/**
 * Represents a value that changes over time. Observers can subscribe to the subject to receive all subsequent
 * notifications, unless or until the source Observable is complete. It is possible to observe the number of
 * subscribers.
 *
 * May be called as an unbound closure but will not subscribe to any source Observable.
 *
 * An optional `subject` may be provided to dictate the nature of the multicast output and/or provide explicit
 * supplementary control of the Observable output. For example, pass `new Rx.BehaviorSubject()` to receive a
 * **behavior** output.
 *
 * Exposes a `lifecycle` Observable which tracks the number of subscribers to the Observable proper. The `lifecycle`
 * will complete when the source Observable completes. The `lifecycle` is a **behavior** in that all new subscriptions
 * will immediately receive the current reference count as their first value, unless or until the source Observable is
 * complete.
 *
 * @this {Observable|undefined}
 * @param {Subject} [subject] Optional existing Subject instance, similar to `multicast()` operator
 * @returns {LifecycleObservable} A RefCountObservable with additional `lifecycle:Observable` field
 */
function lifecycle(subject) {
  /* jshint validthis:true */

  // use a degenerate observable where bound 'this' is not observable
  var source = !!this && (typeof this === 'object') && (this instanceof Rx.Observable) && this || Rx.Observable.never();

  // create a sub-class of RefCountObservable
  //  infer the RefCountObservable class definition by one of its instances
  var LifecycleObservable = subclassWith({
    lifecycle: {get: getLifecycle}
  }, RefCountObservable, constructor);

  return new LifecycleObservable(source, subject);
}

module.exports = lifecycle;

/**
 * Constructor for the LifecycleObservable class
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
  this._subscribe = _subscribe;

  var countStimulus = this._countStimulus = new Rx.BehaviorSubject(0);

  this._lifecycle = Rx.Observable.never()
    .multicast(countStimulus)
    .refCount();

  function setDisposed() {
    that._isDisposed = true;
    that._countStimulus.complete();
  }
}

/**
 * Getter for the LifecycleObservable instance `lifecycle` property
 */
function getLifecycle() {
  /* jshint validthis:true */
  return this._lifecycle;
}

/**
 * Monkey-patch _subscribe method and defer to the RefCountObservable superclass
 */
function _subscribe(subscriber) {
  /* jshint validthis:true */
  var that = this;

  // call super._subscribe()
  var subscription = Object.getPrototypeOf(Object.getPrototypeOf(this))
    ._subscribe.call(this, subscriber);
  that._countStimulus.next(that.refCount);

  var _unsubscribe = subscription._unsubscribe.bind(subscription);

  // money-patch _unsubscribe() and defer to the subscrition
  subscription._unsubscribe = function unsubscribe() {
    _unsubscribe(subscription);
    that._countStimulus.next(that.refCount);
  };
  return subscription;
}