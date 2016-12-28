/***
 *                          __     _  __       __                     
 *       ____ ___   ____   / /_   (_)/ /___   / /_   ___   _____ ____ 
 *      / __ `__ \ / __ \ / __ \ / // // _ \ / __ \ / _ \ / ___// __ \
 *     / / / / / // /_/ // /_/ // // //  __// / / //  __// /   / /_/ /
 *    /_/ /_/ /_/ \____//_.___//_//_/ \___//_/ /_/ \___//_/    \____/ 
 *                                                                    
 *                  mobile solutions for everyday heroes                                  
 *                                                                    
 * @file This module is used to load remote files and manage the caching of those files.
 * @module nativeloop/cache 
 * @version 1.0.0
 * @since 1.0.0
 * @copyright Copyright (c) 2017 by Superhero Studios Incorporated.  All Rights Reserved.  
 * @license Licensed under the terms of the MIT License (MIT)
 *                                                       
 */

/**
 * Define exports for this module
 */
var cache = {};
module.exports = cache;

var _ = require( '/alloy' )._;
var CACHE_SUBFOLDER = 'NATIVELOOP_CACHE';
var CACHE_ROOT_DIRECTORY;
var CACHE_METADATA = 'HERO_CACHE_METADATA';
var CACHE_TTL = 60 * 60; // 60 minutes


cache.getCachedUrl = function( args ) {

	args = _.defaults( args, {
		cacheId: Ti.Utils.md5HexDigest( args.url )
	} );

	if( !args.cacheExtension ) {

		// from http://stackoverflow.com/a/680982/292947
		var re = /(?:\.([^.]+))?$/;
		var ext = re.exec( args.url )[ 1 ];

		args.cacheExtension = ext ? ext : '';
	}

	//TODO:  Check expiration date

	var cacheItem = cache.getItem( args.cacheId ) || {};

	cacheItem = _.defaults( cacheItem, {
		id: args.cacheId,
		dateCreated: Date.now(),
		dateModified: Date.now(),
		url: args.url
	} );

	var cachedFileExists;
	var cachedFile;


	if( cacheItem.filepath ) {
		cachedFile = Ti.Filesystem.getFile( cacheItem.filepath );
		cachedFileExists = cachedFile.exists();
		if( cachedFileExists ) {
			console.info( 'cache.getCachedUrl: old cacheItem.filepath does not exist - ' + cacheItem.filepath );
			return cacheItem.filepath;
		}
		console.info( 'cache.getCachedUrl: old cacheItem.filepath does not exist - ' + cacheItem.filepath );
	} else {
		console.info( 'cache.getCachedUrl: no cache item exists for: ' + args.url );
	}


	args.force = true;
	cache.saveFile( args );

	//cacheItem.filepath = null;
	return;
}

