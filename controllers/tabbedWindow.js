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
 * @overview 
 * Widget that handles the actual implementation of the bottom-tabbed window navigation
 * -- Note -- This is a work in progress and is not fully functional!  
 * 
 * @module widgets/nativeloop/controllers/navigator
 * @author Brenton House <brenton.house@gmail.com>
 * @version 1.0.0
 * @since 1.0.0
 * @copyright Copyright (c) 2017 by Superhero Studios Incorporated.  All Rights Reserved.
 * @license Licensed under the terms of the MIT License (MIT)
 * 
 */

const apm = require( 'nativeloop/apm' );
const utils = require( 'nativeloop/utils' );

$.getViewAlloy = $.getView;
$.getView = function( id ) {
	$.init();
	return $.getViewAlloy( id );
};

/**
 * @function createTabbedWindow
 * @summary create a tabbed window
 * @param {object} params - parameters used to initialize the creating of the window
 * @see {@link http://docs.appcelerator.com/platform/latest/#!/api/Modules.Performance | Appcelerator Titanium Window Documentation} 
 * @since 1.0.0
 * @returns {object} - Returns the Titanium Window 
 */
var createTabbedWindow = function( params ) {
	let __prefix = $.__controllerPath + '.createTabbedWindow: ';
	apm.leaveBreadcrumb( __prefix + 'entering' );
	console.error( 'params: ' + utils.stringify( params, null, 2 ) );

	const Navigation = require( 'nativeloop/navigation' );
	const tabs = [];

	_.forEach( params.tabs, tabParams => {
		let window = Navigation.createNavBasedWindow( tabParams.screen );

		params.tabStyle = params.tabStyle || {};
		_.defaults( tabParams, params.tabStyle );

		tabParams.iconColor = tabParams.iconColor || tabParams.color;
		tabParams.imageColor = tabParams.imageColor || tabParams.color;
		tabParams.titleColor = tabParams.titleColor || tabParams.color;

		tabParams.activeIconColor = tabParams.activeIconColor || tabParams.activeColor;
		tabParams.activeImageColor = tabParams.activeImageColor || tabParams.activeColor;
		tabParams.activeTitleColor = tabParams.activeTitleColor || tabParams.activeColor;

		if( tabParams.icon ) {
			tabParams.image = utils.saveIconAsFile( {
				name: tabParams.icon,
				height: 30,
				color: tabParams.iconColor || tabParams.color || 'black',
				force: true,
			} );
		} else if( tabParams.image ) {
			tabParams.image = tabParams.image;
		}

		if( tabParams.activeIcon ) {
			tabParams.activeImage = utils.saveIconAsFile( {
				name: tabParams.activeIcon,
				height: 30,
				color: tabParams.activeIconColor || tabParams.activeColor || 'black',
				force: true,
			} );
		} else if( tabParams.activeImage ) {
			tabParams.activeImage = tabParams.activeImage;
		} else if( tabParams.icon ) {
			tabParams.activeImage = utils.saveIconAsFile( {
				name: tabParams.icon,
				height: 30,
				color: tabParams.activeIconColor || tabParams.activeColor || 'black',
				force: true,
			} );
		}

		// if icon is defined but activeIcon is not, we need to define it.

		let tabOptions = {
			window: window,
			title: tabParams.title,
			icon: tabParams.image,
			activeIcon: tabParams.activeImage,
			activeIconIsMask: false, // need to see if color is defined
			iconIsMask: false,
			titleColor: tabParams.titleColor,
			activeTitleColor: tabParams.activeTitleColor,
			// activeTabIconTint: _.get(tabParams,'activeIcon.color'),
		};

		console.error( 'tabOptions: ' + JSON.stringify( tabOptions, null, 2 ) );

		let tab = Ti.UI.createTab( tabOptions );

		tabs.push( tab );
	} );

	let tabGroup = Ti.UI.createTabGroup( {
		tabs: tabs,
	} );

	return tabGroup;

	apm.leaveBreadcrumb( __prefix + 'exiting' );
	__prefix = null;
};

$.init = _.once( function() {
	var __prefix = $.__controllerPath + '.init: ';
	apm.leaveBreadcrumb( __prefix + 'entering' );
	if( OS_IOS ) {
		// console.error( '$.args: ' + utils.stringify( $.args, null, 2 ) );
		$.tabbedWindow = createTabbedWindow( $.args );
		$.tabbedWindow && $.addTopLevelView( $.tabbedWindow );
	}

	apm.leaveBreadcrumb( __prefix + 'exiting' );
} );