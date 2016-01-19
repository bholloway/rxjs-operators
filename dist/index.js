(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("Rx"));
	else if(typeof define === 'function' && define.amd)
		define(["Rx"], factory);
	else if(typeof exports === 'object')
		exports["rxOperators"] = factory(require("Rx"));
	else
		root["rxOperators"] = factory(root["Rx"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_3__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/*!******************!*\
  !*** multi main ***!
  \******************/
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(/*! ./index.js */1);


/***/ },
/* 1 */
/*!******************!*\
  !*** ./index.js ***!
  \******************/
/***/ function(module, exports, __webpack_require__) {

	/*
	 * MIT License http://opensource.org/licenses/MIT
	 * Author: Ben Holloway @bholloway
	 */
	'use strict';
	
	module.exports = {
	  utilty  : {
	    subclassWith: __webpack_require__(/*! ./utility/subclass-with */ 2)
	  },
	  operator: {
	    behavior    : __webpack_require__(/*! ./operator/behavior */ 4),
	    disposable  : __webpack_require__(/*! ./operator/disposable */ 6),
	    lifecycle   : __webpack_require__(/*! ./operator/lifecycle */ 7),
	    toObservable: __webpack_require__(/*! ./operator/to-observable */ 5)
	  }
	};

/***/ },
/* 2 */
/*!**********************************!*\
  !*** ./utility/subclass-with.js ***!
  \**********************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var Observable = __webpack_require__(/*! rxjs */ 3).Observable;
	
	/**
	 * Create a subclass of `Rx.Operator` that includes the given operators.
	 * @param {object} operators A hash of operator functions
	 * @returns {function} A subclass that includes the given operators
	 */
	function subclassWith(operators) {
	  var Subclass = function Subclass() {
	    Observable.apply(this, Array.prototype.slice.call(arguments));
	  };
	
	  Subclass.prototype = Object.create(Observable.prototype);
	  Subclass.prototype.constructor = Subclass;
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

/***/ },
/* 3 */
/*!*********************!*\
  !*** external "Rx" ***!
  \*********************/
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_3__;

/***/ },
/* 4 */
/*!******************************!*\
  !*** ./operator/behavior.js ***!
  \******************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var Observable = __webpack_require__(/*! rxjs */ 3).Observable;
	
	var toObservable = __webpack_require__(/*! ./to-observable */ 5);
	
	/**
	 * Represents a value that changes over time. Observers can subscribe to the subject to receive the last (or initial)
	 * value and all subsequent notifications, unless or until the source Observable is complete.
	 *
	 * @this {Observable}
	 * @param {function():*|*} [initialValue] Optional value to use when invalid or factory thereof (default `undefined`)
	 * @param {Scheduler} [scheduler] Optional scheduler for internal use
	 * @returns {Observable} An observable with additional `clear()` method and `isValid:boolean` field
	 */
	function behavior(initialValue, scheduler) {
	  /* jshint validthis:true */
	  var currentValue,
	      isAssigned  = false,
	      isDisposed  = false,
	      upstreamObs = this;
	
	  // shared by all subscribers
	  var sourceObs = upstreamObs
	    .do(store, undefined, dispose);
	
	  var clearStim,
	      clearObs = Observable.create(function (instance) {
	        if (isDisposed) {
	          instance.complete();
	        }
	        else {
	          clearStim = instance;
	        }
	      }, scheduler);
	
	  var sharedObs = Observable.merge(sourceObs, clearObs, scheduler);
	
	  // ensure that new subscribers are notified COMPLETE if the instance is disposed
	  var resultObs = Observable.defer(function () {
	    return isDisposed ?
	      Observable.empty() :
	      Observable.merge(Observable.of(getStartValue()), sharedObs, scheduler);
	  });
	
	  // ensure the result is the correct type
	  var castResultObs = toObservable.call(resultObs, upstreamObs.constructor);
	
	  // composition
	  return Object.defineProperties(castResultObs, {
	    clear     : {value: clear},
	    getIsValid: {value: getIsValid},
	    isValid   : {get: getIsValid}
	  });
	
	  function store(value) {
	    isAssigned = true;
	    currentValue = value;
	  }
	
	  function clear() {
	    if (!isDisposed) {
	      isAssigned = false;
	      currentValue = undefined;
	      clearStim.next(getInitialValue());
	    }
	  }
	
	  function dispose() {
	    if (!isDisposed) {
	      isDisposed = true;
	
	      isAssigned = false;
	      currentValue = undefined;
	      if (clearStim) {
	        clearStim.complete();
	      }
	
	      upstreamObs = null;
	      sourceObs = null;
	      clearStim = clearObs = null;
	      sharedObs = null;
	      resultObs = null;
	      castResultObs = null;
	    }
	  }
	
	  function getIsValid() {
	    return !isDisposed && (currentValue !== getInitialValue());
	  }
	
	  function getStartValue() {
	    return isDisposed ? undefined : isAssigned ? currentValue : getInitialValue();
	  }
	
	  function getInitialValue() {
	    return (typeof initialValue === 'function') ? initialValue() : initialValue;
	  }
	}
	
	module.exports = behavior;

/***/ },
/* 5 */
/*!***********************************!*\
  !*** ./operator/to-observable.js ***!
  \***********************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var Observable = __webpack_require__(/*! rxjs */ 3).Observable;
	
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

