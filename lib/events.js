"use strict";

var EventEmitter = require( "nativeloop/eventemitter2" );

// console.error("__filename: " + __filename);

// console.error("__dirname: " + __dirname);

var events = new EventEmitter( {
	wildcard: true,
	newListener: false,
	delimiter: "::",
	maxListeners: 20
} );

module.exports = events;