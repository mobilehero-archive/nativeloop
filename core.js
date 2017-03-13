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
 * @file core module for {nativeloop}, a framework for building native mobile apps using nodejs style javascript.
 * @module nativeloop/core
 * @author Brenton House <brenton.house@gmail.com>* 
 * @version 1.0.0
 * @since 1.0.0
 * @copyright Copyright (c) 2017 by Superhero Studios Incorporated.  All Rights Reserved.
 * @license Licensed under the terms of the MIT License (MIT)
 * 
 */

const _ = require( 'lodash' );
const path = require( 'path' );
const resolve = require( 'resolve' );
const paths = require( 'global-paths' );
const hjson = require( 'hjson' );
const utils = require( './utils' );
// var config;
var _event;
const debug = require( 'debug' );
const log = debug( 'nativeloop' );
const warn = debug( 'nativeloop' );
debug.log = console.info.bind( console );
const alloyParser = require( './alloy-parser' );
const nativeloop_widgets = require( './widgets' );

var CONST;
var CU;
var U;


function handler( params ) {
	init( params );
}
module.exports = handler;

/**
 * @function init
 * @summary Initialize the core handler
 * @param {object} params - Parameters to initialize core
 * @since 1.0.0
 */
var init = function( params ) {
	// console.debug("params: " + JSON.stringify(params, null, 2));

	CONST = params.constants;
	CU = params.compilerUtils;
	U = params.utils;


	// var x = U.getWidgetDirectories.toString();
	// console.error('x.length: ' + JSON.stringify(x.length, null, 2));
	// console.error('U.getWidgetDirectories: ' + U.getWidgetDirectories.toString());
	// console.error('U.getWidgetDirectories.findWidgetAsNodeModule: ' + U.getWidgetDirectories.findWidgetAsNodeModule.toString());


	params.resolve.sync = _.wrap( params.resolve.sync, function( func, id, opts ) {
		console.error( 'you are here → resolve.sync: ' + id );
		var response;
		try {
			response = func( id, opts );
			console.error( 'you are here → resolve.sync: after 1st' );
			console.error( 'response: ' + JSON.stringify( response, null, 2 ) );
			return response;
		} catch( error ) {

			// var regex = new RegExp( CONST.NPM_WIDGET_PREFIX + '([^\/]*)\/widget' );
			var regex = new RegExp( CONST.NPM_WIDGET_PREFIX + '(.*)\/widget' );
			var found = regex.exec( id );
			console.error( 'found[1]: ' + JSON.stringify( found[ 1 ], null, 2 ) );
			if( found && found[ 1 ] ) {
				console.error( 'you are here → resolve.sync: before 2nd -- ' + found[ 1 ] );
				response = func( found[ 1 ] + '/widget', opts );
				console.error( 'you are here → resolve.sync: after 2nd' );
				return response;
			}
		}
	} );

	params.jsonlint.parse = _.wrap( params.jsonlint.parse, function( func, input, opts ) {
		debug.error( 'you are here → jsonlint.parse: ' );
		debug.warn( 'input: ' + JSON.stringify( input, null, 2 ) );

		var result = func( input );
		return require( './fix-config' ).addWidgets( { input: result, logger: debug } );
		// return hjson.parse( input, opts );
	} );


	U.getWidgetDirectories = _.wrap( U.getWidgetDirectories, function( func, options ) {
		console.log( "********* getWidgetDirectories **********" );
		return func( options );
	} );


	// var widgetParser = {
	// 	parse: ( node, state ) => {
	// 		if( !node.getAttribute( 'src' ) && state.widgetId ) {
	// 			node.setAttribute( 'src', state.widgetId );
	// 		}

	// 		console.error( 'you are here → inside widgetParser' );
	// 		node.nodeName = 'Require';
	// 		node.setAttribute( 'type', 'widget' );

	// 		let response = params.requireParser.parse( node, state );
	// 		return response;
	// 	}
	// }


	params.baseParser.parse = alloyParser.parse( {
		baseParser: params.baseParser,
		defaultParser: params.defaultParser,
		widgetParser: params.widgetParser,
		// widgetParser: widgetParser,
	} );


	// params.requireParser.parse = _.wrap( params.requireParser.parse, ( func, node, state ) => {
	// 	console.error('you are here → inside the FAKE require parser');
	// 	let response = func( node, state );
	// 	// console.error(  node  );
	// 	// console.error( node.attributes);
	// 	// console.error( state );
	// 	// console.error('node.getAttribute("__nativeloop"): ' + JSON.stringify(node.getAttribute('__nativeloop'), null, 2));

	// 	// console.error( 'response: ' + JSON.stringify( response, null, 2 ) );
	// 	if( node.getAttribute( '__nativeloop' ) && response.parent && response.parent.symbol ) {
	// 		console.error( 'you are here → fixing parent.symbol' );
	// 		// response.parent.symbol = response.parent.symbol.replace( /\.getViewEx[^\)]*\)/, '' );
	// 		response.code = response.code.replace( /\.getViewEx[^\)]*\)/g, '' );
	// 	}
	// 	console.error( 'response.code: ' + JSON.stringify( response.code, null, 2 ) );
	// 	console.error( 'response.parent: ' + JSON.stringify( response.parent, null, 2 ) );
	// 	return response;
	// } );

	U.XML.getAlloyFromFile = handler.getAlloyFromFile;

	console.log( "********* WRAPPING uglifyjs.parse **********" );
	params.uglifyjs.parse = _.wrap( params.uglifyjs.parse, function( func, code, options ) {
		console.log( "********* PRE:PARSE **********" );
		var params = {
			code: code
		};
		executeScripts( "preparse", params );
		return func( params.code, options );
	} );

	alloyParser.init( {
		CONST: CONST,
		CU: CU,
		U: U,
		nativeloop_widgets: nativeloop_widgets,
	} );



	params.task( "pre:load", handler.preload );
	params.task( "pre:compile", handler.precompile );
	params.task( "post:compile", handler.postcompile );
	params.task( "compile:app.js", handler.appjs );
}

