"use strict";

var _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj) {
    return typeof obj;
} : function(obj) {
    return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};

!function(undefined) {
    function init() {
        this._events = {};
        this._conf && configure.call(this, this._conf);
    }
    function configure(conf) {
        if (conf) {
            this._conf = conf;
            conf.delimiter && (this.delimiter = conf.delimiter);
            this._events.maxListeners = conf.maxListeners !== undefined ? conf.maxListeners : defaultMaxListeners;
            conf.wildcard && (this.wildcard = conf.wildcard);
            conf.newListener && (this.newListener = conf.newListener);
            this.wildcard && (this.listenerTree = {});
        } else this._events.maxListeners = defaultMaxListeners;
    }
    function logPossibleMemoryLeak(count) {
        console.error("(node) warning: possible EventEmitter memory leak detected. %d listeners added. Use emitter.setMaxListeners() to increase limit.", count);
        console.trace && console.trace();
    }
    function EventEmitter(conf) {
        this._events = {};
        this.newListener = false;
        configure.call(this, conf);
    }
    function searchListenerTree(handlers, type, tree, i) {
        if (!tree) return [];
        var leaf, len, branch, xTree, xxTree, isolatedBranch, endReached, listeners = [], typeLength = type.length, currentType = type[i], nextType = type[i + 1];
        if (i === typeLength && tree._listeners) {
            if ("function" == typeof tree._listeners) {
                handlers && handlers.push(tree._listeners);
                return [ tree ];
            }
            for (leaf = 0, len = tree._listeners.length; len > leaf; leaf++) handlers && handlers.push(tree._listeners[leaf]);
            return [ tree ];
        }
        if ("*" === currentType || "**" === currentType || tree[currentType]) {
            if ("*" === currentType) {
                for (branch in tree) "_listeners" !== branch && tree.hasOwnProperty(branch) && (listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], i + 1)));
                return listeners;
            }
            if ("**" === currentType) {
                endReached = i + 1 === typeLength || i + 2 === typeLength && "*" === nextType;
                endReached && tree._listeners && (listeners = listeners.concat(searchListenerTree(handlers, type, tree, typeLength)));
                for (branch in tree) if ("_listeners" !== branch && tree.hasOwnProperty(branch)) if ("*" === branch || "**" === branch) {
                    tree[branch]._listeners && !endReached && (listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], typeLength)));
                    listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], i));
                } else listeners = listeners.concat(branch === nextType ? searchListenerTree(handlers, type, tree[branch], i + 2) : searchListenerTree(handlers, type, tree[branch], i));
                return listeners;
            }
            listeners = listeners.concat(searchListenerTree(handlers, type, tree[currentType], i + 1));
        }
        xTree = tree["*"];
        xTree && searchListenerTree(handlers, type, xTree, i + 1);
        xxTree = tree["**"];
        if (xxTree) if (typeLength > i) {
            xxTree._listeners && searchListenerTree(handlers, type, xxTree, typeLength);
            for (branch in xxTree) if ("_listeners" !== branch && xxTree.hasOwnProperty(branch)) if (branch === nextType) searchListenerTree(handlers, type, xxTree[branch], i + 2); else if (branch === currentType) searchListenerTree(handlers, type, xxTree[branch], i + 1); else {
                isolatedBranch = {};
                isolatedBranch[branch] = xxTree[branch];
                searchListenerTree(handlers, type, {
                    "**": isolatedBranch
                }, i + 1);
            }
        } else xxTree._listeners ? searchListenerTree(handlers, type, xxTree, typeLength) : xxTree["*"] && xxTree["*"]._listeners && searchListenerTree(handlers, type, xxTree["*"], typeLength);
        return listeners;
    }
    function growListenerTree(type, listener) {
        type = "string" == typeof type ? type.split(this.delimiter) : type.slice();
        for (var i = 0, len = type.length; len > i + 1; i++) if ("**" === type[i] && "**" === type[i + 1]) return;
        var tree = this.listenerTree;
        var name = type.shift();
        while (name !== undefined) {
            tree[name] || (tree[name] = {});
            tree = tree[name];
            if (0 === type.length) {
                if (tree._listeners) {
                    "function" == typeof tree._listeners && (tree._listeners = [ tree._listeners ]);
                    tree._listeners.push(listener);
                    if (!tree._listeners.warned && this._events.maxListeners > 0 && tree._listeners.length > this._events.maxListeners) {
                        tree._listeners.warned = true;
                        logPossibleMemoryLeak(tree._listeners.length);
                    }
                } else tree._listeners = listener;
                return true;
            }
            name = type.shift();
        }
        return true;
    }
    var isArray = Array.isArray ? Array.isArray : function(obj) {
        return "[object Array]" === Object.prototype.toString.call(obj);
    };
    var defaultMaxListeners = 10;
    EventEmitter.EventEmitter2 = EventEmitter;
    EventEmitter.prototype.delimiter = ".";
    EventEmitter.prototype.setMaxListeners = function(n) {
        if (n !== undefined) {
            this._events || init.call(this);
            this._events.maxListeners = n;
            this._conf || (this._conf = {});
            this._conf.maxListeners = n;
        }
    };
    EventEmitter.prototype.event = "";
    EventEmitter.prototype.once = function(event, fn) {
        this.many(event, 1, fn);
        return this;
    };
    EventEmitter.prototype.many = function(event, ttl, fn) {
        function listener() {
            0 === --ttl && self.off(event, listener);
            fn.apply(this, arguments);
        }
        var self = this;
        if ("function" != typeof fn) throw new Error("many only accepts instances of Function");
        listener._origin = fn;
        this.on(event, listener);
        return self;
    };
    EventEmitter.prototype.emit = function() {
        this._events || init.call(this);
        var type = arguments[0];
        if ("newListener" === type && !this.newListener && !this._events.newListener) return false;
        var al = arguments.length;
        var args, l, i, j;
        var handler;
        if (this._all && this._all.length) {
            handler = this._all.slice();
            if (al > 3) {
                args = new Array(al);
                for (j = 0; al > j; j++) args[j] = arguments[j];
            }
            for (i = 0, l = handler.length; l > i; i++) {
                this.event = type;
                switch (al) {
                  case 1:
                    handler[i].call(this, type);
                    break;

                  case 2:
                    handler[i].call(this, type, arguments[1]);
                    break;

                  case 3:
                    handler[i].call(this, type, arguments[1], arguments[2]);
                    break;

                  default:
                    handler[i].apply(this, args);
                }
            }
        }
        if (this.wildcard) {
            handler = [];
            var ns = "string" == typeof type ? type.split(this.delimiter) : type.slice();
            searchListenerTree.call(this, handler, ns, this.listenerTree, 0);
        } else {
            handler = this._events[type];
            if ("function" == typeof handler) {
                this.event = type;
                switch (al) {
                  case 1:
                    handler.call(this);
                    break;

                  case 2:
                    handler.call(this, arguments[1]);
                    break;

                  case 3:
                    handler.call(this, arguments[1], arguments[2]);
                    break;

                  default:
                    args = new Array(al - 1);
                    for (j = 1; al > j; j++) args[j - 1] = arguments[j];
                    handler.apply(this, args);
                }
                return true;
            }
            handler && (handler = handler.slice());
        }
        if (handler && handler.length) {
            if (al > 3) {
                args = new Array(al - 1);
                for (j = 1; al > j; j++) args[j - 1] = arguments[j];
            }
            for (i = 0, l = handler.length; l > i; i++) {
                this.event = type;
                switch (al) {
                  case 1:
                    handler[i].call(this);
                    break;

                  case 2:
                    handler[i].call(this, arguments[1]);
                    break;

                  case 3:
                    handler[i].call(this, arguments[1], arguments[2]);
                    break;

                  default:
                    handler[i].apply(this, args);
                }
            }
            return true;
        }
        if (!this._all && "error" === type) throw arguments[1] instanceof Error ? arguments[1] : new Error("Uncaught, unspecified 'error' event.");
        return !!this._all;
    };
    EventEmitter.prototype.emitAsync = function() {
        this._events || init.call(this);
        var type = arguments[0];
        if ("newListener" === type && !this.newListener && !this._events.newListener) return Promise.resolve([ false ]);
        var promises = [];
        var al = arguments.length;
        var args, l, i, j;
        var handler;
        if (this._all) {
            if (al > 3) {
                args = new Array(al);
                for (j = 1; al > j; j++) args[j] = arguments[j];
            }
            for (i = 0, l = this._all.length; l > i; i++) {
                this.event = type;
                switch (al) {
                  case 1:
                    promises.push(this._all[i].call(this, type));
                    break;

                  case 2:
                    promises.push(this._all[i].call(this, type, arguments[1]));
                    break;

                  case 3:
                    promises.push(this._all[i].call(this, type, arguments[1], arguments[2]));
                    break;

                  default:
                    promises.push(this._all[i].apply(this, args));
                }
            }
        }
        if (this.wildcard) {
            handler = [];
            var ns = "string" == typeof type ? type.split(this.delimiter) : type.slice();
            searchListenerTree.call(this, handler, ns, this.listenerTree, 0);
        } else handler = this._events[type];
        if ("function" == typeof handler) {
            this.event = type;
            switch (al) {
              case 1:
                promises.push(handler.call(this));
                break;

              case 2:
                promises.push(handler.call(this, arguments[1]));
                break;

              case 3:
                promises.push(handler.call(this, arguments[1], arguments[2]));
                break;

              default:
                args = new Array(al - 1);
                for (j = 1; al > j; j++) args[j - 1] = arguments[j];
                promises.push(handler.apply(this, args));
            }
        } else if (handler && handler.length) {
            if (al > 3) {
                args = new Array(al - 1);
                for (j = 1; al > j; j++) args[j - 1] = arguments[j];
            }
            for (i = 0, l = handler.length; l > i; i++) {
                this.event = type;
                switch (al) {
                  case 1:
                    promises.push(handler[i].call(this));
                    break;

                  case 2:
                    promises.push(handler[i].call(this, arguments[1]));
                    break;

                  case 3:
                    promises.push(handler[i].call(this, arguments[1], arguments[2]));
                    break;

                  default:
                    promises.push(handler[i].apply(this, args));
                }
            }
        } else if (!this._all && "error" === type) return Promise.reject(arguments[1] instanceof Error ? arguments[1] : "Uncaught, unspecified 'error' event.");
        return Promise.all(promises);
    };
    EventEmitter.prototype.on = function(type, listener) {
        if ("function" == typeof type) {
            this.onAny(type);
            return this;
        }
        if ("function" != typeof listener) throw new Error("on only accepts instances of Function");
        this._events || init.call(this);
        this.emit("newListener", type, listener);
        if (this.wildcard) {
            growListenerTree.call(this, type, listener);
            return this;
        }
        if (this._events[type]) {
            "function" == typeof this._events[type] && (this._events[type] = [ this._events[type] ]);
            this._events[type].push(listener);
            if (!this._events[type].warned && this._events.maxListeners > 0 && this._events[type].length > this._events.maxListeners) {
                this._events[type].warned = true;
                logPossibleMemoryLeak(this._events[type].length);
            }
        } else this._events[type] = listener;
        return this;
    };
    EventEmitter.prototype.onAny = function(fn) {
        if ("function" != typeof fn) throw new Error("onAny only accepts instances of Function");
        this._all || (this._all = []);
        this._all.push(fn);
        return this;
    };
    EventEmitter.prototype.addListener = EventEmitter.prototype.on;
    EventEmitter.prototype.off = function(type, listener) {
        function recursivelyGarbageCollect(root) {
            if (root === undefined) return;
            var keys = Object.keys(root);
            for (var i in keys) {
                var key = keys[i];
                var obj = root[key];
                if (obj instanceof Function || "object" !== ("undefined" == typeof obj ? "undefined" : _typeof(obj)) || null === obj) continue;
                Object.keys(obj).length > 0 && recursivelyGarbageCollect(root[key]);
                0 === Object.keys(obj).length && delete root[key];
            }
        }
        if ("function" != typeof listener) throw new Error("removeListener only takes instances of Function");
        var handlers, leafs = [];
        if (this.wildcard) {
            var ns = "string" == typeof type ? type.split(this.delimiter) : type.slice();
            leafs = searchListenerTree.call(this, null, ns, this.listenerTree, 0);
        } else {
            if (!this._events[type]) return this;
            handlers = this._events[type];
            leafs.push({
                _listeners: handlers
            });
        }
        for (var iLeaf = 0; iLeaf < leafs.length; iLeaf++) {
            var leaf = leafs[iLeaf];
            handlers = leaf._listeners;
            if (isArray(handlers)) {
                var position = -1;
                for (var i = 0, length = handlers.length; length > i; i++) if (handlers[i] === listener || handlers[i].listener && handlers[i].listener === listener || handlers[i]._origin && handlers[i]._origin === listener) {
                    position = i;
                    break;
                }
                if (0 > position) continue;
                this.wildcard ? leaf._listeners.splice(position, 1) : this._events[type].splice(position, 1);
                0 === handlers.length && (this.wildcard ? delete leaf._listeners : delete this._events[type]);
                this.emit("removeListener", type, listener);
                return this;
            }
            if (handlers === listener || handlers.listener && handlers.listener === listener || handlers._origin && handlers._origin === listener) {
                this.wildcard ? delete leaf._listeners : delete this._events[type];
                this.emit("removeListener", type, listener);
            }
        }
        recursivelyGarbageCollect(this.listenerTree);
        return this;
    };
    EventEmitter.prototype.offAny = function(fn) {
        var fns, i = 0, l = 0;
        if (fn && this._all && this._all.length > 0) {
            fns = this._all;
            for (i = 0, l = fns.length; l > i; i++) if (fn === fns[i]) {
                fns.splice(i, 1);
                this.emit("removeListenerAny", fn);
                return this;
            }
        } else {
            fns = this._all;
            for (i = 0, l = fns.length; l > i; i++) this.emit("removeListenerAny", fns[i]);
            this._all = [];
        }
        return this;
    };
    EventEmitter.prototype.removeListener = EventEmitter.prototype.off;
    EventEmitter.prototype.removeAllListeners = function(type) {
        if (0 === arguments.length) {
            !this._events || init.call(this);
            return this;
        }
        if (this.wildcard) {
            var ns = "string" == typeof type ? type.split(this.delimiter) : type.slice();
            var leafs = searchListenerTree.call(this, null, ns, this.listenerTree, 0);
            for (var iLeaf = 0; iLeaf < leafs.length; iLeaf++) {
                var leaf = leafs[iLeaf];
                leaf._listeners = null;
            }
        } else this._events && (this._events[type] = null);
        return this;
    };
    EventEmitter.prototype.listeners = function(type) {
        if (this.wildcard) {
            var handlers = [];
            var ns = "string" == typeof type ? type.split(this.delimiter) : type.slice();
            searchListenerTree.call(this, handlers, ns, this.listenerTree, 0);
            return handlers;
        }
        this._events || init.call(this);
        this._events[type] || (this._events[type] = []);
        isArray(this._events[type]) || (this._events[type] = [ this._events[type] ]);
        return this._events[type];
    };
    EventEmitter.prototype.listenerCount = function(type) {
        return this.listeners(type).length;
    };
    EventEmitter.prototype.listenersAny = function() {
        return this._all ? this._all : [];
    };
    "function" == typeof define && define.amd ? define(function() {
        return EventEmitter;
    }) : "object" === ("undefined" == typeof exports ? "undefined" : _typeof(exports)) ? module.exports = EventEmitter : window.EventEmitter2 = EventEmitter;
}();