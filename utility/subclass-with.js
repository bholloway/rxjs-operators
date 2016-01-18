'use strict';

var Operator = require('rxjs').Operator;

/**
 * Create a subclass of `Rx.Operator` that includes the given operators.
 * @param {object} operators A hash of operator functions
 * @returns {class} A subclass that includes the given operators
 */
function subclassWith(operators) {
  var Subclass = function Subclass() {
    Operator.apply(this, Array.prototype.slice.call(arguments));
  };

  Subclass.prototype = Object.create(Operator);
  Subclass.prototype.constructor = Operator;
  Subclass.prototype.lift = lift;

  for (var key in operators) {
    if (operators.hasOwnProperty(key)) {
      Subclass.prototype[key] = operators[key];
    }
  }

  return Subclass;

  function lift(operator) {
    /* jshint validthis:true */
    var observable = new Subclass();
    observable.source = this;
    observable.operator = operator;
    return observable;
  }
}

module.exports = subclassWith;