# RxJS Operators

[![NPM](https://nodei.co/npm/rxjs-operators.png)](http://github.com/bholloway/rxjs-operators)

A library of operators for RxJS

## Usage

In all cases this library does **not add operators to Rx.Observable**. You need to do extra work to create an Observable with these operators.

You may either:
 * Use the whole package to get a hash `object` of all `RxOperators.operator.*` and `RxOperators.utility.*`.
 * Import individual operators from `/operator` and/or utilities from `/utility`.

The operators are simply `function` that expect `this` to be the **upstream** `Observable` If they were contained within RxJS then they would be prototype functions on `Observable`. They create and return a **downstream** `Observable`.

To use the operators you should either:

 * Create your own `Observable` implementation using `utility.subclassWith(operators)`.  The resulting class implements the necessary `lift()` and `from()` methods and all the given operators.

 * Use any of the [options listed in the documentation](https://github.com/ReactiveX/RxJS/blob/master/doc/operator-creation.md#adding-the-operator-to-observable).

Note that the author considers it poor practice to monkey patch `Observable.prototype` per Option 3 as it creates a global namespace in which it will be [easy to conflict with other libraries](https://github.com/ReactiveX/RxJS/issues/1207#issue-127133307).

For example:

Import everthing
```
var RxOperators  = require('rxjs-operators');
var MyObservable = RxOperators.utility.subclassWith({
  disposable: MyObservable.operators.disposable,
  ...
});
```

or import selectively
```
var subclassWith = require('rxjs-operators/utility/subclass-with'),
    disposable   = require('rxjs-operators/operators/disposable');
	
var MyObservable = subclassWith({
  disposable: disposable,
  ...
});
```

then use the RxJS `let()` operator to cast any Observable
```
var disposableObservable = anyObservable
  .let(MyObservable.from)
  .disposable();
...
disposableObservable.dispose()
```

## Reference

### utility

#### `utility.subclassWith(operators, [BaseClass], [constructor]) : Class`

Create a subclass of `Rx.Observable`, or the given `BaseClass`, that includes the given operators.

Implements instance `lift()` and static `from()` methods.

* **@param** `operators : object` A hash of operator functions or property definitions for the prototype
* **@param** `[BaseClass : Class]` Optional subclass of Observable to use as the base class (default Observable)
* **@param** `[constructor : function]` Optional constructor implementation (default BaseClass)
* **@returns** `: Class` A subclass of Observable that includes the given operators

While `operators` values are typically `function`, they may also be a descriptor `object` per [Object.defineProperty()](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty).

### operator

#### `operator.behavior([initialValue]) : BehaviorObservable`

Represents a value that changes over time. Observers can subscribe to the subject to receive the **last (or initial) value** and all subsequent notifications, unless or until the source Observable is complete.

* **@this** `: Observable`
* **@param** `[initialValue : *]` Optional value to use when invalid (default `undefined`)
* **@returns** `: BehaviorObservable` A RefCountObservable with additional `clear()` method, and `isValid:boolean` and `value:*` fields

Exposes a `clear()` method that will re-instate the `initialValue`.

Exposes an `isValid` flag which negates any time the current value is the `initialValue` (by strict equality).

![operator.behavior](operator/behavior.png)

#### `operator.disposable([subject]) : LifecycleObservable`

Represents a value that changes over time. Observers can subscribe to the subject to receive all subsequent notifications, unless or until the source Observable (if given) is complete. May be explicitly completed using an exposed `dispose()` method.

* **@this** `: Observable|undefined`
* **@param** `[subject : Subject]` Optional existing Subject instance, similar to `multicast()` operator
* **@returns** `: LifecycleObservable` A RefCountObservable with additional `dispose()` method and `isComplete:boolean` field

May be called as an unbound closure but will not subscribe to any source Observable.

An optional `subject` may be provided to dictate the nature of the multicast output and/or provide explicit supplementary control of the Observable output. For example, pass `new Rx.BehaviorSubject()` to receive a **behavior** output.

Exposes a `dispose()` method which causes the Subject to `complete` if it has not already done so.

Exposes an `isDisposed` flag which indicates whether the Subject has completed.

![operator.disposable](operator/disposable.png)

There is some duplication with the [`takeUntil()` operator](http://reactivex.io/documentation/operators/takeuntil.html) which you should consider as an alternative.

This operator is more convenient in the case where where you want to terminate by simple function call, rather than an observable. If you find you are iterating over observables and calling `.dispose()` then you should compose with `.takeUntil(kill)` and a single `kill:Observable` instead.

#### `operator.stimulus([subject]) : StimulusObservable`

Represents a value that changes over time. Observers can subscribe to the subject to receive all subsequent notifications, unless or until the source Observable (if given) is complete. May be explicitly control Observable output using the exposed `next()`, `error()`, and `complete()` methods.

* **@this** `: Observable|undefined`
* **@param** `[subject : Subject]` Optional existing Subject instance, similar to `multicast()` operator
* **@returns** `: StimulusObservable` A RefCountObservable with additional `dispose()` method and `isComplete:boolean` field

May be called as an unbound closure but will not subscribe to any source Observable.

An optional `subject` may be provided to dictate the nature of the multicast output and/or provide explicit supplementary control of the Observable output. For example, pass `new Rx.BehaviorSubject()` to receive a  **behavior** output.

Exposes a `dispose()` method which causes the Subject to `complete` if it has not already done so.

Exposes an `isDisposed` flag which indicates whether the Subject has completed.

![operator.stimulus](operator/stimulus.png)

There is some duplication with the [`takeUntil()` operator](http://reactivex.io/documentation/operators/takeuntil.html) which you should consider as an alternative.

This operator is more convenient in the case where where you want to terminate by simple function call, rather than an observable. If you find you are iterating over observables and calling `.dispose()` then you should compose with `.takeUntil(kill)` and a single `kill:Observable` instead.

#### `operator.lifecycle() : LifecycleObservable`

Represents a value that changes over time. Observers can subscribe to the subject to receive all subsequent notifications, unless or until the source Observable is complete. It is possible to **observe the number of subscriptions** to the Subject.

* **@this** `: Observable|undefined`
* **@param** `[subject : Subject]` Optional existing Subject instance, similar to `multicast()` operator
* **@returns** `: LifecycleObservable` A RefCountObservable with additional `lifecycle:Observable` field

May be called as an unbound closure but will not subscribe to any source Observable.

An optional `subject` may be provided to dictate the nature of the multicast output and/or provide explicit supplementary control of the Observable output. For example, pass `new Rx.BehaviorSubject()` to receive a **behavior** output.

Exposes a `lifecycle` Observable which tracks the number of subscribers to the Observable proper. The `lifecycle` will complete when the source Observable completes. The `lifecycle` is a **behavior** in that all new subscriptions will immediately receive the current reference count as their first value, unless or until the source Observable is complete.

![operator.lifecycle](operator/lifecycle.png)