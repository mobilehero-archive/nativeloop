#! /usr/bin/env node

var yargs = require( "yargs" );
var Promise = require( "bluebird" );
Promise.promisifyAll( require( "fs-extra" ) );
const _ = require( 'lodash' );

require( 'yargs' )
	.version()
	.alias( 'v', 'version' )
	.demand( 1, "must provide a valid command" )
	.commandDir( 'commands', {
		recurse: false
	} )
	.recommendCommands()
	.help()
	.argv