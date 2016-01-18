'use strict';

var Observable = require('rxjs').Observable;

/**
 * Transform the current Observable to an Observable with a different class implementation.
 * Where it is already of the same `constructor` then the current instance is returned unchanged.
 *
 * @this {Observable}
 * @param Subclass A subclass of `Observable` to cast the observable to
 * @returns An instance of the given class
 */
function toObservable(Subclass) {
  /* jshint validthis:true */

  // any subclass of Observable or Observable itself is valid
  var isValid = (typeof Subclass === 'function') && !!Subclass.prototype && (typeof Subclass.prototype === 'object') &&
    ((Subclass === Observable) || (Subclass.prototype instanceof Observable));

  // invalid argument
  if (!isValid) {
    throw new TypeError('given argument must be a subclass of Rx.Observable');
  }
  // same class implies unchanged
  else if (Subclass.prototype.isPrototypeOf(this)) {
    return this;
  }
  // mismatch implies new instance (similar to Observable.lift)
  else {
    var observable = new Subclass();
    observable.source = this;
    observable.operator = this.operator;
    return observable;
  }
}

module.exports = toObservable;