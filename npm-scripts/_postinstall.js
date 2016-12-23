var fs = require( "fs-extra" );
var path = require( "path" );
var tiappDir = require( "tiapp-dir" );
var pathExists = require( 'path-exists' );

var root = tiappDir.sync( process.env.PWD );

if( !root ) {
	console.error( "tiapp.xml does not exist: " + process.env.PWD );
	return;
}

var target = path.join( root, "app", "alloy.jmk" );
console.error( "target: " + target );
var source = path.join( __dirname, "..", "template", "alloy.jmk" );
if( pathExists.sync( source ) ) {
	if( pathExists.sync( target ) ) {
		// check to see if the alloy.jmk is one provided by nativeloop
		var original = fs.readFileSync( target, 'utf8' );
		var test = /\/\/NATIVELOOP: ALLOY\.JMK/.test( original );
		console.info( "nativeloop alloy.jmk in place: " + test );
		if( !test ) {
			console.info( "Renaming alloy.jmk to alloy.bakup.jmk" );
			fs.renameSync( path.join( root, "app", "alloy.jmk" ), path.join( root, "app", "alloy.bakup.jmk" ) )
		}
	}

	console.info( "Copying alloy.jmk to " + target );
	fs.copySync( path.join( __dirname, "..", "template", "alloy.jmk" ), target, { clobber: true, dereference: true } );
} else {
	console.error( "source file does not exist: " + source );
}