# Rx Operators

[![NPM](https://nodei.co/npm/rx-operators.png)](http://github.com/bholloway/rx-operators)

A library of operators for RxJS

## Usage

In all cases this library does **not add operators to Observable**. You need to do extra work to create an Observable with these operators.

You may either:
 * Use the whole package to get a hash `object` of all `rxOperators.operator.*` and `rxOperators.utility.*`.
 * Import individual operators from `/operator` and/or utilities from `/utility`.

The operators are simply`function` that expect `this` to be `Observable` If they were contained within RxJS then they would be prototype functions on `Observable`.

To use the operators you should either:

 * Create your own `Observable` implementation using `utility.subclassWith(operators)`.
 * Use any of the [options listed in the documentation](https://github.com/ReactiveX/RxJS/blob/master/doc/operator-creation.md#adding-the-operator-to-observable).

Note that the author considers it poor practice to monkey patch `Observable.prototype` per Option 3 as it creates a global namespace in which it will be [easy to conflict with other libraries](https://github.com/ReactiveX/RxJS/issues/1207#issue-127133307). However you may find it useful to do this for operator `toObservable()` otherwise you will have to duplicate all of the `Observable` static methods.

For example:

Import everthing
```
var rxOperators  = require('rx-operators');
var MyObservable = rxOperators.utility.subclassWith({
  disposable: MyObservable.operators.disposable
});
Operator.prototype.toObservable = rxOperators.rxOperators;
```

or import selectively
```
var subclassWith = require('rx-operators/utility/subclass-with');
var MyObservable = subclassWith({
  disposable: require('rx-operators/operators/disposable')
});
Operator.prototype.toObservable = require('rx-operators/utility/to-observable');
```

then use
```
var observable = Observable.create(...)
  .toObservable(MyObservable)
  .disposable();
...
observable.dispose()
```

## Reference

### `utility.subclassWith(operators) : Class`

Create a subclass of `Rx.Operator` that includes the given operators.

* **@param** `operators : object` A hash of operator functions
* **@returns** `:Class` A subclass that includes the given operators

### `operator.behavior([initialValue], [scheduler]) : Observable`

Represents a value that changes over time. Observers can subscribe to the subject to receive the **last (or initial) value** and all subsequent notifications, unless or until the source Observable is complete.

* **@param** `[initialValue] : *` Optional value to use when invalid (defaults to `undefined`)
* **@param** `[scheduler] : Scheduler` Optional scheduler for internal use
* **@returns** `:Observable` An observable with additional `clear()` method and `isValid:boolean` field

Exposes a `clear()` method that will re-instate the `initialValue`.

Exposes an `isValid` flag which negates any time the current value is the `initialValue` (by strict equality).

![operator.behavior](operator/behavior.png)

### `operator.lifecycle([scheduler])`

Represents a value that changes over time. Observers can subscribe to the subject to receive all subsequent notifications, unless or until the source Observable is complete. It is possible to **observe the number of subscriptions** to the Subject.

* **@param** `[scheduler] : Scheduler` Optional scheduler for internal use
* **@returns** `:Observable` An observable with an additional `lifecycle:Observable` field

Exposes a `lifecycle` Observable which tracks the number of subscriptions to the Subject proper. It will complete when the source `Observable` completes and it is a behavior (see above) in that all new subscriptions will immediately receive the current reference count as their first value, unless or until the source `observable` is complete.

![operator.lifecycle](operator/lifecycle.png)

### `operator.disposable([scheduler])`

Represents a value that changes over time. Observers can subscribe to the subject to receive all subsequent notifications, unless or until the source Observable is complete or the Subject is **disposed**.

This operator introduces a `complete` that will all down-stream observables to also complete and any disposal lifecycle hooks (i.e. `.using()`) to therefore fire.

* **@param** `[scheduler] : Scheduler` Optional scheduler for internal use
* **@returns** `:Observable` An observable with additional `dispose()` method and `isComplete:boolean` field

Exposes a `dispose()` method which causes the Subject to `complete` if it has not already done so.

Exposes an `isDisposed` flag which indicates whether the Subject has completed.

![cold.disposableSubject](operator/disposable.png)

There is some duplication with the [`takeUntil()` operator](http://reactivex.io/documentation/operators/takeuntil.html) which you should consider as an alternative.

This operator is more convenient in the case where where you want to terminate by simple function call, rather than an observable. If you find you are iterating over observables and calling `.dispose()` then you should compose with `.takeUntil(kill)` and a single `kill:Observable` instead.