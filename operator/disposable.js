'use strict';

var Rx = require('rxjs');

/**
 * Represents a value that changes over time. Observers can subscribe to the subject to receive all subsequent
 * notifications, unless or until the source Observable (if given) is complete. May be explicitly completed
 * using an exposed `dispose()` method.
 *
 * @this {Observable}
 * @param {Subject} [subject] Optional existing Subject instance which provides a `complete()` method to manipulate
 * @returns {RefCountObservable} An observable with additional `dispose()` method
 */
function disposable(subject) {
  /* jshint validthis:true */

  subject = subject || new Rx.Subject();

  // ensure a valid observable
  var hasThis  = !!this && (typeof this === 'object') && (this instanceof Rx.Observable),
      upstream = hasThis ? this : Rx.Observable.never();

  var observable = upstream
    .multicast(subject)
    .refCount();

  return Object.defineProperties(observable, {
    dispose: {value: subject.complete.bind(subject)}
  });
}

module.exports = disposable;