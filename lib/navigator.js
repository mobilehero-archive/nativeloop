'use strict';
/***
 *                          __     _  __       __                     
 *       ____ ___   ____   / /_   (_)/ /___   / /_   ___   _____ ____ 
 *      / __ `__ \ / __ \ / __ \ / // // _ \ / __ \ / _ \ / ___// __ \ 
 *     / / / / / // /_/ // /_/ // // //  __// / / //  __// /   / /_/ / 
 *    /_/ /_/ /_/ \____//_.___//_//_/ \___//_/ /_/ \___//_/    \____/ 
 *                                                                    
 *                  mobile solutions for everyday heroes
 *                                                                    
 * @file This is the core class for top navigation style windows.  
 * @module nativeloop/navigator 
 * @author Brenton House <brenton.house@gmail.com>
 * @version 1.0.0
 * @since 1.0.0
 * @copyright Copyright (c) 2017 by Superhero Studios Incorporated.  All Rights Reserved.
 * @license Licensed under the terms of the MIT License (MIT)
 * 
 */


const Alloy = require( "/alloy" );
const apm = require( "nativeloop/apm" );
const utils = require( 'nativeloop/utils' );
const __modulename = __filename;
const EventEmitter = require( 'nativeloop/eventemitter2' );
// const events = require( "events" );
// const util = require( 'util' );

const Navigator = function() {
	this._isInNavigatorStack = false;
	this.controller = null;
	this._navStack = [];

	if( navigatorStack.length === 0 ) {
		navigatorStack.push( this );
		this._isInNavigatorStack = true;
	}

	//TODO:  make delimiter configurable 
	var localEvents = new EventEmitter( {
		wildcard: true,
		newListener: true,
		delimiter: '::',
		maxListeners: 20
	} );

	this.id = utils.createGuid();
	Alloy.Navigators = Alloy.Navigators || {};
	Alloy.Navigators[ this.id ] = this;

	localEvents.trigger = localEvents.emit;
	localEvents.fire = localEvents.emit;

	_.assignIn( this, localEvents );
	// util.inherits( this, localEvents );

	console.error( '_.keys(localEvents): ' + JSON.stringify( _.keysIn( localEvents ), null, 2 ) );

	console.error( '_.keys(this): ' + JSON.stringify( _.keys( this ), null, 2 ) );
	console.error( '_.keysIn(this): ' + JSON.stringify( _.keysIn( this ), null, 2 ) );

	console.error( 'localEvents.emit: ' + JSON.stringify( _.isFunction( localEvents.emit ), null, 2 ) );
	console.error( 'this.emit: ' + JSON.stringify( _.isFunction( this.emit ), null, 2 ) );

	this.on( 'newListener', e => {
		console.error( 'you are here → newListener event fired: ' + JSON.stringify( e, null, 2 ) );
	} );

	this.onAny( function( event, value ) {
		console.log( 'All events trigger this.' );
		console.error( 'event: ' + JSON.stringify( event, null, 2 ) );
		console.error( 'value: ' + JSON.stringify( value, null, 2 ) );
	} );


	this.on( "nav::open::**", ( e, args ) => {
		var __prefix = __modulename + " nav::open::** ";
		apm.leaveBreadcrumb( __prefix + "entering" );
		var commands = parseEventHorizon( this.event, args );
		if( commands.length < 3 ) {
			console.error( "[frame] Attempted to call nav::open with no target" );
			apm.leaveBreadcrumb( __prefix + "exiting" );
			__prefix = null;
			return;
		}
		this.push( commands[ 2 ], commands[ 3 ] || args );
		apm.leaveBreadcrumb( __prefix + "exiting" );
		__prefix = null;
	} );

	// events.on( "nav::open::*", function() {
	// 	var __prefix = __modulename + "nav::open::* ";
	// 	apm.leaveBreadcrumb( __prefix + "entering" );
	// 	console.info( "event = " + this.event );
	// 	var split = this.event.split( "::" );
	// 	split.length > 2 && Navigator.topmost().go( split[ 2 ] );
	// 	apm.leaveBreadcrumb( __prefix + "exiting" );
	// 	__prefix = null;
	// } );

	this.on( "nav::back", () => {
		var __prefix = __modulename + " nav::back ";
		apm.leaveBreadcrumb( __prefix + "entering" );
		console.info( "event = " + this.event );
		// Navigator.topmost().goBack();
		this.goBack();
		apm.leaveBreadcrumb( __prefix + "exiting" );
		__prefix = null;
	} );

	this.on( "nav::*", () => {
		var __prefix = __modulename + " nav::* ";
		apm.leaveBreadcrumb( __prefix + "entering" );
		console.info( "nav event = " + this.event );
		apm.leaveBreadcrumb( __prefix + "exiting" );
		__prefix = null;
	} );

	this.actionHandler = e => {
		var __prefix = __modulename + ".actionHandler: ";
		apm.leaveBreadcrumb( __prefix + "entering" );
		var eventName;
		console.error( 'e: ' + JSON.stringify( e, null, 2 ) );
		console.error( 'e.type: ' + JSON.stringify( e.type, null, 2 ) );
		console.error( ' e.section.items[ e.itemIndex ]: ' + JSON.stringify( e.section.items[ e.itemIndex ], null, 2 ) );
		if( e.section && !_.isNil( e.itemIndex ) ) {
			eventName = e.section.items[ e.itemIndex ].properties[ e.type ];
			if( eventName ) {
				Ti.API.trace( "actionHandler: Triggering event - " + eventName );
				// console.error("listener count: " + Alloy.Globals.Events.listeners(event_name).length);
				this.emit( eventName, e );
			}

			return;
		}
		if( !e || !e.source || !e.source[ e.type ] ) {

			console.error( "no context available for ActionHandler" );
			return;
		}
		if( e && e.source && e.source[ e.type ] ) {
			eventName = e.source[ e.type ];
			Ti.API.trace( "actionHandler: Triggering event - " + eventName );
			// console.error("listener count: " + Alloy.Globals.Events.listeners(event_name).length);
			this.trigger( eventName, e );
		} else if( e && e.source && e.source.collection_name && e.type === "change" ) {
			eventName = e.source.collection_name + "::change";
			apm.leaveBreadcrumb( __prefix + "Triggering event - " + event_name );
			// console.error("listener count: " + Alloy.Globals.Events.listeners(event_name).length);
			this.trigger( eventName, e );
		}
		apm.leaveBreadcrumb( __prefix + "exiting" );
		__prefix = null;
	};

};

