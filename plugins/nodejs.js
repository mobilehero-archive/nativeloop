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
 * @file nativeloop} plugin for making alloy code use the nodejs style module resolution
 * @module nativeloop/plugins/nodejs
 * @author Brenton House <brenton.house@gmail.com>
 * @copyright Copyright (c) 2016 by Superhero Studios Incorporated.  All Rights Reserved.
 * @license Licensed under the terms of the MIT License (MIT)
 * 
 */

var path = require( "path" );
var _ = require( 'lodash' );
var logger;

function plugin( params ) {

	logger = params.logger;
	params.dirname = params.dirname || params.event.dir.resourcesPlatform;

	_.defaults( params.config, {
		modules: {}
	} );

	logger.debug( "fixing alloy require in directory: " + params.dirname );
	// logger.trace("nodejs params: " + JSON.stringify(params.config, null, 2));
	var r = require( './resolver/resolve-fix' );
	var resolveFix = new r( params.dirname, params.modules, params.includes, logger );
	var registry = JSON.stringify( resolveFix.registry, null, 4 );
	//console.warn(registry);
}

module.exports.execute = plugin;
module.exports.tasks = [
	{
		"module": module.id,
		"events": "postcompile"
	}
]