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
 * @file {nativeloop} plugin for running babel transformations on your mobile code
 * @module nativeloop/plugins/babeljs
 * @author Brenton House <brenton.house@gmail.com>
 * @copyright Copyright (c) 2017 by Superhero Studios Incorporated.  All Rights Reserved.
 * @license Licensed under the terms of the MIT License (MIT)
 * 
 */

var path = require( 'path' );
var fs = require( 'fs-extra' );
// var wrench = require('wrench');
var _ = require( 'lodash' );
var logger;
var babel = require( 'babel-core' );
var minimatch = require( 'minimatch' );

/**
 * Run babel tranformations on mobile source code
 * @function plugin
 * @param {object} params - parameters available for executing of Alloy+ plugin.
 * @param {object} params.event - Provides a set of objects and values which may be useful for building tasks:
 * @param {object} params.event.alloyConfig - Contains Alloy compiler configuration information.
 * @param {string} params.event.alloyConfig.platform - either android, ios, mobileweb or windows.
 * @param {string} [params.event.alloyConfig.file] - file to target for selective compilation.
 * @param {string} params.event.alloyConfig.deploytype - compilation environment type: either development, test or production.
 * @param {string} params.event.alloyConfig.beautify - if set to true, the output from UglifyJS will be beautified.
 * @param {string} params.event.autoStyle - If set to true, autostyle is enabled for the entire project.
 * @param {object} params.event.dependencies - If set to true, autostyle is enabled for the entire project.
 * @param {object} params.event.dir - Contains directory paths to various resources.
 * @param {string} params.event.dir.home - absolute path to the Alloy project's app directory.
 * @param {string} params.event.dir.project - absolute path to the Alloy project's root directory.
 * @param {string} params.event.dir.resources - absolute path to the Alloy project's Resource directory.
 * @param {string} params.event.dir.resourcesAlloy - absolute path to the Alloy project's Resource/alloy directory.
 * @param {string} params.event.dir.resourcesPlatform - absolute path to the Alloy project's Resource/{platform} directory. (i.e. /Resources/iphone)
 * @param {string} params.event.dir.assets - absolute path to the Alloy project's assets.
 * @param {string} params.event.dir.config - absolute path to the Alloy project's config.
 * @param {string} params.event.dir.controllers - absolute path to the Alloy project's controllers.
 * @param {string} params.event.dir.migrations - absolute path to the Alloy project's migrations.
 * @param {string} params.event.dir.models - absolute path to the Alloy project's models.
 * @param {string} params.event.dir.styles - absolute path to the Alloy project's styles.
 * @param {string} params.event.dir.themes - absolute path to the Alloy project's themes.
 * @param {string} params.event.dir.views - absolute path to the Alloy project's views.
 * @param {string} params.event.dir.widgets - absolute path to the Alloy project's widgets.
 * @param {string} params.event.dir.builtins - absolute path to the Alloy project's builtins.
 * @param {string} params.event.dir.template - absolute path to the Alloy project's template.
 * @param {string} params.event.sourcemap - If true, generates the source mapping files for use with the Studio debugger and other functions.
These files maps the generated Titanium files in the Resources directory to the ones in the app directory.
 * @param {string} params.event.theme - Name of the theme being used.
 * @param {string} [params.event.code] - Only present for the appjs build hook. Contains the contents of the app.js file.
 * @param {string} [params.event.appJSFile] - Only present for the appjs build hook. Contains the the absolute path to the app.js file.
 * @param {object} params.logger - Alloy logger object
 * @param {string[]} [params.includes] - Array of glob patterns to match files to be included in transformation
 * @param {string} [params.code]
 * @param {object} params.options - babel configuration object (see http://babeljs.io/docs/usage/options/)
 * @param {string[]} [params.options.presets=[]] - List of presets (a set of plugins) to load and use..
 * @param {string[]} [options.plugins=[]] - List of plugins to load and use.
 * @param {boolean} [params.options.babelrc=true] - Specify whether or not to use .babelrc and .babelignore files.
 * @param {boolean} [params.options.ast=true] - Include the AST in the returned object
 * @param {boolean} [params.options.minified=true] - Should the output be minified (not printing last semicolons in blocks, printing literal string values instead of escaped ones, stripping () from new when safe)
 * @param {boolean} [params.options.comments=true] - Output comments in generated output.
 * @param {object} [params.options.env={}] - This is an object of keys that represent different environments. For example, you may have: { env: { production: { someOption: true } } } which will use those options when the enviroment variable BABEL_ENV is set to "production". If BABEL_ENV isn’t set then NODE_ENV will be used, if it’s not set then it defaults to "development"
 * @param {string} [params.options.extends=null] - A path to an .babelrc file to extend
 */
function plugin( params ) {

	logger = params.logger;
	params.dirname = params.dirname ? _.template( params.dirname )( params ) : params.event.dir.resourcesPlatform;

	_.defaults( params, {
		options: {},
		includes: [ '**/*.js', '!backbone.js', '!**/alloy/lodash.js' ]
	} );

	if( params.code ) {
		// logger.trace(params.code);
		logger.trace( "running babel on code" );
		params.code = transformCode( params.code, params.options );
	} else {
		logger.trace( "running babel in directory: " + params.dirname );
		var files = findFiles( params.dirname, params.includes );
		_.forEach( files, function( file ) {
			transformFile( path.join( params.dirname, file ), params.options );
		} );
	}
}