/**
 * @function getAlloyFromFile
 * @summary summary
 * @param {string} filename - description
 * @since 1.0.0
 * @returns {object} - description
 */
handler.getAlloyFromFile = function( filename ) {

	// console.trace("***** INSIDE getAlloyFromFile()");
	var doc = U.XML.parseFromFile( filename );
	var docRoot = doc.documentElement;

	if( _.toLower( docRoot.nodeName ) === "nativeloop" ) {
		docRoot.nodeName = CONST.ROOT_NODE;
		docRoot.setAttribute( "module", "/nativeloop" );
	} else if( docRoot.nodeName === CONST.ROOT_NODE.toLowerCase() ) {
		docRoot.nodeName = CONST.ROOT_NODE;
	}
	// Make sure the markup has a top-level <Alloy> tag
	else if( docRoot.nodeName !== CONST.ROOT_NODE ) {
		exports.die( [
			'Invalid view file "' + filename + '".',
			'All view markup must have a top-level <Alloy> tag'
		] );
	}

	return docRoot;
};

// handler.preparse = function ( func ) {
// 	console.log( "********* WRAPPING uglifyjs.parse **********" );
// 	return _.wrap( func, function ( func, code, options ) {
// 		console.log( "********* PRE:PARSE **********" );
// 		var params = {
// 			code: code
// 		};
// 		executeScripts( "preparse", params );
// 		return func( params.code, options );
// 	} );
// }

// handler.alloyParser = alloyParser.parse;

/**
 * @function splitTasks
 * @summary summary
 * @param {object} tasks - description
 * @since 1.0.0
 * @returns {object} - description
 */
function splitTasks( tasks ) {
	var results = [];
	if( !_.isArray( tasks ) ) {
		tasks = [ tasks ];
	}
	// handler.logger.trace("splitting tasks...");
	// handler.logger.trace("tasks: " + JSON.stringify(tasks, null, 2));
	_.forEach( tasks, function( task ) {

		if( _.isArray( task.events ) && !_.isEmpty( task.events ) ) {
			// handler.logger.trace("found events to split");
			_.forEach( task.events, function( event ) {
				var splitTask = _.cloneDeep( task );
				splitTask.events = event;
				results.push( splitTask );
			} );
		} else {
			results.push( task );
		}

	} );
	return results;

}

var _init = _.once( function() {
	loadConfig();
	configureTasks();
} );


/**
 * @function loadTasks
 * @summary summary
 * @since 1.0.0
 * @returns {object} - description
*/
function loadTasks() {
	var tasks = _.cloneDeep( _.get( handler.config, "nativeloop.tasks", [] ).concat( require( "./core_tasks" ) ) );
	// handler.logger.debug("loaded Tasks: " + JSON.stringify(tasks, null, 2));
	return tasks;
}

/**
 * @function configureTasks
 * @summary summary
 * @param {object} tasks - description
 * @since 1.0.0
 * @returns {object} - description
 */
