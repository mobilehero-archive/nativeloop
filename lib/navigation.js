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
 * @file This is the core class for nativeloop naviation.  
 * @module nativeloop/navigation
 * @author Brenton House <brenton.house@gmail.com>
 * @version 1.0.0
 * @since 1.0.0
 * @copyright Copyright (c) 2017 by Superhero Studios Incorporated.  All Rights Reserved.
 * @license Licensed under the terms of the MIT License (MIT)
 * 
 */

const __modulename = __filename;
const apm = require( 'nativeloop/apm' );

var Navigation = {};

// Similar to API used by react-native-navigation (https://github.com/wix/react-native-navigation/wiki/Top-Level-API)

/**
 * @function createTabBasedWindow
 * @summary create a window with bottom-tab control
 * @param {object} params
 * @param {object} params.tabsStyle
 * @param {object} [params.passProps] - simple serializable object that will pass as props to all top screens (optional)
 * @param {object} [params.drawer] - side menu drawer in your app
 * @param {object} [params.drawer.left] - left side drawer properties
 * @param {object} [params.drawer.right] - right side drawer properties
 * @param {string} [params.animationType] - add transition animation to root change: 'none', 'slide-down', 'fade' (optional)
 * @param {object[]} params.tabs - tabs definitions
 * @param {string} [params.tabs[].label] - tab label as appears under the icon (optional)
 * @param {string|object} params.tabs[].screen - unique ID registered with Navigation.registerScreen
 * @param {string} params.tabs[].selectedIcon - local image asset for the tab icon selected state (optional)
 * @param {string} params.tabs[].title - title of the screen as appears in the nav bar (optional)
 * @param {object} params.tabs[].navigatorStyle - override the navigator style for the tab screen
 * @param {object} params.tabs[].navigatorButtons - override the nav buttons for the tab screen
 * @param {object[]} params.tabs[].navigatorButtons.leftButtons - override the left nav buttons for the tab screen
 * @param {object[]} params.tabs[].navigatorButtons.leftButtons[].title - title for the left nav button
 * @param {string} params.tabs[].navigatorButtons.leftButtons[].id - id for this button
 * @param {boolean} [params.tabs[].navigatorButtons.leftButtons[].disabled=false] - used to disable the button (optional)
 * @param {string} [params.tabs[].navigatorButtons.leftButtons[].image] - local image asset name to use for button (optional)
 * @param {string} [params.tabs[].navigatorButtons.leftButtons[].icon] - local icon name to use for button (optional)
 * @param {object[]} params.tabs[].navigatorButtons.rightButtons - override the right nav buttons for the tab screen
 * @param {object[]} params.tabs[].navigatorButtons.rightButtons[].title - title for the right nav button
 * @param {string} params.tabs[].navigatorButtons.rightButtons[].id - id for this button
 * @param {boolean} [params.tabs[].navigatorButtons.rightButtons[].disabled=false] - used to disable the button (optional)
 * @param {string} [params.tabs[].navigatorButtons.rightButtons[].image] - local image asset name to use for button (optional)
 * @param {string} [params.tabs[].navigatorButtons.rightButtons[].icon] - local icon name to use for button (optional)
 * @since 1.0.0
 */
Navigation.createTabBasedWindow = ( params = {} ) => {
	// create widget controller for tab
	// create navigator for tab (passing in widget controller for tab)
	// navigate to first screen
	// pass window from widget controller for tab to constructor for widget controller for tabbed window
	// open widget controller window for tabbed window

	let controller = Alloy.createWidget( 'nativeloop', 'tabbedWindow', params );
	let window = controller.getView();
	// window.open();
	return window;
};

/**
 * @function createNavBasedWindow
 * @summary create a window with a top navigation bar
 * @param {object} params
 * @param {object} params.screen - screen parameters
 * @param {string} params.screen.title - title of the screen as appears in the nav bar (optional)
 * @param {object} params.screen.navigatorStyle - override the navigator style for the tab screen
 * @param {object} params.screen.navigatorButtons - override the nav buttons for the tab screen
 * @param {object[]} params.screen.navigatorButtons.leftButtons - override the left nav buttons for the tab screen
 * @param {string} params.screen.navigatorButtons.leftButtons[].title - title for the left nav button
 * @param {string} params.screen.navigatorButtons.leftButtons[].id - id for this button
 * @param {boolean} [params.screen.navigatorButtons.leftButtons[].disabled=false] - used to disable the button (optional)
 * @param {string} [params.screen.navigatorButtons.leftButtons[].image] - local image asset name to use for button (optional)
 * @param {string} [params.screen.navigatorButtons.leftButtons[].icon] - local icon name to use for button (optional)
 * @param {object[]} params.screen.navigatorButtons.rightButtons - override the right nav buttons for the tab screen
 * @param {object[]} params.screen.navigatorButtons.rightButtons[].title - title for the right nav button
 * @param {string} params.screen.navigatorButtons.rightButtons[].id - id for this button
 * @param {boolean} [params.screen.navigatorButtons.rightButtons[].disabled=false] - used to disable the button (optional)
 * @param {string} [params.screen.navigatorButtons.rightButtons[].image] - local image asset name to use for button (optional)
 * @param {string} [params.screen.navigatorButtons.rightButtons[].icon] - local icon name to use for button (optional)
 * @param {object} [params.passProps] - simple serializable object that will pass as props to all top screens (optional)
 * @param {object} [params.drawer] - side menu drawer in your app
 * @param {object} [params.drawer.left] - left side drawer properties
 * @param {object} [params.drawer.right] - right side drawer properties
 * @param {string} [params.animationType] - add transition animation to root change: 'none', 'slide-down', 'fade' (optional)
 * @since 1.0.0
 */
Navigation.createNavBasedWindow = ( params = {} ) => {
	var __prefix = __modulename + '.push: ';
	apm.leaveBreadcrumb( __prefix + 'entering' );

	// create widget controller
	// create navigator (passing in widget controller)
	// navigate to first screen
	// open widget controller window

	//TODO:  Check for required values

	var Navigator = require( 'nativeloop/navigator' );
	let navigator = new Navigator();

	// if( _.isString( params ) ) {
	// 	params = { screen: { name: params } }
	// } else if( _.isString( params.screen ) ) {
	// 	params.screen = { name: params }
	// }

	// let screen = _.cloneDeep( params.screen );
	// screen.passProps = _.cloneDeep( params.passProps || {} );
	navigator.push( params );

	let window = navigator.controller.getView();
	// window.open();

	apm.leaveBreadcrumb( __prefix + '.exiting' );
	__prefix = null;

	return window;
};

Navigation.showModal = ( params = {} ) => {};
Navigation.dismissModal = ( params = {} ) => {};
Navigation.dismissAllModals = ( params = {} ) => {};
Navigation.showLightBox = ( params = {} ) => {};
Navigation.dismissLightBox = ( params = {} ) => {};
Navigation.registerScreen = ( screenID, generator ) => {};
Navigation.registerComponent = ( screenID, generator, store = undefined, Provider = undefined ) => {};

module.exports = Navigation;

// module.exports = {
// 	Navigation,
// }

// Screen API: https://github.com/wix/react-native-navigation/wiki/Screen-API

// Add:  popToTop()  // from ex-navigation