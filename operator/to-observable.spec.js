'use strict';

var Observable = require('rxjs').Observable;

var subclassWith = require('../utility/subclass-with'),
    toObservable = require('./to-observable');

describe('to-observable', function () {
  var SubClass,
      observable;

  beforeEach(function () {
    SubClass = subclassWith({
      toObservable: toObservable
    });
  });

  beforeEach(function () {
    observable = new SubClass();
  });

  describe('with same class as the observable', function () {
    var output;

    beforeEach(function () {
      output = observable.toObservable(SubClass);
    });

    it('should be idempotent for the observable', function () {
      expect(output).toBe(observable);
    });
  });

  describe('with different class to the observable', function () {
    var AnotherClass;

    beforeEach(function () {
      AnotherClass = subclassWith({
        toObservable: toObservable
      });
    });

    describe('that is an immediate subclass of Observable', function () {
      var output;

      beforeEach(function () {
        output = observable.toObservable(AnotherClass);
      });

      it('should be an instanceof the given class', function () {
        expect(output instanceof AnotherClass).toBe(true);
      });

      it('should be idempotent for the output', function () {
        expect(output.toObservable(AnotherClass)).toBe(output);
      });
    });

    describe('that is a deep subclass of Observable', function () {
      var Deep,
          output;

      beforeEach(function () {
        Deep = function () {
        };
        Deep.prototype = Object.create(SubClass.prototype);
        Deep.prototype.constructor = Deep;
      });

      beforeEach(function () {
        output = observable.toObservable(Deep);
      });

      it('should be an instanceof the given class', function () {
        expect(output instanceof Deep).toBe(true);
      });

      it('should be idempotent for the output', function () {
        expect(output.toObservable(Deep)).toBe(output);
      });
    });

    describe('that is a plain function', function () {

      it('should throw', function () {
        expect(function () {
          observable.toObservable(function () {
          });
        }).toThrow();
      });
    });

    describe('that is Observable', function () {

      it('should not throw', function () {
        expect(function () {
          observable.toObservable(Observable);
        }).not.toThrow();
      });
    });
  });
});