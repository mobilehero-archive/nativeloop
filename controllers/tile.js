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
 * @file This is the core class for functionality enabled by the MobileHero platform.  
 * @module widgets/nativeloop/controllers/tile 
 * @author Brenton House <brenton.house@gmail.com>
 * @version 1.0.0
 * @since 1.0.0
 * @copyright Copyright (c) 2017 by Superhero Studios Incorporated.  All Rights Reserved.
 * @license Licensed under the terms of the MIT License (MIT)
 * 
 */




var device = require( 'nativeloop/device' );
var utils = require( 'nativeloop/utils' );
var styles = require( '../styles/styles' );
let currentArgs = { icon: {}, iconbox: {} };
var apm = require( 'nativeloop/apm' );
var nativeloop = require( 'nativeloop' );

// console.error( '[tile] $.args: ' + utils.stringify( $.args, null, 2 ) );
// console.warn( '[tile] $.nav: ' + utils.stringify( $.nav, null, 2 ) );

// require( "/nativeloop/baseController" ).call( this, $ );


// $.applyProperties = ( args ) => {
// 	console.error( '[tile] args: ' + utils.stringify( args, null, 2 ) );

// 	//TODO:  Check for existing classes from previous args.
// 	//TODO:  Merge class styles based on priority.

// 	if( args.classes ) {
// 		_.forEach( args.classes, ( className ) => {
// 			var style = _.get( _.find( styles, { isClass: true, key: className } ), 'style' );
// 			console.warn( 'style: ' + utils.stringify( style, null, 2 ) );
// 			if( style ) {
// 				_.assignIn( args, _.cloneDeep( style ) );
// 			}
// 		} );
// 	}



// 	if( !_.isNil( args.margin ) ) {
// 		args.margin = utils.parsePadding( args.margin, args.width );
// 	}

// 	// if( !_.isNil( args.padding ) ) {
// 	args.padding = utils.parsePadding( args.padding || 0, args.width );
// 	// }

// 	fixTitleAttributes( args );
// 	fixImageAttributes( args );

// 	// let titleArgs = {
// 	// 	text: args.title || args.titleText || $._title.text,
// 	// 	color: args.titleColor || args.color || $._title.color,
// 	// }
// 	args.title && $._title.applyProperties( args.title );

// 	// let imageArgs = {
// 	// 	image: args.image || $._image.image,
// 	// 	height: '50%',
// 	// 	width: '50%',
// 	// }

// 	// console.error( 'imageArgs: ' + utils.stringify( imageArgs, null, 2 ) );

// 	// $._image.applyProperties( imageArgs );
// 	$._iconbox.applyProperties( args.iconbox );
// 	$._image.applyProperties( args.image );

// 	let wrapperArgs = {
// 		width: args.width,
// 		height: args.height,
// 		_backgroundColor: 'pink',
// 	};

// 	$._wrapper.applyProperties( wrapperArgs );

// 	let outerArgs = _.assignIn( {
// 		backgroundColor: args.backgroundColor || $._outer.backgroundColor,
// 	}, args.margin );

// 	$._outer.applyProperties( outerArgs );

// 	let innerArgs = _.assignIn( {}, args.padding );

// 	$._inner.applyProperties( innerArgs );

// 	console.error( '[tile] args: ' + utils.stringify( args, null, 2 ) );
// }

