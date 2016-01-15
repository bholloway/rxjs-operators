/**
 * Represents a value that changes over time. Observers can subscribe to the subject to receive all subsequent
 * notifications, unless or until the source Observable is complete or the Subject is disposed.
 *
 * This Subject introduces a complete that will cause following operators in the observable chain to also complete,
 * and any disposal lifecycle hooks (i.e. `.using()`) will fire. There is some duplication with the `takeUntil()`
 * operator which you should consider as an alternative. This Subject is more convenient in the case where where you
 * want to terminate by simple function call, rather than an observable.
 *
 * @param [scheduler] Optional scheduler for internal use
 * @returns An observable with additional `dispose()` method and `isComplete:boolean` field
 */
function disposableOperator(scheduler) {

  // force completion on disposal
  var isDisposed,
      disposeObserver,
      disposeObs = Rx.Observable.create(function (observer) {
        disposeObserver = observer;
      });

  var result = this
    .do(undefined, undefined, dispose)
    .takeUntil(disposeObs);

  // composition
  return Object.defineProperties(result, {
    dispose      : {value: dispose},
    getIsDisposed: {value: getIsDisposed},
    isDisposed   : {get: getIsDisposed}
  });

  function dispose() {
    if (!isDisposed) {
      isDisposed = true;
      disposeObserver.next();
      disposeObserver.complete();

      disposeObserver = disposeObs = null;
      result = null;
    }
  }

  function getIsDisposed() {
    return isDisposed;
  }
}

module.exports = disposableOperator;