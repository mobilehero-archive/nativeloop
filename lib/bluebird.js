"use strict";

var _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj) {
    return typeof obj;
} : function(obj) {
    return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};

!function(e) {
    if ("object" == ("undefined" == typeof exports ? "undefined" : _typeof(exports)) && "undefined" != typeof module) module.exports = e(); else if ("function" == typeof define && define.amd) define([], e); else {
        var f;
        "undefined" != typeof window ? f = window : "undefined" != typeof global ? f = global : "undefined" != typeof self && (f = self), 
        f.Promise = e();
    }
}(function() {
    var define, module, exports;
    return function e(t, n, r) {
        function s(o, u) {
            if (!n[o]) {
                if (!t[o]) {
                    var a = "function" == typeof _dereq_ && _dereq_;
                    if (!u && a) return a(o, !0);
                    if (i) return i(o, !0);
                    var f = new Error("Cannot find module '" + o + "'");
                    throw f.code = "MODULE_NOT_FOUND", f;
                }
                var l = n[o] = {
                    exports: {}
                };
                t[o][0].call(l.exports, function(e) {
                    var n = t[o][1][e];
                    return s(n ? n : e);
                }, l, l.exports, e, t, n, r);
            }
            return n[o].exports;
        }
        var i = "function" == typeof _dereq_ && _dereq_;
        for (var o = 0; o < r.length; o++) s(r[o]);
        return s;
    }({
        1: [ function(_dereq_, module) {
            module.exports = function(Promise) {
                function any(promises) {
                    var ret = new SomePromiseArray(promises);
                    var promise = ret.promise();
                    ret.setHowMany(1);
                    ret.setUnwrap();
                    ret.init();
                    return promise;
                }
                var SomePromiseArray = Promise._SomePromiseArray;
                Promise.any = function(promises) {
                    return any(promises);
                };
                Promise.prototype.any = function() {
                    return any(this);
                };
            };
        }, {} ],
        2: [ function(_dereq_, module) {
            function Async() {
                this._customScheduler = false;
                this._isTickUsed = false;
                this._lateQueue = new Queue(16);
                this._normalQueue = new Queue(16);
                this._haveDrainedQueues = false;
                this._trampolineEnabled = true;
                var self = this;
                this.drainQueues = function() {
                    self._drainQueues();
                };
                this._schedule = schedule;
            }
            function AsyncInvokeLater(fn, receiver, arg) {
                this._lateQueue.push(fn, receiver, arg);
                this._queueTick();
            }
            function AsyncInvoke(fn, receiver, arg) {
                this._normalQueue.push(fn, receiver, arg);
                this._queueTick();
            }
            function AsyncSettlePromises(promise) {
                this._normalQueue._pushOne(promise);
                this._queueTick();
            }
            var firstLineError;
            try {
                throw new Error();
            } catch (e) {
                firstLineError = e;
            }
            var schedule = _dereq_("./schedule");
            var Queue = _dereq_("./queue");
            var util = _dereq_("./util");
            Async.prototype.setScheduler = function(fn) {
                var prev = this._schedule;
                this._schedule = fn;
                this._customScheduler = true;
                return prev;
            };
            Async.prototype.hasCustomScheduler = function() {
                return this._customScheduler;
            };
            Async.prototype.enableTrampoline = function() {
                this._trampolineEnabled = true;
            };
            Async.prototype.disableTrampolineIfNecessary = function() {
                util.hasDevTools && (this._trampolineEnabled = false);
            };
            Async.prototype.haveItemsQueued = function() {
                return this._isTickUsed || this._haveDrainedQueues;
            };
            Async.prototype.fatalError = function(e, isNode) {
                if (isNode) {
                    process.stderr.write("Fatal " + (e instanceof Error ? e.stack : e) + "\n");
                    process.exit(2);
                } else this.throwLater(e);
            };
            Async.prototype.throwLater = function(fn, arg) {
                if (1 === arguments.length) {
                    arg = fn;
                    fn = function() {
                        throw arg;
                    };
                }
                if ("undefined" != typeof setTimeout) setTimeout(function() {
                    fn(arg);
                }, 0); else try {
                    this._schedule(function() {
                        fn(arg);
                    });
                } catch (e) {
                    throw new Error("No async scheduler available\n\n    See http://goo.gl/MqrFmX\n");
                }
            };
            if (util.hasDevTools) {
                Async.prototype.invokeLater = function(fn, receiver, arg) {
                    this._trampolineEnabled ? AsyncInvokeLater.call(this, fn, receiver, arg) : this._schedule(function() {
                        setTimeout(function() {
                            fn.call(receiver, arg);
                        }, 100);
                    });
                };
                Async.prototype.invoke = function(fn, receiver, arg) {
                    this._trampolineEnabled ? AsyncInvoke.call(this, fn, receiver, arg) : this._schedule(function() {
                        fn.call(receiver, arg);
                    });
                };
                Async.prototype.settlePromises = function(promise) {
                    this._trampolineEnabled ? AsyncSettlePromises.call(this, promise) : this._schedule(function() {
                        promise._settlePromises();
                    });
                };
            } else {
                Async.prototype.invokeLater = AsyncInvokeLater;
                Async.prototype.invoke = AsyncInvoke;
                Async.prototype.settlePromises = AsyncSettlePromises;
            }
            Async.prototype.invokeFirst = function(fn, receiver, arg) {
                this._normalQueue.unshift(fn, receiver, arg);
                this._queueTick();
            };
            Async.prototype._drainQueue = function(queue) {
                while (queue.length() > 0) {
                    var fn = queue.shift();
                    if ("function" != typeof fn) {
                        fn._settlePromises();
                        continue;
                    }
                    var receiver = queue.shift();
                    var arg = queue.shift();
                    fn.call(receiver, arg);
                }
            };
            Async.prototype._drainQueues = function() {
                this._drainQueue(this._normalQueue);
                this._reset();
                this._haveDrainedQueues = true;
                this._drainQueue(this._lateQueue);
            };
            Async.prototype._queueTick = function() {
                if (!this._isTickUsed) {
                    this._isTickUsed = true;
                    this._schedule(this.drainQueues);
                }
            };
            Async.prototype._reset = function() {
                this._isTickUsed = false;
            };
            module.exports = Async;
            module.exports.firstLineError = firstLineError;
        }, {
            "./queue": 26,
            "./schedule": 29,
            "./util": 36
        } ],
        3: [ function(_dereq_, module) {
            module.exports = function(Promise, INTERNAL, tryConvertToPromise, debug) {
                var calledBind = false;
                var rejectThis = function(_, e) {
                    this._reject(e);
                };
                var targetRejected = function(e, context) {
                    context.promiseRejectionQueued = true;
                    context.bindingPromise._then(rejectThis, rejectThis, null, this, e);
                };
                var bindingResolved = function(thisArg, context) {
                    0 === (50397184 & this._bitField) && this._resolveCallback(context.target);
                };
                var bindingRejected = function(e, context) {
                    context.promiseRejectionQueued || this._reject(e);
                };
                Promise.prototype.bind = function(thisArg) {
                    if (!calledBind) {
                        calledBind = true;
                        Promise.prototype._propagateFrom = debug.propagateFromFunction();
                        Promise.prototype._boundValue = debug.boundValueFunction();
                    }
                    var maybePromise = tryConvertToPromise(thisArg);
                    var ret = new Promise(INTERNAL);
                    ret._propagateFrom(this, 1);
                    var target = this._target();
                    ret._setBoundTo(maybePromise);
                    if (maybePromise instanceof Promise) {
                        var context = {
                            promiseRejectionQueued: false,
                            promise: ret,
                            target: target,
                            bindingPromise: maybePromise
                        };
                        target._then(INTERNAL, targetRejected, void 0, ret, context);
                        maybePromise._then(bindingResolved, bindingRejected, void 0, ret, context);
                        ret._setOnCancel(maybePromise);
                    } else ret._resolveCallback(target);
                    return ret;
                };
                Promise.prototype._setBoundTo = function(obj) {
                    if (void 0 !== obj) {
                        this._bitField = 2097152 | this._bitField;
                        this._boundTo = obj;
                    } else this._bitField = -2097153 & this._bitField;
                };
                Promise.prototype._isBound = function() {
                    return 2097152 === (2097152 & this._bitField);
                };
                Promise.bind = function(thisArg, value) {
                    return Promise.resolve(value).bind(thisArg);
                };
            };
        }, {} ],
        4: [ function(_dereq_, module) {
            function noConflict() {
                try {
                    Promise === bluebird && (Promise = old);
                } catch (e) {}
                return bluebird;
            }
            var old;
            "undefined" != typeof Promise && (old = Promise);
            var bluebird = _dereq_("./promise")();
            bluebird.noConflict = noConflict;
            module.exports = bluebird;
        }, {
            "./promise": 22
        } ],
        5: [ function(_dereq_, module) {
            var cr = Object.create;
            if (cr) {
                var callerCache = cr(null);
                var getterCache = cr(null);
                callerCache[" size"] = getterCache[" size"] = 0;
            }
            module.exports = function(Promise) {
                function ensureMethod(obj, methodName) {
                    var fn;
                    null != obj && (fn = obj[methodName]);
                    if ("function" != typeof fn) {
                        var message = "Object " + util.classString(obj) + " has no method '" + util.toString(methodName) + "'";
                        throw new Promise.TypeError(message);
                    }
                    return fn;
                }
                function caller(obj) {
                    var methodName = this.pop();
                    var fn = ensureMethod(obj, methodName);
                    return fn.apply(obj, this);
                }
                function namedGetter(obj) {
                    return obj[this];
                }
                function indexedGetter(obj) {
                    var index = +this;
                    0 > index && (index = Math.max(0, index + obj.length));
                    return obj[index];
                }
                var util = _dereq_("./util");
                var canEvaluate = util.canEvaluate;
                util.isIdentifier;
                var getGetter;
                Promise.prototype.call = function(methodName) {
                    var args = [].slice.call(arguments, 1);
                    args.push(methodName);
                    return this._then(caller, void 0, void 0, args, void 0);
                };
                Promise.prototype.get = function(propertyName) {
                    var isIndex = "number" == typeof propertyName;
                    var getter;
                    if (isIndex) getter = indexedGetter; else if (canEvaluate) {
                        var maybeGetter = getGetter(propertyName);
                        getter = null !== maybeGetter ? maybeGetter : namedGetter;
                    } else getter = namedGetter;
                    return this._then(getter, void 0, void 0, propertyName, void 0);
                };
            };
        }, {
            "./util": 36
        } ],
        6: [ function(_dereq_, module) {
            module.exports = function(Promise, PromiseArray, apiRejection, debug) {
                var util = _dereq_("./util");
                var tryCatch = util.tryCatch;
                var errorObj = util.errorObj;
                var async = Promise._async;
                Promise.prototype["break"] = Promise.prototype.cancel = function() {
                    if (!debug.cancellation()) return this._warn("cancellation is disabled");
                    var promise = this;
                    var child = promise;
                    while (promise._isCancellable()) {
                        if (!promise._cancelBy(child)) {
                            child._isFollowing() ? child._followee().cancel() : child._cancelBranched();
                            break;
                        }
                        var parent = promise._cancellationParent;
                        if (null == parent || !parent._isCancellable()) {
                            promise._isFollowing() ? promise._followee().cancel() : promise._cancelBranched();
                            break;
                        }
                        promise._isFollowing() && promise._followee().cancel();
                        promise._setWillBeCancelled();
                        child = promise;
                        promise = parent;
                    }
                };
                Promise.prototype._branchHasCancelled = function() {
                    this._branchesRemainingToCancel--;
                };
                Promise.prototype._enoughBranchesHaveCancelled = function() {
                    return void 0 === this._branchesRemainingToCancel || this._branchesRemainingToCancel <= 0;
                };
                Promise.prototype._cancelBy = function(canceller) {
                    if (canceller === this) {
                        this._branchesRemainingToCancel = 0;
                        this._invokeOnCancel();
                        return true;
                    }
                    this._branchHasCancelled();
                    if (this._enoughBranchesHaveCancelled()) {
                        this._invokeOnCancel();
                        return true;
                    }
                    return false;
                };
                Promise.prototype._cancelBranched = function() {
                    this._enoughBranchesHaveCancelled() && this._cancel();
                };
                Promise.prototype._cancel = function() {
                    if (!this._isCancellable()) return;
                    this._setCancelled();
                    async.invoke(this._cancelPromises, this, void 0);
                };
                Promise.prototype._cancelPromises = function() {
                    this._length() > 0 && this._settlePromises();
                };
                Promise.prototype._unsetOnCancel = function() {
                    this._onCancelField = void 0;
                };
                Promise.prototype._isCancellable = function() {
                    return this.isPending() && !this._isCancelled();
                };
                Promise.prototype.isCancellable = function() {
                    return this.isPending() && !this.isCancelled();
                };
                Promise.prototype._doInvokeOnCancel = function(onCancelCallback, internalOnly) {
                    if (util.isArray(onCancelCallback)) for (var i = 0; i < onCancelCallback.length; ++i) this._doInvokeOnCancel(onCancelCallback[i], internalOnly); else if (void 0 !== onCancelCallback) if ("function" == typeof onCancelCallback) {
                        if (!internalOnly) {
                            var e = tryCatch(onCancelCallback).call(this._boundValue());
                            if (e === errorObj) {
                                this._attachExtraTrace(e.e);
                                async.throwLater(e.e);
                            }
                        }
                    } else onCancelCallback._resultCancelled(this);
                };
                Promise.prototype._invokeOnCancel = function() {
                    var onCancelCallback = this._onCancel();
                    this._unsetOnCancel();
                    async.invoke(this._doInvokeOnCancel, this, onCancelCallback);
                };
                Promise.prototype._invokeInternalOnCancel = function() {
                    if (this._isCancellable()) {
                        this._doInvokeOnCancel(this._onCancel(), true);
                        this._unsetOnCancel();
                    }
                };
                Promise.prototype._resultCancelled = function() {
                    this.cancel();
                };
            };
        }, {
            "./util": 36
        } ],
        7: [ function(_dereq_, module) {
            module.exports = function(NEXT_FILTER) {
                function catchFilter(instances, cb, promise) {
                    return function(e) {
                        var boundTo = promise._boundValue();
                        predicateLoop: for (var i = 0; i < instances.length; ++i) {
                            var item = instances[i];
                            if (item === Error || null != item && item.prototype instanceof Error) {
                                if (e instanceof item) return tryCatch(cb).call(boundTo, e);
                            } else if ("function" == typeof item) {
                                var matchesPredicate = tryCatch(item).call(boundTo, e);
                                if (matchesPredicate === errorObj) return matchesPredicate;
                                if (matchesPredicate) return tryCatch(cb).call(boundTo, e);
                            } else if (util.isObject(e)) {
                                var keys = getKeys(item);
                                for (var j = 0; j < keys.length; ++j) {
                                    var key = keys[j];
                                    if (item[key] != e[key]) continue predicateLoop;
                                }
                                return tryCatch(cb).call(boundTo, e);
                            }
                        }
                        return NEXT_FILTER;
                    };
                }
                var util = _dereq_("./util");
                var getKeys = _dereq_("./es5").keys;
                var tryCatch = util.tryCatch;
                var errorObj = util.errorObj;
                return catchFilter;
            };
        }, {
            "./es5": 13,
            "./util": 36
        } ],
        8: [ function(_dereq_, module) {
            module.exports = function(Promise) {
                function Context() {
                    this._trace = new Context.CapturedTrace(peekContext());
                }
                function createContext() {
                    if (longStackTraces) return new Context();
                }
                function peekContext() {
                    var lastIndex = contextStack.length - 1;
                    if (lastIndex >= 0) return contextStack[lastIndex];
                    return void 0;
                }
                var longStackTraces = false;
                var contextStack = [];
                Promise.prototype._promiseCreated = function() {};
                Promise.prototype._pushContext = function() {};
                Promise.prototype._popContext = function() {
                    return null;
                };
                Promise._peekContext = Promise.prototype._peekContext = function() {};
                Context.prototype._pushContext = function() {
                    if (void 0 !== this._trace) {
                        this._trace._promiseCreated = null;
                        contextStack.push(this._trace);
                    }
                };
                Context.prototype._popContext = function() {
                    if (void 0 !== this._trace) {
                        var trace = contextStack.pop();
                        var ret = trace._promiseCreated;
                        trace._promiseCreated = null;
                        return ret;
                    }
                    return null;
                };
                Context.CapturedTrace = null;
                Context.create = createContext;
                Context.deactivateLongStackTraces = function() {};
                Context.activateLongStackTraces = function() {
                    var Promise_pushContext = Promise.prototype._pushContext;
                    var Promise_popContext = Promise.prototype._popContext;
                    var Promise_PeekContext = Promise._peekContext;
                    var Promise_peekContext = Promise.prototype._peekContext;
                    var Promise_promiseCreated = Promise.prototype._promiseCreated;
                    Context.deactivateLongStackTraces = function() {
                        Promise.prototype._pushContext = Promise_pushContext;
                        Promise.prototype._popContext = Promise_popContext;
                        Promise._peekContext = Promise_PeekContext;
                        Promise.prototype._peekContext = Promise_peekContext;
                        Promise.prototype._promiseCreated = Promise_promiseCreated;
                        longStackTraces = false;
                    };
                    longStackTraces = true;
                    Promise.prototype._pushContext = Context.prototype._pushContext;
                    Promise.prototype._popContext = Context.prototype._popContext;
                    Promise._peekContext = Promise.prototype._peekContext = peekContext;
                    Promise.prototype._promiseCreated = function() {
                        var ctx = this._peekContext();
                        ctx && null == ctx._promiseCreated && (ctx._promiseCreated = this);
                    };
                };
                return Context;
            };
        }, {} ],
        9: [ function(_dereq_, module) {
            module.exports = function(Promise, Context) {
                function generatePromiseLifecycleEventObject(name, promise) {
                    return {
                        promise: promise
                    };
                }
                function defaultFireEvent() {
                    return false;
                }
                function cancellationExecute(executor, resolve, reject) {
                    var promise = this;
                    try {
                        executor(resolve, reject, function(onCancel) {
                            if ("function" != typeof onCancel) throw new TypeError("onCancel must be a function, got: " + util.toString(onCancel));
                            promise._attachCancellationCallback(onCancel);
                        });
                    } catch (e) {
                        return e;
                    }
                }
                function cancellationAttachCancellationCallback(onCancel) {
                    if (!this._isCancellable()) return this;
                    var previousOnCancel = this._onCancel();
                    void 0 !== previousOnCancel ? util.isArray(previousOnCancel) ? previousOnCancel.push(onCancel) : this._setOnCancel([ previousOnCancel, onCancel ]) : this._setOnCancel(onCancel);
                }
                function cancellationOnCancel() {
                    return this._onCancelField;
                }
                function cancellationSetOnCancel(onCancel) {
                    this._onCancelField = onCancel;
                }
                function cancellationClearCancellationData() {
                    this._cancellationParent = void 0;
                    this._onCancelField = void 0;
                }
                function cancellationPropagateFrom(parent, flags) {
                    if (0 !== (1 & flags)) {
                        this._cancellationParent = parent;
                        var branchesRemainingToCancel = parent._branchesRemainingToCancel;
                        void 0 === branchesRemainingToCancel && (branchesRemainingToCancel = 0);
                        parent._branchesRemainingToCancel = branchesRemainingToCancel + 1;
                    }
                    0 !== (2 & flags) && parent._isBound() && this._setBoundTo(parent._boundTo);
                }
                function bindingPropagateFrom(parent, flags) {
                    0 !== (2 & flags) && parent._isBound() && this._setBoundTo(parent._boundTo);
                }
                function _boundValueFunction() {
                    var ret = this._boundTo;
                    if (void 0 !== ret && ret instanceof Promise) return ret.isFulfilled() ? ret.value() : void 0;
                    return ret;
                }
                function longStackTracesCaptureStackTrace() {
                    this._trace = new CapturedTrace(this._peekContext());
                }
                function longStackTracesAttachExtraTrace(error, ignoreSelf) {
                    if (canAttachTrace(error)) {
                        var trace = this._trace;
                        void 0 !== trace && ignoreSelf && (trace = trace._parent);
                        if (void 0 !== trace) trace.attachExtraTrace(error); else if (!error.__stackCleaned__) {
                            var parsed = parseStackAndMessage(error);
                            util.notEnumerableProp(error, "stack", parsed.message + "\n" + parsed.stack.join("\n"));
                            util.notEnumerableProp(error, "__stackCleaned__", true);
                        }
                    }
                }
                function checkForgottenReturns(returnValue, promiseCreated, name, promise, parent) {
                    if (void 0 === returnValue && null !== promiseCreated && wForgottenReturn) {
                        if (void 0 !== parent && parent._returnedNonUndefined()) return;
                        if (0 === (65535 & promise._bitField)) return;
                        name && (name += " ");
                        var handlerLine = "";
                        var creatorLine = "";
                        if (promiseCreated._trace) {
                            var traceLines = promiseCreated._trace.stack.split("\n");
                            var stack = cleanStack(traceLines);
                            for (var i = stack.length - 1; i >= 0; --i) {
                                var line = stack[i];
                                if (!nodeFramePattern.test(line)) {
                                    var lineMatches = line.match(parseLinePattern);
                                    lineMatches && (handlerLine = "at " + lineMatches[1] + ":" + lineMatches[2] + ":" + lineMatches[3] + " ");
                                    break;
                                }
                            }
                            if (stack.length > 0) {
                                var firstUserLine = stack[0];
                                for (var i = 0; i < traceLines.length; ++i) if (traceLines[i] === firstUserLine) {
                                    i > 0 && (creatorLine = "\n" + traceLines[i - 1]);
                                    break;
                                }
                            }
                        }
                        var msg = "a promise was created in a " + name + "handler " + handlerLine + "but was not returned from it, see http://goo.gl/rRqMUw" + creatorLine;
                        promise._warn(msg, true, promiseCreated);
                    }
                }
                function deprecated(name, replacement) {
                    var message = name + " is deprecated and will be removed in a future version.";
                    replacement && (message += " Use " + replacement + " instead.");
                    return warn(message);
                }
                function warn(message, shouldUseOwnTrace, promise) {
                    if (!config.warnings) return;
                    var warning = new Warning(message);
                    var ctx;
                    if (shouldUseOwnTrace) promise._attachExtraTrace(warning); else if (config.longStackTraces && (ctx = Promise._peekContext())) ctx.attachExtraTrace(warning); else {
                        var parsed = parseStackAndMessage(warning);
                        warning.stack = parsed.message + "\n" + parsed.stack.join("\n");
                    }
                    activeFireEvent("warning", warning) || formatAndLogError(warning, "", true);
                }
                function reconstructStack(message, stacks) {
                    for (var i = 0; i < stacks.length - 1; ++i) {
                        stacks[i].push("From previous event:");
                        stacks[i] = stacks[i].join("\n");
                    }
                    i < stacks.length && (stacks[i] = stacks[i].join("\n"));
                    return message + "\n" + stacks.join("\n");
                }
                function removeDuplicateOrEmptyJumps(stacks) {
                    for (var i = 0; i < stacks.length; ++i) if (0 === stacks[i].length || i + 1 < stacks.length && stacks[i][0] === stacks[i + 1][0]) {
                        stacks.splice(i, 1);
                        i--;
                    }
                }
                function removeCommonRoots(stacks) {
                    var current = stacks[0];
                    for (var i = 1; i < stacks.length; ++i) {
                        var prev = stacks[i];
                        var currentLastIndex = current.length - 1;
                        var currentLastLine = current[currentLastIndex];
                        var commonRootMeetPoint = -1;
                        for (var j = prev.length - 1; j >= 0; --j) if (prev[j] === currentLastLine) {
                            commonRootMeetPoint = j;
                            break;
                        }
                        for (var j = commonRootMeetPoint; j >= 0; --j) {
                            var line = prev[j];
                            if (current[currentLastIndex] !== line) break;
                            current.pop();
                            currentLastIndex--;
                        }
                        current = prev;
                    }
                }
                function cleanStack(stack) {
                    var ret = [];
                    for (var i = 0; i < stack.length; ++i) {
                        var line = stack[i];
                        var isTraceLine = "    (No stack trace)" === line || stackFramePattern.test(line);
                        var isInternalFrame = isTraceLine && shouldIgnore(line);
                        if (isTraceLine && !isInternalFrame) {
                            indentStackFrames && " " !== line.charAt(0) && (line = "    " + line);
                            ret.push(line);
                        }
                    }
                    return ret;
                }
                function stackFramesAsArray(error) {
                    var stack = error.stack.replace(/\s+$/g, "").split("\n");
                    for (var i = 0; i < stack.length; ++i) {
                        var line = stack[i];
                        if ("    (No stack trace)" === line || stackFramePattern.test(line)) break;
                    }
                    i > 0 && (stack = stack.slice(i));
                    return stack;
                }
                function parseStackAndMessage(error) {
                    var stack = error.stack;
                    var message = error.toString();
                    stack = "string" == typeof stack && stack.length > 0 ? stackFramesAsArray(error) : [ "    (No stack trace)" ];
                    return {
                        message: message,
                        stack: cleanStack(stack)
                    };
                }
                function formatAndLogError(error, title, isSoft) {
                    if ("undefined" != typeof console) {
                        var message;
                        if (util.isObject(error)) {
                            var stack = error.stack;
                            message = title + formatStack(stack, error);
                        } else message = title + String(error);
                        "function" == typeof printWarning ? printWarning(message, isSoft) : ("function" == typeof console.log || "object" === _typeof(console.log)) && console.log(message);
                    }
                }
                function fireRejectionEvent(name, localHandler, reason, promise) {
                    var localEventFired = false;
                    try {
                        if ("function" == typeof localHandler) {
                            localEventFired = true;
                            "rejectionHandled" === name ? localHandler(promise) : localHandler(reason, promise);
                        }
                    } catch (e) {
                        async.throwLater(e);
                    }
                    "unhandledRejection" === name ? activeFireEvent(name, reason, promise) || localEventFired || formatAndLogError(reason, "Unhandled rejection ") : activeFireEvent(name, promise);
                }
                function formatNonError(obj) {
                    var str;
                    if ("function" == typeof obj) str = "[function " + (obj.name || "anonymous") + "]"; else {
                        str = obj && "function" == typeof obj.toString ? obj.toString() : util.toString(obj);
                        var ruselessToString = /\[object [a-zA-Z0-9$_]+\]/;
                        if (ruselessToString.test(str)) try {
                            var newStr = JSON.stringify(obj);
                            str = newStr;
                        } catch (e) {}
                        0 === str.length && (str = "(empty array)");
                    }
                    return "(<" + snip(str) + ">, no stack trace)";
                }
                function snip(str) {
                    var maxChars = 41;
                    if (str.length < maxChars) return str;
                    return str.substr(0, maxChars - 3) + "...";
                }
                function longStackTracesIsSupported() {
                    return "function" == typeof captureStackTrace;
                }
                function parseLineInfo(line) {
                    var matches = line.match(parseLineInfoRegex);
                    if (matches) return {
                        fileName: matches[1],
                        line: parseInt(matches[2], 10)
                    };
                }
                function setBounds(firstLineError, lastLineError) {
                    if (!longStackTracesIsSupported()) return;
                    var firstStackLines = firstLineError.stack.split("\n");
                    var lastStackLines = lastLineError.stack.split("\n");
                    var firstIndex = -1;
                    var lastIndex = -1;
                    var firstFileName;
                    var lastFileName;
                    for (var i = 0; i < firstStackLines.length; ++i) {
                        var result = parseLineInfo(firstStackLines[i]);
                        if (result) {
                            firstFileName = result.fileName;
                            firstIndex = result.line;
                            break;
                        }
                    }
                    for (var i = 0; i < lastStackLines.length; ++i) {
                        var result = parseLineInfo(lastStackLines[i]);
                        if (result) {
                            lastFileName = result.fileName;
                            lastIndex = result.line;
                            break;
                        }
                    }
                    if (0 > firstIndex || 0 > lastIndex || !firstFileName || !lastFileName || firstFileName !== lastFileName || firstIndex >= lastIndex) return;
                    shouldIgnore = function(line) {
                        if (bluebirdFramePattern.test(line)) return true;
                        var info = parseLineInfo(line);
                        if (info && info.fileName === firstFileName && firstIndex <= info.line && info.line <= lastIndex) return true;
                        return false;
                    };
                }
                function CapturedTrace(parent) {
                    this._parent = parent;
                    this._promisesCreated = 0;
                    var length = this._length = 1 + (void 0 === parent ? 0 : parent._length);
                    captureStackTrace(this, CapturedTrace);
                    length > 32 && this.uncycle();
                }
                var getDomain = Promise._getDomain;
                var async = Promise._async;
                var Warning = _dereq_("./errors").Warning;
                var util = _dereq_("./util");
                var canAttachTrace = util.canAttachTrace;
                var unhandledRejectionHandled;
                var possiblyUnhandledRejection;
                var bluebirdFramePattern = /[\\\/]bluebird[\\\/]js[\\\/](release|debug|instrumented)/;
                var nodeFramePattern = /\((?:timers\.js):\d+:\d+\)/;
                var parseLinePattern = /[\/<\(](.+?):(\d+):(\d+)\)?\s*$/;
                var stackFramePattern = null;
                var formatStack = null;
                var indentStackFrames = false;
                var printWarning;
                var debugging = !!(0 != util.env("BLUEBIRD_DEBUG") && true);
                var warnings = !!(0 != util.env("BLUEBIRD_WARNINGS") && (debugging || util.env("BLUEBIRD_WARNINGS")));
                var longStackTraces = !!(0 != util.env("BLUEBIRD_LONG_STACK_TRACES") && (debugging || util.env("BLUEBIRD_LONG_STACK_TRACES")));
                var wForgottenReturn = 0 != util.env("BLUEBIRD_W_FORGOTTEN_RETURN") && (warnings || !!util.env("BLUEBIRD_W_FORGOTTEN_RETURN"));
                Promise.prototype.suppressUnhandledRejections = function() {
                    var target = this._target();
                    target._bitField = -1048577 & target._bitField | 524288;
                };
                Promise.prototype._ensurePossibleRejectionHandled = function() {
                    if (0 !== (524288 & this._bitField)) return;
                    this._setRejectionIsUnhandled();
                    async.invokeLater(this._notifyUnhandledRejection, this, void 0);
                };
                Promise.prototype._notifyUnhandledRejectionIsHandled = function() {
                    fireRejectionEvent("rejectionHandled", unhandledRejectionHandled, void 0, this);
                };
                Promise.prototype._setReturnedNonUndefined = function() {
                    this._bitField = 268435456 | this._bitField;
                };
                Promise.prototype._returnedNonUndefined = function() {
                    return 0 !== (268435456 & this._bitField);
                };
                Promise.prototype._notifyUnhandledRejection = function() {
                    if (this._isRejectionUnhandled()) {
                        var reason = this._settledValue();
                        this._setUnhandledRejectionIsNotified();
                        fireRejectionEvent("unhandledRejection", possiblyUnhandledRejection, reason, this);
                    }
                };
                Promise.prototype._setUnhandledRejectionIsNotified = function() {
                    this._bitField = 262144 | this._bitField;
                };
                Promise.prototype._unsetUnhandledRejectionIsNotified = function() {
                    this._bitField = -262145 & this._bitField;
                };
                Promise.prototype._isUnhandledRejectionNotified = function() {
                    return (262144 & this._bitField) > 0;
                };
                Promise.prototype._setRejectionIsUnhandled = function() {
                    this._bitField = 1048576 | this._bitField;
                };
                Promise.prototype._unsetRejectionIsUnhandled = function() {
                    this._bitField = -1048577 & this._bitField;
                    if (this._isUnhandledRejectionNotified()) {
                        this._unsetUnhandledRejectionIsNotified();
                        this._notifyUnhandledRejectionIsHandled();
                    }
                };
                Promise.prototype._isRejectionUnhandled = function() {
                    return (1048576 & this._bitField) > 0;
                };
                Promise.prototype._warn = function(message, shouldUseOwnTrace, promise) {
                    return warn(message, shouldUseOwnTrace, promise || this);
                };
                Promise.onPossiblyUnhandledRejection = function(fn) {
                    var domain = getDomain();
                    possiblyUnhandledRejection = "function" == typeof fn ? null === domain ? fn : util.domainBind(domain, fn) : void 0;
                };
                Promise.onUnhandledRejectionHandled = function(fn) {
                    var domain = getDomain();
                    unhandledRejectionHandled = "function" == typeof fn ? null === domain ? fn : util.domainBind(domain, fn) : void 0;
                };
                var disableLongStackTraces = function() {};
                Promise.longStackTraces = function() {
                    if (async.haveItemsQueued() && !config.longStackTraces) throw new Error("cannot enable long stack traces after promises have been created\n\n    See http://goo.gl/MqrFmX\n");
                    if (!config.longStackTraces && longStackTracesIsSupported()) {
                        var Promise_captureStackTrace = Promise.prototype._captureStackTrace;
                        var Promise_attachExtraTrace = Promise.prototype._attachExtraTrace;
                        config.longStackTraces = true;
                        disableLongStackTraces = function() {
                            if (async.haveItemsQueued() && !config.longStackTraces) throw new Error("cannot enable long stack traces after promises have been created\n\n    See http://goo.gl/MqrFmX\n");
                            Promise.prototype._captureStackTrace = Promise_captureStackTrace;
                            Promise.prototype._attachExtraTrace = Promise_attachExtraTrace;
                            Context.deactivateLongStackTraces();
                            async.enableTrampoline();
                            config.longStackTraces = false;
                        };
                        Promise.prototype._captureStackTrace = longStackTracesCaptureStackTrace;
                        Promise.prototype._attachExtraTrace = longStackTracesAttachExtraTrace;
                        Context.activateLongStackTraces();
                        async.disableTrampolineIfNecessary();
                    }
                };
                Promise.hasLongStackTraces = function() {
                    return config.longStackTraces && longStackTracesIsSupported();
                };
                var fireDomEvent = function() {
                    try {
                        if ("function" == typeof CustomEvent) {
                            var event = new CustomEvent("CustomEvent");
                            util.global.dispatchEvent(event);
                            return function(name, event) {
                                var domEvent = new CustomEvent(name.toLowerCase(), {
                                    detail: event,
                                    cancelable: true
                                });
                                return !util.global.dispatchEvent(domEvent);
                            };
                        }
                        if ("function" == typeof Event) {
                            var event = new Event("CustomEvent");
                            util.global.dispatchEvent(event);
                            return function(name, event) {
                                var domEvent = new Event(name.toLowerCase(), {
                                    cancelable: true
                                });
                                domEvent.detail = event;
                                return !util.global.dispatchEvent(domEvent);
                            };
                        }
                        var event = document.createEvent("CustomEvent");
                        event.initCustomEvent("testingtheevent", false, true, {});
                        util.global.dispatchEvent(event);
                        return function(name, event) {
                            var domEvent = document.createEvent("CustomEvent");
                            domEvent.initCustomEvent(name.toLowerCase(), false, true, event);
                            return !util.global.dispatchEvent(domEvent);
                        };
                    } catch (e) {}
                    return function() {
                        return false;
                    };
                }();
                var fireGlobalEvent = function() {
                    if (util.isNode) return function() {
                        return process.emit.apply(process, arguments);
                    };
                    if (!util.global) return function() {
                        return false;
                    };
                    return function(name) {
                        var methodName = "on" + name.toLowerCase();
                        var method = util.global[methodName];
                        if (!method) return false;
                        method.apply(util.global, [].slice.call(arguments, 1));
                        return true;
                    };
                }();
                var eventToObjectGenerator = {
                    promiseCreated: generatePromiseLifecycleEventObject,
                    promiseFulfilled: generatePromiseLifecycleEventObject,
                    promiseRejected: generatePromiseLifecycleEventObject,
                    promiseResolved: generatePromiseLifecycleEventObject,
                    promiseCancelled: generatePromiseLifecycleEventObject,
                    promiseChained: function(name, promise, child) {
                        return {
                            promise: promise,
                            child: child
                        };
                    },
                    warning: function(name, _warning) {
                        return {
                            warning: _warning
                        };
                    },
                    unhandledRejection: function(name, reason, promise) {
                        return {
                            reason: reason,
                            promise: promise
                        };
                    },
                    rejectionHandled: generatePromiseLifecycleEventObject
                };
                var activeFireEvent = function(name) {
                    var globalEventFired = false;
                    try {
                        globalEventFired = fireGlobalEvent.apply(null, arguments);
                    } catch (e) {
                        async.throwLater(e);
                        globalEventFired = true;
                    }
                    var domEventFired = false;
                    try {
                        domEventFired = fireDomEvent(name, eventToObjectGenerator[name].apply(null, arguments));
                    } catch (e) {
                        async.throwLater(e);
                        domEventFired = true;
                    }
                    return domEventFired || globalEventFired;
                };
                Promise.config = function(opts) {
                    opts = Object(opts);
                    "longStackTraces" in opts && (opts.longStackTraces ? Promise.longStackTraces() : !opts.longStackTraces && Promise.hasLongStackTraces() && disableLongStackTraces());
                    if ("warnings" in opts) {
                        var warningsOption = opts.warnings;
                        config.warnings = !!warningsOption;
                        wForgottenReturn = config.warnings;
                        util.isObject(warningsOption) && "wForgottenReturn" in warningsOption && (wForgottenReturn = !!warningsOption.wForgottenReturn);
                    }
                    if ("cancellation" in opts && opts.cancellation && !config.cancellation) {
                        if (async.haveItemsQueued()) throw new Error("cannot enable cancellation after promises are in use");
                        Promise.prototype._clearCancellationData = cancellationClearCancellationData;
                        Promise.prototype._propagateFrom = cancellationPropagateFrom;
                        Promise.prototype._onCancel = cancellationOnCancel;
                        Promise.prototype._setOnCancel = cancellationSetOnCancel;
                        Promise.prototype._attachCancellationCallback = cancellationAttachCancellationCallback;
                        Promise.prototype._execute = cancellationExecute;
                        _propagateFromFunction = cancellationPropagateFrom;
                        config.cancellation = true;
                    }
                    if ("monitoring" in opts) if (opts.monitoring && !config.monitoring) {
                        config.monitoring = true;
                        Promise.prototype._fireEvent = activeFireEvent;
                    } else if (!opts.monitoring && config.monitoring) {
                        config.monitoring = false;
                        Promise.prototype._fireEvent = defaultFireEvent;
                    }
                };
                Promise.prototype._fireEvent = defaultFireEvent;
                Promise.prototype._execute = function(executor, resolve, reject) {
                    try {
                        executor(resolve, reject);
                    } catch (e) {
                        return e;
                    }
                };
                Promise.prototype._onCancel = function() {};
                Promise.prototype._setOnCancel = function() {};
                Promise.prototype._attachCancellationCallback = function() {};
                Promise.prototype._captureStackTrace = function() {};
                Promise.prototype._attachExtraTrace = function() {};
                Promise.prototype._clearCancellationData = function() {};
                Promise.prototype._propagateFrom = function() {};
                var _propagateFromFunction = bindingPropagateFrom;
                var shouldIgnore = function() {
                    return false;
                };
                var parseLineInfoRegex = /[\/<\(]([^:\/]+):(\d+):(?:\d+)\)?\s*$/;
                util.inherits(CapturedTrace, Error);
                Context.CapturedTrace = CapturedTrace;
                CapturedTrace.prototype.uncycle = function() {
                    var length = this._length;
                    if (2 > length) return;
                    var nodes = [];
                    var stackToIndex = {};
                    for (var i = 0, node = this; void 0 !== node; ++i) {
                        nodes.push(node);
                        node = node._parent;
                    }
                    length = this._length = i;
                    for (var i = length - 1; i >= 0; --i) {
                        var stack = nodes[i].stack;
                        void 0 === stackToIndex[stack] && (stackToIndex[stack] = i);
                    }
                    for (var i = 0; length > i; ++i) {
                        var currentStack = nodes[i].stack;
                        var index = stackToIndex[currentStack];
                        if (void 0 !== index && index !== i) {
                            if (index > 0) {
                                nodes[index - 1]._parent = void 0;
                                nodes[index - 1]._length = 1;
                            }
                            nodes[i]._parent = void 0;
                            nodes[i]._length = 1;
                            var cycleEdgeNode = i > 0 ? nodes[i - 1] : this;
                            if (length - 1 > index) {
                                cycleEdgeNode._parent = nodes[index + 1];
                                cycleEdgeNode._parent.uncycle();
                                cycleEdgeNode._length = cycleEdgeNode._parent._length + 1;
                            } else {
                                cycleEdgeNode._parent = void 0;
                                cycleEdgeNode._length = 1;
                            }
                            var currentChildLength = cycleEdgeNode._length + 1;
                            for (var j = i - 2; j >= 0; --j) {
                                nodes[j]._length = currentChildLength;
                                currentChildLength++;
                            }
                            return;
                        }
                    }
                };
                CapturedTrace.prototype.attachExtraTrace = function(error) {
                    if (error.__stackCleaned__) return;
                    this.uncycle();
                    var parsed = parseStackAndMessage(error);
                    var message = parsed.message;
                    var stacks = [ parsed.stack ];
                    var trace = this;
                    while (void 0 !== trace) {
                        stacks.push(cleanStack(trace.stack.split("\n")));
                        trace = trace._parent;
                    }
                    removeCommonRoots(stacks);
                    removeDuplicateOrEmptyJumps(stacks);
                    util.notEnumerableProp(error, "stack", reconstructStack(message, stacks));
                    util.notEnumerableProp(error, "__stackCleaned__", true);
                };
                var captureStackTrace = function() {
                    var v8stackFramePattern = /^\s*at\s*/;
                    var v8stackFormatter = function(stack, error) {
                        if ("string" == typeof stack) return stack;
                        if (void 0 !== error.name && void 0 !== error.message) return error.toString();
                        return formatNonError(error);
                    };
                    if ("number" == typeof Error.stackTraceLimit && "function" == typeof Error.captureStackTrace) {
                        Error.stackTraceLimit += 6;
                        stackFramePattern = v8stackFramePattern;
                        formatStack = v8stackFormatter;
                        var captureStackTrace = Error.captureStackTrace;
                        shouldIgnore = function(line) {
                            return bluebirdFramePattern.test(line);
                        };
                        return function(receiver, ignoreUntil) {
                            Error.stackTraceLimit += 6;
                            captureStackTrace(receiver, ignoreUntil);
                            Error.stackTraceLimit -= 6;
                        };
                    }
                    var err = new Error();
                    if ("string" == typeof err.stack && err.stack.split("\n")[0].indexOf("stackDetection@") >= 0) {
                        stackFramePattern = /@/;
                        formatStack = v8stackFormatter;
                        indentStackFrames = true;
                        return function(o) {
                            o.stack = new Error().stack;
                        };
                    }
                    var hasStackAfterThrow;
                    try {
                        throw new Error();
                    } catch (e) {
                        hasStackAfterThrow = "stack" in e;
                    }
                    if (!("stack" in err) && hasStackAfterThrow && "number" == typeof Error.stackTraceLimit) {
                        stackFramePattern = v8stackFramePattern;
                        formatStack = v8stackFormatter;
                        return function(o) {
                            Error.stackTraceLimit += 6;
                            try {
                                throw new Error();
                            } catch (e) {
                                o.stack = e.stack;
                            }
                            Error.stackTraceLimit -= 6;
                        };
                    }
                    formatStack = function(stack, error) {
                        if ("string" == typeof stack) return stack;
                        if (("object" === ("undefined" == typeof error ? "undefined" : _typeof(error)) || "function" == typeof error) && void 0 !== error.name && void 0 !== error.message) return error.toString();
                        return formatNonError(error);
                    };
                    return null;
                }([]);
                if ("undefined" != typeof console && "undefined" != typeof console.warn) {
                    printWarning = function(message) {
                        console.warn(message);
                    };
                    util.isNode && process.stderr.isTTY ? printWarning = function(message, isSoft) {
                        var color = isSoft ? "[33m" : "[31m";
                        console.warn(color + message + "[0m\n");
                    } : util.isNode || "string" != typeof new Error().stack || (printWarning = function(message, isSoft) {
                        console.warn("%c" + message, isSoft ? "color: darkorange" : "color: red");
                    });
                }
                var config = {
                    warnings: warnings,
                    longStackTraces: false,
                    cancellation: false,
                    monitoring: false
                };
                longStackTraces && Promise.longStackTraces();
                return {
                    longStackTraces: function() {
                        return config.longStackTraces;
                    },
                    warnings: function() {
                        return config.warnings;
                    },
                    cancellation: function() {
                        return config.cancellation;
                    },
                    monitoring: function() {
                        return config.monitoring;
                    },
                    propagateFromFunction: function() {
                        return _propagateFromFunction;
                    },
                    boundValueFunction: function() {
                        return _boundValueFunction;
                    },
                    checkForgottenReturns: checkForgottenReturns,
                    setBounds: setBounds,
                    warn: warn,
                    deprecated: deprecated,
                    CapturedTrace: CapturedTrace,
                    fireDomEvent: fireDomEvent,
                    fireGlobalEvent: fireGlobalEvent
                };
            };
        }, {
            "./errors": 12,
            "./util": 36
        } ],
        10: [ function(_dereq_, module) {
            module.exports = function(Promise) {
                function returner() {
                    return this.value;
                }
                function thrower() {
                    throw this.reason;
                }
                Promise.prototype["return"] = Promise.prototype.thenReturn = function(value) {
                    value instanceof Promise && value.suppressUnhandledRejections();
                    return this._then(returner, void 0, void 0, {
                        value: value
                    }, void 0);
                };
                Promise.prototype["throw"] = Promise.prototype.thenThrow = function(reason) {
                    return this._then(thrower, void 0, void 0, {
                        reason: reason
                    }, void 0);
                };
                Promise.prototype.catchThrow = function(reason) {
                    if (arguments.length <= 1) return this._then(void 0, thrower, void 0, {
                        reason: reason
                    }, void 0);
                    var _reason = arguments[1];
                    var handler = function() {
                        throw _reason;
                    };
                    return this.caught(reason, handler);
                };
                Promise.prototype.catchReturn = function(value) {
                    if (arguments.length <= 1) {
                        value instanceof Promise && value.suppressUnhandledRejections();
                        return this._then(void 0, returner, void 0, {
                            value: value
                        }, void 0);
                    }
                    var _value = arguments[1];
                    _value instanceof Promise && _value.suppressUnhandledRejections();
                    var handler = function() {
                        return _value;
                    };
                    return this.caught(value, handler);
                };
            };
        }, {} ],
        11: [ function(_dereq_, module) {
            module.exports = function(Promise, INTERNAL) {
                function promiseAllThis() {
                    return PromiseAll(this);
                }
                function PromiseMapSeries(promises, fn) {
                    return PromiseReduce(promises, fn, INTERNAL, INTERNAL);
                }
                var PromiseReduce = Promise.reduce;
                var PromiseAll = Promise.all;
                Promise.prototype.each = function(fn) {
                    return PromiseReduce(this, fn, INTERNAL, 0)._then(promiseAllThis, void 0, void 0, this, void 0);
                };
                Promise.prototype.mapSeries = function(fn) {
                    return PromiseReduce(this, fn, INTERNAL, INTERNAL);
                };
                Promise.each = function(promises, fn) {
                    return PromiseReduce(promises, fn, INTERNAL, 0)._then(promiseAllThis, void 0, void 0, promises, void 0);
                };
                Promise.mapSeries = PromiseMapSeries;
            };
        }, {} ],
        12: [ function(_dereq_, module) {
            function subError(nameProperty, defaultMessage) {
                function SubError(message) {
                    if (!(this instanceof SubError)) return new SubError(message);
                    notEnumerableProp(this, "message", "string" == typeof message ? message : defaultMessage);
                    notEnumerableProp(this, "name", nameProperty);
                    Error.captureStackTrace ? Error.captureStackTrace(this, this.constructor) : Error.call(this);
                }
                inherits(SubError, Error);
                return SubError;
            }
            function OperationalError(message) {
                if (!(this instanceof OperationalError)) return new OperationalError(message);
                notEnumerableProp(this, "name", "OperationalError");
                notEnumerableProp(this, "message", message);
                this.cause = message;
                this["isOperational"] = true;
                if (message instanceof Error) {
                    notEnumerableProp(this, "message", message.message);
                    notEnumerableProp(this, "stack", message.stack);
                } else Error.captureStackTrace && Error.captureStackTrace(this, this.constructor);
            }
            var es5 = _dereq_("./es5");
            var Objectfreeze = es5.freeze;
            var util = _dereq_("./util");
            var inherits = util.inherits;
            var notEnumerableProp = util.notEnumerableProp;
            var _TypeError, _RangeError;
            var Warning = subError("Warning", "warning");
            var CancellationError = subError("CancellationError", "cancellation error");
            var TimeoutError = subError("TimeoutError", "timeout error");
            var AggregateError = subError("AggregateError", "aggregate error");
            try {
                _TypeError = TypeError;
                _RangeError = RangeError;
            } catch (e) {
                _TypeError = subError("TypeError", "type error");
                _RangeError = subError("RangeError", "range error");
            }
            var methods = "join pop push shift unshift slice filter forEach some every map indexOf lastIndexOf reduce reduceRight sort reverse".split(" ");
            for (var i = 0; i < methods.length; ++i) "function" == typeof Array.prototype[methods[i]] && (AggregateError.prototype[methods[i]] = Array.prototype[methods[i]]);
            es5.defineProperty(AggregateError.prototype, "length", {
                value: 0,
                configurable: false,
                writable: true,
                enumerable: true
            });
            AggregateError.prototype["isOperational"] = true;
            var level = 0;
            AggregateError.prototype.toString = function() {
                var indent = Array(4 * level + 1).join(" ");
                var ret = "\n" + indent + "AggregateError of:\n";
                level++;
                indent = Array(4 * level + 1).join(" ");
                for (var i = 0; i < this.length; ++i) {
                    var str = this[i] === this ? "[Circular AggregateError]" : this[i] + "";
                    var lines = str.split("\n");
                    for (var j = 0; j < lines.length; ++j) lines[j] = indent + lines[j];
                    str = lines.join("\n");
                    ret += str + "\n";
                }
                level--;
                return ret;
            };
            inherits(OperationalError, Error);
            var errorTypes = Error["__BluebirdErrorTypes__"];
            if (!errorTypes) {
                errorTypes = Objectfreeze({
                    CancellationError: CancellationError,
                    TimeoutError: TimeoutError,
                    OperationalError: OperationalError,
                    RejectionError: OperationalError,
                    AggregateError: AggregateError
                });
                es5.defineProperty(Error, "__BluebirdErrorTypes__", {
                    value: errorTypes,
                    writable: false,
                    enumerable: false,
                    configurable: false
                });
            }
            module.exports = {
                Error: Error,
                TypeError: _TypeError,
                RangeError: _RangeError,
                CancellationError: errorTypes.CancellationError,
                OperationalError: errorTypes.OperationalError,
                TimeoutError: errorTypes.TimeoutError,
                AggregateError: errorTypes.AggregateError,
                Warning: Warning
            };
        }, {
            "./es5": 13,
            "./util": 36
        } ],
        13: [ function(_dereq_, module) {
            var isES5 = function() {
                return void 0 === this;
            }();
            if (isES5) module.exports = {
                freeze: Object.freeze,
                defineProperty: Object.defineProperty,
                getDescriptor: Object.getOwnPropertyDescriptor,
                keys: Object.keys,
                names: Object.getOwnPropertyNames,
                getPrototypeOf: Object.getPrototypeOf,
                isArray: Array.isArray,
                isES5: isES5,
                propertyIsWritable: function(obj, prop) {
                    var descriptor = Object.getOwnPropertyDescriptor(obj, prop);
                    return !!(!descriptor || descriptor.writable || descriptor.set);
                }
            }; else {
                var has = {}.hasOwnProperty;
                var str = {}.toString;
                var proto = {}.constructor.prototype;
                var ObjectKeys = function(o) {
                    var ret = [];
                    for (var key in o) has.call(o, key) && ret.push(key);
                    return ret;
                };
                var ObjectGetDescriptor = function(o, key) {
                    return {
                        value: o[key]
                    };
                };
                var ObjectDefineProperty = function(o, key, desc) {
                    o[key] = desc.value;
                    return o;
                };
                var ObjectFreeze = function(obj) {
                    return obj;
                };
                var ObjectGetPrototypeOf = function(obj) {
                    try {
                        return Object(obj).constructor.prototype;
                    } catch (e) {
                        return proto;
                    }
                };
                var ArrayIsArray = function(obj) {
                    try {
                        return "[object Array]" === str.call(obj);
                    } catch (e) {
                        return false;
                    }
                };
                module.exports = {
                    isArray: ArrayIsArray,
                    keys: ObjectKeys,
                    names: ObjectKeys,
                    defineProperty: ObjectDefineProperty,
                    getDescriptor: ObjectGetDescriptor,
                    freeze: ObjectFreeze,
                    getPrototypeOf: ObjectGetPrototypeOf,
                    isES5: isES5,
                    propertyIsWritable: function() {
                        return true;
                    }
                };
            }
        }, {} ],
        14: [ function(_dereq_, module) {
            module.exports = function(Promise, INTERNAL) {
                var PromiseMap = Promise.map;
                Promise.prototype.filter = function(fn, options) {
                    return PromiseMap(this, fn, options, INTERNAL);
                };
                Promise.filter = function(promises, fn, options) {
                    return PromiseMap(promises, fn, options, INTERNAL);
                };
            };
        }, {} ],
        15: [ function(_dereq_, module) {
            module.exports = function(Promise, tryConvertToPromise) {
                function PassThroughHandlerContext(promise, type, handler) {
                    this.promise = promise;
                    this.type = type;
                    this.handler = handler;
                    this.called = false;
                    this.cancelPromise = null;
                }
                function FinallyHandlerCancelReaction(finallyHandler) {
                    this.finallyHandler = finallyHandler;
                }
                function checkCancel(ctx, reason) {
                    if (null != ctx.cancelPromise) {
                        arguments.length > 1 ? ctx.cancelPromise._reject(reason) : ctx.cancelPromise._cancel();
                        ctx.cancelPromise = null;
                        return true;
                    }
                    return false;
                }
                function succeed() {
                    return finallyHandler.call(this, this.promise._target()._settledValue());
                }
                function fail(reason) {
                    if (checkCancel(this, reason)) return;
                    errorObj.e = reason;
                    return errorObj;
                }
                function finallyHandler(reasonOrValue) {
                    var promise = this.promise;
                    var handler = this.handler;
                    if (!this.called) {
                        this.called = true;
                        var ret = this.isFinallyHandler() ? handler.call(promise._boundValue()) : handler.call(promise._boundValue(), reasonOrValue);
                        if (void 0 !== ret) {
                            promise._setReturnedNonUndefined();
                            var maybePromise = tryConvertToPromise(ret, promise);
                            if (maybePromise instanceof Promise) {
                                if (null != this.cancelPromise) {
                                    if (maybePromise._isCancelled()) {
                                        var reason = new CancellationError("late cancellation observer");
                                        promise._attachExtraTrace(reason);
                                        errorObj.e = reason;
                                        return errorObj;
                                    }
                                    maybePromise.isPending() && maybePromise._attachCancellationCallback(new FinallyHandlerCancelReaction(this));
                                }
                                return maybePromise._then(succeed, fail, void 0, this, void 0);
                            }
                        }
                    }
                    if (promise.isRejected()) {
                        checkCancel(this);
                        errorObj.e = reasonOrValue;
                        return errorObj;
                    }
                    checkCancel(this);
                    return reasonOrValue;
                }
                var util = _dereq_("./util");
                var CancellationError = Promise.CancellationError;
                var errorObj = util.errorObj;
                PassThroughHandlerContext.prototype.isFinallyHandler = function() {
                    return 0 === this.type;
                };
                FinallyHandlerCancelReaction.prototype._resultCancelled = function() {
                    checkCancel(this.finallyHandler);
                };
                Promise.prototype._passThrough = function(handler, type, success, fail) {
                    if ("function" != typeof handler) return this.then();
                    return this._then(success, fail, void 0, new PassThroughHandlerContext(this, type, handler), void 0);
                };
                Promise.prototype.lastly = Promise.prototype["finally"] = function(handler) {
                    return this._passThrough(handler, 0, finallyHandler, finallyHandler);
                };
                Promise.prototype.tap = function(handler) {
                    return this._passThrough(handler, 1, finallyHandler);
                };
                return PassThroughHandlerContext;
            };
        }, {
            "./util": 36
        } ],
        16: [ function(_dereq_, module) {
            module.exports = function(Promise, apiRejection, INTERNAL, tryConvertToPromise, Proxyable, debug) {
                function promiseFromYieldHandler(value, yieldHandlers, traceParent) {
                    for (var i = 0; i < yieldHandlers.length; ++i) {
                        traceParent._pushContext();
                        var result = tryCatch(yieldHandlers[i])(value);
                        traceParent._popContext();
                        if (result === errorObj) {
                            traceParent._pushContext();
                            var ret = Promise.reject(errorObj.e);
                            traceParent._popContext();
                            return ret;
                        }
                        var maybePromise = tryConvertToPromise(result, traceParent);
                        if (maybePromise instanceof Promise) return maybePromise;
                    }
                    return null;
                }
                function PromiseSpawn(generatorFunction, receiver, yieldHandler, stack) {
                    if (debug.cancellation()) {
                        var internal = new Promise(INTERNAL);
                        var _finallyPromise = this._finallyPromise = new Promise(INTERNAL);
                        this._promise = internal.lastly(function() {
                            return _finallyPromise;
                        });
                        internal._captureStackTrace();
                        internal._setOnCancel(this);
                    } else {
                        var promise = this._promise = new Promise(INTERNAL);
                        promise._captureStackTrace();
                    }
                    this._stack = stack;
                    this._generatorFunction = generatorFunction;
                    this._receiver = receiver;
                    this._generator = void 0;
                    this._yieldHandlers = "function" == typeof yieldHandler ? [ yieldHandler ].concat(yieldHandlers) : yieldHandlers;
                    this._yieldedPromise = null;
                    this._cancellationPhase = false;
                }
                var errors = _dereq_("./errors");
                var TypeError = errors.TypeError;
                var util = _dereq_("./util");
                var errorObj = util.errorObj;
                var tryCatch = util.tryCatch;
                var yieldHandlers = [];
                util.inherits(PromiseSpawn, Proxyable);
                PromiseSpawn.prototype._isResolved = function() {
                    return null === this._promise;
                };
                PromiseSpawn.prototype._cleanup = function() {
                    this._promise = this._generator = null;
                    if (debug.cancellation() && null !== this._finallyPromise) {
                        this._finallyPromise._fulfill();
                        this._finallyPromise = null;
                    }
                };
                PromiseSpawn.prototype._promiseCancelled = function() {
                    if (this._isResolved()) return;
                    var implementsReturn = "undefined" != typeof this._generator["return"];
                    var result;
                    if (implementsReturn) {
                        this._promise._pushContext();
                        result = tryCatch(this._generator["return"]).call(this._generator, void 0);
                        this._promise._popContext();
                    } else {
                        var reason = new Promise.CancellationError("generator .return() sentinel");
                        Promise.coroutine.returnSentinel = reason;
                        this._promise._attachExtraTrace(reason);
                        this._promise._pushContext();
                        result = tryCatch(this._generator["throw"]).call(this._generator, reason);
                        this._promise._popContext();
                    }
                    this._cancellationPhase = true;
                    this._yieldedPromise = null;
                    this._continue(result);
                };
                PromiseSpawn.prototype._promiseFulfilled = function(value) {
                    this._yieldedPromise = null;
                    this._promise._pushContext();
                    var result = tryCatch(this._generator.next).call(this._generator, value);
                    this._promise._popContext();
                    this._continue(result);
                };
                PromiseSpawn.prototype._promiseRejected = function(reason) {
                    this._yieldedPromise = null;
                    this._promise._attachExtraTrace(reason);
                    this._promise._pushContext();
                    var result = tryCatch(this._generator["throw"]).call(this._generator, reason);
                    this._promise._popContext();
                    this._continue(result);
                };
                PromiseSpawn.prototype._resultCancelled = function() {
                    if (this._yieldedPromise instanceof Promise) {
                        var promise = this._yieldedPromise;
                        this._yieldedPromise = null;
                        promise.cancel();
                    }
                };
                PromiseSpawn.prototype.promise = function() {
                    return this._promise;
                };
                PromiseSpawn.prototype._run = function() {
                    this._generator = this._generatorFunction.call(this._receiver);
                    this._receiver = this._generatorFunction = void 0;
                    this._promiseFulfilled(void 0);
                };
                PromiseSpawn.prototype._continue = function(result) {
                    var promise = this._promise;
                    if (result === errorObj) {
                        this._cleanup();
                        return this._cancellationPhase ? promise.cancel() : promise._rejectCallback(result.e, false);
                    }
                    var value = result.value;
                    if (true === result.done) {
                        this._cleanup();
                        return this._cancellationPhase ? promise.cancel() : promise._resolveCallback(value);
                    }
                    var maybePromise = tryConvertToPromise(value, this._promise);
                    if (!(maybePromise instanceof Promise)) {
                        maybePromise = promiseFromYieldHandler(maybePromise, this._yieldHandlers, this._promise);
                        if (null === maybePromise) {
                            this._promiseRejected(new TypeError("A value %s was yielded that could not be treated as a promise\n\n    See http://goo.gl/MqrFmX\n\n".replace("%s", value) + "From coroutine:\n" + this._stack.split("\n").slice(1, -7).join("\n")));
                            return;
                        }
                    }
                    maybePromise = maybePromise._target();
                    var bitField = maybePromise._bitField;
                    if (0 === (50397184 & bitField)) {
                        this._yieldedPromise = maybePromise;
                        maybePromise._proxy(this, null);
                    } else 0 !== (33554432 & bitField) ? Promise._async.invoke(this._promiseFulfilled, this, maybePromise._value()) : 0 !== (16777216 & bitField) ? Promise._async.invoke(this._promiseRejected, this, maybePromise._reason()) : this._promiseCancelled();
                };
                Promise.coroutine = function(generatorFunction, options) {
                    if ("function" != typeof generatorFunction) throw new TypeError("generatorFunction must be a function\n\n    See http://goo.gl/MqrFmX\n");
                    var yieldHandler = Object(options).yieldHandler;
                    var PromiseSpawn$ = PromiseSpawn;
                    var stack = new Error().stack;
                    return function() {
                        var generator = generatorFunction.apply(this, arguments);
                        var spawn = new PromiseSpawn$(void 0, void 0, yieldHandler, stack);
                        var ret = spawn.promise();
                        spawn._generator = generator;
                        spawn._promiseFulfilled(void 0);
                        return ret;
                    };
                };
                Promise.coroutine.addYieldHandler = function(fn) {
                    if ("function" != typeof fn) throw new TypeError("expecting a function but got " + util.classString(fn));
                    yieldHandlers.push(fn);
                };
                Promise.spawn = function(generatorFunction) {
                    debug.deprecated("Promise.spawn()", "Promise.coroutine()");
                    if ("function" != typeof generatorFunction) return apiRejection("generatorFunction must be a function\n\n    See http://goo.gl/MqrFmX\n");
                    var spawn = new PromiseSpawn(generatorFunction, this);
                    var ret = spawn.promise();
                    spawn._run(Promise.spawn);
                    return ret;
                };
            };
        }, {
            "./errors": 12,
            "./util": 36
        } ],
        17: [ function(_dereq_, module) {
            module.exports = function(Promise, PromiseArray, tryConvertToPromise, INTERNAL, async, getDomain) {
                var util = _dereq_("./util");
                util.canEvaluate;
                util.tryCatch;
                util.errorObj;
                Promise.join = function() {
                    var last = arguments.length - 1;
                    var fn;
                    if (last > 0 && "function" == typeof arguments[last]) {
                        fn = arguments[last];
                        var ret;
                    }
                    var args = [].slice.call(arguments);
                    fn && args.pop();
                    var ret = new PromiseArray(args).promise();
                    return void 0 !== fn ? ret.spread(fn) : ret;
                };
            };
        }, {
            "./util": 36
        } ],
        18: [ function(_dereq_, module) {
            module.exports = function(Promise, PromiseArray, apiRejection, tryConvertToPromise, INTERNAL, debug) {
                function MappingPromiseArray(promises, fn, limit, _filter) {
                    this.constructor$(promises);
                    this._promise._captureStackTrace();
                    var domain = getDomain();
                    this._callback = null === domain ? fn : util.domainBind(domain, fn);
                    this._preservedValues = _filter === INTERNAL ? new Array(this.length()) : null;
                    this._limit = limit;
                    this._inFlight = 0;
                    this._queue = [];
                    async.invoke(this._asyncInit, this, void 0);
                }
                function map(promises, fn, options, _filter) {
                    if ("function" != typeof fn) return apiRejection("expecting a function but got " + util.classString(fn));
                    var limit = 0;
                    if (void 0 !== options) {
                        if ("object" !== ("undefined" == typeof options ? "undefined" : _typeof(options)) || null === options) return Promise.reject(new TypeError("options argument must be an object but it is " + util.classString(options)));
                        if ("number" != typeof options.concurrency) return Promise.reject(new TypeError("'concurrency' must be a number but it is " + util.classString(options.concurrency)));
                        limit = options.concurrency;
                    }
                    limit = "number" == typeof limit && isFinite(limit) && limit >= 1 ? limit : 0;
                    return new MappingPromiseArray(promises, fn, limit, _filter).promise();
                }
                var getDomain = Promise._getDomain;
                var util = _dereq_("./util");
                var tryCatch = util.tryCatch;
                var errorObj = util.errorObj;
                var async = Promise._async;
                util.inherits(MappingPromiseArray, PromiseArray);
                MappingPromiseArray.prototype._asyncInit = function() {
                    this._init$(void 0, -2);
                };
                MappingPromiseArray.prototype._init = function() {};
                MappingPromiseArray.prototype._promiseFulfilled = function(value, index) {
                    var values = this._values;
                    var length = this.length();
                    var preservedValues = this._preservedValues;
                    var limit = this._limit;
                    if (0 > index) {
                        index = -1 * index - 1;
                        values[index] = value;
                        if (limit >= 1) {
                            this._inFlight--;
                            this._drainQueue();
                            if (this._isResolved()) return true;
                        }
                    } else {
                        if (limit >= 1 && this._inFlight >= limit) {
                            values[index] = value;
                            this._queue.push(index);
                            return false;
                        }
                        null !== preservedValues && (preservedValues[index] = value);
                        var promise = this._promise;
                        var callback = this._callback;
                        var receiver = promise._boundValue();
                        promise._pushContext();
                        var ret = tryCatch(callback).call(receiver, value, index, length);
                        var promiseCreated = promise._popContext();
                        debug.checkForgottenReturns(ret, promiseCreated, null !== preservedValues ? "Promise.filter" : "Promise.map", promise);
                        if (ret === errorObj) {
                            this._reject(ret.e);
                            return true;
                        }
                        var maybePromise = tryConvertToPromise(ret, this._promise);
                        if (maybePromise instanceof Promise) {
                            maybePromise = maybePromise._target();
                            var bitField = maybePromise._bitField;
                            if (0 === (50397184 & bitField)) {
                                limit >= 1 && this._inFlight++;
                                values[index] = maybePromise;
                                maybePromise._proxy(this, -1 * (index + 1));
                                return false;
                            }
                            if (0 === (33554432 & bitField)) {
                                if (0 !== (16777216 & bitField)) {
                                    this._reject(maybePromise._reason());
                                    return true;
                                }
                                this._cancel();
                                return true;
                            }
                            ret = maybePromise._value();
                        }
                        values[index] = ret;
                    }
                    var totalResolved = ++this._totalResolved;
                    if (totalResolved >= length) {
                        null !== preservedValues ? this._filter(values, preservedValues) : this._resolve(values);
                        return true;
                    }
                    return false;
                };
                MappingPromiseArray.prototype._drainQueue = function() {
                    var queue = this._queue;
                    var limit = this._limit;
                    var values = this._values;
                    while (queue.length > 0 && this._inFlight < limit) {
                        if (this._isResolved()) return;
                        var index = queue.pop();
                        this._promiseFulfilled(values[index], index);
                    }
                };
                MappingPromiseArray.prototype._filter = function(booleans, values) {
                    var len = values.length;
                    var ret = new Array(len);
                    var j = 0;
                    for (var i = 0; len > i; ++i) booleans[i] && (ret[j++] = values[i]);
                    ret.length = j;
                    this._resolve(ret);
                };
                MappingPromiseArray.prototype.preservedValues = function() {
                    return this._preservedValues;
                };
                Promise.prototype.map = function(fn, options) {
                    return map(this, fn, options, null);
                };
                Promise.map = function(promises, fn, options, _filter) {
                    return map(promises, fn, options, _filter);
                };
            };
        }, {
            "./util": 36
        } ],
        19: [ function(_dereq_, module) {
            module.exports = function(Promise, INTERNAL, tryConvertToPromise, apiRejection, debug) {
                var util = _dereq_("./util");
                var tryCatch = util.tryCatch;
                Promise.method = function(fn) {
                    if ("function" != typeof fn) throw new Promise.TypeError("expecting a function but got " + util.classString(fn));
                    return function() {
                        var ret = new Promise(INTERNAL);
                        ret._captureStackTrace();
                        ret._pushContext();
                        var value = tryCatch(fn).apply(this, arguments);
                        var promiseCreated = ret._popContext();
                        debug.checkForgottenReturns(value, promiseCreated, "Promise.method", ret);
                        ret._resolveFromSyncValue(value);
                        return ret;
                    };
                };
                Promise.attempt = Promise["try"] = function(fn) {
                    if ("function" != typeof fn) return apiRejection("expecting a function but got " + util.classString(fn));
                    var ret = new Promise(INTERNAL);
                    ret._captureStackTrace();
                    ret._pushContext();
                    var value;
                    if (arguments.length > 1) {
                        debug.deprecated("calling Promise.try with more than 1 argument");
                        var arg = arguments[1];
                        var ctx = arguments[2];
                        value = util.isArray(arg) ? tryCatch(fn).apply(ctx, arg) : tryCatch(fn).call(ctx, arg);
                    } else value = tryCatch(fn)();
                    var promiseCreated = ret._popContext();
                    debug.checkForgottenReturns(value, promiseCreated, "Promise.try", ret);
                    ret._resolveFromSyncValue(value);
                    return ret;
                };
                Promise.prototype._resolveFromSyncValue = function(value) {
                    value === util.errorObj ? this._rejectCallback(value.e, false) : this._resolveCallback(value, true);
                };
            };
        }, {
            "./util": 36
        } ],
        20: [ function(_dereq_, module) {
            function isUntypedError(obj) {
                return obj instanceof Error && es5.getPrototypeOf(obj) === Error.prototype;
            }
            function wrapAsOperationalError(obj) {
                var ret;
                if (isUntypedError(obj)) {
                    ret = new OperationalError(obj);
                    ret.name = obj.name;
                    ret.message = obj.message;
                    ret.stack = obj.stack;
                    var keys = es5.keys(obj);
                    for (var i = 0; i < keys.length; ++i) {
                        var key = keys[i];
                        rErrorKey.test(key) || (ret[key] = obj[key]);
                    }
                    return ret;
                }
                util.markAsOriginatingFromRejection(obj);
                return obj;
            }
            function nodebackForPromise(promise, multiArgs) {
                return function(err, value) {
                    if (null === promise) return;
                    if (err) {
                        var wrapped = wrapAsOperationalError(maybeWrapAsError(err));
                        promise._attachExtraTrace(wrapped);
                        promise._reject(wrapped);
                    } else if (multiArgs) {
                        var args = [].slice.call(arguments, 1);
                        promise._fulfill(args);
                    } else promise._fulfill(value);
                    promise = null;
                };
            }
            var util = _dereq_("./util");
            var maybeWrapAsError = util.maybeWrapAsError;
            var errors = _dereq_("./errors");
            var OperationalError = errors.OperationalError;
            var es5 = _dereq_("./es5");
            var rErrorKey = /^(?:name|message|stack|cause)$/;
            module.exports = nodebackForPromise;
        }, {
            "./errors": 12,
            "./es5": 13,
            "./util": 36
        } ],
        21: [ function(_dereq_, module) {
            module.exports = function(Promise) {
                function spreadAdapter(val, nodeback) {
                    var promise = this;
                    if (!util.isArray(val)) return successAdapter.call(promise, val, nodeback);
                    var ret = tryCatch(nodeback).apply(promise._boundValue(), [ null ].concat(val));
                    ret === errorObj && async.throwLater(ret.e);
                }
                function successAdapter(val, nodeback) {
                    var promise = this;
                    var receiver = promise._boundValue();
                    var ret = void 0 === val ? tryCatch(nodeback).call(receiver, null) : tryCatch(nodeback).call(receiver, null, val);
                    ret === errorObj && async.throwLater(ret.e);
                }
                function errorAdapter(reason, nodeback) {
                    var promise = this;
                    if (!reason) {
                        var newReason = new Error(reason + "");
                        newReason.cause = reason;
                        reason = newReason;
                    }
                    var ret = tryCatch(nodeback).call(promise._boundValue(), reason);
                    ret === errorObj && async.throwLater(ret.e);
                }
                var util = _dereq_("./util");
                var async = Promise._async;
                var tryCatch = util.tryCatch;
                var errorObj = util.errorObj;
                Promise.prototype.asCallback = Promise.prototype.nodeify = function(nodeback, options) {
                    if ("function" == typeof nodeback) {
                        var adapter = successAdapter;
                        void 0 !== options && Object(options).spread && (adapter = spreadAdapter);
                        this._then(adapter, errorAdapter, void 0, this, nodeback);
                    }
                    return this;
                };
            };
        }, {
            "./util": 36
        } ],
        22: [ function(_dereq_, module) {
            module.exports = function() {
                function Proxyable() {}
                function check(self, executor) {
                    if ("function" != typeof executor) throw new TypeError("expecting a function but got " + util.classString(executor));
                    if (self.constructor !== Promise) throw new TypeError("the promise constructor cannot be invoked directly\n\n    See http://goo.gl/MqrFmX\n");
                }
                function Promise(executor) {
                    this._bitField = 0;
                    this._fulfillmentHandler0 = void 0;
                    this._rejectionHandler0 = void 0;
                    this._promise0 = void 0;
                    this._receiver0 = void 0;
                    if (executor !== INTERNAL) {
                        check(this, executor);
                        this._resolveFromExecutor(executor);
                    }
                    this._promiseCreated();
                    this._fireEvent("promiseCreated", this);
                }
                function deferResolve(v) {
                    this.promise._resolveCallback(v);
                }
                function deferReject(v) {
                    this.promise._rejectCallback(v, false);
                }
                function fillTypes(value) {
                    var p = new Promise(INTERNAL);
                    p._fulfillmentHandler0 = value;
                    p._rejectionHandler0 = value;
                    p._promise0 = value;
                    p._receiver0 = value;
                }
                var makeSelfResolutionError = function() {
                    return new TypeError("circular promise resolution chain\n\n    See http://goo.gl/MqrFmX\n");
                };
                var reflectHandler = function() {
                    return new Promise.PromiseInspection(this._target());
                };
                var apiRejection = function(msg) {
                    return Promise.reject(new TypeError(msg));
                };
                var UNDEFINED_BINDING = {};
                var util = _dereq_("./util");
                var getDomain;
                getDomain = util.isNode ? function() {
                    var ret = process.domain;
                    void 0 === ret && (ret = null);
                    return ret;
                } : function() {
                    return null;
                };
                util.notEnumerableProp(Promise, "_getDomain", getDomain);
                var es5 = _dereq_("./es5");
                var Async = _dereq_("./async");
                var async = new Async();
                es5.defineProperty(Promise, "_async", {
                    value: async
                });
                var errors = _dereq_("./errors");
                var TypeError = Promise.TypeError = errors.TypeError;
                Promise.RangeError = errors.RangeError;
                var CancellationError = Promise.CancellationError = errors.CancellationError;
                Promise.TimeoutError = errors.TimeoutError;
                Promise.OperationalError = errors.OperationalError;
                Promise.RejectionError = errors.OperationalError;
                Promise.AggregateError = errors.AggregateError;
                var INTERNAL = function() {};
                var APPLY = {};
                var NEXT_FILTER = {};
                var tryConvertToPromise = _dereq_("./thenables")(Promise, INTERNAL);
                var PromiseArray = _dereq_("./promise_array")(Promise, INTERNAL, tryConvertToPromise, apiRejection, Proxyable);
                var Context = _dereq_("./context")(Promise);
                var createContext = Context.create;
                var debug = _dereq_("./debuggability")(Promise, Context);
                debug.CapturedTrace;
                var PassThroughHandlerContext = _dereq_("./finally")(Promise, tryConvertToPromise);
                var catchFilter = _dereq_("./catch_filter")(NEXT_FILTER);
                var nodebackForPromise = _dereq_("./nodeback");
                var errorObj = util.errorObj;
                var tryCatch = util.tryCatch;
                Promise.prototype.toString = function() {
                    return "[object Promise]";
                };
                Promise.prototype.caught = Promise.prototype["catch"] = function(fn) {
                    var len = arguments.length;
                    if (len > 1) {
                        var i, catchInstances = new Array(len - 1), j = 0;
                        for (i = 0; len - 1 > i; ++i) {
                            var item = arguments[i];
                            if (!util.isObject(item)) return apiRejection("expecting an object but got A catch statement predicate " + util.classString(item));
                            catchInstances[j++] = item;
                        }
                        catchInstances.length = j;
                        fn = arguments[i];
                        return this.then(void 0, catchFilter(catchInstances, fn, this));
                    }
                    return this.then(void 0, fn);
                };
                Promise.prototype.reflect = function() {
                    return this._then(reflectHandler, reflectHandler, void 0, this, void 0);
                };
                Promise.prototype.then = function(didFulfill, didReject) {
                    if (debug.warnings() && arguments.length > 0 && "function" != typeof didFulfill && "function" != typeof didReject) {
                        var msg = ".then() only accepts functions but was passed: " + util.classString(didFulfill);
                        arguments.length > 1 && (msg += ", " + util.classString(didReject));
                        this._warn(msg);
                    }
                    return this._then(didFulfill, didReject, void 0, void 0, void 0);
                };
                Promise.prototype.done = function(didFulfill, didReject) {
                    var promise = this._then(didFulfill, didReject, void 0, void 0, void 0);
                    promise._setIsFinal();
                };
                Promise.prototype.spread = function(fn) {
                    if ("function" != typeof fn) return apiRejection("expecting a function but got " + util.classString(fn));
                    return this.all()._then(fn, void 0, void 0, APPLY, void 0);
                };
                Promise.prototype.toJSON = function() {
                    var ret = {
                        isFulfilled: false,
                        isRejected: false,
                        fulfillmentValue: void 0,
                        rejectionReason: void 0
                    };
                    if (this.isFulfilled()) {
                        ret.fulfillmentValue = this.value();
                        ret.isFulfilled = true;
                    } else if (this.isRejected()) {
                        ret.rejectionReason = this.reason();
                        ret.isRejected = true;
                    }
                    return ret;
                };
                Promise.prototype.all = function() {
                    arguments.length > 0 && this._warn(".all() was passed arguments but it does not take any");
                    return new PromiseArray(this).promise();
                };
                Promise.prototype.error = function(fn) {
                    return this.caught(util.originatesFromRejection, fn);
                };
                Promise.getNewLibraryCopy = module.exports;
                Promise.is = function(val) {
                    return val instanceof Promise;
                };
                Promise.fromNode = Promise.fromCallback = function(fn) {
                    var ret = new Promise(INTERNAL);
                    ret._captureStackTrace();
                    var multiArgs = arguments.length > 1 ? !!Object(arguments[1]).multiArgs : false;
                    var result = tryCatch(fn)(nodebackForPromise(ret, multiArgs));
                    result === errorObj && ret._rejectCallback(result.e, true);
                    ret._isFateSealed() || ret._setAsyncGuaranteed();
                    return ret;
                };
                Promise.all = function(promises) {
                    return new PromiseArray(promises).promise();
                };
                Promise.cast = function(obj) {
                    var ret = tryConvertToPromise(obj);
                    if (!(ret instanceof Promise)) {
                        ret = new Promise(INTERNAL);
                        ret._captureStackTrace();
                        ret._setFulfilled();
                        ret._rejectionHandler0 = obj;
                    }
                    return ret;
                };
                Promise.resolve = Promise.fulfilled = Promise.cast;
                Promise.reject = Promise.rejected = function(reason) {
                    var ret = new Promise(INTERNAL);
                    ret._captureStackTrace();
                    ret._rejectCallback(reason, true);
                    return ret;
                };
                Promise.setScheduler = function(fn) {
                    if ("function" != typeof fn) throw new TypeError("expecting a function but got " + util.classString(fn));
                    return async.setScheduler(fn);
                };
                Promise.prototype._then = function(didFulfill, didReject, _, receiver, internalData) {
                    var haveInternalData = void 0 !== internalData;
                    var promise = haveInternalData ? internalData : new Promise(INTERNAL);
                    var target = this._target();
                    var bitField = target._bitField;
                    if (!haveInternalData) {
                        promise._propagateFrom(this, 3);
                        promise._captureStackTrace();
                        void 0 === receiver && 0 !== (2097152 & this._bitField) && (receiver = 0 === (50397184 & bitField) ? target === this ? void 0 : this._boundTo : this._boundValue());
                        this._fireEvent("promiseChained", this, promise);
                    }
                    var domain = getDomain();
                    if (0 === (50397184 & bitField)) target._addCallbacks(didFulfill, didReject, promise, receiver, domain); else {
                        var handler, value, settler = target._settlePromiseCtx;
                        if (0 !== (33554432 & bitField)) {
                            value = target._rejectionHandler0;
                            handler = didFulfill;
                        } else if (0 !== (16777216 & bitField)) {
                            value = target._fulfillmentHandler0;
                            handler = didReject;
                            target._unsetRejectionIsUnhandled();
                        } else {
                            settler = target._settlePromiseLateCancellationObserver;
                            value = new CancellationError("late cancellation observer");
                            target._attachExtraTrace(value);
                            handler = didReject;
                        }
                        async.invoke(settler, target, {
                            handler: null === domain ? handler : "function" == typeof handler && util.domainBind(domain, handler),
                            promise: promise,
                            receiver: receiver,
                            value: value
                        });
                    }
                    return promise;
                };
                Promise.prototype._length = function() {
                    return 65535 & this._bitField;
                };
                Promise.prototype._isFateSealed = function() {
                    return 0 !== (117506048 & this._bitField);
                };
                Promise.prototype._isFollowing = function() {
                    return 67108864 === (67108864 & this._bitField);
                };
                Promise.prototype._setLength = function(len) {
                    this._bitField = -65536 & this._bitField | 65535 & len;
                };
                Promise.prototype._setFulfilled = function() {
                    this._bitField = 33554432 | this._bitField;
                    this._fireEvent("promiseFulfilled", this);
                };
                Promise.prototype._setRejected = function() {
                    this._bitField = 16777216 | this._bitField;
                    this._fireEvent("promiseRejected", this);
                };
                Promise.prototype._setFollowing = function() {
                    this._bitField = 67108864 | this._bitField;
                    this._fireEvent("promiseResolved", this);
                };
                Promise.prototype._setIsFinal = function() {
                    this._bitField = 4194304 | this._bitField;
                };
                Promise.prototype._isFinal = function() {
                    return (4194304 & this._bitField) > 0;
                };
                Promise.prototype._unsetCancelled = function() {
                    this._bitField = -65537 & this._bitField;
                };
                Promise.prototype._setCancelled = function() {
                    this._bitField = 65536 | this._bitField;
                    this._fireEvent("promiseCancelled", this);
                };
                Promise.prototype._setWillBeCancelled = function() {
                    this._bitField = 8388608 | this._bitField;
                };
                Promise.prototype._setAsyncGuaranteed = function() {
                    if (async.hasCustomScheduler()) return;
                    this._bitField = 134217728 | this._bitField;
                };
                Promise.prototype._receiverAt = function(index) {
                    var ret = 0 === index ? this._receiver0 : this[4 * index - 4 + 3];
                    if (ret === UNDEFINED_BINDING) return void 0;
                    if (void 0 === ret && this._isBound()) return this._boundValue();
                    return ret;
                };
                Promise.prototype._promiseAt = function(index) {
                    return this[4 * index - 4 + 2];
                };
                Promise.prototype._fulfillmentHandlerAt = function(index) {
                    return this[4 * index - 4 + 0];
                };
                Promise.prototype._rejectionHandlerAt = function(index) {
                    return this[4 * index - 4 + 1];
                };
                Promise.prototype._boundValue = function() {};
                Promise.prototype._migrateCallback0 = function(follower) {
                    follower._bitField;
                    var fulfill = follower._fulfillmentHandler0;
                    var reject = follower._rejectionHandler0;
                    var promise = follower._promise0;
                    var receiver = follower._receiverAt(0);
                    void 0 === receiver && (receiver = UNDEFINED_BINDING);
                    this._addCallbacks(fulfill, reject, promise, receiver, null);
                };
                Promise.prototype._migrateCallbackAt = function(follower, index) {
                    var fulfill = follower._fulfillmentHandlerAt(index);
                    var reject = follower._rejectionHandlerAt(index);
                    var promise = follower._promiseAt(index);
                    var receiver = follower._receiverAt(index);
                    void 0 === receiver && (receiver = UNDEFINED_BINDING);
                    this._addCallbacks(fulfill, reject, promise, receiver, null);
                };
                Promise.prototype._addCallbacks = function(fulfill, reject, promise, receiver, domain) {
                    var index = this._length();
                    if (index >= 65531) {
                        index = 0;
                        this._setLength(0);
                    }
                    if (0 === index) {
                        this._promise0 = promise;
                        this._receiver0 = receiver;
                        "function" == typeof fulfill && (this._fulfillmentHandler0 = null === domain ? fulfill : util.domainBind(domain, fulfill));
                        "function" == typeof reject && (this._rejectionHandler0 = null === domain ? reject : util.domainBind(domain, reject));
                    } else {
                        var base = 4 * index - 4;
                        this[base + 2] = promise;
                        this[base + 3] = receiver;
                        "function" == typeof fulfill && (this[base + 0] = null === domain ? fulfill : util.domainBind(domain, fulfill));
                        "function" == typeof reject && (this[base + 1] = null === domain ? reject : util.domainBind(domain, reject));
                    }
                    this._setLength(index + 1);
                    return index;
                };
                Promise.prototype._proxy = function(proxyable, arg) {
                    this._addCallbacks(void 0, void 0, arg, proxyable, null);
                };
                Promise.prototype._resolveCallback = function(value, shouldBind) {
                    if (0 !== (117506048 & this._bitField)) return;
                    if (value === this) return this._rejectCallback(makeSelfResolutionError(), false);
                    var maybePromise = tryConvertToPromise(value, this);
                    if (!(maybePromise instanceof Promise)) return this._fulfill(value);
                    shouldBind && this._propagateFrom(maybePromise, 2);
                    var promise = maybePromise._target();
                    if (promise === this) {
                        this._reject(makeSelfResolutionError());
                        return;
                    }
                    var bitField = promise._bitField;
                    if (0 === (50397184 & bitField)) {
                        var len = this._length();
                        len > 0 && promise._migrateCallback0(this);
                        for (var i = 1; len > i; ++i) promise._migrateCallbackAt(this, i);
                        this._setFollowing();
                        this._setLength(0);
                        this._setFollowee(promise);
                    } else if (0 !== (33554432 & bitField)) this._fulfill(promise._value()); else if (0 !== (16777216 & bitField)) this._reject(promise._reason()); else {
                        var reason = new CancellationError("late cancellation observer");
                        promise._attachExtraTrace(reason);
                        this._reject(reason);
                    }
                };
                Promise.prototype._rejectCallback = function(reason, synchronous, ignoreNonErrorWarnings) {
                    var trace = util.ensureErrorObject(reason);
                    var hasStack = trace === reason;
                    if (!hasStack && !ignoreNonErrorWarnings && debug.warnings()) {
                        var message = "a promise was rejected with a non-error: " + util.classString(reason);
                        this._warn(message, true);
                    }
                    this._attachExtraTrace(trace, synchronous ? hasStack : false);
                    this._reject(reason);
                };
                Promise.prototype._resolveFromExecutor = function(executor) {
                    var promise = this;
                    this._captureStackTrace();
                    this._pushContext();
                    var synchronous = true;
                    var r = this._execute(executor, function(value) {
                        promise._resolveCallback(value);
                    }, function(reason) {
                        promise._rejectCallback(reason, synchronous);
                    });
                    synchronous = false;
                    this._popContext();
                    void 0 !== r && promise._rejectCallback(r, true);
                };
                Promise.prototype._settlePromiseFromHandler = function(handler, receiver, value, promise) {
                    var bitField = promise._bitField;
                    if (0 !== (65536 & bitField)) return;
                    promise._pushContext();
                    var x;
                    if (receiver === APPLY) if (value && "number" == typeof value.length) x = tryCatch(handler).apply(this._boundValue(), value); else {
                        x = errorObj;
                        x.e = new TypeError("cannot .spread() a non-array: " + util.classString(value));
                    } else x = tryCatch(handler).call(receiver, value);
                    var promiseCreated = promise._popContext();
                    bitField = promise._bitField;
                    if (0 !== (65536 & bitField)) return;
                    if (x === NEXT_FILTER) promise._reject(value); else if (x === errorObj) promise._rejectCallback(x.e, false); else {
                        debug.checkForgottenReturns(x, promiseCreated, "", promise, this);
                        promise._resolveCallback(x);
                    }
                };
                Promise.prototype._target = function() {
                    var ret = this;
                    while (ret._isFollowing()) ret = ret._followee();
                    return ret;
                };
                Promise.prototype._followee = function() {
                    return this._rejectionHandler0;
                };
                Promise.prototype._setFollowee = function(promise) {
                    this._rejectionHandler0 = promise;
                };
                Promise.prototype._settlePromise = function(promise, handler, receiver, value) {
                    var isPromise = promise instanceof Promise;
                    var bitField = this._bitField;
                    var asyncGuaranteed = 0 !== (134217728 & bitField);
                    if (0 !== (65536 & bitField)) {
                        isPromise && promise._invokeInternalOnCancel();
                        if (receiver instanceof PassThroughHandlerContext && receiver.isFinallyHandler()) {
                            receiver.cancelPromise = promise;
                            tryCatch(handler).call(receiver, value) === errorObj && promise._reject(errorObj.e);
                        } else handler === reflectHandler ? promise._fulfill(reflectHandler.call(receiver)) : receiver instanceof Proxyable ? receiver._promiseCancelled(promise) : isPromise || promise instanceof PromiseArray ? promise._cancel() : receiver.cancel();
                    } else if ("function" == typeof handler) if (isPromise) {
                        asyncGuaranteed && promise._setAsyncGuaranteed();
                        this._settlePromiseFromHandler(handler, receiver, value, promise);
                    } else handler.call(receiver, value, promise); else if (receiver instanceof Proxyable) receiver._isResolved() || (0 !== (33554432 & bitField) ? receiver._promiseFulfilled(value, promise) : receiver._promiseRejected(value, promise)); else if (isPromise) {
                        asyncGuaranteed && promise._setAsyncGuaranteed();
                        0 !== (33554432 & bitField) ? promise._fulfill(value) : promise._reject(value);
                    }
                };
                Promise.prototype._settlePromiseLateCancellationObserver = function(ctx) {
                    var handler = ctx.handler;
                    var promise = ctx.promise;
                    var receiver = ctx.receiver;
                    var value = ctx.value;
                    "function" == typeof handler ? promise instanceof Promise ? this._settlePromiseFromHandler(handler, receiver, value, promise) : handler.call(receiver, value, promise) : promise instanceof Promise && promise._reject(value);
                };
                Promise.prototype._settlePromiseCtx = function(ctx) {
                    this._settlePromise(ctx.promise, ctx.handler, ctx.receiver, ctx.value);
                };
                Promise.prototype._settlePromise0 = function(handler, value) {
                    var promise = this._promise0;
                    var receiver = this._receiverAt(0);
                    this._promise0 = void 0;
                    this._receiver0 = void 0;
                    this._settlePromise(promise, handler, receiver, value);
                };
                Promise.prototype._clearCallbackDataAtIndex = function(index) {
                    var base = 4 * index - 4;
                    this[base + 2] = this[base + 3] = this[base + 0] = this[base + 1] = void 0;
                };
                Promise.prototype._fulfill = function(value) {
                    var bitField = this._bitField;
                    if ((117506048 & bitField) >>> 16) return;
                    if (value === this) {
                        var err = makeSelfResolutionError();
                        this._attachExtraTrace(err);
                        return this._reject(err);
                    }
                    this._setFulfilled();
                    this._rejectionHandler0 = value;
                    (65535 & bitField) > 0 && (0 !== (134217728 & bitField) ? this._settlePromises() : async.settlePromises(this));
                };
                Promise.prototype._reject = function(reason) {
                    var bitField = this._bitField;
                    if ((117506048 & bitField) >>> 16) return;
                    this._setRejected();
                    this._fulfillmentHandler0 = reason;
                    if (this._isFinal()) return async.fatalError(reason, util.isNode);
                    (65535 & bitField) > 0 ? async.settlePromises(this) : this._ensurePossibleRejectionHandled();
                };
                Promise.prototype._fulfillPromises = function(len, value) {
                    for (var i = 1; len > i; i++) {
                        var handler = this._fulfillmentHandlerAt(i);
                        var promise = this._promiseAt(i);
                        var receiver = this._receiverAt(i);
                        this._clearCallbackDataAtIndex(i);
                        this._settlePromise(promise, handler, receiver, value);
                    }
                };
                Promise.prototype._rejectPromises = function(len, reason) {
                    for (var i = 1; len > i; i++) {
                        var handler = this._rejectionHandlerAt(i);
                        var promise = this._promiseAt(i);
                        var receiver = this._receiverAt(i);
                        this._clearCallbackDataAtIndex(i);
                        this._settlePromise(promise, handler, receiver, reason);
                    }
                };
                Promise.prototype._settlePromises = function() {
                    var bitField = this._bitField;
                    var len = 65535 & bitField;
                    if (len > 0) {
                        if (0 !== (16842752 & bitField)) {
                            var reason = this._fulfillmentHandler0;
                            this._settlePromise0(this._rejectionHandler0, reason, bitField);
                            this._rejectPromises(len, reason);
                        } else {
                            var value = this._rejectionHandler0;
                            this._settlePromise0(this._fulfillmentHandler0, value, bitField);
                            this._fulfillPromises(len, value);
                        }
                        this._setLength(0);
                    }
                    this._clearCancellationData();
                };
                Promise.prototype._settledValue = function() {
                    var bitField = this._bitField;
                    if (0 !== (33554432 & bitField)) return this._rejectionHandler0;
                    if (0 !== (16777216 & bitField)) return this._fulfillmentHandler0;
                };
                Promise.defer = Promise.pending = function() {
                    debug.deprecated("Promise.defer", "new Promise");
                    var promise = new Promise(INTERNAL);
                    return {
                        promise: promise,
                        resolve: deferResolve,
                        reject: deferReject
                    };
                };
                util.notEnumerableProp(Promise, "_makeSelfResolutionError", makeSelfResolutionError);
                _dereq_("./method")(Promise, INTERNAL, tryConvertToPromise, apiRejection, debug);
                _dereq_("./bind")(Promise, INTERNAL, tryConvertToPromise, debug);
                _dereq_("./cancel")(Promise, PromiseArray, apiRejection, debug);
                _dereq_("./direct_resolve")(Promise);
                _dereq_("./synchronous_inspection")(Promise);
                _dereq_("./join")(Promise, PromiseArray, tryConvertToPromise, INTERNAL, async, getDomain);
                Promise.Promise = Promise;
                Promise.version = "3.4.6";
                _dereq_("./map.js")(Promise, PromiseArray, apiRejection, tryConvertToPromise, INTERNAL, debug);
                _dereq_("./call_get.js")(Promise);
                _dereq_("./using.js")(Promise, apiRejection, tryConvertToPromise, createContext, INTERNAL, debug);
                _dereq_("./timers.js")(Promise, INTERNAL, debug);
                _dereq_("./generators.js")(Promise, apiRejection, INTERNAL, tryConvertToPromise, Proxyable, debug);
                _dereq_("./nodeify.js")(Promise);
                _dereq_("./promisify.js")(Promise, INTERNAL);
                _dereq_("./props.js")(Promise, PromiseArray, tryConvertToPromise, apiRejection);
                _dereq_("./race.js")(Promise, INTERNAL, tryConvertToPromise, apiRejection);
                _dereq_("./reduce.js")(Promise, PromiseArray, apiRejection, tryConvertToPromise, INTERNAL, debug);
                _dereq_("./settle.js")(Promise, PromiseArray, debug);
                _dereq_("./some.js")(Promise, PromiseArray, apiRejection);
                _dereq_("./filter.js")(Promise, INTERNAL);
                _dereq_("./each.js")(Promise, INTERNAL);
                _dereq_("./any.js")(Promise);
                util.toFastProperties(Promise);
                util.toFastProperties(Promise.prototype);
                fillTypes({
                    a: 1
                });
                fillTypes({
                    b: 2
                });
                fillTypes({
                    c: 3
                });
                fillTypes(1);
                fillTypes(function() {});
                fillTypes(void 0);
                fillTypes(false);
                fillTypes(new Promise(INTERNAL));
                debug.setBounds(Async.firstLineError, util.lastLineError);
                return Promise;
            };
        }, {
            "./any.js": 1,
            "./async": 2,
            "./bind": 3,
            "./call_get.js": 5,
            "./cancel": 6,
            "./catch_filter": 7,
            "./context": 8,
            "./debuggability": 9,
            "./direct_resolve": 10,
            "./each.js": 11,
            "./errors": 12,
            "./es5": 13,
            "./filter.js": 14,
            "./finally": 15,
            "./generators.js": 16,
            "./join": 17,
            "./map.js": 18,
            "./method": 19,
            "./nodeback": 20,
            "./nodeify.js": 21,
            "./promise_array": 23,
            "./promisify.js": 24,
            "./props.js": 25,
            "./race.js": 27,
            "./reduce.js": 28,
            "./settle.js": 30,
            "./some.js": 31,
            "./synchronous_inspection": 32,
            "./thenables": 33,
            "./timers.js": 34,
            "./using.js": 35,
            "./util": 36
        } ],
        23: [ function(_dereq_, module) {
            module.exports = function(Promise, INTERNAL, tryConvertToPromise, apiRejection, Proxyable) {
                function toResolutionValue(val) {
                    switch (val) {
                      case -2:
                        return [];

                      case -3:
                        return {};
                    }
                }
                function PromiseArray(values) {
                    var promise = this._promise = new Promise(INTERNAL);
                    values instanceof Promise && promise._propagateFrom(values, 3);
                    promise._setOnCancel(this);
                    this._values = values;
                    this._length = 0;
                    this._totalResolved = 0;
                    this._init(void 0, -2);
                }
                var util = _dereq_("./util");
                util.isArray;
                util.inherits(PromiseArray, Proxyable);
                PromiseArray.prototype.length = function() {
                    return this._length;
                };
                PromiseArray.prototype.promise = function() {
                    return this._promise;
                };
                PromiseArray.prototype._init = function init(_, resolveValueIfEmpty) {
                    var values = tryConvertToPromise(this._values, this._promise);
                    if (values instanceof Promise) {
                        values = values._target();
                        var bitField = values._bitField;
                        this._values = values;
                        if (0 === (50397184 & bitField)) {
                            this._promise._setAsyncGuaranteed();
                            return values._then(init, this._reject, void 0, this, resolveValueIfEmpty);
                        }
                        if (0 === (33554432 & bitField)) return 0 !== (16777216 & bitField) ? this._reject(values._reason()) : this._cancel();
                        values = values._value();
                    }
                    values = util.asArray(values);
                    if (null === values) {
                        var err = apiRejection("expecting an array or an iterable object but got " + util.classString(values)).reason();
                        this._promise._rejectCallback(err, false);
                        return;
                    }
                    if (0 === values.length) {
                        -5 === resolveValueIfEmpty ? this._resolveEmptyArray() : this._resolve(toResolutionValue(resolveValueIfEmpty));
                        return;
                    }
                    this._iterate(values);
                };
                PromiseArray.prototype._iterate = function(values) {
                    var len = this.getActualLength(values.length);
                    this._length = len;
                    this._values = this.shouldCopyValues() ? new Array(len) : this._values;
                    var result = this._promise;
                    var isResolved = false;
                    var bitField = null;
                    for (var i = 0; len > i; ++i) {
                        var maybePromise = tryConvertToPromise(values[i], result);
                        if (maybePromise instanceof Promise) {
                            maybePromise = maybePromise._target();
                            bitField = maybePromise._bitField;
                        } else bitField = null;
                        if (isResolved) null !== bitField && maybePromise.suppressUnhandledRejections(); else if (null !== bitField) if (0 === (50397184 & bitField)) {
                            maybePromise._proxy(this, i);
                            this._values[i] = maybePromise;
                        } else isResolved = 0 !== (33554432 & bitField) ? this._promiseFulfilled(maybePromise._value(), i) : 0 !== (16777216 & bitField) ? this._promiseRejected(maybePromise._reason(), i) : this._promiseCancelled(i); else isResolved = this._promiseFulfilled(maybePromise, i);
                    }
                    isResolved || result._setAsyncGuaranteed();
                };
                PromiseArray.prototype._isResolved = function() {
                    return null === this._values;
                };
                PromiseArray.prototype._resolve = function(value) {
                    this._values = null;
                    this._promise._fulfill(value);
                };
                PromiseArray.prototype._cancel = function() {
                    if (this._isResolved() || !this._promise._isCancellable()) return;
                    this._values = null;
                    this._promise._cancel();
                };
                PromiseArray.prototype._reject = function(reason) {
                    this._values = null;
                    this._promise._rejectCallback(reason, false);
                };
                PromiseArray.prototype._promiseFulfilled = function(value, index) {
                    this._values[index] = value;
                    var totalResolved = ++this._totalResolved;
                    if (totalResolved >= this._length) {
                        this._resolve(this._values);
                        return true;
                    }
                    return false;
                };
                PromiseArray.prototype._promiseCancelled = function() {
                    this._cancel();
                    return true;
                };
                PromiseArray.prototype._promiseRejected = function(reason) {
                    this._totalResolved++;
                    this._reject(reason);
                    return true;
                };
                PromiseArray.prototype._resultCancelled = function() {
                    if (this._isResolved()) return;
                    var values = this._values;
                    this._cancel();
                    if (values instanceof Promise) values.cancel(); else for (var i = 0; i < values.length; ++i) values[i] instanceof Promise && values[i].cancel();
                };
                PromiseArray.prototype.shouldCopyValues = function() {
                    return true;
                };
                PromiseArray.prototype.getActualLength = function(len) {
                    return len;
                };
                return PromiseArray;
            };
        }, {
            "./util": 36
        } ],
        24: [ function(_dereq_, module) {
            module.exports = function(Promise, INTERNAL) {
                function propsFilter(key) {
                    return !noCopyPropsPattern.test(key);
                }
                function isPromisified(fn) {
                    try {
                        return true === fn.__isPromisified__;
                    } catch (e) {
                        return false;
                    }
                }
                function hasPromisified(obj, key, suffix) {
                    var val = util.getDataPropertyOrDefault(obj, key + suffix, defaultPromisified);
                    return val ? isPromisified(val) : false;
                }
                function checkValid(ret, suffix, suffixRegexp) {
                    for (var i = 0; i < ret.length; i += 2) {
                        var key = ret[i];
                        if (suffixRegexp.test(key)) {
                            var keyWithoutAsyncSuffix = key.replace(suffixRegexp, "");
                            for (var j = 0; j < ret.length; j += 2) if (ret[j] === keyWithoutAsyncSuffix) throw new TypeError("Cannot promisify an API that has normal methods with '%s'-suffix\n\n    See http://goo.gl/MqrFmX\n".replace("%s", suffix));
                        }
                    }
                }
                function promisifiableMethods(obj, suffix, suffixRegexp, filter) {
                    var keys = util.inheritedDataKeys(obj);
                    var ret = [];
                    for (var i = 0; i < keys.length; ++i) {
                        var key = keys[i];
                        var value = obj[key];
                        var passesDefaultFilter = filter === defaultFilter ? true : defaultFilter(key, value, obj);
                        "function" != typeof value || isPromisified(value) || hasPromisified(obj, key, suffix) || !filter(key, value, obj, passesDefaultFilter) || ret.push(key, value);
                    }
                    checkValid(ret, suffix, suffixRegexp);
                    return ret;
                }
                function makeNodePromisifiedClosure(callback, receiver, _, fn, __, multiArgs) {
                    function promisified() {
                        var _receiver = receiver;
                        receiver === THIS && (_receiver = this);
                        var promise = new Promise(INTERNAL);
                        promise._captureStackTrace();
                        var cb = "string" == typeof method && this !== defaultThis ? this[method] : callback;
                        var fn = nodebackForPromise(promise, multiArgs);
                        try {
                            cb.apply(_receiver, withAppended(arguments, fn));
                        } catch (e) {
                            promise._rejectCallback(maybeWrapAsError(e), true, true);
                        }
                        promise._isFateSealed() || promise._setAsyncGuaranteed();
                        return promise;
                    }
                    var defaultThis = function() {
                        return this;
                    }();
                    var method = callback;
                    "string" == typeof method && (callback = fn);
                    util.notEnumerableProp(promisified, "__isPromisified__", true);
                    return promisified;
                }
                function promisifyAll(obj, suffix, filter, promisifier, multiArgs) {
                    var suffixRegexp = new RegExp(escapeIdentRegex(suffix) + "$");
                    var methods = promisifiableMethods(obj, suffix, suffixRegexp, filter);
                    for (var i = 0, len = methods.length; len > i; i += 2) {
                        var key = methods[i];
                        var fn = methods[i + 1];
                        var promisifiedKey = key + suffix;
                        if (promisifier === makeNodePromisified) obj[promisifiedKey] = makeNodePromisified(key, THIS, key, fn, suffix, multiArgs); else {
                            var promisified = promisifier(fn, function() {
                                return makeNodePromisified(key, THIS, key, fn, suffix, multiArgs);
                            });
                            util.notEnumerableProp(promisified, "__isPromisified__", true);
                            obj[promisifiedKey] = promisified;
                        }
                    }
                    util.toFastProperties(obj);
                    return obj;
                }
                function promisify(callback, receiver, multiArgs) {
                    return makeNodePromisified(callback, receiver, void 0, callback, null, multiArgs);
                }
                var THIS = {};
                var util = _dereq_("./util");
                var nodebackForPromise = _dereq_("./nodeback");
                var withAppended = util.withAppended;
                var maybeWrapAsError = util.maybeWrapAsError;
                var canEvaluate = util.canEvaluate;
                var TypeError = _dereq_("./errors").TypeError;
                var defaultSuffix = "Async";
                var defaultPromisified = {
                    __isPromisified__: true
                };
                var noCopyProps = [ "arity", "length", "name", "arguments", "caller", "callee", "prototype", "__isPromisified__" ];
                var noCopyPropsPattern = new RegExp("^(?:" + noCopyProps.join("|") + ")$");
                var defaultFilter = function(name) {
                    return util.isIdentifier(name) && "_" !== name.charAt(0) && "constructor" !== name;
                };
                var escapeIdentRegex = function(str) {
                    return str.replace(/([$])/, "\\$");
                };
                var makeNodePromisifiedEval;
                var makeNodePromisified = canEvaluate ? makeNodePromisifiedEval : makeNodePromisifiedClosure;
                Promise.promisify = function(fn, options) {
                    if ("function" != typeof fn) throw new TypeError("expecting a function but got " + util.classString(fn));
                    if (isPromisified(fn)) return fn;
                    options = Object(options);
                    var receiver = void 0 === options.context ? THIS : options.context;
                    var multiArgs = !!options.multiArgs;
                    var ret = promisify(fn, receiver, multiArgs);
                    util.copyDescriptors(fn, ret, propsFilter);
                    return ret;
                };
                Promise.promisifyAll = function(target, options) {
                    if ("function" != typeof target && "object" !== ("undefined" == typeof target ? "undefined" : _typeof(target))) throw new TypeError("the target of promisifyAll must be an object or a function\n\n    See http://goo.gl/MqrFmX\n");
                    options = Object(options);
                    var multiArgs = !!options.multiArgs;
                    var suffix = options.suffix;
                    "string" != typeof suffix && (suffix = defaultSuffix);
                    var filter = options.filter;
                    "function" != typeof filter && (filter = defaultFilter);
                    var promisifier = options.promisifier;
                    "function" != typeof promisifier && (promisifier = makeNodePromisified);
                    if (!util.isIdentifier(suffix)) throw new RangeError("suffix must be a valid identifier\n\n    See http://goo.gl/MqrFmX\n");
                    var keys = util.inheritedDataKeys(target);
                    for (var i = 0; i < keys.length; ++i) {
                        var value = target[keys[i]];
                        if ("constructor" !== keys[i] && util.isClass(value)) {
                            promisifyAll(value.prototype, suffix, filter, promisifier, multiArgs);
                            promisifyAll(value, suffix, filter, promisifier, multiArgs);
                        }
                    }
                    return promisifyAll(target, suffix, filter, promisifier, multiArgs);
                };
            };
        }, {
            "./errors": 12,
            "./nodeback": 20,
            "./util": 36
        } ],
        25: [ function(_dereq_, module) {
            module.exports = function(Promise, PromiseArray, tryConvertToPromise, apiRejection) {
                function PropertiesPromiseArray(obj) {
                    var isMap = false;
                    var entries;
                    if (void 0 !== Es6Map && obj instanceof Es6Map) {
                        entries = mapToEntries(obj);
                        isMap = true;
                    } else {
                        var keys = es5.keys(obj);
                        var len = keys.length;
                        entries = new Array(2 * len);
                        for (var i = 0; len > i; ++i) {
                            var key = keys[i];
                            entries[i] = obj[key];
                            entries[i + len] = key;
                        }
                    }
                    this.constructor$(entries);
                    this._isMap = isMap;
                    this._init$(void 0, -3);
                }
                function props(promises) {
                    var ret;
                    var castValue = tryConvertToPromise(promises);
                    if (!isObject(castValue)) return apiRejection("cannot await properties of a non-object\n\n    See http://goo.gl/MqrFmX\n");
                    ret = castValue instanceof Promise ? castValue._then(Promise.props, void 0, void 0, void 0, void 0) : new PropertiesPromiseArray(castValue).promise();
                    castValue instanceof Promise && ret._propagateFrom(castValue, 2);
                    return ret;
                }
                var util = _dereq_("./util");
                var isObject = util.isObject;
                var es5 = _dereq_("./es5");
                var Es6Map;
                "function" == typeof Map && (Es6Map = Map);
                var mapToEntries = function() {
                    function extractEntry(value, key) {
                        this[index] = value;
                        this[index + size] = key;
                        index++;
                    }
                    var index = 0;
                    var size = 0;
                    return function(map) {
                        size = map.size;
                        index = 0;
                        var ret = new Array(2 * map.size);
                        map.forEach(extractEntry, ret);
                        return ret;
                    };
                }();
                var entriesToMap = function(entries) {
                    var ret = new Es6Map();
                    var length = entries.length / 2 | 0;
                    for (var i = 0; length > i; ++i) {
                        var key = entries[length + i];
                        var value = entries[i];
                        ret.set(key, value);
                    }
                    return ret;
                };
                util.inherits(PropertiesPromiseArray, PromiseArray);
                PropertiesPromiseArray.prototype._init = function() {};
                PropertiesPromiseArray.prototype._promiseFulfilled = function(value, index) {
                    this._values[index] = value;
                    var totalResolved = ++this._totalResolved;
                    if (totalResolved >= this._length) {
                        var val;
                        if (this._isMap) val = entriesToMap(this._values); else {
                            val = {};
                            var keyOffset = this.length();
                            for (var i = 0, len = this.length(); len > i; ++i) val[this._values[i + keyOffset]] = this._values[i];
                        }
                        this._resolve(val);
                        return true;
                    }
                    return false;
                };
                PropertiesPromiseArray.prototype.shouldCopyValues = function() {
                    return false;
                };
                PropertiesPromiseArray.prototype.getActualLength = function(len) {
                    return len >> 1;
                };
                Promise.prototype.props = function() {
                    return props(this);
                };
                Promise.props = function(promises) {
                    return props(promises);
                };
            };
        }, {
            "./es5": 13,
            "./util": 36
        } ],
        26: [ function(_dereq_, module) {
            function arrayMove(src, srcIndex, dst, dstIndex, len) {
                for (var j = 0; len > j; ++j) {
                    dst[j + dstIndex] = src[j + srcIndex];
                    src[j + srcIndex] = void 0;
                }
            }
            function Queue(capacity) {
                this._capacity = capacity;
                this._length = 0;
                this._front = 0;
            }
            Queue.prototype._willBeOverCapacity = function(size) {
                return this._capacity < size;
            };
            Queue.prototype._pushOne = function(arg) {
                var length = this.length();
                this._checkCapacity(length + 1);
                var i = this._front + length & this._capacity - 1;
                this[i] = arg;
                this._length = length + 1;
            };
            Queue.prototype._unshiftOne = function(value) {
                var capacity = this._capacity;
                this._checkCapacity(this.length() + 1);
                var front = this._front;
                var i = (front - 1 & capacity - 1 ^ capacity) - capacity;
                this[i] = value;
                this._front = i;
                this._length = this.length() + 1;
            };
            Queue.prototype.unshift = function(fn, receiver, arg) {
                this._unshiftOne(arg);
                this._unshiftOne(receiver);
                this._unshiftOne(fn);
            };
            Queue.prototype.push = function(fn, receiver, arg) {
                var length = this.length() + 3;
                if (this._willBeOverCapacity(length)) {
                    this._pushOne(fn);
                    this._pushOne(receiver);
                    this._pushOne(arg);
                    return;
                }
                var j = this._front + length - 3;
                this._checkCapacity(length);
                var wrapMask = this._capacity - 1;
                this[j + 0 & wrapMask] = fn;
                this[j + 1 & wrapMask] = receiver;
                this[j + 2 & wrapMask] = arg;
                this._length = length;
            };
            Queue.prototype.shift = function() {
                var front = this._front, ret = this[front];
                this[front] = void 0;
                this._front = front + 1 & this._capacity - 1;
                this._length--;
                return ret;
            };
            Queue.prototype.length = function() {
                return this._length;
            };
            Queue.prototype._checkCapacity = function(size) {
                this._capacity < size && this._resizeTo(this._capacity << 1);
            };
            Queue.prototype._resizeTo = function(capacity) {
                var oldCapacity = this._capacity;
                this._capacity = capacity;
                var front = this._front;
                var length = this._length;
                var moveItemsCount = front + length & oldCapacity - 1;
                arrayMove(this, 0, this, oldCapacity, moveItemsCount);
            };
            module.exports = Queue;
        }, {} ],
        27: [ function(_dereq_, module) {
            module.exports = function(Promise, INTERNAL, tryConvertToPromise, apiRejection) {
                function race(promises, parent) {
                    var maybePromise = tryConvertToPromise(promises);
                    if (maybePromise instanceof Promise) return raceLater(maybePromise);
                    promises = util.asArray(promises);
                    if (null === promises) return apiRejection("expecting an array or an iterable object but got " + util.classString(promises));
                    var ret = new Promise(INTERNAL);
                    void 0 !== parent && ret._propagateFrom(parent, 3);
                    var fulfill = ret._fulfill;
                    var reject = ret._reject;
                    for (var i = 0, len = promises.length; len > i; ++i) {
                        var val = promises[i];
                        if (void 0 === val && !(i in promises)) continue;
                        Promise.cast(val)._then(fulfill, reject, void 0, ret, null);
                    }
                    return ret;
                }
                var util = _dereq_("./util");
                var raceLater = function(promise) {
                    return promise.then(function(array) {
                        return race(array, promise);
                    });
                };
                Promise.race = function(promises) {
                    return race(promises, void 0);
                };
                Promise.prototype.race = function() {
                    return race(this, void 0);
                };
            };
        }, {
            "./util": 36
        } ],
        28: [ function(_dereq_, module) {
            module.exports = function(Promise, PromiseArray, apiRejection, tryConvertToPromise, INTERNAL, debug) {
                function ReductionPromiseArray(promises, fn, initialValue, _each) {
                    this.constructor$(promises);
                    var domain = getDomain();
                    this._fn = null === domain ? fn : util.domainBind(domain, fn);
                    if (void 0 !== initialValue) {
                        initialValue = Promise.resolve(initialValue);
                        initialValue._attachCancellationCallback(this);
                    }
                    this._initialValue = initialValue;
                    this._currentCancellable = null;
                    this._eachValues = _each === INTERNAL ? Array(this._length) : 0 === _each ? null : void 0;
                    this._promise._captureStackTrace();
                    this._init$(void 0, -5);
                }
                function completed(valueOrReason, array) {
                    this.isFulfilled() ? array._resolve(valueOrReason) : array._reject(valueOrReason);
                }
                function reduce(promises, fn, initialValue, _each) {
                    if ("function" != typeof fn) return apiRejection("expecting a function but got " + util.classString(fn));
                    var array = new ReductionPromiseArray(promises, fn, initialValue, _each);
                    return array.promise();
                }
                function gotAccum(accum) {
                    this.accum = accum;
                    this.array._gotAccum(accum);
                    var value = tryConvertToPromise(this.value, this.array._promise);
                    if (value instanceof Promise) {
                        this.array._currentCancellable = value;
                        return value._then(gotValue, void 0, void 0, this, void 0);
                    }
                    return gotValue.call(this, value);
                }
                function gotValue(value) {
                    var array = this.array;
                    var promise = array._promise;
                    var fn = tryCatch(array._fn);
                    promise._pushContext();
                    var ret;
                    ret = void 0 !== array._eachValues ? fn.call(promise._boundValue(), value, this.index, this.length) : fn.call(promise._boundValue(), this.accum, value, this.index, this.length);
                    ret instanceof Promise && (array._currentCancellable = ret);
                    var promiseCreated = promise._popContext();
                    debug.checkForgottenReturns(ret, promiseCreated, void 0 !== array._eachValues ? "Promise.each" : "Promise.reduce", promise);
                    return ret;
                }
                var getDomain = Promise._getDomain;
                var util = _dereq_("./util");
                var tryCatch = util.tryCatch;
                util.inherits(ReductionPromiseArray, PromiseArray);
                ReductionPromiseArray.prototype._gotAccum = function(accum) {
                    void 0 !== this._eachValues && null !== this._eachValues && accum !== INTERNAL && this._eachValues.push(accum);
                };
                ReductionPromiseArray.prototype._eachComplete = function(value) {
                    null !== this._eachValues && this._eachValues.push(value);
                    return this._eachValues;
                };
                ReductionPromiseArray.prototype._init = function() {};
                ReductionPromiseArray.prototype._resolveEmptyArray = function() {
                    this._resolve(void 0 !== this._eachValues ? this._eachValues : this._initialValue);
                };
                ReductionPromiseArray.prototype.shouldCopyValues = function() {
                    return false;
                };
                ReductionPromiseArray.prototype._resolve = function(value) {
                    this._promise._resolveCallback(value);
                    this._values = null;
                };
                ReductionPromiseArray.prototype._resultCancelled = function(sender) {
                    if (sender === this._initialValue) return this._cancel();
                    if (this._isResolved()) return;
                    this._resultCancelled$();
                    this._currentCancellable instanceof Promise && this._currentCancellable.cancel();
                    this._initialValue instanceof Promise && this._initialValue.cancel();
                };
                ReductionPromiseArray.prototype._iterate = function(values) {
                    this._values = values;
                    var value;
                    var i;
                    var length = values.length;
                    if (void 0 !== this._initialValue) {
                        value = this._initialValue;
                        i = 0;
                    } else {
                        value = Promise.resolve(values[0]);
                        i = 1;
                    }
                    this._currentCancellable = value;
                    if (!value.isRejected()) for (;length > i; ++i) {
                        var ctx = {
                            accum: null,
                            value: values[i],
                            index: i,
                            length: length,
                            array: this
                        };
                        value = value._then(gotAccum, void 0, void 0, ctx, void 0);
                    }
                    void 0 !== this._eachValues && (value = value._then(this._eachComplete, void 0, void 0, this, void 0));
                    value._then(completed, completed, void 0, value, this);
                };
                Promise.prototype.reduce = function(fn, initialValue) {
                    return reduce(this, fn, initialValue, null);
                };
                Promise.reduce = function(promises, fn, initialValue, _each) {
                    return reduce(promises, fn, initialValue, _each);
                };
            };
        }, {
            "./util": 36
        } ],
        29: [ function(_dereq_, module) {
            var util = _dereq_("./util");
            var schedule;
            var noAsyncScheduler = function() {
                throw new Error("No async scheduler available\n\n    See http://goo.gl/MqrFmX\n");
            };
            var NativePromise = util.getNativePromise();
            if (util.isNode && "undefined" == typeof MutationObserver) {
                var GlobalSetImmediate = global.setImmediate;
                var ProcessNextTick = process.nextTick;
                schedule = util.isRecentNode ? function(fn) {
                    GlobalSetImmediate.call(global, fn);
                } : function(fn) {
                    ProcessNextTick.call(process, fn);
                };
            } else if ("function" == typeof NativePromise && "function" == typeof NativePromise.resolve) {
                var nativePromise = NativePromise.resolve();
                schedule = function(fn) {
                    nativePromise.then(fn);
                };
            } else schedule = "undefined" == typeof MutationObserver || "undefined" != typeof window && window.navigator && (window.navigator.standalone || window.cordova) ? "undefined" != typeof setImmediate ? function(fn) {
                setImmediate(fn);
            } : "undefined" != typeof setTimeout ? function(fn) {
                setTimeout(fn, 0);
            } : noAsyncScheduler : function() {
                var div = document.createElement("div");
                var opts = {
                    attributes: true
                };
                var toggleScheduled = false;
                var div2 = document.createElement("div");
                var o2 = new MutationObserver(function() {
                    div.classList.toggle("foo");
                    toggleScheduled = false;
                });
                o2.observe(div2, opts);
                var scheduleToggle = function() {
                    if (toggleScheduled) return;
                    toggleScheduled = true;
                    div2.classList.toggle("foo");
                };
                return function(fn) {
                    var o = new MutationObserver(function() {
                        o.disconnect();
                        fn();
                    });
                    o.observe(div, opts);
                    scheduleToggle();
                };
            }();
            module.exports = schedule;
        }, {
            "./util": 36
        } ],
        30: [ function(_dereq_, module) {
            module.exports = function(Promise, PromiseArray, debug) {
                function SettledPromiseArray(values) {
                    this.constructor$(values);
                }
                var PromiseInspection = Promise.PromiseInspection;
                var util = _dereq_("./util");
                util.inherits(SettledPromiseArray, PromiseArray);
                SettledPromiseArray.prototype._promiseResolved = function(index, inspection) {
                    this._values[index] = inspection;
                    var totalResolved = ++this._totalResolved;
                    if (totalResolved >= this._length) {
                        this._resolve(this._values);
                        return true;
                    }
                    return false;
                };
                SettledPromiseArray.prototype._promiseFulfilled = function(value, index) {
                    var ret = new PromiseInspection();
                    ret._bitField = 33554432;
                    ret._settledValueField = value;
                    return this._promiseResolved(index, ret);
                };
                SettledPromiseArray.prototype._promiseRejected = function(reason, index) {
                    var ret = new PromiseInspection();
                    ret._bitField = 16777216;
                    ret._settledValueField = reason;
                    return this._promiseResolved(index, ret);
                };
                Promise.settle = function(promises) {
                    debug.deprecated(".settle()", ".reflect()");
                    return new SettledPromiseArray(promises).promise();
                };
                Promise.prototype.settle = function() {
                    return Promise.settle(this);
                };
            };
        }, {
            "./util": 36
        } ],
        31: [ function(_dereq_, module) {
            module.exports = function(Promise, PromiseArray, apiRejection) {
                function SomePromiseArray(values) {
                    this.constructor$(values);
                    this._howMany = 0;
                    this._unwrap = false;
                    this._initialized = false;
                }
                function some(promises, howMany) {
                    if ((0 | howMany) !== howMany || 0 > howMany) return apiRejection("expecting a positive integer\n\n    See http://goo.gl/MqrFmX\n");
                    var ret = new SomePromiseArray(promises);
                    var promise = ret.promise();
                    ret.setHowMany(howMany);
                    ret.init();
                    return promise;
                }
                var util = _dereq_("./util");
                var RangeError = _dereq_("./errors").RangeError;
                var AggregateError = _dereq_("./errors").AggregateError;
                var isArray = util.isArray;
                var CANCELLATION = {};
                util.inherits(SomePromiseArray, PromiseArray);
                SomePromiseArray.prototype._init = function() {
                    if (!this._initialized) return;
                    if (0 === this._howMany) {
                        this._resolve([]);
                        return;
                    }
                    this._init$(void 0, -5);
                    var isArrayResolved = isArray(this._values);
                    !this._isResolved() && isArrayResolved && this._howMany > this._canPossiblyFulfill() && this._reject(this._getRangeError(this.length()));
                };
                SomePromiseArray.prototype.init = function() {
                    this._initialized = true;
                    this._init();
                };
                SomePromiseArray.prototype.setUnwrap = function() {
                    this._unwrap = true;
                };
                SomePromiseArray.prototype.howMany = function() {
                    return this._howMany;
                };
                SomePromiseArray.prototype.setHowMany = function(count) {
                    this._howMany = count;
                };
                SomePromiseArray.prototype._promiseFulfilled = function(value) {
                    this._addFulfilled(value);
                    if (this._fulfilled() === this.howMany()) {
                        this._values.length = this.howMany();
                        this._resolve(1 === this.howMany() && this._unwrap ? this._values[0] : this._values);
                        return true;
                    }
                    return false;
                };
                SomePromiseArray.prototype._promiseRejected = function(reason) {
                    this._addRejected(reason);
                    return this._checkOutcome();
                };
                SomePromiseArray.prototype._promiseCancelled = function() {
                    if (this._values instanceof Promise || null == this._values) return this._cancel();
                    this._addRejected(CANCELLATION);
                    return this._checkOutcome();
                };
                SomePromiseArray.prototype._checkOutcome = function() {
                    if (this.howMany() > this._canPossiblyFulfill()) {
                        var e = new AggregateError();
                        for (var i = this.length(); i < this._values.length; ++i) this._values[i] !== CANCELLATION && e.push(this._values[i]);
                        e.length > 0 ? this._reject(e) : this._cancel();
                        return true;
                    }
                    return false;
                };
                SomePromiseArray.prototype._fulfilled = function() {
                    return this._totalResolved;
                };
                SomePromiseArray.prototype._rejected = function() {
                    return this._values.length - this.length();
                };
                SomePromiseArray.prototype._addRejected = function(reason) {
                    this._values.push(reason);
                };
                SomePromiseArray.prototype._addFulfilled = function(value) {
                    this._values[this._totalResolved++] = value;
                };
                SomePromiseArray.prototype._canPossiblyFulfill = function() {
                    return this.length() - this._rejected();
                };
                SomePromiseArray.prototype._getRangeError = function(count) {
                    var message = "Input array must contain at least " + this._howMany + " items but contains only " + count + " items";
                    return new RangeError(message);
                };
                SomePromiseArray.prototype._resolveEmptyArray = function() {
                    this._reject(this._getRangeError(0));
                };
                Promise.some = function(promises, howMany) {
                    return some(promises, howMany);
                };
                Promise.prototype.some = function(howMany) {
                    return some(this, howMany);
                };
                Promise._SomePromiseArray = SomePromiseArray;
            };
        }, {
            "./errors": 12,
            "./util": 36
        } ],
        32: [ function(_dereq_, module) {
            module.exports = function(Promise) {
                function PromiseInspection(promise) {
                    if (void 0 !== promise) {
                        promise = promise._target();
                        this._bitField = promise._bitField;
                        this._settledValueField = promise._isFateSealed() ? promise._settledValue() : void 0;
                    } else {
                        this._bitField = 0;
                        this._settledValueField = void 0;
                    }
                }
                PromiseInspection.prototype._settledValue = function() {
                    return this._settledValueField;
                };
                var value = PromiseInspection.prototype.value = function() {
                    if (!this.isFulfilled()) throw new TypeError("cannot get fulfillment value of a non-fulfilled promise\n\n    See http://goo.gl/MqrFmX\n");
                    return this._settledValue();
                };
                var reason = PromiseInspection.prototype.error = PromiseInspection.prototype.reason = function() {
                    if (!this.isRejected()) throw new TypeError("cannot get rejection reason of a non-rejected promise\n\n    See http://goo.gl/MqrFmX\n");
                    return this._settledValue();
                };
                var isFulfilled = PromiseInspection.prototype.isFulfilled = function() {
                    return 0 !== (33554432 & this._bitField);
                };
                var isRejected = PromiseInspection.prototype.isRejected = function() {
                    return 0 !== (16777216 & this._bitField);
                };
                var isPending = PromiseInspection.prototype.isPending = function() {
                    return 0 === (50397184 & this._bitField);
                };
                var isResolved = PromiseInspection.prototype.isResolved = function() {
                    return 0 !== (50331648 & this._bitField);
                };
                PromiseInspection.prototype.isCancelled = function() {
                    return 0 !== (8454144 & this._bitField);
                };
                Promise.prototype.__isCancelled = function() {
                    return 65536 === (65536 & this._bitField);
                };
                Promise.prototype._isCancelled = function() {
                    return this._target().__isCancelled();
                };
                Promise.prototype.isCancelled = function() {
                    return 0 !== (8454144 & this._target()._bitField);
                };
                Promise.prototype.isPending = function() {
                    return isPending.call(this._target());
                };
                Promise.prototype.isRejected = function() {
                    return isRejected.call(this._target());
                };
                Promise.prototype.isFulfilled = function() {
                    return isFulfilled.call(this._target());
                };
                Promise.prototype.isResolved = function() {
                    return isResolved.call(this._target());
                };
                Promise.prototype.value = function() {
                    return value.call(this._target());
                };
                Promise.prototype.reason = function() {
                    var target = this._target();
                    target._unsetRejectionIsUnhandled();
                    return reason.call(target);
                };
                Promise.prototype._value = function() {
                    return this._settledValue();
                };
                Promise.prototype._reason = function() {
                    this._unsetRejectionIsUnhandled();
                    return this._settledValue();
                };
                Promise.PromiseInspection = PromiseInspection;
            };
        }, {} ],
        33: [ function(_dereq_, module) {
            module.exports = function(Promise, INTERNAL) {
                function tryConvertToPromise(obj, context) {
                    if (isObject(obj)) {
                        if (obj instanceof Promise) return obj;
                        var then = getThen(obj);
                        if (then === errorObj) {
                            context && context._pushContext();
                            var ret = Promise.reject(then.e);
                            context && context._popContext();
                            return ret;
                        }
                        if ("function" == typeof then) {
                            if (isAnyBluebirdPromise(obj)) {
                                var ret = new Promise(INTERNAL);
                                obj._then(ret._fulfill, ret._reject, void 0, ret, null);
                                return ret;
                            }
                            return doThenable(obj, then, context);
                        }
                    }
                    return obj;
                }
                function doGetThen(obj) {
                    return obj.then;
                }
                function getThen(obj) {
                    try {
                        return doGetThen(obj);
                    } catch (e) {
                        errorObj.e = e;
                        return errorObj;
                    }
                }
                function isAnyBluebirdPromise(obj) {
                    try {
                        return hasProp.call(obj, "_promise0");
                    } catch (e) {
                        return false;
                    }
                }
                function doThenable(x, then, context) {
                    function resolve(value) {
                        if (!promise) return;
                        promise._resolveCallback(value);
                        promise = null;
                    }
                    function reject(reason) {
                        if (!promise) return;
                        promise._rejectCallback(reason, synchronous, true);
                        promise = null;
                    }
                    var promise = new Promise(INTERNAL);
                    var ret = promise;
                    context && context._pushContext();
                    promise._captureStackTrace();
                    context && context._popContext();
                    var synchronous = true;
                    var result = util.tryCatch(then).call(x, resolve, reject);
                    synchronous = false;
                    if (promise && result === errorObj) {
                        promise._rejectCallback(result.e, true, true);
                        promise = null;
                    }
                    return ret;
                }
                var util = _dereq_("./util");
                var errorObj = util.errorObj;
                var isObject = util.isObject;
                var hasProp = {}.hasOwnProperty;
                return tryConvertToPromise;
            };
        }, {
            "./util": 36
        } ],
        34: [ function(_dereq_, module) {
            module.exports = function(Promise, INTERNAL, debug) {
                function HandleWrapper(handle) {
                    this.handle = handle;
                }
                function successClear(value) {
                    clearTimeout(this.handle);
                    return value;
                }
                function failureClear(reason) {
                    clearTimeout(this.handle);
                    throw reason;
                }
                var util = _dereq_("./util");
                var TimeoutError = Promise.TimeoutError;
                HandleWrapper.prototype._resultCancelled = function() {
                    clearTimeout(this.handle);
                };
                var afterValue = function(value) {
                    return delay(+this).thenReturn(value);
                };
                var delay = Promise.delay = function(ms, value) {
                    var ret;
                    var handle;
                    if (void 0 !== value) {
                        ret = Promise.resolve(value)._then(afterValue, null, null, ms, void 0);
                        debug.cancellation() && value instanceof Promise && ret._setOnCancel(value);
                    } else {
                        ret = new Promise(INTERNAL);
                        handle = setTimeout(function() {
                            ret._fulfill();
                        }, +ms);
                        debug.cancellation() && ret._setOnCancel(new HandleWrapper(handle));
                        ret._captureStackTrace();
                    }
                    ret._setAsyncGuaranteed();
                    return ret;
                };
                Promise.prototype.delay = function(ms) {
                    return delay(ms, this);
                };
                var afterTimeout = function(promise, message, parent) {
                    var err;
                    err = "string" != typeof message ? message instanceof Error ? message : new TimeoutError("operation timed out") : new TimeoutError(message);
                    util.markAsOriginatingFromRejection(err);
                    promise._attachExtraTrace(err);
                    promise._reject(err);
                    null != parent && parent.cancel();
                };
                Promise.prototype.timeout = function(ms, message) {
                    ms = +ms;
                    var ret, parent;
                    var handleWrapper = new HandleWrapper(setTimeout(function() {
                        ret.isPending() && afterTimeout(ret, message, parent);
                    }, ms));
                    if (debug.cancellation()) {
                        parent = this.then();
                        ret = parent._then(successClear, failureClear, void 0, handleWrapper, void 0);
                        ret._setOnCancel(handleWrapper);
                    } else ret = this._then(successClear, failureClear, void 0, handleWrapper, void 0);
                    return ret;
                };
            };
        }, {
            "./util": 36
        } ],
        35: [ function(_dereq_, module) {
            module.exports = function(Promise, apiRejection, tryConvertToPromise, createContext, INTERNAL, debug) {
                function thrower(e) {
                    setTimeout(function() {
                        throw e;
                    }, 0);
                }
                function castPreservingDisposable(thenable) {
                    var maybePromise = tryConvertToPromise(thenable);
                    maybePromise !== thenable && "function" == typeof thenable._isDisposable && "function" == typeof thenable._getDisposer && thenable._isDisposable() && maybePromise._setDisposable(thenable._getDisposer());
                    return maybePromise;
                }
                function dispose(resources, inspection) {
                    function iterator() {
                        if (i >= len) return ret._fulfill();
                        var maybePromise = castPreservingDisposable(resources[i++]);
                        if (maybePromise instanceof Promise && maybePromise._isDisposable()) {
                            try {
                                maybePromise = tryConvertToPromise(maybePromise._getDisposer().tryDispose(inspection), resources.promise);
                            } catch (e) {
                                return thrower(e);
                            }
                            if (maybePromise instanceof Promise) return maybePromise._then(iterator, thrower, null, null, null);
                        }
                        iterator();
                    }
                    var i = 0;
                    var len = resources.length;
                    var ret = new Promise(INTERNAL);
                    iterator();
                    return ret;
                }
                function Disposer(data, promise, context) {
                    this._data = data;
                    this._promise = promise;
                    this._context = context;
                }
                function FunctionDisposer(fn, promise, context) {
                    this.constructor$(fn, promise, context);
                }
                function maybeUnwrapDisposer(value) {
                    if (Disposer.isDisposer(value)) {
                        this.resources[this.index]._setDisposable(value);
                        return value.promise();
                    }
                    return value;
                }
                function ResourceList(length) {
                    this.length = length;
                    this.promise = null;
                    this[length - 1] = null;
                }
                var util = _dereq_("./util");
                var TypeError = _dereq_("./errors").TypeError;
                var inherits = _dereq_("./util").inherits;
                var errorObj = util.errorObj;
                var tryCatch = util.tryCatch;
                var NULL = {};
                Disposer.prototype.data = function() {
                    return this._data;
                };
                Disposer.prototype.promise = function() {
                    return this._promise;
                };
                Disposer.prototype.resource = function() {
                    if (this.promise().isFulfilled()) return this.promise().value();
                    return NULL;
                };
                Disposer.prototype.tryDispose = function(inspection) {
                    var resource = this.resource();
                    var context = this._context;
                    void 0 !== context && context._pushContext();
                    var ret = resource !== NULL ? this.doDispose(resource, inspection) : null;
                    void 0 !== context && context._popContext();
                    this._promise._unsetDisposable();
                    this._data = null;
                    return ret;
                };
                Disposer.isDisposer = function(d) {
                    return null != d && "function" == typeof d.resource && "function" == typeof d.tryDispose;
                };
                inherits(FunctionDisposer, Disposer);
                FunctionDisposer.prototype.doDispose = function(resource, inspection) {
                    var fn = this.data();
                    return fn.call(resource, resource, inspection);
                };
                ResourceList.prototype._resultCancelled = function() {
                    var len = this.length;
                    for (var i = 0; len > i; ++i) {
                        var item = this[i];
                        item instanceof Promise && item.cancel();
                    }
                };
                Promise.using = function() {
                    var len = arguments.length;
                    if (2 > len) return apiRejection("you must pass at least 2 arguments to Promise.using");
                    var fn = arguments[len - 1];
                    if ("function" != typeof fn) return apiRejection("expecting a function but got " + util.classString(fn));
                    var input;
                    var spreadArgs = true;
                    if (2 === len && Array.isArray(arguments[0])) {
                        input = arguments[0];
                        len = input.length;
                        spreadArgs = false;
                    } else {
                        input = arguments;
                        len--;
                    }
                    var resources = new ResourceList(len);
                    for (var i = 0; len > i; ++i) {
                        var resource = input[i];
                        if (Disposer.isDisposer(resource)) {
                            var disposer = resource;
                            resource = resource.promise();
                            resource._setDisposable(disposer);
                        } else {
                            var maybePromise = tryConvertToPromise(resource);
                            maybePromise instanceof Promise && (resource = maybePromise._then(maybeUnwrapDisposer, null, null, {
                                resources: resources,
                                index: i
                            }, void 0));
                        }
                        resources[i] = resource;
                    }
                    var reflectedResources = new Array(resources.length);
                    for (var i = 0; i < reflectedResources.length; ++i) reflectedResources[i] = Promise.resolve(resources[i]).reflect();
                    var resultPromise = Promise.all(reflectedResources).then(function(inspections) {
                        for (var i = 0; i < inspections.length; ++i) {
                            var inspection = inspections[i];
                            if (inspection.isRejected()) {
                                errorObj.e = inspection.error();
                                return errorObj;
                            }
                            if (!inspection.isFulfilled()) {
                                resultPromise.cancel();
                                return;
                            }
                            inspections[i] = inspection.value();
                        }
                        promise._pushContext();
                        fn = tryCatch(fn);
                        var ret = spreadArgs ? fn.apply(void 0, inspections) : fn(inspections);
                        var promiseCreated = promise._popContext();
                        debug.checkForgottenReturns(ret, promiseCreated, "Promise.using", promise);
                        return ret;
                    });
                    var promise = resultPromise.lastly(function() {
                        var inspection = new Promise.PromiseInspection(resultPromise);
                        return dispose(resources, inspection);
                    });
                    resources.promise = promise;
                    promise._setOnCancel(resources);
                    return promise;
                };
                Promise.prototype._setDisposable = function(disposer) {
                    this._bitField = 131072 | this._bitField;
                    this._disposer = disposer;
                };
                Promise.prototype._isDisposable = function() {
                    return (131072 & this._bitField) > 0;
                };
                Promise.prototype._getDisposer = function() {
                    return this._disposer;
                };
                Promise.prototype._unsetDisposable = function() {
                    this._bitField = -131073 & this._bitField;
                    this._disposer = void 0;
                };
                Promise.prototype.disposer = function(fn) {
                    if ("function" == typeof fn) return new FunctionDisposer(fn, this, createContext());
                    throw new TypeError();
                };
            };
        }, {
            "./errors": 12,
            "./util": 36
        } ],
        36: [ function(_dereq_, module, exports) {
            function tryCatcher() {
                try {
                    var target = tryCatchTarget;
                    tryCatchTarget = null;
                    return target.apply(this, arguments);
                } catch (e) {
                    errorObj.e = e;
                    return errorObj;
                }
            }
            function tryCatch(fn) {
                tryCatchTarget = fn;
                return tryCatcher;
            }
            function isPrimitive(val) {
                return null == val || true === val || false === val || "string" == typeof val || "number" == typeof val;
            }
            function isObject(value) {
                return "function" == typeof value || "object" === ("undefined" == typeof value ? "undefined" : _typeof(value)) && null !== value;
            }
            function maybeWrapAsError(maybeError) {
                if (!isPrimitive(maybeError)) return maybeError;
                return new Error(safeToString(maybeError));
            }
            function withAppended(target, appendee) {
                var len = target.length;
                var ret = new Array(len + 1);
                var i;
                for (i = 0; len > i; ++i) ret[i] = target[i];
                ret[i] = appendee;
                return ret;
            }
            function getDataPropertyOrDefault(obj, key, defaultValue) {
                if (!es5.isES5) return {}.hasOwnProperty.call(obj, key) ? obj[key] : void 0;
                var desc = Object.getOwnPropertyDescriptor(obj, key);
                if (null != desc) return null == desc.get && null == desc.set ? desc.value : defaultValue;
            }
            function notEnumerableProp(obj, name, value) {
                if (isPrimitive(obj)) return obj;
                var descriptor = {
                    value: value,
                    configurable: true,
                    enumerable: false,
                    writable: true
                };
                es5.defineProperty(obj, name, descriptor);
                return obj;
            }
            function thrower(r) {
                throw r;
            }
            function isClass(fn) {
                try {
                    if ("function" == typeof fn) {
                        var keys = es5.names(fn.prototype);
                        var hasMethods = es5.isES5 && keys.length > 1;
                        var hasMethodsOtherThanConstructor = keys.length > 0 && !(1 === keys.length && "constructor" === keys[0]);
                        var hasThisAssignmentAndStaticMethods = thisAssignmentPattern.test(fn + "") && es5.names(fn).length > 0;
                        if (hasMethods || hasMethodsOtherThanConstructor || hasThisAssignmentAndStaticMethods) return true;
                    }
                    return false;
                } catch (e) {
                    return false;
                }
            }
            function toFastProperties(obj) {
                function FakeConstructor() {}
                FakeConstructor.prototype = obj;
                var l = 8;
                while (l--) new FakeConstructor();
                return obj;
            }
            function isIdentifier(str) {
                return rident.test(str);
            }
            function filledRange(count, prefix, suffix) {
                var ret = new Array(count);
                for (var i = 0; count > i; ++i) ret[i] = prefix + i + suffix;
                return ret;
            }
            function safeToString(obj) {
                try {
                    return obj + "";
                } catch (e) {
                    return "[no string representation]";
                }
            }
            function isError(obj) {
                return null !== obj && "object" === ("undefined" == typeof obj ? "undefined" : _typeof(obj)) && "string" == typeof obj.message && "string" == typeof obj.name;
            }
            function markAsOriginatingFromRejection(e) {
                try {
                    notEnumerableProp(e, "isOperational", true);
                } catch (ignore) {}
            }
            function originatesFromRejection(e) {
                if (null == e) return false;
                return e instanceof Error["__BluebirdErrorTypes__"].OperationalError || true === e["isOperational"];
            }
            function canAttachTrace(obj) {
                return isError(obj) && es5.propertyIsWritable(obj, "stack");
            }
            function classString(obj) {
                return {}.toString.call(obj);
            }
            function copyDescriptors(from, to, filter) {
                var keys = es5.names(from);
                for (var i = 0; i < keys.length; ++i) {
                    var key = keys[i];
                    if (filter(key)) try {
                        es5.defineProperty(to, key, es5.getDescriptor(from, key));
                    } catch (ignore) {}
                }
            }
            function env(key, def) {
                return isNode ? process.env[key] : def;
            }
            function getNativePromise() {
                if ("function" == typeof Promise) try {
                    var promise = new Promise(function() {});
                    if ("[object Promise]" === {}.toString.call(promise)) return Promise;
                } catch (e) {}
            }
            function domainBind(self, cb) {
                return self.bind(cb);
            }
            var es5 = _dereq_("./es5");
            var canEvaluate = "undefined" == typeof navigator;
            var errorObj = {
                e: {}
            };
            var tryCatchTarget;
            var globalObject = "undefined" != typeof self ? self : "undefined" != typeof window ? window : "undefined" != typeof global ? global : void 0 !== this ? this : null;
            var inherits = function(Child, Parent) {
                function T() {
                    this.constructor = Child;
                    this.constructor$ = Parent;
                    for (var propertyName in Parent.prototype) hasProp.call(Parent.prototype, propertyName) && "$" !== propertyName.charAt(propertyName.length - 1) && (this[propertyName + "$"] = Parent.prototype[propertyName]);
                }
                var hasProp = {}.hasOwnProperty;
                T.prototype = Parent.prototype;
                Child.prototype = new T();
                return Child.prototype;
            };
            var inheritedDataKeys = function() {
                var excludedPrototypes = [ Array.prototype, Object.prototype, Function.prototype ];
                var isExcludedProto = function(val) {
                    for (var i = 0; i < excludedPrototypes.length; ++i) if (excludedPrototypes[i] === val) return true;
                    return false;
                };
                if (es5.isES5) {
                    var getKeys = Object.getOwnPropertyNames;
                    return function(obj) {
                        var ret = [];
                        var visitedKeys = Object.create(null);
                        while (null != obj && !isExcludedProto(obj)) {
                            var keys;
                            try {
                                keys = getKeys(obj);
                            } catch (e) {
                                return ret;
                            }
                            for (var i = 0; i < keys.length; ++i) {
                                var key = keys[i];
                                if (visitedKeys[key]) continue;
                                visitedKeys[key] = true;
                                var desc = Object.getOwnPropertyDescriptor(obj, key);
                                null != desc && null == desc.get && null == desc.set && ret.push(key);
                            }
                            obj = es5.getPrototypeOf(obj);
                        }
                        return ret;
                    };
                }
                var hasProp = {}.hasOwnProperty;
                return function(obj) {
                    if (isExcludedProto(obj)) return [];
                    var ret = [];
                    enumeration: for (var key in obj) if (hasProp.call(obj, key)) ret.push(key); else {
                        for (var i = 0; i < excludedPrototypes.length; ++i) if (hasProp.call(excludedPrototypes[i], key)) continue enumeration;
                        ret.push(key);
                    }
                    return ret;
                };
            }();
            var thisAssignmentPattern = /this\s*\.\s*\S+\s*=/;
            var rident = /^[a-z$_][a-z$_0-9]*$/i;
            var ensureErrorObject = function() {
                return "stack" in new Error() ? function(value) {
                    if (canAttachTrace(value)) return value;
                    return new Error(safeToString(value));
                } : function(value) {
                    if (canAttachTrace(value)) return value;
                    try {
                        throw new Error(safeToString(value));
                    } catch (err) {
                        return err;
                    }
                };
            }();
            var asArray = function(v) {
                if (es5.isArray(v)) return v;
                return null;
            };
            if ("undefined" != typeof Symbol && Symbol.iterator) {
                var ArrayFrom = "function" == typeof Array.from ? function(v) {
                    return Array.from(v);
                } : function(v) {
                    var ret = [];
                    var it = v[Symbol.iterator]();
                    var itResult;
                    while (!(itResult = it.next()).done) ret.push(itResult.value);
                    return ret;
                };
                asArray = function(v) {
                    if (es5.isArray(v)) return v;
                    if (null != v && "function" == typeof v[Symbol.iterator]) return ArrayFrom(v);
                    return null;
                };
            }
            var isNode = "undefined" != typeof process && "[object process]" === classString(process).toLowerCase();
            var ret = {
                isClass: isClass,
                isIdentifier: isIdentifier,
                inheritedDataKeys: inheritedDataKeys,
                getDataPropertyOrDefault: getDataPropertyOrDefault,
                thrower: thrower,
                isArray: es5.isArray,
                asArray: asArray,
                notEnumerableProp: notEnumerableProp,
                isPrimitive: isPrimitive,
                isObject: isObject,
                isError: isError,
                canEvaluate: canEvaluate,
                errorObj: errorObj,
                tryCatch: tryCatch,
                inherits: inherits,
                withAppended: withAppended,
                maybeWrapAsError: maybeWrapAsError,
                toFastProperties: toFastProperties,
                filledRange: filledRange,
                toString: safeToString,
                canAttachTrace: canAttachTrace,
                ensureErrorObject: ensureErrorObject,
                originatesFromRejection: originatesFromRejection,
                markAsOriginatingFromRejection: markAsOriginatingFromRejection,
                classString: classString,
                copyDescriptors: copyDescriptors,
                hasDevTools: "undefined" != typeof chrome && chrome && "function" == typeof chrome.loadTimes,
                isNode: isNode,
                env: env,
                global: globalObject,
                getNativePromise: getNativePromise,
                domainBind: domainBind
            };
            ret.isRecentNode = ret.isNode && function() {
                var version = process.versions.node.split(".").map(Number);
                return 0 === version[0] && version[1] > 10 || version[0] > 0;
            }();
            ret.isNode && ret.toFastProperties(process);
            try {
                throw new Error();
            } catch (e) {
                ret.lastLineError = e;
            }
            module.exports = ret;
        }, {
            "./es5": 13
        } ]
    }, {}, [ 4 ])(4);
});

"undefined" != typeof window && null !== window ? window.P = window.Promise : "undefined" != typeof self && null !== self && (self.P = self.Promise);