var transformArgs = ( args ) => {
	var __prefix = $.__controllerPath + ".transformArgs: ";
	apm.leaveBreadcrumb( __prefix + "entering" );
	// console.error( '[tile] args: ' + utils.stringify( args, null, 2 ) );

	//TODO:  Check for existing classes from previous args.
	//TODO:  Merge class styles based on priority.

	if( args.classes ) {
		_.forEach( args.classes, ( className ) => {
			var style = _.get( _.find( styles, { isClass: true, key: className } ), 'style' );
			// console.warn( 'style: ' + utils.stringify( style, null, 2 ) );
			if( style ) {
				// _.assignIn( args, _.cloneDeep( style ) );
				_.defaultsDeep( args, _.cloneDeep( style ) );
			}
		} );
	}

	args.outer = {
		backgroundColor: args.backgroundColor || $._outer.backgroundColor,
	};

	if( !_.isNil( args.margin && args.width ) ) {
		args.margin = utils.parsePadding( args.margin, args.width );
		_.defaults( args.outer, args.margin );
	}

	if( !_.isNil( args.padding && args.width ) ) {
		args.inner = args.inner || {};
		args.padding = utils.parsePadding( args.padding || 0, args.width );
		_.defaults( args.inner, args.padding );
	}

	fixTitleAttributes( args );
	fixImageAttributes( args );

	// let titleArgs = {
	// 	text: args.title || args.titleText || $._title.text,
	// 	color: args.titleColor || args.color || $._title.color,
	// }


	// args.title && $._title.applyProperties( args.title );

	// let imageArgs = {
	// 	image: args.image || $._image.image,
	// 	height: '50%',
	// 	width: '50%',
	// }

	// console.error( 'imageArgs: ' + utils.stringify( imageArgs, null, 2 ) );

	// $._image.applyProperties( imageArgs );
	// $._iconbox.applyProperties( args.iconbox );
	// $._image.applyProperties( args.image );

	args.wrapper = {
		width: args.width,
		height: args.height,
		_backgroundColor: 'pink',
	};

	// $._wrapper.applyProperties( wrapperArgs );
	// args.outer = {
	// 	backgroundColor: args.backgroundColor || $._outer.backgroundColor,
	// };

	// _.defaults(args.outer, args.margin);
	// args.margin && ( args.outer = args.outer, args.margin );

	// // $._outer.applyProperties( outerArgs );

	// args.padding && ( args.inner = _.assignIn( {}, args.padding ) );

	apm.leaveBreadcrumb( __prefix + 'exiting' );
	__prefix = null;
	return args;
	// currentArgs = _.cloneDeep( args );
	// applyViewProperties( currentArgs );

	// args.title && $._title.applyProperties( args.title );
	// $._iconbox.applyProperties( args.iconbox );
	// $._image.applyProperties( args.image );
	// $._wrapper.applyProperties( args.wrapper );
	// $._inner.applyProperties( args.inner );
	// $._outer.applyProperties( args.outer );

	// console.error( '[tile] args: ' + utils.stringify( args, null, 2 ) );

}


$.applyProperties = ( args ) => {
	var __prefix = $.__controllerPath + ".applyProperties: ";
	apm.leaveBreadcrumb( __prefix + "entering" );
	console.error( '$.applyProperties.args: ' + JSON.stringify( args, null, 2 ) );
	currentArgs = transformArgs( _.cloneDeep( args ) );
	console.warn( '$.applyProperties.currentArgs: ' + JSON.stringify( currentArgs, null, 2 ) );
	applyViewProperties( currentArgs );
	$.addEventListeners( args, $._outer );
	apm.leaveBreadcrumb( __prefix + 'exiting' );
	__prefix = null;
}

$.applyDefaults = ( args ) => {
	var __prefix = $.__controllerPath + ".applyDefaults: ";
	apm.leaveBreadcrumb( __prefix + "entering" );

	args = _.cloneDeep( args )

	let existingClasses = _.filter( currentArgs.classes, classname => _.startsWith( classname, 'tile-' ) );
	console.error( 'existingClasses: ' + utils.stringify( existingClasses, null, 2 ) );
	if( !_.isEmpty( existingClasses ) ) {
		console.error( 'removing tile' );
		_.remove( args.classes, classname => _.startsWith( classname, 'tile-' ) );
		args.classes = _.concat( args.classes, existingClasses );
	}
	let transformedArgs = transformArgs( args );

	// console.warn( 'currentArgs: ' + utils.stringify( currentArgs, null, 2 ) );
	_.defaultsDeep( currentArgs, transformedArgs );
	// let defaultCurrentArgs = _.defaultsDeep( currentArgs, _.cloneDeep( args ));
	// console.debug('defaultCurrentArgs: ' + utils.stringify(defaultCurrentArgs, null, 2));
	// currentArgs = transformArgs( defaultCurrentArgs );
	// currentArgs = transformArgs( _.defaultsDeep( currentArgs, _.cloneDeep( args ) ) );
	applyViewProperties( currentArgs );
	apm.leaveBreadcrumb( __prefix + 'exiting' );
	__prefix = null;
}

