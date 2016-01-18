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
	
	module.exports = {
	  utilty  : {
	    subclassWith: __webpack_require__(/*! ./utility/subclass-with */ 2)
	  },
	  operator: {
	    behavior    : __webpack_require__(/*! ./operator/behavior */ 4),
	    disposable  : __webpack_require__(/*! ./operator/disposable */ 5),
	    lifecycle   : __webpack_require__(/*! ./operator/lifecycle */ 6),
	    toObservable: __webpack_require__(/*! ./operator/to-observable */ 7)
	  }
	};

/***/ },
/* 2 */
/*!**********************************!*\
  !*** ./utility/subclass-with.js ***!
  \**********************************/
/***/ function(module, exports, __webpack_require__) {

	var Operator = __webpack_require__(/*! rxjs */ 3).Operator;
	
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
	
	  for (var key in operators) {
	    if (operators.hasOwnProperty(key)) {
	      Subclass.prototype[key] = operators[key];
	    }
	  }
	
	  return Subclass;
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
/***/ function(module, exports) {

	/**
	 * Represents a value that changes over time. Observers can subscribe to the subject to receive the last (or initial)
	 * value and all subsequent notifications, unless or until the source Observable is complete.
	 *
	 * @param {*} [initialValue] Optional value to use when invalid (defaults to `undefined`)
	 * @param {Scheduler} [scheduler] Optional scheduler for internal use
	 * @returns {Observable} An observable with additional `clear()` method and `isValid:boolean` field
	 */
	function behaviorOperator(initialValue, scheduler) {
	  var currentValue,
	      isDisposed;
	
	  // shared by all subscribers
	  var sourceObs = this.do(store, undefined, dispose);
	
	  var clearObserver,
	      clearObs = Rx.Observable.create(function (observer) {
	        clearObserver = observer;
	      });
	
	  var sharedObs = Rx.Observable.merge(sourceObs, clearObs);
	
	  // factory an observable for each subscriber
	  var result = Rx.Observable.defer(function () {
	    return isDisposed ?
	      Rx.Observable.empty() :
	      Rx.Observable.merge(Rx.Observable.of(currentValue || initialValue), sharedObs);
	  });
	
	  // composition
	  return Object.defineProperties(result, {
	    clear     : {value: clear},
	    getIsValid: {value: getIsValid},
	    isValid   : {get: getIsValid}
	  });
	
	  function store(value) {
	    currentValue = value;
	  }
	
	  function clear() {
	    currentValue = undefined;
	    clearObserver.next(initialValue);
	  }
	
	  function dispose() {
	    if (!isDisposed) {
	      isDisposed = true;
	      currentValue = null;
	      clearObserver.complete();
	
	      sourceObs = null;
	      clearObserver = clearObs = null;
	      sharedObs = null;
	      result = null;
	    }
	  }
	
	  function getIsValid() {
	    return !isDisposed && (currentValue !== initialValue);
	  }
	}
	
	module.exports = behaviorOperator;

/***/ },
/* 5 */
/*!********************************!*\
  !*** ./operator/disposable.js ***!
  \********************************/
/***/ function(module, exports) {

	/**
	 * Represents a value that changes over time. Observers can subscribe to the subject to receive all subsequent
	 * notifications, unless or until the source Observable is complete or the Subject is disposed.
	 *
	 * This Subject introduces a complete that will cause following operators in the observable chain to also complete,
	 * and any disposal lifecycle hooks (i.e. `.using()`) will fire. There is some duplication with the `takeUntil()`
	 * operator which you should consider as an alternative. This Subject is more convenient in the case where where you
	 * want to terminate by simple function call, rather than an observable.
	 *
	 * @param [scheduler] Optional scheduler for internal use
	 * @returns An observable with additional `dispose()` method and `isComplete:boolean` field
	 */
	function disposableOperator(scheduler) {
	
	  // force completion on disposal
	  var isDisposed,
	      disposeObserver,
	      disposeObs = Rx.Observable.create(function (observer) {
	        disposeObserver = observer;
	      });
	
	  var result = this
	    .do(undefined, undefined, dispose)
	    .takeUntil(disposeObs);
	
	  // composition
	  return Object.defineProperties(result, {
	    dispose      : {value: dispose},
	    getIsDisposed: {value: getIsDisposed},
	    isDisposed   : {get: getIsDisposed}
	  });
	
	  function dispose() {
	    if (!isDisposed) {
	      isDisposed = true;
	      disposeObserver.next();
	      disposeObserver.complete();
	
	      disposeObserver = disposeObs = null;
	      result = null;
	    }
	  }
	
	  function getIsDisposed() {
	    return isDisposed;
	  }
	}
	
	module.exports = disposableOperator;

/***/ },
/* 6 */
/*!*******************************!*\
  !*** ./operator/lifecycle.js ***!
  \*******************************/
/***/ function(module, exports, __webpack_require__) {

	var behaviorOperator = __webpack_require__(/*! ./behavior */ 4);
	
	/**
	 * Represents a value that changes over time. Observers can subscribe to the subject to receive all subsequent
	 * notifications, unless or until the source Observable is complete. It is possible to observe the number of
	 * subscriptions to the Subject.
	 *
	 * @param [scheduler] Optional scheduler for internal use
	 * @returns {Observable} An observable with additional `lifecycle:Observable` field
	 */
	function lifecycleOperator(scheduler) {
	  var isDisposed;
	
	  // reference-count lifecycle observable
	  var countObserver,
	      countObs         = Rx.Observable.create(function (observer) {
	        countObserver = observer;
	      }),
	      countBehaviorObs = behaviorOperator.call(countObs, 0);
	
	  // publish single observable for all subscribers
	  var result = this
	    .do(undefined, undefined, dispose)
	    .publish()
	    .refCount();
	
	  // composition
	  return Object.defineProperties(hookSubscribe(result), {
	    lifecycle: {value: countBehaviorObs}
	  });
	
	  function dispose() {
	    if (!isDisposed) {
	      isDisposed = true;
	      countObserver.complete();
	
	      countObserver = countObs = countBehaviorObs = null;
	      result = null;
	    }
	  }
	
	  function hookSubscribe(connectableObs) {
	    var _subscribe = connectableObs._subscribe;
	
	    connectableObs._subscribe = function subscribe(subscriber) {
	      var subscription = _subscribe.call(connectableObs, subscriber);
	      if (countObserver) {
	        countObserver.next(countable.refCount);
	      }
	
	      var _unsubscribe = subscription._unsubscribe;
	
	      subscription._unsubscribe = function unsubscribe() {
	        _unsubscribe.call(subscription);
	        if (countObserver) {
	          countObserver.next(countable.refCount - 1);
	        }
	      };
	      return subscription;
	    };
	
	    return connectableObs;
	  }
	}
	
	module.exports = lifecycleOperator;

/***/ },
/* 7 */
/*!***********************************!*\
  !*** ./operator/to-observable.js ***!
  \***********************************/
/***/ function(module, exports) {

	/**
	 * Represents a value that changes over time. Observers can subscribe to the subject to receive all subsequent
	 * notifications, unless or until the source Observable is complete or the Subject is disposed.
	 *
	 * This Subject introduces a complete that will cause following operators in the observable chain to also complete,
	 * and any disposal lifecycle hooks (i.e. `.using()`) will fire. There is some duplication with the `takeUntil()`
	 * operator which you should consider as an alternative. This Subject is more convenient in the case where where you
	 * want to terminate by simple function call, rather than an observable.
	 *
	 * @param [scheduler] Optional scheduler for internal use
	 * @returns An observable with additional `dispose()` method and `isComplete:boolean` field
	 */
	function disposableOperator(scheduler) {
	
	  // force completion on disposal
	  var isDisposed,
	      disposeObserver,
	      disposeObs = Rx.Observable.create(function (observer) {
	        disposeObserver = observer;
	      });
	
	  var result = this
	    .do(undefined, undefined, dispose)
	    .takeUntil(disposeObs);
	
	  // composition
	  return Object.defineProperties(result, {
	    dispose      : {value: dispose},
	    getIsDisposed: {value: getIsDisposed},
	    isDisposed   : {get: getIsDisposed}
	  });
	
	  function dispose() {
	    if (!isDisposed) {
	      isDisposed = true;
	      disposeObserver.next();
	      disposeObserver.complete();
	
	      disposeObserver = disposeObs = null;
	      result = null;
	    }
	  }
	
	  function getIsDisposed() {
	    return isDisposed;
	  }
	}
	
	module.exports = disposableOperator;

/***/ }
/******/ ])
});
;
//# sourceMappingURL=index.js.map