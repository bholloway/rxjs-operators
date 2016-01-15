# Rx Cold Subjects

[![NPM](https://nodei.co/npm/rx-cold-subjects.png)](http://github.com/bholloway/rx-cold-subjects)

Selected RxJS Subjects that operate cold

## Rationale

Per [Dave Sexton's guide](http://davesexton.com/blog/post/To-Use-Subject-Or-Not-To-Use-Subject.aspx) you should only use a Subject if you want a ['hot' observable](http://reactivex.io/documentation/observable.html).

This is because the way you input data to the Subject is using the `subscribe()` method. For example:

```
var mySourceObservable = ...              // some source
var mySubject = ...                       // some subject
mySourceObservable.subscribe(mySubject);  // compose the system
```

Using the subscribe effectively makes a 'hot' system. Even if the source observable was cold, the `subscribe()` will cause it to begin emitting as soon as the system is composed.

Alternatively we could try the `do()` method because. For example:

```
var mySourceObservable = ...       // some source
var mySubject = ...                // some subject
mySourceObservable.do(mySubject);  // compose the system
```

However this system is passive with respect to the source. If the source happens to start then the Subject will receive input but subscribing to the Subject will not cause the source Observable to start.

This library contains implementations of some selected Subjects which are genuinely 'cold'. However they differ from the classical implementation as their source observable needs to be specified at construction.

## Usage

You may either:
 * import the whole package to get a hash `object` of all Subjects, or;
 * import subjects individually from `/cold`.

## API

All Subjects may observe only a single source which must be specified at construction. However unlike classing Subjects the systems they compose will operate ['cold'](http://reactivex.io/documentation/observable.html).

### Reference-Counting Subject

A Subject which exposes a `refCount` Observable which tracks the number of subscriptions to the Subject proper.

`cold.refCountSubject(observable, [scheduler])`

A factory for the Subject.

@param `observable : Observable` The source observable
@param `[scheduler] : Scheduler` Optional scheduler for internal use
@returns `:Observable` An observable with an additional `refCount:Observable` field

Both the Subject proper and the `refCount` Observable will `COMPLETE` when the source `observable` completes.

The `refCount` Observable is a [Behaviour](http://www.introtorx.com/Content/v1.0.10621.0/02_KeyTypes.html#BehaviorSubject) in that all new subscriptions will immediately receive the current reference count as their first value (unless the Observable is already complete).

![cold.refCountSubject](cold/ref-count-subject.png)