function configureTasks( tasks ) {

	tasks = tasks || loadTasks();

	var configuredTasks = [];
	var importedTasks = [];
	// handler.logger.trace("tasks coming into configureTasks(): " + JSON.stringify(tasks, null, 2));
	_.forEach( tasks, function( task ) {
		// handler.logger.trace("task: " + JSON.stringify(task, null, 2));
		if( _.isString( task ) ) {
			handler.logger.trace( "getting default tasks for module: " + task );
			var target = require( resolve.sync( task, {
				basedir: handler.event.dir.project
			} ) );
			importedTasks = importedTasks.concat( target.tasks || [] );
			// handler.logger.error("target.tasks: " + JSON.stringify(target.tasks, null, 2));
			// handler.logger.warn("imported tasks: " + JSON.stringify(importedTasks, null, 2));
			return true;
		} else {
			// handler.logger.trace("adding task: " + JSON.stringify(task, null, 2));
			configuredTasks.push( _.defaults( task, {
				weight: 1000,
				platforms: [ "ios", "android", "mobileweb", "windows" ]
			} ) );
		}
	} );


	if( !_.isEmpty( importedTasks ) ) {
		handler.logger.debug( "Configuring importedTasks" )
		configuredTasks = configuredTasks.concat( configureTasks( importedTasks ) );
	} else {
		handler.configuredTasks = splitTasks( configuredTasks );
		// handler.logger.trace("handler.configuredTasks: " + JSON.stringify(handler.configuredTasks, null, 2));
	}
	return configuredTasks;
}

/**
 * @function loadConfig
 * @summary Load alloy config file and set it to property in handler
 * @since 1.0.0
*/
var loadConfig = function() {

	handler.logger.debug( "Loading alloy config file" );
	handler.config = require( path.join( handler.event.dir.resourcesPlatform, "alloy", "CFG" ) );
	// handler.logger.trace(JSON.stringify(handler.event, null, 2));
	// handler.logger.trace(JSON.stringify(handler.config, null, 2));
}

Object.defineProperty( handler, "event", {

	get: function() {
		return _event;
	},
	set: function( event ) {
		_event = event;
		event.dir.resourcesPlatform = path.join( event.dir.resources, event.alloyConfig.platform === 'ios' ? 'iphone' : event.alloyConfig.platform );
	},
	enumerable: true,
	configurable: false
} );

/**
 * @function executeScripts
 * @summary summary
 * @param {string} eventName - description
 * @param {object} params    - description
 * @since 1.0.0
 */
function executeScripts( eventName, params ) {

	// handler.logger.trace("task to execute: " + JSON.stringify(handler.configuredTasks, null, 2));
	// handler.logger.trace("handler.configuredTasks: " + JSON.stringify(handler.configuredTasks, null, 2));
	var tasks = _.sortBy( _.filter( handler.configuredTasks || [], ( task ) => {
		return task.events === eventName && _.includes( task.platforms, handler.event.alloyConfig.platform );
	} ), "weight" );
	params = params || {};

	_.forEach( tasks, function( task ) {

		//TODO:  Check to make sure task is an object...

		var taskParams = {
			event: handler.event,
			config: handler.config,
			logger: handler.logger,
			code: params.code,
		};

		_.defaults( taskParams, task );
		handler.logger.debug( "executing task: " + task.module );
		// handler.logger.debug("taskParams: " + JSON.stringify(taskParams, null, 2));
		var target = require( resolve.sync( task.module, {
			basedir: handler.event.dir.project,
			paths: paths(),
		} ) );
		_.isFunction( target.execute ) && target.execute( taskParams );

		if( taskParams.code ) {
			// handler.logger.trace(taskParams.code);
			params.code = taskParams.code;
		}

	} );

}

var events = [ "preload", "precompile", "postcompile", "appjs" ];
_.forEach( events, function( eventName ) {
	handler[ eventName ] = function( event, logger ) {
		// handler.logger = logger;
		debug.trace = logger.trace.bind( logger );
		debug.debug = logger.debug.bind( logger );
		debug.info = logger.info.bind( logger );
		debug.warn = logger.warn.bind( logger );
		debug.error = logger.error.bind( logger );
		handler.logger = debug;
		handler.event = event;
		_init();

		handler.logger.warn( "********************* STARTING EVENT: " + eventName + " ***************************" );
		handler.logger = logger;
		// debug.trace = logger.trace.bind(logger);
		// debug.warn = logger.debug.bind(logger);
		// debug.info = logger.info.bind(logger);
		// debug.warn = logger.warn.bind(logger);
		// debug.error = logger.error.bind(logger);
		// handler.logger = debug;

		executeScripts( eventName );
		handler.logger.warn( "********************* FINISHED EVENT: " + eventName + " ***************************" );
	}
} );