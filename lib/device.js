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
 * @file This module is used to display information known about the device it is running on.
 * @module nativeloop/device 
 * @author Brenton House <brenton.house@gmail.com>
 * @version 1.0.0
 * @since 1.0.0
 * @copyright Copyright (c) 2017 by Superhero Studios Incorporated.  All Rights Reserved.
 * @license Licensed under the terms of the MIT License (MIT)
 * 
 */

/**
 * Define exports for this module
 */
var device = {};
module.exports = device;

/**
 * Declare variables needed for this module
 */
console.log( 'inside device.js' );
device.width = null;
const events = require( 'events' );

/**
 * @function calculatePercentWidth
 * @summary summary
 * @param {number} relative - description
 * @param {number} plus     - description
 * @since 1.0.0
 * @returns {number} - description
 */
var calculatePercentWidth = function( relative, plus ) {

	relative = relative || 100;
	plus = plus || 0;

	switch( device.platform ) {
		case "mobileweb":
			return device.platformWidth;

		case "iPhone OS":
			return device.platformWidth;

		default:
			//var pointDp = measurement.pointPXToDP(relative);
			var px = device.platformWidth * ( relative / 100 );
			var calcDp = Math.round( px / ( device.dpi / 160 ) );
			return( calcDp + parseInt( plus ) );
			break;
	}

};

/**
 * @function calculatePercentHeight
 * @summary summary
 * @param {number} relative - description
 * @param {number} plus     - description
 * @since 1.0.0
 * @returns {number} - description
 */
var calculatePercentHeight = function( relative, plus ) {

	relative = relative || 100;
	plus = plus || 0;

	switch( device.platform ) {
		case "mobileweb":
			return device.platformHeight;

		case "iPhone OS":
			return device.platformHeight;

		default:
			//var pointDp = measurement.pointPXToDP(relative);
			var px = device.platformHeight * ( relative / 100 );
			var calcDp = Math.round( px / ( device.dpi / 160 ) );
			return( calcDp + parseInt( plus ) );
			break;
	}

};

/**
 * @function isIos7Plus
 * @summary Function to test if device is iOS 7 or later
 * @since 1.0.0
 * @returns {bool} - Returns true if iOS 7+ otherwise false
 */
var isIos7Plus = function() {
	//TODO:  Cache this call
	// iOS-specific test
	if( OS_IOS ) {
		//var version = Titanium.Platform.version.split(".");
		var version = device.version.split( "." );
		var major = parseInt( version[ 0 ], 10 );

		// Can only test this support on a 3.2+ device
		if( major >= 7 ) {
			return true;
		}
	}
	return false;
}

/**
 * @function isIos8Plus
 * @summary Function to test if device is iOS 8 or later
 * @since 1.0.0
 * @returns {bool} - Returns true if iOS 8+ otherwise false
 */
var isIos8Plus = function() {
	//TODO:  Cache this call
	// iOS-specific test
	if( OS_IOS ) {
		//var version = Titanium.Platform.version.split(".");
		var version = device.version.split( "." );
		var major = parseInt( version[ 0 ], 10 );

		// Can only test this support on a 3.2+ device
		if( major >= 8 ) {
			return true;
		}
	}
	return false;
}

/**
 * Fire orientationchange event
 */
device.onOrientationChange = function( value ) {
	events.emit( 'nativeloop.orientationchange' );
}

/**
 * @function recalculate
 * @summary Calculate properties of the device when it is initialized or when device orientation is changed. 
 * @since 1.0.0
 */
device.recalculate = function() {
	var platformWidth = Ti.Platform.displayCaps.platformWidth;
	var platformHeight = Ti.Platform.displayCaps.platformHeight;
	// var deviceWidth = OS_IOS ? Ti.Platform.displayCaps.platformWidth : Math.round( Ti.Platform.displayCaps.platformWidth / ( Ti.Platform.displayCaps.dpi / 160 ) );

	var orientation = Ti.Gesture.orientation;
	device.isLandscape = orientation === ( Ti.UI.LANDSCAPE_LEFT || orientation === Ti.UI.LANDSCAPE_RIGHT );
	device.isPortrait = !device.isLandscape;

	device.platformWidth = device.isPortrait && platformWidth > platformHeight ? platformHeight : platformWidth;
	device.platformHeight = device.isPortrait && platformWidth > platformHeight ? platformWidth : platformHeight;

	device.actualHeight = calculatePercentHeight();
	device.height = isIos7Plus() ? device.actualHeight - 20 : device.actualHeight;
	device.width = calculatePercentWidth();
	//console.log(device);

};

/**
 * @function destroy
 * @summary Cleanup when destroying module.
 * @since 1.0.0
 * @returns {object} - description
 */
device.destroy = function() {

	events.off( 'hero.orientationchange', device.recalculate );
	Ti.Gesture.removeEventListener( "orientationchange", device.onOrientationChange );

}

