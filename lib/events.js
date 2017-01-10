'use strict';

var EventEmitter = require( 'nativeloop/eventemitter2' );

//TODO:  make delimiter configurable 

var events = new EventEmitter( {
	wildcard: true,
	newListener: false,
	delimiter: '::',
	maxListeners: 20
} );

events.trigger = events.emit;
events.fire = events.emit;

module.exports = events;