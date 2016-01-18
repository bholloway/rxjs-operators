'use strict';

/**
 * Transform the current Observable to an Observable with a different class implementation.
 *
 * @param Subclass A subclass of `Observable` to cast the observable to
 * @returns An instance of the given class
 */
function toObservableOperator(Subclass) {
  /* jshint: validthis */
  var observable = new Subclass();
  observable.source = this;
  observable.operator = this.operator;
  return observable;
}

module.exports = toObservableOperator;