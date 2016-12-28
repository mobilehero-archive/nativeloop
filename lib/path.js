'use strict';

function assertPath( path ) {
	if( "string" != typeof path ) throw new TypeError( "Path must be a string. Received " + inspect( path ) );
}

function normalizeStringWin32( path, allowAboveRoot ) {
	var res = "";
	var lastSlash = -1;
	var dots = 0;
	var code;
	for( var i = 0; i <= path.length; ++i ) {
		if( i < path.length ) code = path.charCodeAt( i );
		else {
			if( 47 === code || 92 === code ) break;
			code = 47;
		}
		if( 47 === code || 92 === code ) {
			if( lastSlash === i - 1 || 1 === dots );
			else if( lastSlash !== i - 1 && 2 === dots ) {
				if( res.length < 2 || 46 !== res.charCodeAt( res.length - 1 ) || 46 !== res.charCodeAt( res.length - 2 ) )
					if( res.length > 2 ) {
						var start = res.length - 1;
						var j = start;
						for( ; j >= 0; --j )
							if( 92 === res.charCodeAt( j ) ) break;
						if( j !== start ) {
							res = -1 === j ? "" : res.slice( 0, j );
							lastSlash = i;
							dots = 0;
							continue;
						}
					} else if( 2 === res.length || 1 === res.length ) {
					res = "";
					lastSlash = i;
					dots = 0;
					continue;
				}
				allowAboveRoot && ( res.length > 0 ? res += "\\.." : res = ".." );
			} else res.length > 0 ? res += "\\" + path.slice( lastSlash + 1, i ) : res = path.slice( lastSlash + 1, i );
			lastSlash = i;
			dots = 0;
		} else 46 === code && -1 !== dots ? ++dots : dots = -1;
	}
	return res;
}

function normalizeStringPosix( path, allowAboveRoot ) {
	var res = "";
	var lastSlash = -1;
	var dots = 0;
	var code;
	for( var i = 0; i <= path.length; ++i ) {
		if( i < path.length ) code = path.charCodeAt( i );
		else {
			if( 47 === code ) break;
			code = 47;
		}
		if( 47 === code ) {
			if( lastSlash === i - 1 || 1 === dots );
			else if( lastSlash !== i - 1 && 2 === dots ) {
				if( res.length < 2 || 46 !== res.charCodeAt( res.length - 1 ) || 46 !== res.charCodeAt( res.length - 2 ) )
					if( res.length > 2 ) {
						var start = res.length - 1;
						var j = start;
						for( ; j >= 0; --j )
							if( 47 === res.charCodeAt( j ) ) break;
						if( j !== start ) {
							res = -1 === j ? "" : res.slice( 0, j );
							lastSlash = i;
							dots = 0;
							continue;
						}
					} else if( 2 === res.length || 1 === res.length ) {
					res = "";
					lastSlash = i;
					dots = 0;
					continue;
				}
				allowAboveRoot && ( res.length > 0 ? res += "/.." : res = ".." );
			} else res.length > 0 ? res += "/" + path.slice( lastSlash + 1, i ) : res = path.slice( lastSlash + 1, i );
			lastSlash = i;
			dots = 0;
		} else 46 === code && -1 !== dots ? ++dots : dots = -1;
	}
	return res;
}

function _format( sep, pathObject ) {
	var dir = pathObject.dir || pathObject.root;
	var base = pathObject.base || ( pathObject.name || "" ) + ( pathObject.ext || "" );
	if( !dir ) return base;
	if( dir === pathObject.root ) return dir + base;
	return dir + sep + base;
}

var _typeof2 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function( obj ) {
	return typeof obj;
} : function( obj ) {
	return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};

var _typeof = "function" == typeof Symbol && "symbol" === _typeof2( Symbol.iterator ) ? function( obj ) {
	return "undefined" == typeof obj ? "undefined" : _typeof2( obj );
} : function( obj ) {
	return obj && "function" == typeof Symbol && obj.constructor === Symbol ? "symbol" : "undefined" == typeof obj ? "undefined" : _typeof2( obj );
};

var inspect = function( obj ) {
	return obj;
};

