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
 * @file This is the core class for functionality enabled by the MobileHero platform.  
 * @module nativeloop/utils 
 * @author Brenton House <brenton.house@gmail.com>
 * @version 1.0.0
 * @since 1.0.0
 * @copyright Copyright (c) 2017 by Superhero Studios Incorporated.  All Rights Reserved.
 * @license Licensed under the terms of the MIT License (MIT)
 * 
 */

var utils = {};
module.exports = utils;

/**
 * @function createUrlHash
 * @param {string} url - Url to be hashed
 * @since 1.0.0
 * @returns {string} Hash of normalized url
 */
utils.createUrlHash = url => {
	//TODO:  Normalize url

	return Ti.Utils.md5HexDigest( url );
};

/**
 * @function openURL
 * @param {string} url - Url to be opened
 * @since 1.0.0
 * @returns {boolean} Success of opening URL
 */
utils.openURL = function( url ) {
	if( _.isArray( url ) ) {
		url = url[ 0 ];
	}
	if( !Ti.Platform.canOpenURL( url ) ) {
		console.warn( 'Not able to open url: ' + url );
		return false;
	}
	var success = false;
	try {
		success = Ti.Platform.openURL( url );
	} catch( ex ) {
		console.error( 'Failed to open url: ' + url );
		Alloy.Globals.apm.logHandledException( err );
		return false;
	}

	return success;
};

/**
 * Parse a percentage of a given whole or device width (if whole is undefined)
 * @function parsePercentage
 * @param {string} input - value to be parsed for a percentage and then converted to number
 * @param {number} [whole] - value of entire width (defaults to device width)
 * @since 1.0.0
 * @returns {number} 
 */
utils.parsePercentage = function( input, whole ) {
	if( !input || input === Ti.UI.SIZE || input === Ti.UI.FILL ) {
		return input;
	}
	whole = whole || require( 'nativeloop/device' ).width;
	if( _.isString( input ) ) {
		var test = input.slice( -1 );
		if( test === '%' ) {
			var percentage = input.slice( 0, -1 );
			var percentageInt = _.parseInt( percentage );
			if( percentageInt > 0 ) {
				return whole * ( percentageInt / 100 );
			}
		} else {
			var parsedInput = _.parseInt( input );
			return _.isFinite( parsedInput ) ? parsedInput : input;
		}
	}

	return input;
};

/**
 * Parse input in CSS style padding format
 * @function parsePadding
 * @param {string|object} paddingInput 
 * @param {number} totalWidth 
 * @since 1.0.0
 * @returns {object} padding object
 */
utils.parsePadding = function( paddingInput, totalWidth ) {
	// console.error( 'paddingInput: ' + JSON.stringify( paddingInput, null, 2 ) );
	var padding = {};

	if( _.isNil( paddingInput ) ) {
		// return padding;
		padding.exists = false;
		paddingInput = 0;
	} else {
		padding.exists = true;
	}

	if( _.isNumber( paddingInput ) ) {
		paddingInput = paddingInput.toString();
		// console.error( 'paddingInput: ' + JSON.stringify( paddingInput, null, 2 ) );
	} else if( _.isString( paddingInput ) ) {
		if( paddingInput.indexOf( ' ' ) > 0 ) {
			//paddingInput = _.map(paddingInput.split(' '), function (value) { return parseInt(value); });
			paddingInput = paddingInput.split( ' ' );
		}
	}
	if( _.isObject( paddingInput ) ) {
		if( _.isArray( paddingInput ) ) {
			var ln = paddingInput.length;

			if( ln === 1 ) {
				padding.top = paddingInput[ 0 ];
				padding.right = padding.top;
				padding.bottom = padding.top;
				padding.left = padding.top;
			} else if( ln === 2 ) {
				padding.top = paddingInput[ 0 ];
				padding.right = paddingInput[ 1 ];
				padding.bottom = padding.top;
				padding.left = padding.right;
			} else if( ln === 3 ) {
				padding.top = paddingInput[ 0 ];
				padding.right = paddingInput[ 1 ];
				padding.bottom = paddingInput[ 2 ];
				padding.left = padding.right;
			} else {
				padding.top = paddingInput[ 0 ];
				padding.right = paddingInput[ 1 ];
				padding.bottom = paddingInput[ 2 ];
				padding.left = paddingInput[ 3 ];
			}
		} else {
			padding.top = paddingInput.top || 0;
			padding.right = paddingInput.right || 0;
			padding.bottom = paddingInput.bottom || 0;
			padding.left = paddingInput.left || 0;
		}
	} else {
		padding.top = paddingInput;
		padding.right = paddingInput;
		padding.bottom = paddingInput;
		padding.left = paddingInput;
	}

	padding.top = utils.parsePercentage( padding.top, totalWidth );
	padding.right = utils.parsePercentage( padding.right, totalWidth );
	padding.bottom = utils.parsePercentage( padding.bottom, totalWidth );
	padding.left = utils.parsePercentage( padding.left, totalWidth );

	// console.error( 'padding: ' + JSON.stringify( padding, null, 2 ) );

	return padding;
};

/**
 * @function tryParseInt
 * @summary Converts the string representation of a number to an integer
 * @param {string} intput - A string representing a number to convert.
 * @param {object} [defaultValue] - Default value to be used if conversion fails
 * @since 1.0.0
 * @returns {int} - The float equivalent to the numeric value contained in input
 */
utils.tryParseInt = function( input, defaultValue ) {
	var retValue = parseInt( input );
	if( isNaN( retValue ) ) {
		retValue = defaultValue;
	}

	return retValue;
};