var applyViewProperties = ( args ) => {
	var __prefix = $.__controllerPath + ".applyViewProperties: ";
	apm.leaveBreadcrumb( __prefix + "entering" );
	// console.error( 'args: ' + utils.stringify( args, null, 2 ) );
	args.title && $._title.applyProperties( args.title );
	args.iconbox && $._iconbox.applyProperties( args.iconbox );
	args.image && $._image.applyProperties( args.image );
	args.wrapper && $._wrapper.applyProperties( args.wrapper );
	args.inner && $._inner.applyProperties( args.inner );
	args.outer && $._outer.applyProperties( args.outer );
	args.icon && $._icon.applyProperties( args.icon );
	apm.leaveBreadcrumb( __prefix + 'exiting' );
	__prefix = null;
}

var fixImageAttributes = ( params ) => {
	var __prefix = $.__controllerPath + ".fixImageAttributes: ";
	apm.leaveBreadcrumb( __prefix + "entering" );

	// _.defaults(params.image, currentArgs.image);
	console.error( 'params: ' + utils.stringify( params, null, 2 ) );
	console.warn( 'currentArgs.icon: ' + JSON.stringify( currentArgs.icon, null, 2 ) );

	params.icon = params.icon || {};
	params.iconbox = params.iconbox || {};

	if( params.icon.image ) {
		params.image = { image: params.icon.image };
		delete params.icon.image;
	}
	params.iconbox = params.iconbox || {};

	// console.error( 'params.image: ' + JSON.stringify( params.image, null, 2 ) );
	// console.error( 'currentArgs.image: ' + JSON.stringify( currentArgs.image, null, 2 ) );

	if( currentArgs.image ) {
		params.image = _.defaults( params.image, currentArgs.image );
	}

	if( currentArgs.icon ) {
		params.icon = _.defaults( params.icon, currentArgs.icon );
	}

	// console.error( 'params.image: ' + JSON.stringify( params.image, null, 2 ) );
	params.iconbox.backgroundColor = params.icon.circleColor || params.iconBackgroundColor || params.icon.backgroundColor || currentArgs.iconbox.backgroundColor;
	// params.image.image = params.imageSrc || params.image.src;
	params.iconbox.height = params.iconHeight || params.icon.height;
	params.iconbox.width = params.iconWidth || params.icon.width;

	if( params.icon.circleColor ) {
		params.icon.circle = true;
	}

	// Cleanup icon property aliases
	delete params.iconHeight;
	delete params.iconWidth;
	delete params.iconBackgroundColor;
	delete params.icon.backgroundColor;
	delete params.icon.circleColor;

	if( params.height ) {
		if( _.get( currentArgs, 'iconbox.height' ) === params.iconbox.height ) {
			delete currentArgs.iconbox.height;
		}
		params.iconbox.height = utils.parsePercentage( params.iconbox.height, params.height );
	}
	if( params.width ) {
		if( _.get( currentArgs, 'iconbox.width' ) === params.iconbox.width ) {
			delete currentArgs.iconbox.width;
		}
		params.iconbox.width = utils.parsePercentage( params.iconbox.width, params.width );
	}
	// params.iconbox.height = utils.parsePercentage( params.imageHeight || params.image.height, params.width );
	// params.iconbox.width = utils.parsePercentage( params.imageWidth || params.image.width, params.width );

	// console.error( 'params.iconbox.width: ' + utils.stringify( params.iconbox.width, null, 2 ) );

	// params.iconbox.width = ( params.imageHeight - params.padding.left - params.padding.right );
	// // params.image.height = ( params.height - params.padding.top - params.padding.bottom );
	// //TODO: Use image aspect ratio
	// params.iconbox.height = params.iconbox.width;



	if( params.width ) {
		params.icon.padding = utils.parsePadding( params.iconPadding || params.icon.padding, params.width );
	}

	// console.error( 'params.icon.padding: ' + utils.stringify( params.icon.padding, null, 2 ) );

	params.icon.padding && params.icon.padding.exists && _.assignIn( params.icon, params.icon.padding );

	// Only assign height/width if we have values to work with
	_.isNumber( params.iconbox.height ) && ( params.icon.height = ( params.iconbox.height - params.icon.padding.top - params.icon.padding.bottom ) );
	_.isNumber( params.iconbox.width ) && ( params.icon.width = ( params.iconbox.width - params.icon.padding.left - params.icon.padding.right ) );

	// console.error( 'params.iconbox.width: ' + utils.stringify( params.iconbox.width, null, 2 ) );
	// console.error( 'params.icon.circle: ' + utils.stringify( params.icon.circle, null, 2 ) );
	// console.error( '_.isNumber( params.iconbox.width ): ' + utils.stringify( _.isNumber( params.iconbox.width ), null, 2 ) );
	if( ( params.icon.circleColor || params.icon.circle ) && _.isNumber( params.iconbox.width ) ) {
		params.iconbox.borderRadius = ( params.iconbox.width / 2 );
		// console.error( 'params.iconbox.borderRadius: ' + utils.stringify( params.iconbox.borderRadius, null, 2 ) );
		// params.iconbox.backgroundColor = params.icon.circleColor;
	}

	if( params.icon ) {
		params.icon.font = params.icon.font || {};
		// params.icon.font.fontFamily = 'icomoon';
		params.icon.font.fontSize = params.icon.font.fontSize || _.isNumber( params.iconbox.height ) ? params.iconbox.height * .75 : 50;
		console.error( 'params.color: ' + JSON.stringify( params.color, null, 2 ) );
		console.warn( 'params.icon.color: ' + JSON.stringify( params.icon.color, null, 2 ) );
		params.icon.color = params.icon.color || params.color;
		// params.icon.color = params.icon.color || params.color || 'black';
		console.error( 'params.icon.color: ' + JSON.stringify( params.icon.color, null, 2 ) );

		if( params.icon.name ) {
			let split = params.icon.name.split( '.' );
			params.icon.text = typeof params.icon.name === "string" ? _.get( require( "/nativeloop/iconfonts" ), params.icon.name ) : String.fromCharCode( params.icon.name );
			params.icon.font.fontFamily = params.icon.font.fontFamily || split[ 0 ];
		}


		// params.icon.text = _.get( require( 'nativeloop/iconfonts' ), params.icon.name );
		params.icon.textAlign = Ti.UI.TEXT_ALIGNMENT_CENTER;
		// params.icon.isIcon = true;
		delete params.icon.name;
	}


	// params.iconPadding && _.assignIn( params.icon, params.iconPadding );


	params.iconbox = _.omitBy( params.iconbox, _.isNil );
	params.icon = _.omitBy( params.icon, _.isNil );

	if( params.image ) {
		// console.error( 'params.image: ' + JSON.stringify( params.image, null, 2 ) );
		params.image = params.image || {};
		_.assignIn( params.image, params.icon );
		delete params.icon;
	}

	delete params[ 'iconBackgroundColor' ];
	delete params[ 'iconPadding' ];
	delete params[ 'imageSrc' ];
	// delete params.image[ 'padding' ];
	// delete params.image[ 'src' ];
	// delete params.image[ 'backgroundColor' ];


	// console.warn( 'fixImageAttributes.params: ' + JSON.stringify( params, null, 2 ) );

	apm.leaveBreadcrumb( __prefix + 'exiting' );
	__prefix = null;
}


