'use strict';

var EventEmitter = require( 'nativeloop/eventemitter2' );

var events = new EventEmitter( {
	wildcard: true,
	newListener: false,
	delimiter: '::',
	maxListeners: 20
} );

events.trigger = eventbus.emit;
events.fire = eventbus.emit;

module.exports = events;