// var localEvents = new EventEmitter( {
// 	wildcard: true,
// 	newListener: false,
// 	delimiter: '::',
// 	maxListeners: 20
// } );

// localEvents.trigger = localEvents.emit;
// localEvents.fire = localEvents.emit;

// Navigator.prototype = Object.create( localEvents.prototype );

module.exports = Navigator;

var navigatorStack = [];

var resolvePayload = function( payload, params ) {
	var __prefix = __modulename + ".resolvePayload: ";
	apm.leaveBreadcrumb( __prefix + "entering" );
	_.isNil( payload ) ? payload = {} : _.isString( payload ) && ( payload = {
		moduleName: payload
	} );
	_.isObject( params ) && _.defaults( payload, params );
	_.defaults( payload, {
		animated: true
	} );
	apm.leaveBreadcrumb( __prefix + "exiting" );
	__prefix = null;
	return payload;
};

var parseEventHorizon = function( event ) {
	var __prefix = __modulename + ".parseEventHorizon: ";
	apm.leaveBreadcrumb( __prefix + "entering" );
	console.info( "event = " + event );
	var params = event.split( "::" );
	var response = [];
	_.forEach( params, function( param ) {
		if( _.includes( param, ":" ) ) {
			var obj = {};
			_.forEach( param.split( "," ), function( prop ) {
				var a = prop.split( ":" );
				a.length > 1 && _.set( obj, a[ 0 ], a[ 1 ] );
			} );
			response.push( obj );
		} else response.push( param );
	} );
	apm.leaveBreadcrumb( __prefix + "exiting" );
	__prefix = null;
	return response;
};

Navigator.prototype.canGoBack = function() {
	var __prefix = __modulename + ".canGoBack: ";
	apm.leaveBreadcrumb( __prefix + "entering" );
	return this._navStack.length > 0;
};

/**
 * Navigates to the previous entry in the navigation stack
 * @function goBack
 */
Navigator.prototype.goBack = function() {
	var __prefix = __modulename + ".goBack: ";
	apm.leaveBreadcrumb( __prefix + "entering" );
	if( !this.canGoBack() ) {
		apm.leaveBreadcrumb( __prefix + "exiting" );
		return;
	}
	var previous_window = this._navStack.pop();
	this.controller && this.controller.goBack( {
		window: previous_window,
		options: {}
	} );
	apm.leaveBreadcrumb( __prefix + "exiting" );
	__prefix = null;
};

