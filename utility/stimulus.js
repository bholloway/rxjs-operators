'use strict';

var Rx = require('rxjs');

/**
 * Create an cold RefCountObservable which exposes observer next(), error(), and complete() methods.
 * @param {Subject} [subject] Optional existing Subject instance which provides the methods that will be exposed
 * @returns {RefCountObservable} An observable with additional `next()`, `error()`, and `complete()` methods
 */
function stimulus(subject) {
  var isDisposed = false;

  subject = subject || new Rx.Subject();
  subject.subscribe(undefined, undefined, dispose);

  var common = Rx.Observable.never()
    .multicast(subject)
    .refCount();
  
  var observable = Rx.Observable.defer(function () {
    return isDisposed ? Rx.Observable.empty() : common;
  });

  return Object.defineProperties(observable, {
    next    : {value: subject.next.bind(subject)},
    error   : {value: subject.error.bind(subject)},
    complete: {value: subject.complete.bind(subject)}
  });

  function dispose() {
    isDisposed = true;
  }
}

module.exports = stimulus;

/*
function stimulus(subject) {
  subject = subject || new Rx.Subject();

  var observable = Rx.Observable
    .never()
    .multicast(subject)
    .refCount();

  return Object.defineProperties(observable, {
    next    : {value: subject.next.bind(subject)},
    error   : {value: subject.error.bind(subject)},
    complete: {value: subject.complete.bind(subject)},
  });
}

module.exports = stimulus;
*/