var fixTitleAttributes = ( params ) => {
	var __prefix = $.__controllerPath + ".fixTitleAttributes: ";
	apm.leaveBreadcrumb( __prefix + "entering" );
	// console.error( 'params: ' + utils.stringify( params, null, 2 ) );

	// find any title attributes and create proper title and font object
	// if( params && ( params.titleText || params.titleColor || params.titleSize || params.titleFontStyle || params.titleFamily || params.titleWeight || params.titleTextStyle ) ) {

	params.title = params.title || {};
	params.title.lines = params.title.lines || 1;
	params.title.font = params.title.font || {};
	params.title.text = params.titleText || params.title.text;
	params.title.top = params.titleTop || params.title.top;
	params.title.color = params.titleColor || params.title.color || params.color;
	params.title.backgroundColor = params.titleBackgroundColor || params.title.backgroundColor;
	params.title.textAlign = params.titleTextAlign || params.title.textAlign;
	params.title.verticalAlign = params.titleVerticalAlign || params.title.verticalAlign;
	params.title.font.fontSize = params.titleSize || params.title.size || params.title.fontSize || params.title.font.fontSize;
	params.title.font.fontStyle = params.titleFontStyle || params.title.fontStyle || params.title.font.fontStyle; // iOS only: 'italic' or 'normal'
	params.title.font.fontFamily = params.titleFamily || params.title.fontFamily || params.title.font.fontFamily;
	params.title.font.fontWeight = params.titleWeight || params.title.fontWeight || params.title.font.fontWeight;
	params.title.font.textStyle = params.titleTextStyle || params.title.textStyle || params.title.font.textStyle;

	params.title.margin = params.titleMargin || params.title.margin;
	if( params.title.margin ) {
		params.title.margin = utils.parsePadding( params.title.margin, params.width );
	}

	params.title.margin && _.defaults( params.title, params.title.margin );

	if( params.height ) {
		if( _.get( currentArgs, 'title.height' ) === params.title.height ) {
			delete currentArgs.title.height;
		}
		if( params.title.height ) {
			params.title.height = utils.parsePercentage( params.title.height, params.height );
			params.title.font.fontSize = ( ( params.title.height * 0.75 ) / params.title.lines );
		} else if( params.title.font.fontSize ) {
			params.title.height = ( ( params.title.font.fontSize / 0.75 ) * params.title.lines );
		}
	}


	delete params[ 'titleText' ];
	delete params[ 'titleTop' ];
	delete params[ 'titleBackgroundColor' ];
	delete params[ 'titleColor' ];
	delete params[ 'titleSize' ];
	delete params[ 'titleFamily' ];
	delete params[ 'titleWeight' ];
	delete params[ 'titleFontStyle' ];
	delete params[ 'titleTextStyle' ];
	delete params[ 'titleTextAlign' ];
	delete params[ 'titleVerticalAlign' ];
	delete params[ 'titleMargin' ];
	delete params.title[ 'size' ];
	delete params.title[ 'margin' ];
	delete params.title[ 'fontSize' ];
	delete params.title[ 'fontFamily' ];
	delete params.title[ 'fontWeight' ];
	delete params.title[ 'textStyle' ];


	apm.leaveBreadcrumb( __prefix + 'exiting' );
	__prefix = null;

	// }
}

$.applyProperties( $.args );

var onPostLayout = function( e ) {
	// console.error( 'e.source.rect: ' + utils.stringify( {
	// 	source: e.source,
	// 	height: e.source.rect.height,
	// 	width: e.source.rect.width,
	// }, null, 2 ) );
}

var known_events = [ "click", "dblclick", "doubletap", "focus", "keypressed", "longclick", "longpress", "pinch", "postlayout", "singletap", "swipe", "touchcancel", "touchend", "touchmove", "touchstart", "twofingertap", "return", "change", "blur", "focus" ];