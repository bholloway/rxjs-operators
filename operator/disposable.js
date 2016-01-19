'use strict';

var Observable = require('rxjs').Observable;

/**
 * Represents a value that changes over time. Observers can subscribe to the subject to receive all subsequent
 * notifications, unless or until the source Observable is complete or the Subject is disposed.
 *
 * This Subject introduces a complete that will cause following operators in the observable chain to also complete,
 * and any disposal lifecycle hooks (i.e. `.using()`) will fire. There is some duplication with the `takeUntil()`
 * operator which you should consider as an alternative. This Subject is more convenient in the case where where you
 * want to terminate by simple function call, rather than an observable.
 *
 * @this {Observable}
 * @param [scheduler] Optional scheduler for internal use
 * @returns An observable with additional `dispose()` method and `isComplete:boolean` field
 */
function disposable(scheduler) {
  /* jshint validthis:true */
  var isDisposed,
      upstreamObs = this;

  // force completion on disposal
  var disposeObserver,
      disposeObs = Observable.create(function (observer) {
        if (isDisposed) {
          observer.complete();
        }
        else {
          disposeObserver = observer;
        }
      }, scheduler);

  var resultObs = upstreamObs
    .do(undefined, undefined, dispose)
    .takeUntil(disposeObs);

  // composition
  return Object.defineProperties(resultObs, {
    dispose      : {value: dispose},
    getIsDisposed: {value: getIsDisposed},
    isDisposed   : {get: getIsDisposed}
  });

  function dispose() {
    if (!isDisposed) {
      isDisposed = true;

      if (disposeObserver) {
        disposeObserver.next();
        disposeObserver.complete();
      }

      upstreamObs = null;
      disposeObserver = disposeObs = null;
      resultObs = null;
    }
  }

  function getIsDisposed() {
    return isDisposed;
  }
}

module.exports = disposable;