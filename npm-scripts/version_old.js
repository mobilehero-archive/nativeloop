var _ = require( "lodash" );
var semver = require( "semver" );
// var tiapp = require("tiapp.xml").load('./tiapp.xml');
// var initial_version = tiapp.version;

var package = require( "../package" );
var initial_version = package.version;

var versions = initial_version.split( '.' );
var major = _.parseInt( versions[ 0 ] ) || 1;
var minor = _.parseInt( versions[ 1 ] ) || 0;
var build = _.parseInt( versions[ 2 ] ) || 0;
var revision = _.parseInt( versions[ 3 ] ) || 0;

// revision++;

// tiapp.version = major + "." + minor + "." + build + "." + revision;
// tiapp.write();

var spawn = require( 'child_process' ).spawn;
console.log( "initial_version: " + initial_version );

// var new_version = major + "." + minor + ".beta-" + build + "." + revision;

var new_version = semver.inc( initial_version, 'prerelease', 'beta' );
console.log( "new_version: " + new_version );

var git_cmd = "git";
if( process.platform === 'win32' ) {
	var npm_cmd = 'npm.cmd'
} else {
	var npm_cmd = 'npm'
}

//kick off process
var npm = spawn( npm_cmd, [ '--no-git-tag-version', 'version', new_version ] );
var git;

//spit stdout to screen
npm.stdout.on( 'data', function( data ) { process.stdout.write( data.toString() ); } );

// //spit stderr to screen 	
npm.stderr.on( 'data', function( data ) { process.stdout.write( data.toString() ); } );

npm.on( 'close', function( code ) {
	git = spawn( git_cmd, [ 'commit', '-am', ":checkered_flag: updating code for version " + new_version ] );

	//spit stdout to screen
	git.stdout.on( 'data', function( data ) { process.stdout.write( data.toString() ); } );

	// //spit stderr to screen 	
	git.stderr.on( 'data', function( data ) { process.stdout.write( data.toString() ); } );

	git.on( 'close', function( code ) {
		console.log( "Finished: " + code );
		console.log( "-----------------------------------------------------------" );
	} );

	console.log( "Finished: " + code );
	console.log( "-----------------------------------------------------------" );
} );