var win32 = {
	resolve: function() {
		var resolvedDevice = "";
		var resolvedTail = "";
		var resolvedAbsolute = false;
		for( var i = arguments.length - 1; i >= -1; i-- ) {
			var path;
			if( i >= 0 ) path = arguments[ i ];
			else if( resolvedDevice ) {
				path = process.env[ "=" + resolvedDevice ];
				( void 0 === path || path.slice( 0, 3 ).toLowerCase() !== resolvedDevice.toLowerCase() + "\\" ) && ( path = resolvedDevice + "\\" );
			} else path = process.cwd();
			assertPath( path );
			if( 0 === path.length ) continue;
			var len = path.length;
			var rootEnd = 0;
			var code = path.charCodeAt( 0 );
			var device = "";
			var isAbsolute = false;
			if( len > 1 ) {
				if( 47 === code || 92 === code ) {
					isAbsolute = true;
					code = path.charCodeAt( 1 );
					if( 47 === code || 92 === code ) {
						var j = 2;
						var last = j;
						for( ; len > j; ++j ) {
							code = path.charCodeAt( j );
							if( 47 === code || 92 === code ) break;
						}
						if( len > j && j !== last ) {
							var firstPart = path.slice( last, j );
							last = j;
							for( ; len > j; ++j ) {
								code = path.charCodeAt( j );
								if( 47 !== code && 92 !== code ) break;
							}
							if( len > j && j !== last ) {
								last = j;
								for( ; len > j; ++j ) {
									code = path.charCodeAt( j );
									if( 47 === code || 92 === code ) break;
								}
								if( j === len ) {
									device = "\\\\" + firstPart + "\\" + path.slice( last );
									rootEnd = j;
								} else if( j !== last ) {
									device = "\\\\" + firstPart + "\\" + path.slice( last, j );
									rootEnd = j;
								}
							}
						}
					} else rootEnd = 1;
				} else if( code >= 65 && 90 >= code || code >= 97 && 122 >= code ) {
					code = path.charCodeAt( 1 );
					if( 58 === path.charCodeAt( 1 ) ) {
						device = path.slice( 0, 2 );
						rootEnd = 2;
						if( len > 2 ) {
							code = path.charCodeAt( 2 );
							if( 47 === code || 92 === code ) {
								isAbsolute = true;
								rootEnd = 3;
							}
						}
					}
				}
			} else if( 47 === code || 92 === code ) {
				rootEnd = 1;
				isAbsolute = true;
			}
			if( device.length > 0 && resolvedDevice.length > 0 && device.toLowerCase() !== resolvedDevice.toLowerCase() ) continue;
			0 === resolvedDevice.length && device.length > 0 && ( resolvedDevice = device );
			if( !resolvedAbsolute ) {
				resolvedTail = path.slice( rootEnd ) + "\\" + resolvedTail;
				resolvedAbsolute = isAbsolute;
			}
			if( resolvedDevice.length > 0 && resolvedAbsolute ) break;
		}
		resolvedTail = normalizeStringWin32( resolvedTail, !resolvedAbsolute );
		return resolvedDevice + ( resolvedAbsolute ? "\\" : "" ) + resolvedTail || ".";
	},
	normalize: function( path ) {
		assertPath( path );
		var len = path.length;
		if( 0 === len ) return ".";
		var rootEnd = 0;
		var code = path.charCodeAt( 0 );
		var device;
		var isAbsolute = false;
		if( len > 1 ) {
			if( 47 === code || 92 === code ) {
				isAbsolute = true;
				code = path.charCodeAt( 1 );
				if( 47 === code || 92 === code ) {
					var j = 2;
					var last = j;
					for( ; len > j; ++j ) {
						code = path.charCodeAt( j );
						if( 47 === code || 92 === code ) break;
					}
					if( len > j && j !== last ) {
						var firstPart = path.slice( last, j );
						last = j;
						for( ; len > j; ++j ) {
							code = path.charCodeAt( j );
							if( 47 !== code && 92 !== code ) break;
						}
						if( len > j && j !== last ) {
							last = j;
							for( ; len > j; ++j ) {
								code = path.charCodeAt( j );
								if( 47 === code || 92 === code ) break;
							}
							if( j === len ) return "\\\\" + firstPart + "\\" + path.slice( last ) + "\\";
							if( j !== last ) {
								device = "\\\\" + firstPart + "\\" + path.slice( last, j );
								rootEnd = j;
							}
						}
					}
				} else rootEnd = 1;
			} else if( code >= 65 && 90 >= code || code >= 97 && 122 >= code ) {
				code = path.charCodeAt( 1 );
				if( 58 === path.charCodeAt( 1 ) ) {
					device = path.slice( 0, 2 );
					rootEnd = 2;
					if( len > 2 ) {
						code = path.charCodeAt( 2 );
						if( 47 === code || 92 === code ) {
							isAbsolute = true;
							rootEnd = 3;
						}
					}
				}
			}
		} else if( 47 === code || 92 === code ) return "\\";
		code = path.charCodeAt( len - 1 );
		var trailingSeparator = 47 === code || 92 === code;
		var tail;
		tail = len > rootEnd ? normalizeStringWin32( path.slice( rootEnd ), !isAbsolute ) : "";
		0 !== tail.length || isAbsolute || ( tail = "." );
		tail.length > 0 && trailingSeparator && ( tail += "\\" );
		return void 0 === device ? isAbsolute ? tail.length > 0 ? "\\" + tail : "\\" : tail.length > 0 ? tail : "" : isAbsolute ? tail.length > 0 ? device + "\\" + tail : device + "\\" : tail.length > 0 ? device + tail : device;
	},
	isAbsolute: function( path ) {
		assertPath( path );
		var len = path.length;
		if( 0 === len ) return false;
		var code = path.charCodeAt( 0 );
		if( 47 === code || 92 === code ) return true;
		if( ( code >= 65 && 90 >= code || code >= 97 && 122 >= code ) && len > 2 && 58 === path.charCodeAt( 1 ) ) {
			code = path.charCodeAt( 2 );
			if( 47 === code || 92 === code ) return true;
		}
		return false;
	},
	join: function() {
		if( 0 === arguments.length ) return ".";
		var joined;
		var firstPart;
		for( var i = 0; i < arguments.length; ++i ) {
			var arg = arguments[ i ];
			assertPath( arg );
			arg.length > 0 && ( void 0 === joined ? joined = firstPart = arg : joined += "\\" + arg );
		}
		if( void 0 === joined ) return ".";
		var needsReplace = true;
		var slashCount = 0;
		var code = firstPart.charCodeAt( 0 );
		if( 47 === code || 92 === code ) {
			++slashCount;
			var firstLen = firstPart.length;
			if( firstLen > 1 ) {
				code = firstPart.charCodeAt( 1 );
				if( 47 === code || 92 === code ) {
					++slashCount;
					if( firstLen > 2 ) {
						code = firstPart.charCodeAt( 2 );
						47 === code || 92 === code ? ++slashCount : needsReplace = false;
					}
				}
			}
		}
		if( needsReplace ) {
			for( ; slashCount < joined.length; ++slashCount ) {
				code = joined.charCodeAt( slashCount );
				if( 47 !== code && 92 !== code ) break;
			}
			slashCount >= 2 && ( joined = "\\" + joined.slice( slashCount ) );
		}
		return win32.normalize( joined );
	},
	relative: function( from, to ) {
		assertPath( from );
		assertPath( to );
		if( from === to ) return "";
		var fromOrig = win32.resolve( from );
		var toOrig = win32.resolve( to );
		if( fromOrig === toOrig ) return "";
		from = fromOrig.toLowerCase();
		to = toOrig.toLowerCase();
		if( from === to ) return "";
		var fromStart = 0;
		for( ; fromStart < from.length; ++fromStart )
			if( 92 !== from.charCodeAt( fromStart ) ) break;
		var fromEnd = from.length;
		for( ; fromEnd - 1 > fromStart; --fromEnd )
			if( 92 !== from.charCodeAt( fromEnd - 1 ) ) break;
		var fromLen = fromEnd - fromStart;
		var toStart = 0;
		for( ; toStart < to.length; ++toStart )
			if( 92 !== to.charCodeAt( toStart ) ) break;
		var toEnd = to.length;
		for( ; toEnd - 1 > toStart; --toEnd )
			if( 92 !== to.charCodeAt( toEnd - 1 ) ) break;
		var toLen = toEnd - toStart;
		var length = toLen > fromLen ? fromLen : toLen;
		var lastCommonSep = -1;
		var i = 0;
		for( ; length >= i; ++i ) {
			if( i === length ) {
				if( toLen > length ) {
					if( 92 === to.charCodeAt( toStart + i ) ) return toOrig.slice( toStart + i + 1 );
					if( 2 === i ) return toOrig.slice( toStart + i );
				}
				fromLen > length && ( 92 === from.charCodeAt( fromStart + i ) ? lastCommonSep = i : 2 === i && ( lastCommonSep = 3 ) );
				break;
			}
			var fromCode = from.charCodeAt( fromStart + i );
			var toCode = to.charCodeAt( toStart + i );
			if( fromCode !== toCode ) break;
			92 === fromCode && ( lastCommonSep = i );
		}
		if( i !== length && -1 === lastCommonSep ) return toStart > 0 ? toOrig.slice( toStart ) : toOrig;
		var out = ""; -
		1 === lastCommonSep && ( lastCommonSep = 0 );
		for( i = fromStart + lastCommonSep + 1; fromEnd >= i; ++i )( i === fromEnd || 92 === from.charCodeAt( i ) ) && ( out += 0 === out.length ? ".." : "\\.." );
		if( out.length > 0 ) return out + toOrig.slice( toStart + lastCommonSep, toEnd );
		toStart += lastCommonSep;
		92 === toOrig.charCodeAt( toStart ) && ++toStart;
		return toOrig.slice( toStart, toEnd );
	},
	_makeLong: function( path ) {
		if( "string" != typeof path ) return path;
		if( 0 === path.length ) return "";
		var resolvedPath = win32.resolve( path );
		if( resolvedPath.length >= 3 ) {
			var code = resolvedPath.charCodeAt( 0 );
			if( 92 === code ) {
				if( 92 === resolvedPath.charCodeAt( 1 ) ) {
					code = resolvedPath.charCodeAt( 2 );
					if( 63 !== code && 46 !== code ) return "\\\\?\\UNC\\" + resolvedPath.slice( 2 );
				}
			} else if( ( code >= 65 && 90 >= code || code >= 97 && 122 >= code ) && 58 === resolvedPath.charCodeAt( 1 ) && 92 === resolvedPath.charCodeAt( 2 ) ) return "\\\\?\\" + resolvedPath;
		}
		return path;
	},
	dirname: function( path ) {
		assertPath( path );
		var len = path.length;
		if( 0 === len ) return ".";
		var rootEnd = -1;
		var end = -1;
		var matchedSlash = true;
		var offset = 0;
		var code = path.charCodeAt( 0 );
		if( len > 1 ) {
			if( 47 === code || 92 === code ) {
				rootEnd = offset = 1;
				code = path.charCodeAt( 1 );
				if( 47 === code || 92 === code ) {
					var j = 2;
					var last = j;
					for( ; len > j; ++j ) {
						code = path.charCodeAt( j );
						if( 47 === code || 92 === code ) break;
					}
					if( len > j && j !== last ) {
						last = j;
						for( ; len > j; ++j ) {
							code = path.charCodeAt( j );
							if( 47 !== code && 92 !== code ) break;
						}
						if( len > j && j !== last ) {
							last = j;
							for( ; len > j; ++j ) {
								code = path.charCodeAt( j );
								if( 47 === code || 92 === code ) break;
							}
							if( j === len ) return path;
							j !== last && ( rootEnd = offset = j + 1 );
						}
					}
				}
			} else if( code >= 65 && 90 >= code || code >= 97 && 122 >= code ) {
				code = path.charCodeAt( 1 );
				if( 58 === path.charCodeAt( 1 ) ) {
					rootEnd = offset = 2;
					if( len > 2 ) {
						code = path.charCodeAt( 2 );
						( 47 === code || 92 === code ) && ( rootEnd = offset = 3 );
					}
				}
			}
		} else if( 47 === code || 92 === code ) return path[ 0 ];
		for( var i = len - 1; i >= offset; --i ) {
			code = path.charCodeAt( i );
			if( 47 === code || 92 === code ) {
				if( !matchedSlash ) {
					end = i;
					break;
				}
			} else matchedSlash = false;
		}
		if( -1 === end ) {
			if( -1 === rootEnd ) return ".";
			end = rootEnd;
		}
		return path.slice( 0, end );
	},
	basename: function( path, ext ) {
		if( void 0 !== ext && "string" != typeof ext ) throw new TypeError( '"ext" argument must be a string' );
		assertPath( path );
		var start = 0;
		var end = -1;
		var matchedSlash = true;
		var i;
		if( path.length >= 2 ) {
			var drive = path.charCodeAt( 0 );
			( drive >= 65 && 90 >= drive || drive >= 97 && 122 >= drive ) && 58 === path.charCodeAt( 1 ) && ( start = 2 );
		}
		if( void 0 !== ext && ext.length > 0 && ext.length <= path.length ) {
			if( ext.length === path.length && ext === path ) return "";
			var extIdx = ext.length - 1;
			var firstNonSlashEnd = -1;
			for( i = path.length - 1; i >= start; --i ) {
				var code = path.charCodeAt( i );
				if( 47 === code || 92 === code ) {
					if( !matchedSlash ) {
						start = i + 1;
						break;
					}
				} else {
					if( -1 === firstNonSlashEnd ) {
						matchedSlash = false;
						firstNonSlashEnd = i + 1;
					}
					if( extIdx >= 0 )
						if( code === ext.charCodeAt( extIdx ) ) - 1 === --extIdx && ( end = i );
						else {
							extIdx = -1;
							end = firstNonSlashEnd;
						}
				}
			}
			start === end ? end = firstNonSlashEnd : -1 === end && ( end = path.length );
			return path.slice( start, end );
		}
		for( i = path.length - 1; i >= start; --i ) {
			var _code = path.charCodeAt( i );
			if( 47 === _code || 92 === _code ) {
				if( !matchedSlash ) {
					start = i + 1;
					break;
				}
			} else if( -1 === end ) {
				matchedSlash = false;
				end = i + 1;
			}
		}
		if( -1 === end ) return "";
		return path.slice( start, end );
	},
	extname: function( path ) {
		assertPath( path );
		var startDot = -1;
		var startPart = 0;
		var end = -1;
		var matchedSlash = true;
		var preDotState = 0;
		for( var i = path.length - 1; i >= 0; --i ) {
			var code = path.charCodeAt( i );
			if( 47 === code || 92 === code ) {
				if( !matchedSlash ) {
					startPart = i + 1;
					break;
				}
				continue;
			}
			if( -1 === end ) {
				matchedSlash = false;
				end = i + 1;
			}
			46 === code ? -1 === startDot ? startDot = i : 1 !== preDotState && ( preDotState = 1 ) : -1 !== startDot && ( preDotState = -1 );
		}
		if( -1 === startDot || -1 === end || 0 === preDotState || 1 === preDotState && startDot === end - 1 && startDot === startPart + 1 ) return "";
		return path.slice( startDot, end );
	},
	format: function( pathObject ) {
		if( null === pathObject || "object" !== ( "undefined" == typeof pathObject ? "undefined" : _typeof( pathObject ) ) ) throw new TypeError( 'Parameter "pathObject" must be an object, not ' + ( "undefined" == typeof pathObject ? "undefined" : _typeof( pathObject ) ) );
		return _format( "\\", pathObject );
	},
	parse: function( path ) {
		assertPath( path );
		var ret = {
			root: "",
			dir: "",
			base: "",
			ext: "",
			name: ""
		};
		if( 0 === path.length ) return ret;
		var len = path.length;
		var rootEnd = 0;
		var code = path.charCodeAt( 0 );
		var isAbsolute = false;
		if( len > 1 ) {
			if( 47 === code || 92 === code ) {
				isAbsolute = true;
				code = path.charCodeAt( 1 );
				rootEnd = 1;
				if( 47 === code || 92 === code ) {
					var j = 2;
					var last = j;
					for( ; len > j; ++j ) {
						code = path.charCodeAt( j );
						if( 47 === code || 92 === code ) break;
					}
					if( len > j && j !== last ) {
						last = j;
						for( ; len > j; ++j ) {
							code = path.charCodeAt( j );
							if( 47 !== code && 92 !== code ) break;
						}
						if( len > j && j !== last ) {
							last = j;
							for( ; len > j; ++j ) {
								code = path.charCodeAt( j );
								if( 47 === code || 92 === code ) break;
							}
							j === len ? rootEnd = j : j !== last && ( rootEnd = j + 1 );
						}
					}
				}
			} else if( code >= 65 && 90 >= code || code >= 97 && 122 >= code ) {
				code = path.charCodeAt( 1 );
				if( 58 === path.charCodeAt( 1 ) ) {
					rootEnd = 2;
					if( !( len > 2 ) ) {
						ret.root = ret.dir = path.slice( 0, 2 );
						return ret;
					}
					code = path.charCodeAt( 2 );
					if( 47 === code || 92 === code ) {
						if( 3 === len ) {
							ret.root = ret.dir = path.slice( 0, 3 );
							return ret;
						}
						isAbsolute = true;
						rootEnd = 3;
					}
				}
			}
		} else if( 47 === code || 92 === code ) {
			ret.root = ret.dir = path[ 0 ];
			return ret;
		}
		rootEnd > 0 && ( ret.root = path.slice( 0, rootEnd ) );
		var startDot = -1;
		var startPart = 0;
		var end = -1;
		var matchedSlash = true;
		var i = path.length - 1;
		var preDotState = 0;
		for( ; i >= rootEnd; --i ) {
			code = path.charCodeAt( i );
			if( 47 === code || 92 === code ) {
				if( !matchedSlash ) {
					startPart = i + 1;
					break;
				}
				continue;
			}
			if( -1 === end ) {
				matchedSlash = false;
				end = i + 1;
			}
			46 === code ? -1 === startDot ? startDot = i : 1 !== preDotState && ( preDotState = 1 ) : -1 !== startDot && ( preDotState = -1 );
		}
		if( -1 === startDot || -1 === end || 0 === preDotState || 1 === preDotState && startDot === end - 1 && startDot === startPart + 1 ) - 1 !== end && ( ret.base = ret.name = 0 === startPart && isAbsolute ? path.slice( rootEnd, end ) : path.slice( startPart, end ) );
		else {
			if( 0 === startPart && isAbsolute ) {
				ret.name = path.slice( rootEnd, startDot );
				ret.base = path.slice( rootEnd, end );
			} else {
				ret.name = path.slice( startPart, startDot );
				ret.base = path.slice( startPart, end );
			}
			ret.ext = path.slice( startDot, end );
		}
		startPart > 0 ? ret.dir = path.slice( 0, startPart - 1 ) : isAbsolute && ( ret.dir = path.slice( 0, rootEnd ) );
		return ret;
	},
	sep: "\\",
	delimiter: ";",
	win32: null,
	posix: null
};