/**
 * @function getFriendlyOsNameAndVersion
 * @summary summary
 * @since 1.0.0
 * @returns {string} - description
 */
var getFriendlyOsNameAndVersion = function() {
	var os = device.isIos ? "iOS" : device.os;
	return os + " " + os.version;
}

/**
 * @function OsName
 * @summary Get friendly OS name
 * @param {string} original - OS name
 * @since 1.0.0
 * @returns {string} - Friendly OS name
 */
var OsName = function( original ) {

	switch( original ) {

		case "iphone":
		case "ipad":
			{
				return "iOS";
			}

		default:
			{
				return original;
			}
	}
}

/**
 * @function getFriendlyModel
 * @summary Get friendly device model name
 * @param {string} original - Original device model name
 * @since 1.0.0
 * @returns {string} - description
 */
device.getFriendlyModel = function( original ) {

	original = original || device.model;

	switch( original ) {

		case "iPhone9,2":
		case "iPhone9,4":
			{
				return "iPhone 7 Plus";
			}

		case "iPhone9,1":
		case "iPhone9,3":
			{
				return "iPhone 7";
			}

		case "iPhone8,4":
			{
				return "iPhone SE";
			}

		case "iPhone8,2":
			{
				return "iPhone 6s Plus";
			}

		case "iPhone8,1":
			{
				return "	iPhone 6s";
			}
		case "iPhone7,2":
			{
				return "iPhone 6";
			}
		case "iPhone7,1":
			{
				return "iPhone 6 Plus";
			}
		case "iPhone6,2":
			{
				return "iPhone 5s (A1457/A1518/A1530)";
			}
		case "iPhone6,1":
			{
				return "iPhone 5s (A1433/A1453)";
			}
		case "iPhone5,4":
			{
				return "iPhone 5c (A1507/A1516/A1529)";
			}
		case "iPhone5,3":
			{
				return "iPhone 5c (A1456/A1532)";
			}
		case "iPhone5,2":
			{
				return "iPhone 5 (A1429)";
			}
		case "iPhone5,1":
			{
				return "iPhone 5 (A1428)";
			}
		case "iPhone4,1":
			{
				return "iPhone 4S";
			}
		case "iPhone3,3":
			{
				return "iPhone 4 (CDMA)";
			}
		case "iPhone3,1":
			{
				return "iPhone 4 (GSM)";
			}
		case "iPhone2,1":
			{
				return "iPhone 3GS";
			}
		case "iPhone1,2":
			{
				return "iPhone 3G";
			}
		case "iPhone1,1":
			{
				return "iPhone";
			}
		case "iPad6,8":
			{
				return "iPad Pro (Wi-Fi+LTE)";
			}
		case "iPad6,7":
			{
				return "iPad Pro (Wi-Fi)";
			}
		case "iPad5,4":
			{
				return "iPad Air 2 (Wi-Fi+LTE)";
			}
		case "iPad5,3":
			{
				return "iPad Air 2 (Wi-Fi)";
			}
		case "iPad5,2":
			{
				return "iPad mini 4 (Wi-Fi+LTE)";
			}
		case "iPad5,1":
			{
				return "iPad mini 4 (Wi-Fi)";
			}
		case "iPad4,9":
			{
				return "iPad mini 3 (A1601)";
			}
		case "iPad4,8":
			{
				return "iPad mini 3 (A1600)";
			}
		case "iPad4,7":
			{
				return "iPad mini 3 (Wi-Fi)";
			}
		case "iPad4,6":
			{
				return "iPad mini 2 (Rev)";
			}
		default:
			{
				return original;
			}
	}
}

/**
 * @function init
 * @summary Initializes this module.  Executed when module is loaded.
 * @since 1.0.0
 * @returns {object} - description
*/
device.init = function() {
	device.model = Ti.Platform.model;
	device.friendlyModel = device.getFriendlyModel( device.model );
	device.version = Ti.Platform.version;
	device.versionMajor = parseInt( device.version.split( '.' )[ 0 ], 10 );
	device.versionMinor = parseInt( device.version.split( '.' )[ 1 ], 10 );
	device.dpi = Ti.Platform.displayCaps.dpi;
	device.os = Ti.Platform.osname;
	device.platform = Ti.Platform.name;
	device.isIos = device.platform === 'iPhone OS';
	device.isMobileWeb = device.os === 'mobileweb';
	device.isAndroid = device.os === 'android';
	device.isIphone = device.os === 'iphone';
	device.isIpad = device.os === 'ipad';
	device.isTizen = device.os === 'tizen';
	device.isSimulator = device.model === 'Simulator' || device.model.indexOf( 'sdk' ) !== -1;
	device.id = Ti.Platform.id;
	device.isIos7Plus = isIos7Plus() ? true : false;
	device.isIos8Plus = isIos8Plus() ? true : false;

	device.recalculate();

	events.on( 'nativeloop.orientationchange', device.recalculate );
	Ti.Gesture.addEventListener( "orientationchange", device.onOrientationChange );

}();