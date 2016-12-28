'use strict';

function convert_to_alloy_path( resolved_path ) {
	var parsed_path = path.posix.parse( resolved_path );
	return path.posix.join( parsed_path.dir, parsed_path.name );
}

function check_for_alias( request ) {
	var alias_module = load_alias_modules( request );
	if( alias_module ) {
		logger.debug( "alias_module: " + convert_to_alloy_path( alias_module ) );
		return convert_to_alloy_path( alias_module );
	}
	return convert_to_alloy_path( request );
}

function _resolve( request, basepath, physical_file ) {
	logger.debug( "resolve request: " + request );
	logger.debug( "resolve basepath: " + basepath );
	basepath = basepath || path.posix.sep;
	if( !physical_file ) {
		var core_module = load_core_modules( request );
		if( core_module ) {
			logger.debug( "core_module: " + check_for_alias( core_module ) );
			return check_for_alias( core_module );
		}
	}
	var start = request.substring( 0, 1 );
	if( "." === start || "/" === start ) {
		var file_module = load_as_file( request, basepath );
		if( file_module ) {
			logger.debug( "file_module: " + file_module );
			return physical_file ? file_module : check_for_alias( file_module );
		}
		var directory_module = load_as_directory( request, basepath );
		if( directory_module ) {
			logger.debug( "directory_module: " + directory_module );
			return physical_file ? directory_module : check_for_alias( directory_module );
		}
	}
	var node_module = load_node_modules( request, basepath );
	if( node_module ) {
		logger.debug( "node_module: " + node_module );
		console.error( "physical_file: " + JSON.stringify( physical_file, null, 2 ) );
		return physical_file ? node_module : check_for_alias( node_module );
	}
	var alloy_file_module = load_as_file( request, "/" );
	if( alloy_file_module ) {
		logger.debug( "alloy_file_module: " + alloy_file_module );
		return physical_file ? alloy_file_module : check_for_alias( alloy_file_module );
	}
	var fallback_module = load_fallback_modules( request );
	if( fallback_module ) {
		logger.debug( "fallback_module: " + fallback_module );
		return physical_file ? fallback_module : check_for_alias( fallback_module );
	}
	logger.trace( "Cannot find file.  Returning request: " + request );
	return request;
}

function load_core_modules( request ) {
	var module_path = _.find( registry.core, function( item ) {
		return item.id === request;
	} );
	if( module_path ) return module_path.path;
}

function load_fallback_modules( request ) {
	var module_path = _.find( registry.fallback, function( item ) {
		return item.id === request;
	} );
	if( module_path ) return module_path.path;
}

function load_alias_modules( request ) {
	var module_path = _.find( registry.alias, function( item ) {
		return item.id === request;
	} );
	if( module_path ) return module_path.path;
	logger.debug( "alias not found: " + request );
}

function load_as_file( request, startpath ) {
	var module_path;
	var resolved_path = path.posix.resolve( startpath, request );
	logger.debug( "resolved_path: " + resolved_path );
	_.includes( registry.files, resolved_path ) && ( module_path = resolved_path );
	if( module_path ) return module_path;
	var extension = path.extname( request );
	if( !extension ) {
		var exts = [ ".js", ".json" ];
		_.forEach( exts, function( ext ) {
			resolved_path = path.posix.resolve( startpath, request + ext );
			logger.debug( "resolved_path: " + resolved_path );
			_.includes( registry.files, resolved_path ) && ( module_path = resolved_path );
			if( !module_path ) return !module_path;
		} );
	}
	return module_path;
}

function load_as_directory( request, startpath ) {
	var resolved_path = path.posix.resolve( startpath, request );
	var module_path = _.find( registry.directories, function( item ) {
		return item.id === resolved_path;
	} );
	if( module_path ) return module_path.path;
}

function load_node_modules( request, startpath ) {
	var resolved_path;
	var nodepaths = node_modules_paths( startpath );
	_.forEach( nodepaths, function( nodepath ) {
		resolved_path = load_as_file( request, nodepath );
		return !resolved_path;
	} );
	if( resolved_path ) return resolved_path;
	_.forEach( nodepaths, function( nodepath ) {
		resolved_path = load_as_directory( request, nodepath );
		return !resolved_path;
	} );
	return resolved_path;
}

function node_modules_paths( from ) {
	from = path.posix.resolve( from );
	var paths = [];
	var parts = from.split( splitRe );
	for( var tip = parts.length - 1; tip >= 0; tip-- ) {
		if( "node_modules" === parts[ tip ] ) continue;
		var dir = parts.slice( 0, tip + 1 ).concat( "node_modules" ).join( path.posix.sep );
		paths.push( dir );
	}
	return paths;
}

var _ = require( "./lodash" );

var path = require( "path" );

_.contains ? _.includes || _.mixin( {
	includes: _.contains
} ) : _.mixin( {
	contains: _.includes
} );

var registry = {
	files: [],
	directories: [],
	core: [],
	fallback: [],
	alias: []
};

var logger = console;

var ensureCore = function( key, value ) {
	_.find( registry.core, function( item ) {
		return item.id === key;
	} ) || registry.core.push( {
		id: key,
		path: value
	} );
};

var ensureAlias = function( key, value ) {
	_.find( registry.alias, function( item ) {
		return item.id === key;
	} ) || registry.alias.push( {
		id: key,
		path: value
	} );
};

var ensureFallback = function( key, value ) {
	_.find( registry.fallback, function( item ) {
		return item.id === key;
	} ) || registry.fallback.push( {
		id: key,
		path: value
	} );
};

var resolver = function( _registry, _logger, building ) {
	_registry && ( registry = _.defaults( _registry, registry ) );
	_logger && ( logger = _logger );
	logger.error( "-----------------------------------------------------------" );
	if( building ) {
		ensureCore( "path", "nativeloop/path" );
		ensureCore( "alloy", "/alloy" );
		ensureCore( "resolver", "nativeloop/resolver" );
		ensureCore( "process", "nativeloop/process" );
		ensureAlias( "alloy/underscore", "nativeloop/lodash" );
		ensureFallback( "lodash", "nativeloop/lodash" );
		ensureFallback( "events", "nativeloop/events" );
		ensureFallback( "bluebird", "nativeloop/bluebird" );
		_.forEach( registry.fallback, function( fallback ) {
			fallback.path = _resolve( fallback.path, "/" );
		} );
		_.forEach( registry.alias, function( alias ) {
			alias.id = _resolve( alias.id, "/", true );
			alias.path = _resolve( alias.path, "/" );
		} );
		_.forEach( registry.core, function( core ) {
			core.path = _resolve( core.path, "/" );
		} );
	}
	Object.defineProperty( this, "registry", {
		get: function() {
			return _.clone( registry );
		},
		enumerable: true,
		configurable: false
	} );
};

module.exports = resolver;

resolver.prototype.resolve = _.memoize( _resolve, function( request, basepath ) {
	return request + "::" + basepath;
} );

var splitRe = /\//;