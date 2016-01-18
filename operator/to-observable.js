'use strict';

/**
 * Transform the current Observable to an Observable with a different class implementation.
 *
 * @param subclass A subclass of `Observable` to cast the observable to
 * @returns An instance of the given class
 */
function toObservableOperator(subclass) {
  /* jshint: validthis */
  return subclass.lift.call(this, this.operator);
}

module.exports = toObservableOperator;