/**
 * Replace backslashes for cross-platform usage
 * Adapted from https://github.com/sindresorhus/slash
 * @function replaceBackSlashes
 * @param {string} intput - value needing to have backslashes replaced in.
 * @returns {string}
 */
function replaceBackSlashes( input ) {
	var isExtendedLengthPath = /^\\\\\?\\/.test( input );
	var hasNonAscii = /[^\x00-\x80]+/.test( input );

	if( isExtendedLengthPath || hasNonAscii ) {
		return input;
	}

	return input.replace( /\\/g, '/' );
};

/**
 * Find all files that match extension criteria
 * @function findFiles
 * @param {string} rootpath - Absolute path of the directory from which file search will begin
 * @param {string[]|string} [patterns="**"] - Pattern(s) to be used when attempting to match files found
 * @returns {string[]} - Matched file paths
 */
function findFiles( rootpath, patterns ) {
	var patterns = patterns || [ '**' ];
	if( _.isString( patterns ) ) {
		patterns = [ patterns ];
	}
	var files = _.map( fs.readdirSyncRecursive( rootpath ), function( filename ) {
		return path.posix.sep + replaceBackSlashes( filename );
	} );
	var matchedFiles = match( files, patterns, {
		nocase: true,
		matchBase: true,
		dot: true,
	} );
	return _.filter( matchedFiles, function( file ) {
		return !fs.statSync( path.join( rootpath, file ) ).isDirectory();
	} ) || [];

};

/**
 * Find items in array that match a set of patterns
 * Adapted from https://github.com/sindresorhus/multimatch
 * @function match
 * @param {string[]} list
 * @param {string[]|string} patterns
 * @param {object} options
 * @returns {string[]}
 */
function match( list, patterns, options ) {
	list = list || [];
	patterns = patterns || [];
	if( _.isString( patterns ) ) {
		patterns = [ patterns ];
	}

	if( list.length === 0 || patterns.length === 0 ) {
		return [];
	}

	options = options || {};
	return patterns.reduce( function( ret, pattern ) {
		var process = _.union
		if( pattern[ 0 ] === '!' ) {
			pattern = pattern.slice( 1 );
			process = _.difference;
		}
		return process( ret, minimatch.match( list, pattern, options ) );
	}, [] );
};


/**
 * Transform a file with babeljs using babel config
 * @function transformFile
 * @param {string} filepath - absolute path of the file to be transformed
 * @param {object} options - babel configuration object (see http://babeljs.io/docs/usage/options/)
 * @param {string[]} [options.presets=[]] - List of presets (a set of plugins) to load and use..
 * @param {string[]} [options.plugins=[]] - List of plugins to load and use.
 * @param {boolean} [options.babelrc=true] - Specify whether or not to use .babelrc and .babelignore files.
 * @param {boolean} [options.ast=true] - Include the AST in the returned object
 * @param {boolean} [options.minified=true] - Should the output be minified (not printing last semicolons in blocks, printing literal string values instead of escaped ones, stripping () from new when safe)
 * @param {boolean} [options.comments=true] - Output comments in generated output.
 * @param {object} [options.env={}] - This is an object of keys that represent different environments. For example, you may have: { env: { production: { someOption: true } } } which will use those options when the enviroment variable BABEL_ENV is set to "production". If BABEL_ENV isn’t set then NODE_ENV will be used, if it’s not set then it defaults to "development"
 * @param {string} [options.extends=null] - A path to an .babelrc file to extend
 */
function transformFile( filepath, options ) {
	logger.trace( "transforming file - " + filepath );
	var content = fs.readFileSync( filepath, 'utf8' );
	var result = transformCode( content, options );
	fs.writeFileSync( filepath, result );
}

/**
 * Transform the code with bablejs using babel config.
 * @function transformCode
 * @param {string} code - code to transform using babeljs
 * @param {object} options - babel configuration object (see http://babeljs.io/docs/usage/options/)
 * @param {string[]} [options.presets=[]] - List of presets (a set of plugins) to load and use..
 * @param {string[]} [options.plugins=[]] - List of plugins to load and use.
 * @param {boolean} [options.babelrc=true] - Specify whether or not to use .babelrc and .babelignore files.
 * @param {boolean} [options.ast=true] - Include the AST in the returned object
 * @param {boolean} [options.minified=true] - Should the output be minified (not printing last semicolons in blocks, printing literal string values instead of escaped ones, stripping () from new when safe)
 * @param {boolean} [options.comments=true] - Output comments in generated output.
 * @param {object} [options.env={}] - This is an object of keys that represent different environments. For example, you may have: { env: { production: { someOption: true } } } which will use those options when the enviroment variable BABEL_ENV is set to "production". If BABEL_ENV isn’t set then NODE_ENV will be used, if it’s not set then it defaults to "development"
 * @param {string} [options.extends=null] - A path to an .babelrc file to extend
 */
function transformCode( code, options ) {
	var result = babel.transform( code, options );
	var modified = result.code;
	return modified;
}

module.exports.execute = plugin;
module.exports.tasks = [];