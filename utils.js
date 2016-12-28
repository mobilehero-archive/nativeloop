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