var _ = require( "lodash" );
var semver = require( "semver" );
var spawn = require( 'child_process' ).spawn;

// Process any arguments
var args = process.argv.slice( 2 );
var message;
if( args.length === 0 ) {
	message = "Uh, everything is under control. Situation normal.";
} else {
	message = args.join( " " );
}

if( !_.includes( message, "{{" ) ) {
	message = ":checkered_flag: v{{version}} :heavy_minus_sign: " + message;
}

// Load current version
var package = require( "../package" );
console.log( "package.version: " + package.version );

// Create new version
var new_version = semver.inc( package.version, 'prerelease', '' );
console.log( "new_version: " + new_version );

// Format commit message
_.templateSettings.interpolate = /{{([\s\S]+?)}}/g;
var formatted_message = _.template( message )( { version: new_version } );
console.log( "formatted_message: " + formatted_message );

var git_cmd = "git";
if( process.platform === 'win32' ) {
	var npm_cmd = 'npm.cmd'
} else {
	var npm_cmd = 'npm'
}

//kick off npm process
var npm = spawn( npm_cmd, [ '--no-git-tag-version', 'version', new_version ] );
var git;

//spit stdout to screen
npm.stdout.on( 'data', function( data ) { process.stdout.write( data.toString() ); } );

//spit stderr to screen 	
npm.stderr.on( 'data', function( data ) { process.stdout.write( data.toString() ); } );

npm.on( 'close', function( code ) {

	//kick off git_cmd process
	git = spawn( git_cmd, [ 'commit', '-am', formatted_message ] );

	//spit stdout to screen
	git.stdout.on( 'data', function( data ) { process.stdout.write( data.toString() ); } );

	//spit stderr to screen 	
	git.stderr.on( 'data', function( data ) { process.stdout.write( data.toString() ); } );

	git.on( 'close', function( code ) {
		console.log( "Finished: " + code );
		console.log( "-----------------------------------------------------------" );

		//kick off git_cmd process
		git = spawn( git_cmd, [ 'tag', 'v' + new_version ] );

		//spit stdout to screen
		git.stdout.on( 'data', function( data ) {
			process.stdout.write( data.toString() );
		} );

		//spit stderr to screen 	
		git.stderr.on( 'data', function( data ) {
			process.stdout.write( data.toString() );
		} );

		git.on( 'close', function( code ) {
			console.log( "Finished: " + code );
			console.log( "-----------------------------------------------------------" );

		} );
	} );
	console.log( "Finished: " + code );
	console.log( "-----------------------------------------------------------" );
} );