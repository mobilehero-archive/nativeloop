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
 * @file {nativeloop} plugin for adding support for promises to Alloy
 * @module nativeloop/plugins/promises
 * @author Brenton House <brenton.house@gmail.com>
 * @copyright Copyright (c) 2016 by Superhero Studios Incorporated.  All Rights Reserved.
 * @license Licensed under the terms of the MIT License (MIT)
 * 
 */

var path = require('path');
var _ = require('lodash');
var fs = require('fs-extra');
var logger;

/**
 * Add support for promises
 * @function plugin
 * @param {object} params
 */
function plugin(params) {
	logger = params.logger;
	params.dirname = params.dirname ? _.template(params.dirname)(params) : params.event.dir.resourcesPlatform;
	logger.trace('Adding promise support: ' + params.dirname);
	injectCode(params);

}

/**
 * Inject necessary code into the file app.js
 * @function injectCode
 * @param params {object}
 */
function injectCode(params) {

	var fullpath = path.join(params.dirname, 'app.js');
	var source = fs.readFileSync(fullpath, 'utf8');
	var test = /\/\/NATIVELOOP: PROMISES/.test(source);
	logger.trace('NATIVELOOP: PROMISES -- CODE INJECTED ALREADY: ' + test);
	if(!test) {
		source = source.replace(/(var\s+Alloy[^;]+;)/g, "$1\n//NATIVELOOP: PROMISES\nvar Promise = require('bluebird');\n\n");
		fs.writeFileSync(fullpath, source);
	}
}

module.exports.execute = plugin;
module.exports.tasks = [
	{
		'module': module.id,
		'events': 'postcompile'
	}
]