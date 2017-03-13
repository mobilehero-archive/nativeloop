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
 * @file This is the Alloy controller for managing groups of tiles.  
 * @module nativeloop/controllers/flex 
 * @author Brenton House <brenton.house@gmail.com>
 * @version 1.0.0
 * @since 1.0.0
 * @copyright Copyright (c) 2017 by Superhero Studios Incorporated.  All Rights Reserved.
 * @license Licensed under the terms of the MIT License (MIT)
 * 
 */


const utils = require( 'nativeloop/utils' );
const device = require( 'nativeloop/device' );

// console.warn( '[tiles] $.args: ' + JSON.stringify( $.args, null, 2 ) );

// We can't handle 'fill' yet as we need actual widths.
//TODO:  add support for Ti.UI.FILL (with postlayout?)
if( $.args.width === Ti.UI.FILL ) {
	$.args.width = device.width;
}

_.defaults( $.args, {
	width: device.width,
	height: Ti.UI.FILL,
} );

// Find the actual width if a percentage was passed in.
$.args.width = utils.parsePercentage( $.args.width );

// convert margin/padding into objects
let margin = utils.parsePadding( $.args.margin, $.args.width );
let padding = utils.parsePadding( $.args.padding, $.args.width );

// console.error( '[flex] $.args: ' + JSON.stringify( $.args, null, 2 ) );

_.forEach( $.args.children, child => {

	let childArgs = $.args.child || {};
	_.defaults( childArgs, {
		width: ( ( $.args.width / 12 ) * ( childArgs.flexWidth || childArgs.flexSize || childArgs.size || 0 ) ),
		height: ( ( $.args.width / 12 ) * ( childArgs.flexHeight || childArgs.flexSize || childArgs.size || 0 ) ),
	} );


	child.applyDefaults( childArgs );

	$._wrapper.add( child.getView() );

} );

let wrapperArgs = _.assignIn( _.pick( $.args, [ 'height', 'width', 'top', 'bottom', 'left', 'right', 'backgroundColor', 'layout' ] ), margin )

$._wrapper.applyProperties( wrapperArgs );