var ux = require( "nativeloop/ux" );

var ui = {};
ui.createLabel = function ( params ) {
	params = ux.createDefaultParams( params );
	ux.fixFontAttributes( params );
	ux.fixLines( params );
	var view = Ti.UI.createLabel( params );
	return view;
}