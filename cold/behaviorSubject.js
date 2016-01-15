/**
 * Represents a value that changes over time. Observers can subscribe to the subject to receive the last (or initial)
 * value and all subsequent notifications, unless or until the source Observable is complete.
 *
 * @param observable The source observable
 * @param [initialValue] Optional value to use when invalid (defaults to `undefined`)
 * @param [scheduler] Optional scheduler for internal use
 * @returns An observable with additional `clear()` method and `isValid:boolean` field
 */
function behaviorSubject(observable, initialValue, scheduler) {

}

module.exports = behaviorSubject;