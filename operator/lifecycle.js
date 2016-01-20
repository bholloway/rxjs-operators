'use strict';

var Rx        = require('rxjs'),
    multicast = require('rxjs/operator/multicast').multicast;

var subclassWith = require('../utility/subclass-with');

/**
 * Represents a value that changes over time. Observers can subscribe to the subject to receive all subsequent
 * notifications, unless or until the source Observable is complete. It is possible to observe the number of
 * subscriptions to the Subject.
 *
 * @this {Observable}
 * @returns {Observable} An observable with additional `lifecycle:Observable` field
 */
function lifecycle() {
  /* jshint validthis:true */
  var RefCountObservable  = getDefinitionRefCountObservable(),
      LifecycleObservable = subclassWith({
        lifecycle: {get: getLifecycle}
      }, RefCountObservable, constructor);
  return new LifecycleObservable(this);
}

module.exports = lifecycle;

function getDefinitionRefCountObservable() {
  return (new Rx.ConnectableObservable()).refCount().constructor;
}

function constructor(source) {
  /* jshint validthis:true */

  // super()
  getDefinitionRefCountObservable().call(this, multicast.call(source, new Rx.Subject()));

  // private members
  this._subscribe = _subscribe;

  this._countStimulus = new Rx.BehaviorSubject(0);

  this._lifecycle = Rx.Observable.never()
    .takeUntil(source)
    .multicast(this._countStimulus)
    .refCount();
}

function getLifecycle() {
  /* jshint validthis:true */
  return this._lifecycle;
}

function _subscribe(subscriber) {
  /* jshint validthis:true */
  var that = this;

  // call super._subscribe()
  var subscription = Object.getPrototypeOf(Object.getPrototypeOf(this))
    ._subscribe.call(this, subscriber);
  that._countStimulus.next(that.refCount);

  var _unsubscribe = subscription._unsubscribe.bind(subscription);

  subscription._unsubscribe = function unsubscribe() {
    _unsubscribe(subscription);
    that._countStimulus.next(that.refCount);
  };
  return subscription;
}