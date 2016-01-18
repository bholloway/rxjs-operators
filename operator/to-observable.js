'use strict';

/**
 * Transform the current Observable to an Observable with a different class implementation.
 * Where it is already of the same `constructor` then the current instance is returned unchanged.
 *
 * @this {Observable}
 * @param Subclass A subclass of `Observable` to cast the observable to
 * @returns An instance of the given class
 */
function toObservableOperator(Subclass) {
  /* jshint validthis:true */

  // determine whether we can/should convert the Observable
  var isConvert = (typeof Subclass === 'function') && (typeof this.constructor === 'function') &&
    (typeof Subclass.prototype.constructor === 'function') && (this.constructor !== Subclass.prototype.constructor);

  // valid
  if (isConvert) {
    var observable = new Subclass();
    observable.source = this;
    observable.operator = this.operator;
    return observable;
  }
  // invalid implies unchanged
  else {
    return this;
  }
}

module.exports = toObservableOperator;