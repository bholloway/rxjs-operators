/**
 * Represents a value that changes over time. Observers can subscribe to the subject to receive all subsequent
 * notifications, unless or until the source Observable is complete or the Subject is disposed.
 *
 * This Subject introduces a complete that will cause following operators in the observable chain to also complete,
 * and any disposal lifecycle hooks (i.e. `.using()`) will fire. There is some duplication with the `takeUntil()`
 * operator which you should consider as an alternative. This Subject is more convenient in the case where where you
 * want to terminate by simple function call, rather than an observable.
 *
 * @param observable The source observable
 * @param [scheduler] Optional scheduler for internal use
 * @returns An observable with additional `dispose()` method and `isComplete:boolean` field
 */
function disposableSubject(observable, scheduler) {

}

module.exports = disposableSubject;