/**
 * @function tryParseFloat
 * @summary Converts the string representation of a number to a float
 * @param {string} str - A string representing a number to convert.
 * @param {object} [defaultValue] - Default value to be used if conversion fails
 * @since 1.0.0
 * @returns {object} - The float equivalent to the numeric value contained in input
 */
utils.tryParseFloat = function( str, defaultValue ) {
	var retValue = parseFloat( str );
	if( isNaN( retValue ) ) {
		retValue = defaultValue;
	}

	return retValue;
};

/**
 * @function isFloat
 * @summary Checks to see if a value is float
 * @param {*} input - The value to check to see if it is a float
 * @since 1.0.0
 * @returns {bool} - true if input is float otherwise false
 */
utils.isFloat = function( v ) {
	return Number( input ) === input && input % 1 !== 0;
};


utils.decimalPlaces = function( num ) {
	var match = ( '' + num ).match( /(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/ );
	if( !match ) {
		return 0;
	}
	return Math.max(
		0,
		// Number of digits right of decimal point.
		( match[ 1 ] ? match[ 1 ].length : 0 ) -
		// Adjust for scientific notation.
		( match[ 2 ] ? +match[ 2 ] : 0 )
	);
};

/**
 * @function stringify
 * @summary Converts an object to a string in a safe way (skipping circular values)
 * @param {object} input - Object to be converted to string
 * @since 1.0.0
 * @returns {string} - String value of input
 */
utils.stringify = input => {
	var cache = [];
	return JSON.stringify(
		input,
		function( key, value ) {
			if( typeof value === 'object' && value !== null ) {
				if( cache.indexOf( value ) !== -1 ) {
					// Circular reference found, discard key
					return;
				}
				// Store value in our collection
				cache.push( value );
			}
			return value;
		},
		2
	);
};

/**
 * @function saveIconAsFile
 * @summary Saves a font icon character as an image file
 * @param {object} params - Parameters used to create image
 * @param {string} params.name - Font and character to use in format: fontname.character* 
 * @param {string} [params.color] - Foreground color of the icon (defaults to black)
 * @param {boolean} [params.force] - Force generation of image file (defaults to black)
 * @since 1.0.0
 * @returns {string} - Path of newly created object
 */
utils.saveIconAsFile = function( params ) {
	//TODO: take color and size into consideration
	params.color = params.color || 'black';

	let iconNormal = Titanium.Filesystem.getFile(
		Titanium.Filesystem.getTempDirectory(),
		`${params.name}_${params.height}_${params.color}.png`
	);
	if( params.force || !iconNormal.exists() ) {
		params.retina = false;
		let blob = utils.getIconAsBlob( params );
		iconNormal.write( blob );
		// console.error( 'normal.blob.height: ' + JSON.stringify( blob.height, null, 2 ) );
		// console.error( 'normal.blob.width: ' + JSON.stringify( blob.width, null, 2 ) );
	}

	//TODO: Not sure why retina sized icons are showing twice the size on 
	// a retina device, but commenting out for now.

	// if( OS_IOS ) {
	// 	let iconRetina = Titanium.Filesystem.getFile(
	// 		Titanium.Filesystem.getTempDirectory(),
	// 		`${params.name}_${params.color}@2x.png`
	// 	);

	// 	if( params.force || !iconRetina.exists() ) {
	// 		params.retina = true;
	// 		let blob = utils.getIconAsBlob( params );
	// 		iconRetina.write( blob );
	// 		console.error( 'retina.blob.height: ' + JSON.stringify( blob.height, null, 2 ) );
	// 		console.error( 'retina.blob.width: ' + JSON.stringify( blob.width, null, 2 ) );
	// 	}
	// }

	return iconNormal.nativePath;
};

/**
 * @function getIconAsBlob
 * @summary Generates an image blob for a specified icon font character
 * @param {object} params - Parameters used to create image
 * @since 1.0.0
 * @returns {object} - Image blog representing icon font character
 */
utils.getIconAsBlob = function( params ) {
	return utils.getIconAsLabel( params ).toImage( null, !!params.retina );
};

/**
 * @function getIconAsLabel
 * @summary Creates a label from an icon font character
 * @param {object} params - parameters for creating label
 * @since 1.0.0
 * @returns {object} - Titanium Label
 */
utils.getIconAsLabel = function( params ) {
	//TODO:  Check for required parameters

	if( params.height ) {
		// if( params.retina ) {
		// 	params.height = params.height * 2;
		// }

		// params.fontSize = (params.height * 0.75) + "sp";
		params.fontSize = params.height * 0.9;
	}

	let split = params.name.split( '.' );

	params.fontFamily = params.fontFamily || split[ 0 ];
	params.text = typeof params.name === 'string' ?
		_.get( require( '/nativeloop/iconfonts' ), params.name ) :
		String.fromCharCode( params.name );

	// console.error( 'getIconAsLabel.params: ' + JSON.stringify( params, null, 2 ) );

	let label = Ti.UI.createLabel( {
		height: Ti.UI.SIZE,
		// height: params.height,
		width: Ti.UI.SIZE,

		font: {
			fontFamily: params.fontFamily,
			fontSize: params.fontSize,
		},
		text: params.text,
		textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
		color: params.color || 'black',
	} );

	return label;
};

/**
 * @function createGuid
 * @summary create a guid
 * @since 1.0.0
 * @returns {string} - guid
 */
utils.createGuid = function() {
	var guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace( /[xy]/g, function( c ) {
		var r = Math.random() * 16 | 0,
			v = c == 'x' ? r : r & 0x3 | 0x8;
		return v.toString( 16 );
	} );
	return guid;
};

Alloy.stringify = utils.stringify;