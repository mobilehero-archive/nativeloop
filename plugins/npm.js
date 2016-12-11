"use strict";
/***
 *                          __     _  __       __                     
 *       ____ ___   ____   / /_   (_)/ /___   / /_   ___   _____ ____ 
 *      / __ `__ \ / __ \ / __ \ / // // _ \ / __ \ / _ \ / ___// __ \ 
 *     / / / / / // /_/ // /_/ // // //  __// / / //  __// /   / /_/ / 
 *    /_/ /_/ /_/ \____//_.___//_//_/ \___//_/ /_/ \___//_/    \____/ 
 *                                                                    
 *                  mobile solutions for everyday heroes
 *                                                                    
 * @file {nativeloop} plugin for executing npm during build process
 * @module nativeloop/plugins/npm
 * @author Brenton House <brenton.house@gmail.com>
 * @copyright Copyright (c) 2016 by Superhero Studios Incorporated.  All Rights Reserved.
 * @license Licensed under the terms of the MIT License (MIT)
 * 
 */

var _ = require('lodash');

function plugin(params) {

	params.dirname = params.dirname ? _.template(params.dirname)(params) : params.event.dir.lib;
	params.args = params.args ? _.map(params.args, function(arg) {
		return _.template(arg)(params);
	}) : ["install"];

	params.logger.trace("running npm in directory: " + params.dirname);
	params.logger.trace("npm " + params.args.join(" "));

	return require("@geek/spawn").spawnSync("npm", params.args, {
		cwd: params.dirname
	});
	
}

module.exports.execute = plugin;
module.exports.tasks = [
	{
		"module": module.id,
		"dirname": "${event.dir.lib}",
		"args": ["install"],
		"events": "preload"
	}
]