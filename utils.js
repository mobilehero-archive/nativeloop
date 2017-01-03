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

var _ = require( 'lodash' );
var path = require( 'path' );

var utils = {};
module.exports = utils;


var fs = require( 'fs-extra' );
fs.readdirSyncRecursive = function( dir ) {
	console.error( 'dir: ' + JSON.stringify( dir, null, 2 ) );
	return _.map( fs.walkSync( dir ), function( filename ) {
		// var x = path.posix.sep + replaceBackSlashes( filename );
		console.error( 'filename: ' + JSON.stringify( filename, null, 2 ) );
		var x = path.relative( dir, filename );
		console.error( x );
		return x;

	} );
}

/**
 * Replace backslashes for cross-platform usage
 * Adapted from https://github.com/sindresorhus/slash
 * 
 * @param {string} intput - value needing to have backslashes replaced in.
 * @returns {string}
 */
utils.replaceBackSlashes = function( input ) {
	var isExtendedLengthPath = /^\\\\\?\\/.test( input );
	var hasNonAscii = /[^\x00-\x80]+/.test( input );

	if( isExtendedLengthPath || hasNonAscii ) {
		return input;
	}

	return input.replace( /\\/g, '/' );
};


/**
 * @function createUrlHash
 * @param {string} url - Url to be hashed
 * @returns {string} Hash of normalized url
 */
utils.createUrlHash = ( url ) => {

	//TODO:  Normalize url

	return Ti.Utils.md5HexDigest( url );

}