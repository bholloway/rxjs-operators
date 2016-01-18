'use strict';

/**
 * Hook the subscribe and unscubscribe methods of a ConnectableObservable.
 *
 * @param {ConnectableObservable} connectableObs The observable to intercept
 * @param {function({number})} callback A method to call with the current reference count
 * @returns {ConnectableObservable} The observable that was given
 */
function hookSubscribe(connectableObs, callback) {
  var _subscribe = connectableObs._subscribe;

  connectableObs._subscribe = function subscribe(subscriber) {
    var subscription = _subscribe.call(connectableObs, subscriber);
    callback(connectableObs.refCount);

    var _unsubscribe = subscription._unsubscribe;

    subscription._unsubscribe = function unsubscribe() {
      _unsubscribe.call(subscription);
      callback(connectableObs.refCount - 1);
    };
    return subscription;
  };

  return connectableObs;
}

module.exports = hookSubscribe;