cache.saveFile = function( args ) {


	args = _.defaults( args, {
		cacheId: Ti.Utils.md5HexDigest( args.url )
	} );

	if( !args.cacheExtension ) {

		// from http://stackoverflow.com/a/680982/292947
		var re = /(?:\.([^.]+))?$/;
		var ext = re.exec( args.url )[ 1 ];

		args.cacheExtension = ext ? ext : '';
	}

	//TODO:  Check expiration date

	var cacheItem = cache.getItem( args.cacheId ) || {};

	cacheItem = _.defaults( cacheItem, {
		id: args.cacheId,
		dateCreated: Date.now(),
		dateModified: Date.now(),
		url: args.url
	} );

	var cachedFileExists;
	var cachedFile = Ti.Filesystem.getFile( CACHE_FOLDER, args.cacheId + '.' + args.cacheExtension );
	cacheItem.filepath = cachedFile.resolve();

	//if (cacheItem.filepath) {
	//    cachedFile = Ti.Filesystem.saveFile(cacheItem.filepath);
	//    cachedFileExists = cachedFile.exists();
	//    if (!cachedFileExists) {
	//        console.info('cache.saveFile: old cacheItem.filepath does not exist - ' + cacheItem.filepath);
	//        cacheItem.filepath = null;
	//    }
	//}

	//if (!cacheItem.filepath) {
	//    cachedFile = Ti.Filesystem.saveFile(CACHE_FOLDER, args.cacheId + '.' + args.cacheExtension);
	//    cacheItem.filepath = cachedFile.resolve();
	//    console.info('cache.saveFile: setting cacheItem.filepath = ' + cacheItem.filepath);
	//    cacheItem.url = args.url;
	//}


	//cachedFileExists = cachedFile.exists();

	if( args.force || !cachedFile.exists() ) {
		console.info( 'cache.saveFile: cachedFile (' + cacheItem.filepath + ') to be (re)downloaded' );
		cacheItem.etag = null;
		cacheItem.lastModified = null;
	}
	//} else if (cacheItem.ttl && cacheItem.ttl > +(new Date)) {
	//    return cache.filepath;
	//}
	cachedFile = null;



	return require( '@mobile/hero/http' ).get( {
		url: args.url,
		localFilepath: cacheItem.filepath,
		lastModified: cacheItem.lastModified,
		eTag: cacheItem.etag
	} ).then( function( response ) {
		if( response.statusCode === 200 ) {
			cacheItem.lastModified = response.lastModified;
			cacheItem.etag = response.etag;
			cacheItem.lastSuccess = Date.now();
			cacheItem.ttl = +( new Date ) + cache.CACHE_TTL * 1000;
		} else {
			cacheItem.lastSuccess = Date.now();
		}
		cache.setItem( cacheItem );
		return cacheItem.filepath;
	} ).catch( function( e ) {
		console.error( e );
		cacheItem.lastError = Date.now();
		cache.setItem( cacheItem );
		return;
	} );

};

cache.storeUrl = Promise.method( function( args ) {


} );

var getCacheExtension = function( url ) {
	// from http://stackoverflow.com/a/680982/292947
	var re = /(?:\.([^.]+))?$/;
	var ext = re.exec( url )[ 1 ];

	return ext ? ext : '';
}

cache.getFile = Promise.method( function( args ) {


	args = _.defaults( args, {
		cacheId: Ti.Utils.md5HexDigest( args.url ),
		cacheExtension: getCacheExtension( args.url )
	} );

	//if (!args.cacheExtension) {

	//    // from http://stackoverflow.com/a/680982/292947
	//    var re = /(?:\.([^.]+))?$/;
	//    var ext = re.exec(args.url)[1];

	//    args.cacheExtension = ext ? ext : '';
	//}

	//TODO:  Check expiration date

	var cacheItem = cache.getItem( args.cacheId ) || {};

	cacheItem = _.defaults( cacheItem, {
		id: args.cacheId,
		dateCreated: Date.now(),
		dateModified: Date.now(),
		url: args.url
	} );

	var cachedFileExists;
	var cachedFile;


	if( cacheItem.filepath ) {
		cachedFile = Ti.Filesystem.getFile( cacheItem.filepath );
		cachedFileExists = cachedFile.exists();
		if( !cachedFileExists ) {
			console.info( 'cache.getFile: old cacheItem.filepath does not exist - ' + cacheItem.filepath );
			cacheItem.filepath = null;
		}
	}

	if( !cacheItem.filepath ) {
		cachedFile = Ti.Filesystem.getFile( CACHE_FOLDER, args.cacheId + '.' + args.cacheExtension );
		cacheItem.filepath = cachedFile.resolve();
		console.info( 'cache.getFile: setting cacheItem.filepath = ' + cacheItem.filepath );
		cacheItem.url = args.url;
	}


	cachedFileExists || ( cachedFileExists = cachedFile.exists() );

	if( !cachedFileExists ) {
		cacheItem.etag = null;
		cacheItem.lastModified = null;
	}
	cachedFile = null;
	console.info( 'cache.getFile: cachedFile (' + cacheItem.filepath + ') exists: ' + cachedFileExists );
	return require( '@mobile/hero/http' ).get( {
		url: args.url,
		localFilepath: cacheItem.filepath,
		lastModified: cacheItem.lastModified,
		eTag: cacheItem.etag
	} ).then( function( response ) {
		if( response.statusCode === 200 ) {
			cacheItem.lastModified = response.lastModified;
			cacheItem.etag = response.etag;
			cacheItem.ttl = +( new Date ) + cache.CACHE_TTL * 1000;
		}
		cacheItem.lastSuccess = Date.now();
		cache.setItem( cacheItem );
		return cache.loadFile( cacheItem.filepath );
	} ).then( function( text ) {

		return text;
	} ).catch( function( e ) {
		console.error( e );
		cacheItem.lastError = Date.now();
		cache.setItem( cacheItem );
		return;
	} );

} );