Navigator.prototype.goHome = function() {
	var __prefix = __modulename + ".goHome: ";
	apm.leaveBreadcrumb( __prefix + "entering" );
	if( !this.canGoBack() ) {
		apm.leaveBreadcrumb( __prefix + "exiting" );
		__prefix = null;
		return;
	}
	this._navStack.pop();
	this.controller && this.controller.goHome( {
		options: {}
	} );
	apm.leaveBreadcrumb( __prefix + "exiting" );
	__prefix = null;
};

Navigator.prototype.go = function( payload, params ) {
	var __prefix = __modulename + ".go: ";
	apm.leaveBreadcrumb( __prefix + "entering" );
	apm.leaveBreadcrumb( __prefix + "payload: " + JSON.stringify( payload, params ) );
	if( !this._isInNavigatorStack ) {
		navigatorStack.push( this );
		this._isInNavigatorStack = true;
	}
	this.performNavigation( resolvePayload( payload, params ) );
	apm.leaveBreadcrumb( __prefix + ".exiting" );
	__prefix = null;
};


/**
 * @function push
 * @param {object} params - screen parameters
 * @param {string} params.title - title of the screen as appears in the nav bar (optional)
 * @param {object} params.navigatorStyle - override the navigator style for the tab screen
 * @param {object} params.navigatorButtons - override the nav buttons for the tab screen
 * @param {object[]} params.navigatorButtons.leftButtons - override the left nav buttons for the tab screen
 * @param {string} params.navigatorButtons.leftButtons[].title - title for the left nav button
 * @param {string} params.navigatorButtons.leftButtons[].id - id for this button
 * @param {boolean} [params.navigatorButtons.leftButtons[].disabled=false] - used to disable the button (optional)
 * @param {string} [params.navigatorButtons.leftButtons[].image] - local image asset name to use for button (optional)
 * @param {string} [params.navigatorButtons.leftButtons[].icon] - local icon name to use for button (optional)
 * @param {object[]} params.navigatorButtons.rightButtons - override the right nav buttons for the tab screen
 * @param {object[]} params.navigatorButtons.rightButtons[].title - title for the right nav button
 * @param {string} params.navigatorButtons.rightButtons[].id - id for this button
 * @param {boolean} [params.navigatorButtons.rightButtons[].disabled=false] - used to disable the button (optional)
 * @param {string} [params.navigatorButtons.rightButtons[].image] - local image asset name to use for button (optional)
 * @param {string} [params.navigatorButtons.rightButtons[].icon] - local icon name to use for button (optional)
 * @param {object} [params.passProps] - simple serializable object that will pass as props to all top screens (optional)

 */
Navigator.prototype.push = function( params ) {
	var __prefix = __modulename + ".push: ";
	apm.leaveBreadcrumb( __prefix + "entering" );
	apm.leaveBreadcrumb( __prefix + "params: " + JSON.stringify( params, null, 2 ) );
	if( !this._isInNavigatorStack ) {
		navigatorStack.push( this );
		this._isInNavigatorStack = true;
	}

	if( _.isString( params ) ) {
		params = { screen: { name: params } }
	} else if( _.isString( params.screen ) ) {
		params.screen = { name: params }
	}

	// params.navigator = this;
	params.__navigatorId = this.id;

	this._navStack.push( params );
	if( this.controller ) this.controller.push( params );
	else {
		this.controller = Alloy.createWidget( "nativeloop", "navigator", params );
		// this.controller.getView().open();
	}
	apm.leaveBreadcrumb( __prefix + ".exiting" );
	__prefix = null;
};

// Navigator.prototype.performNavigation2 = function( params ) {
// 	var __prefix = __modulename + ".performNavigation2: ";
// 	apm.leaveBreadcrumb( __prefix + "entering" );
// 	console.error( 'params: ' + JSON.stringify( params, null, 2 ) );
// 	this._navStack.push( params );
// 	if( this.controller ) this.controller.push( params );
// 	else {
// 		this.controller = Alloy.createWidget( "nativeloop", "navigator", {
// 			root: params
// 		} );
// 		// this.controller.getView().open();
// 	}
// 	apm.leaveBreadcrumb( __prefix + "exiting" );
// 	__prefix = null;
// };


Navigator.prototype.performNavigation = function( payload ) {
	var __prefix = __modulename + ".performNavigation: ";
	apm.leaveBreadcrumb( __prefix + "entering" );
	console.error( 'payload: ' + JSON.stringify( payload, null, 2 ) );
	this._navStack.push( payload );
	if( this.controller ) this.controller.go( payload );
	else {
		this.controller = Alloy.createWidget( "nativeloop", "navigator", {
			root: payload
		} );
		// this.controller.getView().open();
	}
	apm.leaveBreadcrumb( __prefix + "exiting" );
	__prefix = null;
};

