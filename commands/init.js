var path = require( 'path' );
var fs = require( 'fs-extra' );
var _ = require( 'lodash' );
// var conf = require('rc')('nativeloop', {});
var pathExists = require( 'path-exists' );

exports.desc = 'Initializes a project for native development with {nativeloop}.'

var builder = {

	"path": {
		alias: "p",
		default: process.cwd(),
		describe: "Specifies the directory where you want to initialize the project, if different from the current directory. The directory must already exist.",
		demand: false,
		type: "string"
	},
	"force": {
		alias: "f",
		describe: "If set, applies the default project configuration and does not show the interactive prompt. ",
		demand: false,
		type: "string"
	}

}
var copy_template = function( argv ) {

	console.info( 'copy template  ----------------------------------------------' );
	console.info( 'path: ' + argv[ 'path' ] );
	// process.chdir(argv['path']);
	console.info( '__dirname: ' + __dirname );
	console.info( 'process.cwd(): ' + process.cwd() );

	let filename = 'alloy.jmk';
	let source = path.join( __dirname, "..", 'templates', filename );
	let root = argv[ "path" ];
	console.error( 'source: ' + source );
	console.info( 'root: ' + root );

	console.warn( 'pathExists.sync(source): ' + pathExists.sync( source ) );
	console.warn( 'pathExists.sync(root): ' + pathExists.sync( root ) );

	if( !pathExists.sync( source ) ) {
		console.error( 'source does not exist: ' + source );
		return;
	}

	let tiapp = path.join( root, 'tiapp.xml' );

	if( !pathExists.sync( tiapp ) ) {
		console.error( 'Cannot find tiapp.xml: ' + tiapp );
		return;
	}

	let target = path.join( root, 'app', filename );

	Promise.resolve( () => console.error( "pathExists.sync(target): " + pathExists.sync( root ) ) )
		.then( () => {
			// check to see if the file is a nativeloop file.
			// if it is not, make a backup of the file.
		} )
		.then( () => console.warn( "copying files to target directory: " + root ) )
		.then( () => fs.copyAsync( source, target, {
			clobber: true
		} ) )
		.then( () => console.warn( "all done." ) )
		.catch( err => console.error( "Error occurred: " + err ) );



}

var handler = function( argv ) {
	copy_template( argv );
}

exports.handler = handler;
exports.builder = builder;