'use strict';

var Observable = require('rxjs').Observable;

/**
 * Create a subclass of `Rx.Observable`, or the given `BaseClass`, that includes the given operators.
 *
 * Implements instance `lift()` and static `from()` methods.
 *
 * @param {object} operators A hash of operator functions or property definitions for the prototype
 * @param {Class} [BaseClass] Optional subclass of Observable to use as the base class
 * @param {function} [constructor] Optional constructor implementation
 * @returns {function} A subclass of Observable that includes the given operators
 */
function subclassWith(operators, BaseClass, constructor) {
  BaseClass = BaseClass || Observable;
  constructor = constructor || BaseClass;

  // Observable or its subclasses
  if (!getObservablePrototype(BaseClass)) {
    throw new TypeError('given BaseClass must be Rx.Observable or one of its sub-classes');
  }

  var SubClass = function SubClass() {
    if (typeof constructor === 'function') {
      constructor.apply(this, Array.prototype.slice.call(arguments));
    }
  };

  // static methods
  SubClass.from = from;

  // instance methods
  SubClass.prototype = Object.create(BaseClass.prototype);
  SubClass.prototype.constructor = SubClass;
  SubClass.prototype.lift = lift;

  for (var key in operators) {
    if (operators.hasOwnProperty(key)) {
      var value = operators[key];

      // functions are assigned
      if (typeof value === 'function') {
        SubClass.prototype[key] = value;
      }
      // objects are treated as property definitions
      else if (typeof value === 'object') {
        Object.defineProperty(SubClass.prototype, key, value);
      }
    }
  }

  return SubClass;

  function lift(operator) {
    /* jshint validthis:true */
    var observable = new SubClass();
    observable.source = this;
    observable.operator = operator;
    return observable;
  }

  function from(observable) {
    /* jshint validthis:true */
    var prototype = getObservablePrototype(observable);

    // ensure any instance of Observable or its subclasses
    if (!prototype) {
      throw new TypeError('given observable must be an instance of Rx.Observable or one of its sub-classes');
    }
    // idempotent where the given observable is the same class
    else if (prototype === SubClass.prototype) {
      return this;
    }
    // mismatch class implies new instance (similar to Observable.lift)
    else {
      var result = new SubClass();
      result.source = observable;
      result.operator = observable.operator;
      return result;
    }
  }

  function getObservablePrototype(candidate) {
    var prototype = (typeof candidate === 'function') ? BaseClass.prototype :
          (typeof candidate === 'object') ? Object.getPrototypeOf(candidate) : null,
        isValid   = !!prototype && (typeof prototype === 'object') &&
          ((prototype === Observable.prototype) || (prototype instanceof Observable));
    return isValid && prototype;
  }
}

module.exports = subclassWith;