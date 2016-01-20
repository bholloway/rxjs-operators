'use strict';

var Rx = require('rxjs');

/**
 * Represents a value that changes over time. Observers can subscribe to the subject to receive all subsequent
 * notifications, unless or until the source Observable (if given) is complete. May be explicitly manipulated using
 * exposed `next()`, `error()`, and `complete()` methods.
 *
 * @this {Observable}
 * @param {Subject} [subject] Optional existing Subject instance which provides the methods that will be exposed
 * @returns {RefCountObservable} An observable with additional `next()`, `error()`, and `complete()` methods
 */
function stimulus(subject) {
  /* jshint validthis:true */

  subject = subject || new Rx.Subject();

  // ensure a valid observable
  var hasThis  = !!this && (typeof this === 'object') && (this instanceof Rx.Observable),
      upstream = hasThis ? this : Rx.Observable.never();

  var observable = upstream
    .multicast(subject)
    .refCount();

  return Object.defineProperties(observable, {
    next    : {value: subject.next.bind(subject)},
    error   : {value: subject.error.bind(subject)},
    complete: {value: subject.complete.bind(subject)}
  });
}

module.exports = stimulus;