/***/ },
/* 6 */
/*!********************************!*\
  !*** ./operator/disposable.js ***!
  \********************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var Observable = __webpack_require__(/*! rxjs */ 3).Observable;
	
	/**
	 * Represents a value that changes over time. Observers can subscribe to the subject to receive all subsequent
	 * notifications, unless or until the source Observable is complete or the Subject is disposed.
	 *
	 * This Subject introduces a complete that will cause following operators in the observable chain to also complete,
	 * and any disposal lifecycle hooks (i.e. `.using()`) will fire. There is some duplication with the `takeUntil()`
	 * operator which you should consider as an alternative. This Subject is more convenient in the case where where you
	 * want to terminate by simple function call, rather than an observable.
	 *
	 * @this {Observable}
	 * @param [scheduler] Optional scheduler for internal use
	 * @returns An observable with additional `dispose()` method and `isComplete:boolean` field
	 */
	function disposable(scheduler) {
	  /* jshint validthis:true */
	  var isDisposed,
	      upstreamObs = this;
	
	  // force completion on disposal
	  var disposeObserver,
	      disposeObs = Observable.create(function (observer) {
	        if (isDisposed) {
	          observer.complete();
	        }
	        else {
	          disposeObserver = observer;
	        }
	      }, scheduler);
	
	  var resultObs = upstreamObs
	    .do(undefined, undefined, dispose)
	    .takeUntil(disposeObs);
	
	  // composition
	  return Object.defineProperties(resultObs, {
	    dispose      : {value: dispose},
	    getIsDisposed: {value: getIsDisposed},
	    isDisposed   : {get: getIsDisposed}
	  });
	
	  function dispose() {
	    if (!isDisposed) {
	      isDisposed = true;
	
	      if (disposeObserver) {
	        disposeObserver.next();
	        disposeObserver.complete();
	      }
	
	      upstreamObs = null;
	      disposeObserver = disposeObs = null;
	      resultObs = null;
	    }
	  }
	
	  function getIsDisposed() {
	    return isDisposed;
	  }
	}
	
	module.exports = disposable;

/***/ },
/* 7 */
/*!*******************************!*\
  !*** ./operator/lifecycle.js ***!
  \*******************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var Observable = __webpack_require__(/*! rxjs */ 3).Observable;
	
	var behavior      = __webpack_require__(/*! ./behavior */ 4),
	    toObservable  = __webpack_require__(/*! ./to-observable */ 5),
	    hookSubscribe = __webpack_require__(/*! ../utility/hook-subscribe */ 8);
	
	/**
	 * Represents a value that changes over time. Observers can subscribe to the subject to receive all subsequent
	 * notifications, unless or until the source Observable is complete. It is possible to observe the number of
	 * subscriptions to the Subject.
	 *
	 * @this {Observable}
	 * @param [scheduler] Optional scheduler for internal use
	 * @returns {Observable} An observable with additional `lifecycle:Observable` field
	 */
	function lifecycle(scheduler) {
	  /* jshint validthis:true */
	  var isDisposed,
	      upstreamObs = this,
	      count       = 0;
	
	  // reference-count lifecycle behavior observable of the same type
	  var countStim,
	      countObs         = Observable.create(function (instance) {
	        if (isDisposed) {
	          instance.complete();
	        }
	        else {
	          countStim = instance;
	        }
	      }, scheduler),
	      countBehaviorObs = behavior.call(countObs, getCount, scheduler),
	      countCastObs     = toObservable.call(countBehaviorObs, this.constructor);
	
	  // publish single observable for all subscribers
	  var sharedObs = upstreamObs.do(undefined, undefined, dispose).publish().refCount();
	
	  // hook the subscribe/unsubscribe methods to get a live reference count
	  hookSubscribe(sharedObs, onCount);
	
	  // ensure that new subscribers are notified COMPLETE if the instance is disposed
	  var resultObs = Observable.defer(function () {
	    return isDisposed ? Observable.empty() : sharedObs;
	  });
	
	  // ensure the result is the correct type
	  var castResultObs = toObservable.call(resultObs, upstreamObs.constructor);
	
	  // composition
	  return Object.defineProperties(castResultObs, {
	    lifecycle: {value: countCastObs}
	  });
	
	  function dispose() {
	    if (!isDisposed) {
	      isDisposed = true;
	
	      if (countStim) {
	        countStim.complete();
	      }
	
	      upstreamObs = null;
	      countStim = countObs = countBehaviorObs = countCastObs = null;
	      resultObs = null;
	    }
	  }
	
	  function onCount(value) {
	    if (value !== count) {
	      count = value;
	      if (countStim) {
	        countStim.next(count);
	      }
	    }
	  }
	
	  function getCount() {
	    return count;
	  }
	}
	
	module.exports = lifecycle;

/***/ },
/* 8 */
/*!***********************************!*\
  !*** ./utility/hook-subscribe.js ***!
  \***********************************/
/***/ function(module, exports) {

	'use strict';
	
	/**
	 * Hook the subscribe and unscubscribe methods of a ConnectableObservable.
	 *
	 * @param {ConnectableObservable} connectableObs The observable to intercept
	 * @param {function({number})} callback A method to call with the current reference count
	 * @returns {ConnectableObservable} The observable that was given
	 */
	function hookSubscribe(connectableObs, callback) {
	  var _subscribe = connectableObs._subscribe;
	
	  connectableObs._subscribe = function subscribe(subscriber) {
	    var subscription = _subscribe.call(connectableObs, subscriber);
	    callback(connectableObs.refCount);
	
	    var _unsubscribe = subscription._unsubscribe;
	
	    subscription._unsubscribe = function unsubscribe() {
	      _unsubscribe.call(subscription);
	      callback(connectableObs.refCount);
	    };
	    return subscription;
	  };
	
	  return connectableObs;
	}
	
	module.exports = hookSubscribe;

/***/ }
/******/ ])
});
;
//# sourceMappingURL=index.js.map