Navigator.topmost = function() {
	var __prefix = __modulename + ".topmost: ";
	apm.leaveBreadcrumb( __prefix + "entering" );
	if( navigatorStack.length > 0 ) {
		apm.leaveBreadcrumb( __prefix + "exiting - returning topmost navigator" );
		var topmost = navigatorStack[ navigatorStack.length - 1 ];
		return topmost;
	}
	apm.leaveBreadcrumb( __prefix + "exiting - no navigators found" );
	__prefix = null;
	return void 0;
};

// Navigator.prototype.actionHandler = function( e ) {
// 	var __prefix = __modulename + ".actionHandler: ";
// 	apm.leaveBreadcrumb( __prefix + "entering" );
// 	var eventName;
// 	console.error( 'e: ' + JSON.stringify( e, null, 2 ) );
// 	console.error( 'e.type: ' + JSON.stringify( e.type, null, 2 ) );
// 	console.error( ' e.section.items[ e.itemIndex ]: ' + JSON.stringify( e.section.items[ e.itemIndex ], null, 2 ) );
// 	if( e.section && !_.isNil( e.itemIndex ) ) {
// 		eventName = e.section.items[ e.itemIndex ].properties[ e.type ];
// 		if( eventName ) {
// 			Ti.API.trace( "actionHandler: Triggering event - " + eventName );
// 			// console.error("listener count: " + Alloy.Globals.Events.listeners(event_name).length);
// 			this.trigger( eventName, e );
// 		}

// 		return;
// 	}
// 	if( !e || !e.source || !e.source[ e.type ] ) {

// 		console.error( "no context available for ActionHandler" );
// 		return;
// 	}
// 	if( e && e.source && e.source[ e.type ] ) {
// 		eventName = e.source[ e.type ];
// 		Ti.API.trace( "actionHandler: Triggering event - " + eventName );
// 		// console.error("listener count: " + Alloy.Globals.Events.listeners(event_name).length);
// 		this.trigger( eventName, e );
// 	} else if( e && e.source && e.source.collection_name && e.type === "change" ) {
// 		eventName = e.source.collection_name + "::change";
// 		apm.leaveBreadcrumb( __prefix + "Triggering event - " + event_name );
// 		// console.error("listener count: " + Alloy.Globals.Events.listeners(event_name).length);
// 		this.trigger( eventName, e );
// 	}
// 	apm.leaveBreadcrumb( __prefix + "exiting" );
// 	__prefix = null;
// };


// Navigator.prototype.on( "nav::open::**", function( e, args ) {
// 	var __prefix = __modulename + " nav::open::** ";
// 	apm.leaveBreadcrumb( __prefix + "entering" );
// 	var commands = parseEventHorizon( this.event, args );
// 	if( commands.length < 3 ) {
// 		console.error( "[frame] Attempted to call nav::open with no target" );
// 		apm.leaveBreadcrumb( __prefix + "exiting" );
// 		__prefix = null;
// 		return;
// 	}
// 	this.push( commands[ 2 ], commands[ 3 ] || args );
// 	apm.leaveBreadcrumb( __prefix + "exiting" );
// 	__prefix = null;
// } );

// // events.on( "nav::open::*", function() {
// // 	var __prefix = __modulename + "nav::open::* ";
// // 	apm.leaveBreadcrumb( __prefix + "entering" );
// // 	console.info( "event = " + this.event );
// // 	var split = this.event.split( "::" );
// // 	split.length > 2 && Navigator.topmost().go( split[ 2 ] );
// // 	apm.leaveBreadcrumb( __prefix + "exiting" );
// // 	__prefix = null;
// // } );

// Navigator.prototype.on( "nav::back", function() {
// 	var __prefix = __modulename + " nav::back ";
// 	apm.leaveBreadcrumb( __prefix + "entering" );
// 	console.info( "event = " + this.event );
// 	// Navigator.topmost().goBack();
// 	this.goBack();
// 	apm.leaveBreadcrumb( __prefix + "exiting" );
// 	__prefix = null;
// } );

// Navigator.prototype.on( "nav::*", function() {
// 	var __prefix = __modulename + " nav::* ";
// 	apm.leaveBreadcrumb( __prefix + "entering" );
// 	console.info( "nav event = " + this.event );
// 	apm.leaveBreadcrumb( __prefix + "exiting" );
// 	__prefix = null;
// } );