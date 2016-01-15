/**
 * Represents a value that changes over time. Observers can subscribe to the subject to receive all subsequent
 * notifications, unless or until the source Observable is complete. It is possible to observe the number of
 * subscriptions to the Subject.
 *
 * @param observable The source observable
 * @param [scheduler] Optional scheduler for internal use
 * @returns An observable with an additional `refCount:Observable` field
 */
function refCountSubject(observable, scheduler) {

}

module.exports = refCountSubject;