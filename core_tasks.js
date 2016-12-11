'use strict';

module.exports = [
	// {
	// 	"module": "nativeloop/plugins/npm",
	// 	"dirname": "${event.dir.lib}",
	// 	"args": ["install"],
	// 	"events": "preload",
	// 	"weight": 100,
	// },
	{
		"module": "nativeloop/plugins/promises",
		"events": "postcompile",
		"weight": 100,
	}, {
		"module": "nativeloop/plugins/underscore-fix",
		"events": "postcompile",
		"weight": 110,
	}, {
		"module": "nativeloop/plugins/backbone-fix",
		"events": "postcompile",
		"weight": 120,
	},

	// TODO:  Need to figure out way to add hook after Titanium has completed
	// {
	// 	"module": "nativeloop/plugins/remove-invalid-header",
	// 	"events": "postcompile",
	// 	"weight": 120,
	// 	"platforms": ["mobileweb"],
	// },
	// {
	// 	"module": "nativeloop/plugins/widgets-add",
	// 	"events": "preload",
	// 	"weight": 110,
	// }, {
	// 	"module": "nativeloop/plugins/widgets-remove",
	// 	"events": "postcompile",
	// 	"weight": 500,
	// },

	{
		"module": "nativeloop/plugins/nodejs",
		"events": "postcompile",
		"includes": [ "**/*.js", "**/*.json", "!resolver.js", "!**/alloy/underscore.js" ],
		"weight": 200,
	}, {
		"module": "nativeloop/plugins/babeljs",
		"options": {
			// "presets": ["es2015"]
			'presets': [ require( 'babel-preset-es2015' ) ],
		},
		"includes": [ "**/*.js", "!backbone2.js", "**/alloy/lodash.js" ],
		"events": [ "preload" ],
		"weight": 200,
	}, {
		"module": "nativeloop/plugins/babeljs",
		"options": {
			// "presets": [ "es2015" ]
			'presets': [ require( 'babel-preset-es2015' ) ],
		},
		"includes": [ "**/*.js", "!backbone2.js", "**/alloy/lodash.js" ],
		"events": [ "preparse" ],
		"weight": 100,
	},
]