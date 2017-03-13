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
 * @file This is the core class for nativeloop funcationality.  
 * @module nativeloop 
 * @author Brenton House <brenton.house@gmail.com>
 * @version 1.0.0
 * @since 1.0.0
 * @copyright Copyright (c) 2017 by Superhero Studios Incorporated.  All Rights Reserved.
 * @license Licensed under the terms of the MIT License (MIT)
 * 
 */

const events = require( 'events' );
const apm = require( 'nativeloop/apm' );

var ux = {};
module.exports = ux;


ux.createfontIcon = params => {
	console.debug( "creating nativeloop.fontIcon" );
	fixFontAttributes( params );
}

ux.createImageIcon = params => {
	console.debug( "creating nativeloop.imageIcon" );
	fixFontAttributes( params );
}

ux.createText = ux.createLabel = function( params ) {
	console.debug( "creating nativeloop.label" );
	// console.error( 'params: ' + JSON.stringify( params, null, 2 ) );
	params = createDefaultParams( params );
	fixFontAttributes( params );
	fixLines( params );
	var view = Ti.UI.createLabel( params );
	ux.addEventListeners( params, view );
	return view;
}

ux.createImage = ux.createImageView = function( params ) {
	console.debug( "creating nativeloop.ImageView" );
	params = createDefaultParams( params );
	if( params.src ) {
		params.image = params.src;
	}
	var view = Ti.UI.createImageView( params );
	ux.addEventListeners( params, view );
	return view;
}

ux.createFlex = function( params ) {
	console.debug( "creating nativeloop.flex" );
	params = createDefaultParams( params );
	var controller = Alloy.createWidget( 'nativeloop', 'flex', params );
	var view = controller.getView();
	ux.addEventListeners( params, view );
	return view;

}

ux.createTile = function( params ) {
	console.debug( "creating nativeloop.tile" );
	params = createDefaultParams( params );
	var controller = Alloy.createWidget( 'nativeloop', 'tile', params );
	var view = controller.getView();
	console.error( 'params.click: ' + utils.stringify( params.click, null, 2 ) );
	ux.addEventListeners( params, view );
	return view;
}


ux.createView = function( params ) {
	params = createDefaultParams( params );
	var view = Ti.UI.createView( params );
	ux.addEventListeners( params, view );
	return view;
}

ux.createTextField = function( params ) {
	params = createDefaultParams( params );
	var view = Ti.UI.createTextField( params );
	ux.addEventListeners( params, view );
	return view;
}

var fixFontAttributes = function( params ) {
	// find any font attributes and create proper font object
	if( params && ( params.fontSize || params.fontStyle || params.fontFamily || params.fontWeight || params.textStyle ) ) {

		params.font = params.font || {};
		params.font.fontSize = params.fontSize || params.font.fontSize;
		params.font.fontStyle = params.fontStyle || params.font.fontStyle; // iOS only: 'italic' or 'normal'
		params.font.fontFamily = params.fontFamily || params.font.fontFamily;
		params.font.fontWeight = params.fontWeight || params.font.fontWeight;
		params.font.textStyle = params.textStyle || params.font.textStyle;

		delete params[ 'fontSize' ];
		delete params[ 'fontStyle' ];
		delete params[ 'fontFamily' ];
		delete params[ 'fontWeight' ];
		delete params[ 'textStyle' ];
	}
}

/**
 * @function fixLines
 * @summary Add support for lines property on iOS
 * @param {object} params - description
 * @since 1.0.0
 * @returns {object} - description
 */
var fixLines = function( params ) {
	if( OS_IOS ) {
		if( params.lines ) {
			_.defaults( params.font, {
				fontSize: "15sp"
			} );
			if( !!parseInt( params.font.fontSize ) ) {
				params.height = ( Math.floor( parseInt( params.lines ) ) * Math.floor( parseInt( params.font.fontSize ) ) * 1.333 ) + 1;
				// console.trace("setting height height to: " + params.height);
			}
		}
	}

	return params;
}


var createDefaultParams = function( params ) {
	params = _.defaults( params, {} );
	return params;
}

var known_events = [ "click", "dblclick", "doubletap", "focus", "keypressed", "longclick", "longpress", "pinch", "postlayout", "singletap", "swipe", "touchcancel", "touchend", "touchmove", "touchstart", "twofingertap", "return", "change", "blur", "focus" ];


/**
 * @function addEventListeners
 * @summary Add event listeners based on event shortcut names defined in xml or config
 * @param {object} params - Parameters used to create view
 * @param {object} view   - Ti.UI.View that will trigger events
 * @since 1.0.0
 */
ux.addEventListeners = function( params, view ) {

	var found = _.intersection( _.keys( params ), known_events );
	_.forEach( found, function( event ) {
		if( params[ event ] ) {
			var actions = params[ event ].split( "||" );
			var eventHandler;
			if( params.__navigatorId ) {
				eventHandler = Alloy.Navigators[ params.__navigatorId ] || events;
			} else {
				eventHandler = events;
			}
			_.forEach( actions, function( action ) {
				Ti.API.trace( "Adding Event Listener -- " + event + ":" + action );
				view.addEventListener( event, function( e ) {
					Ti.API.trace( "Triggering event action -- " + action );
					eventHandler.emit( action, e );
				} );

			} );
		}
	} );

	return view;

}



_.once( () => Alloy.createController = ( name, args ) => {
	var __prefix = "Alloy.createController: ";
	apm.leaveBreadcrumb( __prefix + "entering" );
	var controller = new( require( "alloy/controllers/" + name ) )( args );
	// controller.nav = _.get( args, 'params.navigator' );[]
	// controller.nav = _.get( args, 'navigator' );
	apm.leaveBreadcrumb( __prefix + "exiting" );
	return controller;
} )();

_.once( () => Alloy.createWidget = ( id, name, args ) => {
	var __prefix = "Alloy.createWidget: ";
	apm.leaveBreadcrumb( __prefix + "entering" );
	if( "undefined" != typeof name && null !== name && _.isObject( name ) && !_.isString( name ) ) {
		args = name;
		name = DEFAULT_WIDGET;
	}

	// if( args ) {
	// 	if( args.navigator ) {
	// 		args.params = args.params || {};
	// 		args.params.navigator = args.navigator;
	// 		delete args.navigator;
	// 	}
	// }

	var controller = new( require( "alloy/widgets/" + id + "/controllers/" + ( name || DEFAULT_WIDGET ) ) )( args );
	// controller.nav = _.get( args, 'navigator' );
	apm.leaveBreadcrumb( __prefix + "exiting" );
	return controller;

} )();