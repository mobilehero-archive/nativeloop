/***
 *                          __     _  __       __                     
 *       ____ ___   ____   / /_   (_)/ /___   / /_   ___   _____ ____ 
 *      / __ `__ \ / __ \ / __ \ / // // _ \ / __ \ / _ \ / ___// __ \ 
 *     / / / / / // /_/ // /_/ // // //  __// / / //  __// /   / /_/ / 
 *    /_/ /_/ /_/ \____//_.___//_//_/ \___//_/ /_/ \___//_/    \____/ 
 *                                                                    
 *                  mobile solutions for everyday heroes
 *                                                                    
 * @overview 
 * Widget that handles the actual implementation of the window navigation
 * -- Note -- This is a work in progress and is not fully functional!  
 * 
 * @module widgets/nativeloop/controllers/navigator
 * @author Brenton House <brenton.house@gmail.com>
 * @version 0.1.0
 * @since 0.1.0
 * @copyright Copyright (c) 2017 by Superhero Studios Incorporated.  All Rights Reserved.
 * @license Licensed under the terms of the MIT License (MIT)
 * 
 */


// var apm = Alloy.Globals.apm;
var apm = require( 'nativeloop/apm' );

$.getViewAlloy = $.getView;
$.getView = function( id ) {
	init();
	return $.getViewAlloy( id );
}

var createWindow = function( payload ) {
	return payload && payload.moduleName ? Alloy.createController( payload.moduleName, payload ).getViewEx( { recurse: true } ) : null;
}

var init = _.once( function() {
	var __prefix = $.__controllerPath + ".init: ";
	apm.leaveBreadcrumb( __prefix + "entering" );
	var window_stack = [];
	var __local_prefix
	if( OS_IOS ) {
		$.root = $.args.root ? Alloy.createController( $.args.root.moduleName, $.args.root ).getViewEx( { recurse: true } ) : Ti.UI.createWindow( { id: "window" } );
		$.nav = Ti.UI.iOS.createNavigationWindow( {
			window: $.root,
			id: "nav"
		} );

		$.addClass( $.root, 'navbar' );

		// console.error('$.nav.barColor: ' + JSON.stringify($.nav.barColor, null, 2));
		$.nav && $.addTopLevelView( $.nav );
		$.go = function( payload ) {
			__local_prefix = $.__controllerPath + ".go: ";
			apm.leaveBreadcrumb( __local_prefix + "entering" );
			var window;
			try {
				window = createWindow( payload );
			} catch( err ) {
				console.error( err );
			}
			window && $.nav.openWindow( window, { animated: payload.animated } );
			window_stack.push( window );
			apm.leaveBreadcrumb( __local_prefix + "exiting" );
		};
		$.goBack = function( payload ) {
			__local_prefix = $.__controllerPath + ".goBack: ";
			apm.leaveBreadcrumb( __local_prefix + "entering" );
			if( !payload ) {
				return;
			}
			var window = window_stack.pop();
			window && $.nav.closeWindow( window, payload.options );
			apm.leaveBreadcrumb( __local_prefix + "exiting" );
		};
		//TODO:  This should probably be handled by a close function which is called by the navigator...
		$.goHome = function( payload ) {
			__local_prefix = $.__controllerPath + ".goHome: ";
			apm.leaveBreadcrumb( __local_prefix + "entering" );
			for( var i = 0; i < window_stack.length; i++ ) {
				window_stack[ i ].close( Ti.UI.iPhone.AnimationStyle.NONE );
			}
			apm.leaveBreadcrumb( __local_prefix + "exiting" );
		};

	}


	if( OS_ANDROID ) {
		$.root = $.args.root ? Alloy.createController( $.args.root.moduleName, $.args.root ).getViewEx( { recurse: true } ) : Ti.UI.createWindow();
		$.root && $.addTopLevelView( $.root );
		$.go = function( payload ) {
			__local_prefix = $.__controllerPath + ".go: ";
			apm.leaveBreadcrumb( __local_prefix + "entering" );
			var window;
			try {
				window = createWindow( payload );
			} catch( err ) {
				console.error( err );
			}
			if( window ) {
				window.addEventListener( "open", function( evt ) {
					var actionBar = window.activity.actionBar;
					if( actionBar ) {
						actionBar.homeButtonEnabled = true;
						actionBar.displayHomeAsUp = true;
						actionBar.onHomeIconItemSelected = function() {
							evt.source.close();
							window_stack.pop();
						};
					} else {
						console.warn( "No ActionBar found." );
					}
				} );

				window.open();
				window_stack.push( window );
			}
			apm.leaveBreadcrumb( __local_prefix + "exiting" );
		};
		$.goHome = function( payload ) {
			__local_prefix = $.__controllerPath + ".goHome: ";
			apm.leaveBreadcrumb( __local_prefix + "entering" );
			for( var i = 0; i < window_stack.length; i++ ) {
				console.error( "closing window: " + window_stack[ i ].id );
				window_stack[ i ].close();
			}
		};
	}


	if( OS_MOBILEWEB ) {
		$.window = Ti.UI.createWindow( { id: "window" } );
		$.addTopLevelView( $.window );
		$.root = $.args.root ? Alloy.createController( $.args.root.moduleName, $.args.root ).getViewEx( { recurse: true } ) : Ti.UI.createWindow();
		$.nav = Ti.UI.MobileWeb.createNavigationGroup( {
			window: $.root,
			id: "nav"
		} );
		$.window.add( $.nav );
		$.navigate = function( payload ) {
			__local_prefix = $.__controllerPath + ".navigate: ";
			apm.leaveBreadcrumb( __local_prefix + "entering" );
			var window;
			try {
				window = createWindow( payload );
			} catch( err ) {
				console.error( err );
			}
			window && $.nav.open( window );
			window_stack.push( window );
			apm.leaveBreadcrumb( __local_prefix + "exiting" );
		};
		//TODO:  This should probably be handled by a close function which is called by the navigator...
		$.goHome = function( payload ) {
			__local_prefix = $.__controllerPath + ".goHome: ";
			for( var i = 0; i < window_stack.length; i++ ) {
				window_stack[ i ].close();
			}
			apm.leaveBreadcrumb( __local_prefix + "exiting" );
		};
	}

	if( OS_WINDOWS ) {
		$.root = $.args.root ? Alloy.createController( $.args.root.moduleName, $.args.root ).getViewEx( { recurse: true } ) : Ti.UI.createWindow();
		$.root && $.addTopLevelView( $.root );
		$.navigate = function( payload ) {
			__local_prefix = $.__controllerPath + ".navigate: ";
			apm.leaveBreadcrumb( __local_prefix + "entering" );
			var window;
			try {
				window = createWindow( payload );
			} catch( err ) {
				console.error( err );
			}
			window && window.open();
			apm.leaveBreadcrumb( __local_prefix + "exiting" );
		}
	}
	apm.leaveBreadcrumb( __prefix + "exiting" );
} );