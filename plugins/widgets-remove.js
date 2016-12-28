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
 * @module nativeloop/plugins/widgets-remove
 * @author Brenton House <brenton.house@gmail.com>
 * @copyright Copyright (c) 2016 by Superhero Studios Incorporated.  All Rights Reserved.
 * @license Licensed under the terms of the MIT License (MIT)
 * 
 */

var path = require( "path" );
var _ = require( 'lodash' );
var fs = require( 'fs' );
var logger;
var config
var config_location;


/**
 * Ensure that widgets are configured in alloy config.json
 * 
 * @param {object} params
 */
function plugin( params ) {
	logger = params.logger;
	logger.trace( "ensuring widget is configured in config.json file: " + params.event.dir.config );
	config_location = params.event.dir.config + ".json";
	config = require( config_location );
	// logger.warn("config: " + JSON.stringify(config, null, 2));

	_.defaults( config, {
		"widgets": {},
		"dependencies": {},
	} );

	delete config.dependencies.nativeloop;

	_.forEach( _.keys( config.widgets ), ( widget ) => {
		if( config.dependencies[ widget ] && config.dependencies[ widget ] === config.widgets[ widget ] ) {
			delete config.dependencies[ widget ];
		}
	} );

	fs.writeFileSync( config_location, JSON.stringify( config, null, 2 ) );
}


module.exports.execute = plugin;
module.exports.tasks = [ {
	"module": module.id,
	"events": "postcompile"
} ]