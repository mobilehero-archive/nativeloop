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
 * @file 
 * {nativeloop} plugin for parsing alloy xml views
 * 
 * @module 
 * nativeloop/plugins/alloy-parser
 * 
 * @author 
 * Brenton House <brenton.house@gmail.com>
 * 
 * @copyright
 * Copyright (c) 2017 by Superhero Studios Incorporated.  All Rights Reserved.
 *      
 * @license
 * Licensed under the terms of the MIT License (MIT)
 * Please see the license.md included with this distribution for details.
 * 
 */

var _ = require("lodash");

var alloyParser = {};
module.exports = alloyParser;

alloyParser.init = function(params) {
	alloyParser.parserParams = params;
}

alloyParser.parse = function(params) {
	console.error("********* WRAPPING base.parse **********");

	// console.info("nativeloop_widgets: " + JSON.stringify(alloyParser.parserParams.nativeloop_widgets, null, 2));

	return _.wrap(params.baseParser.parse, function(func, node, state, parser) {
		var logger = console;
		var selectedParser = parser;
		var CONST = alloyParser.parserParams.CONST;
		var CU = alloyParser.parserParams.CU;
		var U = alloyParser.parserParams.U;

		console.error("********* BASE:PARSE **********");

		if(CU[CONST.DOCROOT_MODULE_PROPERTY] && !node.hasAttribute('module')) {
			node.setAttribute('module', CU[CONST.DOCROOT_MODULE_PROPERTY]);
		}

		var fullname = CU.getNodeFullname(node);
		var src = node.getAttribute('src');
		var name = node.getAttribute('name');
		var moduleName = node.getAttribute('module');
		node.nodeName = _.upperFirst(_.camelCase(node.nodeName));
		// logger.error("name in parser: " + name);
		// logger.error("module in parser: " + moduleName);
		// logger.error("fullname in parser: " + fullname);
		// logger.error("nodeName in parser: " + _.lowerFirst(node.nodeName));
		if(moduleName === "nativeloop") {

			if(_.includes(alloyParser.parserParams.nativeloop_widgets, _.lowerFirst(node.nodeName))) {
				// logger.debug("returning Alloy.Widget parser");

				!src && node.setAttribute("src", moduleName);
				!name && node.setAttribute("name", _.lowerFirst(node.nodeName));


				var nodeText = U.XML.getNodeText(node);
				// console.debug("nodeText: " + nodeText);
				if(nodeText) {
					nodeText = U.trim(nodeText.replace(/'/g, "\\'"));
					node.setAttribute("text", nodeText);
				}
				_.forEach(node.attributes, function(attribute) {
					// logger.debug("attribute: " + attribute.name + ": " + attribute.value);
				});

				selectedParser = params.widgetParser.parse;
			}

		} else {
			// logger.debug("returning default parser");
			_.forEach(node.attributes, function(attribute) {
				// logger.debug("attribute: " + attribute.name + " = " + attribute.value);
			});
		}


		return func(node, state, selectedParser);

	});
}