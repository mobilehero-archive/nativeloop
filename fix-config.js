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
 * @file {nativeloop} plugin for adding nativeloop widget to config.json
 * @module fix-config
 * @author Brenton House <brenton.house@gmail.com>
 * @copyright Copyright (c) 2016 by Superhero Studios Incorporated.  All Rights Reserved.
 * @license Licensed under the terms of the MIT License (MIT)
 * 
 */

var _ = require( 'lodash' );

/**
 * Adds nativeloop widget to config.json
 * @function addWidget
 * @param {object} params - The parameters for adding widget
 * @param {object} params.input - The parsed json of the config.json
 * @param {object} params.logger - The nativeloop logger
 */
exports.addWidgets = function ( params ) {
	var logger = params.logger;
	logger.trace( 'Adding nativeloop widget to config.json' );
	params.logger.error( "adding widgets" );
	if ( params.input.widgets && params.input.dependencies ) {
		_.defaults( params.input.dependencies, params.input.widgets );
	}

	return params.input;
}
