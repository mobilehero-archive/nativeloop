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
 * @file {nativeloop} plugin for fixing underscore.js usage issues in Alloy
 * @module nativeloop/plugins/underscore-fix
 * @author Brenton House <brenton.house@gmail.com>
 * @copyright Copyright (c) 2016 by Superhero Studios Incorporated.  All Rights Reserved.
 * @license Licensed under the terms of the MIT License (MIT)
 * 
 */

var path = require( 'path' );
var _ = require( 'lodash' );
var fs = require( 'fs-extra' );
var logger;

/**
 * Remove invalid underscore calls from a file
 * @function replace_content
 * @param {string} fullpath
 */
function replace_content( fullpath ) {
	var source = fs.readFileSync( fullpath, 'utf8' );
	var regex = /(require\s*\(\s*['"].*alloy\/underscore['"]\s*\))._/g
	var test = regex.test( source );
	if( test ) {
		logger.trace( 'Fixing file: ' + fullpath );
		source = source.replace( regex, '$1' );
		fs.writeFileSync( fullpath, source );
	}
}

/**
 * Fix certain usages of underscore.js in Alloy source code
 * @function plugin
 * @param {object} params
 */
function plugin( params ) {
	logger = params.logger;
	params.dirname = params.dirname ? _.template( params.dirname )( params ) : params.event.dir.resourcesPlatform;
	logger.trace( "fixing underscore in directory: " + params.dirname );

	replace_content( path.join( params.dirname, 'alloy.js' ) );
	replace_content( path.join( params.dirname, 'alloy', 'sync', 'properties.js' ) );
	replace_content( path.join( params.dirname, 'alloy', 'sync', 'sql.js' ) );
	replace_content( path.join( params.dirname, 'alloy', 'constants.js' ) );

	injectCode( params );

}

/**
 * Inject necessary code into the file app.js
 * @function injectCode
 * @param params {object}
 */
function injectCode( params ) {

	var fullpath = path.join( params.dirname, 'app.js' );
	var source = fs.readFileSync( fullpath, 'utf8' );
	var test = /\/\/NATIVELOOP: UNDERSCORE-FIX/.test( source );
	logger.trace( 'NATIVELOOP: UNDERSCORE-FIX -- CODE INJECTED ALREADY: ' + test );
	if( !test ) {
		source = source.replace( /(var\s+Alloy[^;]+;)/g, "$1\n//NATIVELOOP: UNDERSCORE-FIX\nif(_.VERSION !== \"1.6.0\") {\r\n\tconsole.info(\"Wrapping _.template()\");\r\n\t_.mixin({\r\n\t\ttemplate: _.wrap(_.template, function(func, text, data, options) {\r\n\t\t\tif(options) {\r\n\t\t\t\t\/\/ If a third parameter was passed in, we hope that the older version of template was expected here.\r\n\t\t\t\treturn func(text, options)(data);\r\n\t\t\t} else {\r\n\t\t\t\t\/\/ Here we hope they intended to use the updated version of template...\r\n\t\t\t\treturn func(text, data);\r\n\t\t\t}\r\n\t\t})\r\n\t});\r\n}" );
		fs.writeFileSync( fullpath, source );
	}
}

module.exports.execute = plugin;
module.exports.tasks = [
	{
		'module': module.id,
		'events': 'postcompile'
	}
]