cache.loadFile = function( filepath ) {
	var file = Titanium.Filesystem.getFile( filepath );
	if( file.exists() ) {
		console.info( 'cache.loadFile: filepath exists - ' + filepath );
		var blob = file.read();
		var text = blob.text;

		blob = null;
		file = null;
		//console.error(text);
		return text;
	} else {
		console.warn( 'cache.loadFile: filepath does not exists - ' + filepath );
		return;
	}

}


cache.getItem = function( id ) {
	console.debug( 'cache.getItem: ' + id );
	var cacheMetadata = cache.getAll();
	return _.find( cacheMetadata, 'id', id );
}

cache.setItem = function( cacheItem ) {
	console.debug( 'cache.setItem: ' + JSON.stringify( cacheItem ) );
	cache.removeItem( cacheItem.id );
	var cacheMetadata = cache.getAll();
	cacheMetadata.push( cacheItem );
	cache.saveAll( cacheMetadata );

}

cache.removeItem = function( id, deleteFile ) {
	console.debug( 'cache.removeItem: ' + id );
	var cacheMetadata = cache.getAll();

	var cacheItem = _.find( cacheMetadata, 'id', id );
	if( cacheItem ) {
		if( deleteFile && cacheItem.filepath ) {
			var file = Titanium.Filesystem.getFile( cacheItem.filepath );
			if( file.exists() ) {
				console.debug( 'cache.removeItem: deleting file - ' + cacheItem.filepath );
				file.deleteFile();
			}

		}
		var modifiedCacheMetadata = _.remove( cacheMetadata, function( item ) {
			return item.id === id;
		} );
		cache.saveAll( modifiedCacheMetadata );
	}

}


cache.removeAll = function() {
	console.debug( 'cache.removeAll' );
	var cacheMetadata = cache.getAll();
	_.forEach( cacheMetadata, function( cacheItem ) {
		cacheItem && cache.removeItem( cacheItem.id, true );
	} );
}

cache.getAll = function() {
	console.debug( 'cache.getAll' );
	return cacheMetadata = Ti.App.Properties.getObject( CACHE_METADATA ) || [];
}

cache.saveAll = function( cacheMetadata ) {
	console.debug( 'cache.saveAll' );
	Ti.App.Properties.setObject( CACHE_METADATA, cacheMetadata );
}


var __cache_directory;
Object.defineProperty( cache, "directory", {
	get: function() {
		return __cache_directory;
	}
} );


/**
 * Initializes this module.  Executed when module is loaded.
 */
cache.init = function() {

	if( OS_IOS ) {
		CACHE_ROOT_DIRECTORY = Ti.Filesystem.applicationSupportDirectory;
	} else {
		CACHE_ROOT_DIRECTORY = Ti.Filesystem.applicationDataDirectory;
	}

	var directory = Ti.Filesystem.getFile( CACHE_ROOT_DIRECTORY, CACHE_SUBFOLDER );
	if( !directory.exists() ) {
		console.info( 'cache.init: creating cache.directory - ' + directory.resolve() );
		directory.createDirectory();
	}

	__cache_directory = cache_dir.resolve();
	console.info( 'cache.init: CACHE_FOLDER = ' + CACHE_FOLDER );
}();