var posix = {
	resolve: function() {
		var resolvedPath = "";
		var resolvedAbsolute = false;
		var cwd;
		for( var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i-- ) {
			var path;
			if( i >= 0 ) path = arguments[ i ];
			else {
				void 0 === cwd && ( cwd = process.cwd() );
				path = cwd;
			}
			assertPath( path );
			if( 0 === path.length ) continue;
			resolvedPath = path + "/" + resolvedPath;
			resolvedAbsolute = 47 === path.charCodeAt( 0 );
		}
		resolvedPath = normalizeStringPosix( resolvedPath, !resolvedAbsolute );
		return resolvedAbsolute ? resolvedPath.length > 0 ? "/" + resolvedPath : "/" : resolvedPath.length > 0 ? resolvedPath : ".";
	},
	normalize: function( path ) {
		assertPath( path );
		if( 0 === path.length ) return ".";
		var isAbsolute = 47 === path.charCodeAt( 0 );
		var trailingSeparator = 47 === path.charCodeAt( path.length - 1 );
		path = normalizeStringPosix( path, !isAbsolute );
		0 !== path.length || isAbsolute || ( path = "." );
		path.length > 0 && trailingSeparator && ( path += "/" );
		if( isAbsolute ) return "/" + path;
		return path;
	},
	isAbsolute: function( path ) {
		assertPath( path );
		return path.length > 0 && 47 === path.charCodeAt( 0 );
	},
	join: function() {
		if( 0 === arguments.length ) return ".";
		var joined;
		for( var i = 0; i < arguments.length; ++i ) {
			var arg = arguments[ i ];
			assertPath( arg );
			arg.length > 0 && ( void 0 === joined ? joined = arg : joined += "/" + arg );
		}
		if( void 0 === joined ) return ".";
		return posix.normalize( joined );
	},
	relative: function( from, to ) {
		assertPath( from );
		assertPath( to );
		if( from === to ) return "";
		from = posix.resolve( from );
		to = posix.resolve( to );
		if( from === to ) return "";
		var fromStart = 1;
		for( ; fromStart < from.length; ++fromStart )
			if( 47 !== from.charCodeAt( fromStart ) ) break;
		var fromEnd = from.length;
		var fromLen = fromEnd - fromStart;
		var toStart = 1;
		for( ; toStart < to.length; ++toStart )
			if( 47 !== to.charCodeAt( toStart ) ) break;
		var toEnd = to.length;
		var toLen = toEnd - toStart;
		var length = toLen > fromLen ? fromLen : toLen;
		var lastCommonSep = -1;
		var i = 0;
		for( ; length >= i; ++i ) {
			if( i === length ) {
				if( toLen > length ) {
					if( 47 === to.charCodeAt( toStart + i ) ) return to.slice( toStart + i + 1 );
					if( 0 === i ) return to.slice( toStart + i );
				} else fromLen > length && ( 47 === from.charCodeAt( fromStart + i ) ? lastCommonSep = i : 0 === i && ( lastCommonSep = 0 ) );
				break;
			}
			var fromCode = from.charCodeAt( fromStart + i );
			var toCode = to.charCodeAt( toStart + i );
			if( fromCode !== toCode ) break;
			47 === fromCode && ( lastCommonSep = i );
		}
		var out = "";
		for( i = fromStart + lastCommonSep + 1; fromEnd >= i; ++i )( i === fromEnd || 47 === from.charCodeAt( i ) ) && ( out += 0 === out.length ? ".." : "/.." );
		if( out.length > 0 ) return out + to.slice( toStart + lastCommonSep );
		toStart += lastCommonSep;
		47 === to.charCodeAt( toStart ) && ++toStart;
		return to.slice( toStart );
	},
	_makeLong: function( path ) {
		return path;
	},
	dirname: function( path ) {
		assertPath( path );
		if( 0 === path.length ) return ".";
		var code = path.charCodeAt( 0 );
		var hasRoot = 47 === code;
		var end = -1;
		var matchedSlash = true;
		for( var i = path.length - 1; i >= 1; --i ) {
			code = path.charCodeAt( i );
			if( 47 === code ) {
				if( !matchedSlash ) {
					end = i;
					break;
				}
			} else matchedSlash = false;
		}
		if( -1 === end ) return hasRoot ? "/" : ".";
		if( hasRoot && 1 === end ) return "//";
		return path.slice( 0, end );
	},
	basename: function( path, ext ) {
		if( void 0 !== ext && "string" != typeof ext ) throw new TypeError( '"ext" argument must be a string' );
		assertPath( path );
		var start = 0;
		var end = -1;
		var matchedSlash = true;
		var i;
		if( void 0 !== ext && ext.length > 0 && ext.length <= path.length ) {
			if( ext.length === path.length && ext === path ) return "";
			var extIdx = ext.length - 1;
			var firstNonSlashEnd = -1;
			for( i = path.length - 1; i >= 0; --i ) {
				var code = path.charCodeAt( i );
				if( 47 === code ) {
					if( !matchedSlash ) {
						start = i + 1;
						break;
					}
				} else {
					if( -1 === firstNonSlashEnd ) {
						matchedSlash = false;
						firstNonSlashEnd = i + 1;
					}
					if( extIdx >= 0 )
						if( code === ext.charCodeAt( extIdx ) ) - 1 === --extIdx && ( end = i );
						else {
							extIdx = -1;
							end = firstNonSlashEnd;
						}
				}
			}
			start === end ? end = firstNonSlashEnd : -1 === end && ( end = path.length );
			return path.slice( start, end );
		}
		for( i = path.length - 1; i >= 0; --i )
			if( 47 === path.charCodeAt( i ) ) {
				if( !matchedSlash ) {
					start = i + 1;
					break;
				}
			} else if( -1 === end ) {
			matchedSlash = false;
			end = i + 1;
		}
		if( -1 === end ) return "";
		return path.slice( start, end );
	},
	extname: function( path ) {
		assertPath( path );
		var startDot = -1;
		var startPart = 0;
		var end = -1;
		var matchedSlash = true;
		var preDotState = 0;
		for( var i = path.length - 1; i >= 0; --i ) {
			var code = path.charCodeAt( i );
			if( 47 === code ) {
				if( !matchedSlash ) {
					startPart = i + 1;
					break;
				}
				continue;
			}
			if( -1 === end ) {
				matchedSlash = false;
				end = i + 1;
			}
			46 === code ? -1 === startDot ? startDot = i : 1 !== preDotState && ( preDotState = 1 ) : -1 !== startDot && ( preDotState = -1 );
		}
		if( -1 === startDot || -1 === end || 0 === preDotState || 1 === preDotState && startDot === end - 1 && startDot === startPart + 1 ) return "";
		return path.slice( startDot, end );
	},
	format: function( pathObject ) {
		if( null === pathObject || "object" !== ( "undefined" == typeof pathObject ? "undefined" : _typeof( pathObject ) ) ) throw new TypeError( 'Parameter "pathObject" must be an object, not ' + ( "undefined" == typeof pathObject ? "undefined" : _typeof( pathObject ) ) );
		return _format( "/", pathObject );
	},
	parse: function( path ) {
		assertPath( path );
		var ret = {
			root: "",
			dir: "",
			base: "",
			ext: "",
			name: ""
		};
		if( 0 === path.length ) return ret;
		var code = path.charCodeAt( 0 );
		var isAbsolute = 47 === code;
		var start;
		if( isAbsolute ) {
			ret.root = "/";
			start = 1;
		} else start = 0;
		var startDot = -1;
		var startPart = 0;
		var end = -1;
		var matchedSlash = true;
		var i = path.length - 1;
		var preDotState = 0;
		for( ; i >= start; --i ) {
			code = path.charCodeAt( i );
			if( 47 === code ) {
				if( !matchedSlash ) {
					startPart = i + 1;
					break;
				}
				continue;
			}
			if( -1 === end ) {
				matchedSlash = false;
				end = i + 1;
			}
			46 === code ? -1 === startDot ? startDot = i : 1 !== preDotState && ( preDotState = 1 ) : -1 !== startDot && ( preDotState = -1 );
		}
		if( -1 === startDot || -1 === end || 0 === preDotState || 1 === preDotState && startDot === end - 1 && startDot === startPart + 1 ) - 1 !== end && ( ret.base = ret.name = 0 === startPart && isAbsolute ? path.slice( 1, end ) : path.slice( startPart, end ) );
		else {
			if( 0 === startPart && isAbsolute ) {
				ret.name = path.slice( 1, startDot );
				ret.base = path.slice( 1, end );
			} else {
				ret.name = path.slice( startPart, startDot );
				ret.base = path.slice( startPart, end );
			}
			ret.ext = path.slice( startDot, end );
		}
		startPart > 0 ? ret.dir = path.slice( 0, startPart - 1 ) : isAbsolute && ( ret.dir = "/" );
		return ret;
	},
	sep: "/",
	delimiter: ":",
	win32: null,
	posix: null
};

posix.win32 = win32.win32 = win32;

posix.posix = win32.posix = posix;

module.exports = "win32" === process.platform ? win32 : posix;