'use strict';

function noop() {}

var process = module.exports = {};

process.nextTick = function() {
	var canSetImmediate = "undefined" != typeof window && window.setImmediate;
	var canMutationObserver = "undefined" != typeof window && window.MutationObserver;
	var canPost = "undefined" != typeof window && window.postMessage && window.addEventListener;
	if( canSetImmediate ) return function( f ) {
		return window.setImmediate( f );
	};
	var queue = [];
	if( canMutationObserver ) {
		var hiddenDiv = document.createElement( "div" );
		var observer = new MutationObserver( function() {
			var queueList = queue.slice();
			queue.length = 0;
			queueList.forEach( function( fn ) {
				fn();
			} );
		} );
		observer.observe( hiddenDiv, {
			attributes: true
		} );
		return function( fn ) {
			queue.length || hiddenDiv.setAttribute( "yes", "no" );
			queue.push( fn );
		};
	}
	if( canPost ) {
		window.addEventListener( "message", function( ev ) {
			var source = ev.source;
			if( ( source === window || null === source ) && "process-tick" === ev.data ) {
				ev.stopPropagation();
				if( queue.length > 0 ) {
					var fn = queue.shift();
					fn();
				}
			}
		}, true );
		return function( fn ) {
			queue.push( fn );
			window.postMessage( "process-tick", "*" );
		};
	}
	return function( fn ) {
		setTimeout( fn, 0 );
	};
}();

process.title = "browser";

process.browser = true;

process.env = {};

process.argv = [];

process.on = noop;

process.addListener = noop;

process.once = noop;

process.off = noop;

process.removeListener = noop;

process.removeAllListeners = noop;

process.emit = noop;

process.binding = function() {
	throw new Error( "process.binding is not supported" );
};

process.cwd = function() {
	return "/";
};

process.chdir = function() {
	throw new Error( "process.chdir is not supported" );
};