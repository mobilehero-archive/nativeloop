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
 * @file {nativeloop} plugin for parsing alloy xml views
 * @module nativeloop/plugins/alloy-parser
 * @author Brenton House <brenton.house@gmail.com>
 * @copyright Copyright (c) 2017 by Superhero Studios Incorporated.  All Rights Reserved.
 * @license Licensed under the terms of the MIT License (MIT)
 * 
 */

var _ = require( 'lodash' );

var alloyParser = {};
module.exports = alloyParser;

alloyParser.init = function( params ) {
	alloyParser.parserParams = params;
}

alloyParser.parse = function( params ) {
	console.error( '********* WRAPPING base.parse **********' );
	return _.wrap( params.baseParser.parse, function( func, node, state, parser ) {
		var logger = console;
		var selectedParser = parser;
		var CONST = alloyParser.parserParams.CONST;
		var CU = alloyParser.parserParams.CU;
		var U = alloyParser.parserParams.U;

		console.error( '********* BASE:PARSE **********' );

		if( CU[ CONST.DOCROOT_MODULE_PROPERTY ] && !node.hasAttribute( 'module' ) ) {
			node.setAttribute( 'module', CU[ CONST.DOCROOT_MODULE_PROPERTY ] );
		}

		var fullname = CU.getNodeFullname( node );
		var src = node.getAttribute( 'src' );
		var name = node.getAttribute( 'name' );
		var moduleName = node.getAttribute( 'module' );
		node.nodeName = _.upperFirst( _.camelCase( node.nodeName ) );
		// logger.error("name in parser: " + name);
		// logger.error("module in parser: " + moduleName);
		// logger.error("fullname in parser: " + fullname);
		// logger.error("nodeName in parser: " + _.lowerFirst(node.nodeName));

		logger.error( 'moduleName: ' + JSON.stringify( moduleName, null, 2 ) );
		if( moduleName === '/nativeloop' ) {
			moduleName = 'nativeloop';
			node.setAttribute( 'module', 'nativeloop' );
		}
		if( moduleName === 'nativeloop' ) {

			var nodeText = U.XML.getNodeText( node );
			console.error( "nodeText: " + nodeText );
			if( nodeText ) {
				nodeText = U.trim( nodeText.replace( /'/g, "\\'" ) );
				node.setAttribute( 'text', nodeText );
			}
			// _.forEach( node.attributes, function( attribute ) {
			// 	// logger.debug("attribute: " + attribute.name + ": " + attribute.value);
			// } );

			//TODO:  Add this to constants module
			node.setAttribute( '__nativeloop', true );
			node.setAttribute( '__navigatorId', "_.get($,'nav.id')");

			console.warn( 'you are here → Looking for widget node: ' + _.lowerFirst( node.nodeName ) );
			if( _.includes( alloyParser.parserParams.nativeloop_widgets, _.lowerFirst( node.nodeName ) ) ) {

				console.error( 'you are here → Found widget node: ' + _.lowerFirst( node.nodeName ) );

				!src && node.setAttribute( 'src', moduleName );
				!name && node.setAttribute( 'name', _.lowerFirst( node.nodeName ) );

				// make autoStyle default to true for nativeloop tags.
				if( _.isNil( node.getAttribute( 'autoStyle' ) ) || _.isEmpty( node.getAttribute( 'autoStyle' ) ) ) {
					node.setAttribute( 'autoStyle', true );
				}

				// var nodeText = U.XML.getNodeText( node );
				// console.error("nodeText: " + nodeText);
				// if( nodeText ) {
				// 	nodeText = U.trim( nodeText.replace( /'/g, "\\'" ) );
				// 	node.setAttribute( 'text', nodeText );
				// }
				// // _.forEach( node.attributes, function( attribute ) {
				// // 	// logger.debug("attribute: " + attribute.name + ": " + attribute.value);
				// // } );

				// //TODO:  Add this to constants module
				// node.setAttribute( '__nativeloop', true );

				selectedParser = params.widgetParser.parse;

			}

		} else {
			// logger.debug("returning default parser");
			// _.forEach( node.attributes, function( attribute ) {
			// logger.debug("attribute: " + attribute.name + " = " + attribute.value);
			// } );
		}

		var args = CU.getParserArgs( node, state ),
			code = '';

		// console.error( 'args.createArgs: ' + JSON.stringify( args.createArgs, null, 2 ) );
		// Convert attributes that are in dot-notation to objects.
		_.forEach( _.keys( args.createArgs ), key => {
			console.error( 'key: ' + JSON.stringify( key, null, 2 ) );
			if( _.includes( key, '.' ) ) {
				let value = args.createArgs[ key ];
				delete args.createArgs[ key ];
				let split = key.split( '.' );
				if( _.last( split ) === 'class' ) {
					split[ split.length - 1 ] = 'classes';
					key = split.join( '.' );
					value = value.split( ' ' );
				}
				_.set( args.createArgs, key, value );
				delete args.createArgs[ key ];
			}
		} );


		// console.error( 'args.createArgs: ' + JSON.stringify( args.createArgs, null, 2 ) );

		if( state.pre ) {
			code += state.pre( node, state, args ) || '';
			delete state.pre;
		}
		var newState = selectedParser( node, state, args );
		// logger.error( 'newState.code: ' + JSON.stringify( newState.code, null, 2 ) );
		// newState.code = newState.code.replace( /((Alloy.createWidget[^{]+{)(apiName))/g, "$2 navigator: _.get($,'args.navigator'), $3" )
		// logger.error( 'newState.code: ' + JSON.stringify( newState.code, null, 2 ) );
		code += newState.code;
		if( state.post ) {
			logger.error( 'state.post: ' + JSON.stringify( state.post, null, 2 ) );
			code += state.post( node, newState, args ) || '';
			delete state.post;
		}
		newState.code = code;

		// if( node.getAttribute( '__nativeloop' ) && newState.code && newState.parent && newState.parent.symbol ) {
		if( node.getAttribute( '__nativeloop' ) && newState.code ) {
			// newState.parent.symbol = newState.parent.symbol.replace( /\.getViewEx[^\)]*\)/, '' );
			newState.code = newState.code.replace( /\.getViewEx[^\)]*\)/g, '' );
			newState.code = newState.code.replace( /(__navigatorId:\s*)"([^"]*)"/g, '$1$2' );
		}

		return newState;

		// var newState = func( node, state, selectedParser );
		// if( node.getAttribute( '__nativeloop' ) && newState.parent && newState.parent.symbol ) {
		// 	// newState.parent.symbol = newState.parent.symbol.replace( /\.getViewEx[^\)]*\)/, '' );
		// 	newState.code = response.newState.replace( /\.getViewEx[^\)]*\)/g, '' );
		// }
		// return newState;
	} );
}