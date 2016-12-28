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
 * @file {nativeloop} plugin for removing invalid http header in Alloy
 * @module nativeloop/plugins/remove-invalid-header
 * @author Brenton House <brenton.house@gmail.com>
 * @copyright Copyright (c) 2016 by Superhero Studios Incorporated.  All Rights Reserved.
 * @license Licensed under the terms of the MIT License (MIT)
 * 
 */

var path = require( 'path' );
var _ = require( 'lodash' );
var fs = require( 'fs' );
var logger;

/**
 * Remove invalid http headers from being inserted
 * @function replace_content
 * @param {string} fullpath
 */
function replace_content( fullpath ) {
	var source = fs.readFileSync( fullpath, 'utf8' );
	var regex = /(this._xhr.setRequestHeader\('X-Titanium-Id', App.guid\);)/g
	var test = regex.test( source );
	if( test ) {
		logger.trace( 'Fixing file: ' + fullpath );
		source = source.replace( regex, "" );
		fs.writeFileSync( fullpath, source );
	}
}

/**
 * Fixes CORS issues with MobileWeb by removing invalid HTTP headers
 * @function plugin
 * @param {object} params
 */
function plugin( params ) {
	logger = params.logger;
	params.dirname = params.dirname ? _.template( params.dirname )( params ) : path.join( params.event.dir.project, 'build', 'mobileweb', 'titanium', 'Ti', 'Network' );
	logger.trace( 'removing invalid http headers in directory: ' + params.dirname );
	//replace_content(path.join(params.dirname, "HTTPClient.js"));
}

module.exports.execute = plugin;
module.exports.tasks = [
	{
		'module': module.id,
		'events': 'postcompile'
	}
]