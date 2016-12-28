'use strict';
/***
 *                          __     _  __       __                     
 *       ____ ___   ____   / /_   (_)/ /___   / /_   ___   _____ ____ 
 *      / __ `__ \ / __ \ / __ \ / // // _ \ / __ \ / _ \ / ___// __ \ 
 *     / / / / / // /_/ // /_/ // // //  __// / / //  __// /   / /_/ / 
 *    /_/ /_/ /_/ \____//_.___//_//_/ \___//_/ /_/ \___//_/    \____/ 
 *                                                                    
 *                  mobile solutions for everyday heroes
 *                                                                    
 * @file This is a partially implemented replacement for node.js fs module.
 * This module is a fork of https://github.com/tonylukasavage/ti-fs
 * @module nativeloop/fs 
 * @author Brenton House <brenton.house@gmail.com>
 * @version 1.0.0
 * @since 1.0.0
 * @copyright Copyright (c) 2017 by Superhero Studios Incorporated.  All Rights Reserved.
 * @license Licensed under the terms of the MIT License (MIT)
 * 
 */


var $F = Ti.Filesystem,
    fs = exports,
    util = require('util');

var IS_ANDROID = Ti.Platform.osname === 'android';

var MODE_MAP = {};
MODE_MAP['r'] = MODE_MAP['r+'] = MODE_MAP['rs'] = MODE_MAP['rs+'] = $F.MODE_READ;
MODE_MAP['w'] = MODE_MAP['w+'] = MODE_MAP['wx'] = MODE_MAP['wx+'] = $F.MODE_WRITE;
MODE_MAP['a'] = MODE_MAP['a+'] = MODE_MAP['ax'] = MODE_MAP['ax+'] = $F.MODE_APPEND;

fs.Stats = function Stats(path) {
    this.__file = null;
    this.dev = 0;
    this.ino = 0;
    this.nlink = 0;
    this.uid = 0;
    this.gid = 0;
    this.rdev = 0;
    this.size = 0;
    this.blksize = 4096;
    this.blocks = 8;
    this.ctime = this.atime = this.mtime = 0;

    if (path) {
        this.__file = $F.getFile(path);
        if (!this.__file.exists()) {
            throw new Error('file does not exist');
        }

        this.size = this.__file.size;
        this.mode = 0;
        this.ctime = new Date(this.__file.createTimestamp());
        this.atime = this.mtime = new Date(this.__file.modificationTimestamp());
    }
};

fs.Stats.prototype.isDirectory = function(property) {
    return this.__file.isDirectory();
};

fs.Stats.prototype.isFile = function(property) {
    return this.__file.isFile();
};

fs.Stats.prototype.isBlockDevice = function(property) {
    return false;
};

fs.Stats.prototype.isCharacterDevice = function(property) {
    return false;
};

fs.Stats.prototype.isSymbolicLink = function(property) {
    return this.__file.symbolicLink;
};

fs.Stats.prototype.isFIFO = function(property) {
    return false;
};

fs.Stats.prototype.isSocket = function(property) {
    return false;
};

fs.exists = function exists(path, callback) {
    setTimeout(function() {
        return callback(fs.existsSync(path));
    }, 0);
};

fs.existsSync = function existsSync(path) {
    return $F.getFile(path).exists();
};

fs.readFile = function readFile(path, options, callback_) {
    var callback = maybeCallback(arguments[arguments.length - 1]);
    if (!options || util.isFunction(options)) {
        options = {
            encoding: null,
            flag: 'r'
        };
    } else if (util.isString(options)) {
        options = {
            encoding: options,
            flag: 'r'
        };
    } else if (!util.isObject(options)) {
        throw new TypeError('Bad arguments');
    }

    var encoding = options.encoding,
        flag = options.flag || 'r';
    assertEncoding(options.encoding);

    fs.open(path, flag, function(err, fd) {
        if (err) {
            return callback(err);
        }
        fs.fstat(fd, function(err, stats) {
            if (err) {
                return callback(err);
            }
            var buffer = Ti.createBuffer({
                length: stats.size
            });
            fs.read(fd, buffer, function(err, data) {
                if (err) {
                    return callback(err);
                }
                fs.close(fd, function(err) {
                    if (err) {
                        return callback(err);
                    }
                    return callback(err, encoding ? convertBuffer(buffer, encoding) : buffer);
                });
            });
        });
    });
};

fs.readFileSync = function readFileSync(path, options) {
    if (!options) {
        options = {
            encoding: null,
            flag: 'r'
        };
    } else if (util.isString(options)) {
        options = {
            encoding: options,
            flag: 'r'
        };
    } else if (!util.isObject(options)) {
        throw new TypeError('Bad arguments');
    }

    var encoding = options.encoding,
        flag = options.flag || 'r';
    assertEncoding(options.encoding);

    var fd = fs.openSync(path, flag /*, mode */ ),
        size = fs.fstatSync(fd).size,
        buffer = Ti.createBuffer({
            length: size
        });

    fs.readSync(fd, buffer);
    fs.closeSync(fd);

    return encoding ? convertBuffer(buffer, encoding) : buffer;
};

fs.close = function close(fd, callback) {
    setTimeout(function() {
        var err = null;
        try {
            fd.close();
        } catch (e) {
            err = e;
        }
        return callback(err);
    }, 0);
};

fs.closeSync = function closeSync(fd) {
    fd.close();
};

fs.open = function open(path, flags, mode, callback) {
    callback = maybeCallback(arguments[arguments.length - 1]);
    if (!mode || util.isFunction(mode)) {
        mode = null;
    }

    setTimeout(function() {
        var fd = null,
            err = null;
        try {
            fd = fs.openSync(path, flags, mode);
        } catch (e) {
            err = e;
        }
        return callback(err, fd);
    }, 0);
};

fs.openSync = function openSync(path, flags, mode) {
    var tiMode = assertFlags(flags),
        file = $F.getFile(path),
        fd = file.open(tiMode);
    fd.__path = path;
    return fd;
};

fs.read = function read(fd, buffer, offset, length, position, callback) {
    // position is not handled in Titanium streams
    callback = maybeCallback(arguments[arguments.length - 1]);
    if (util.isFunction(position)) {
        position = undefined;
    }
    if (util.isFunction(length)) {
        length = undefined;
    }
    if (util.isFunction(offset)) {
        offset = undefined;
    }

    // TODO: This should be Ti.Stream.read(), but it doesn't appear to do
    // anything when targeting a FileStream, despite the docs.
    setTimeout(function() {
        var bytes = null,
            err = null;
        try {
            bytes = fs.readSync(fd, buffer, offset, length, position);
        } catch (e) {
            err = e;
        }
        return callback(err, bytes, buffer);
    }, 0);
};

// Android improperly handles undefined args passed to offset and/or length
if (IS_ANDROID) {
    fs.readSync = function readSync(fd, buffer, offset, length, position) {
        if (offset == null && length == null) {
            return fd.read(buffer);
        } else {
            return fd.read(buffer, offset, length);
        }
    };
} else {
    fs.readSync = function readSync(fd, buffer, offset, length, position) {
        return fd.read(buffer, offset, length);
    };
}

fs.write = function write(fd, buffer, offset, length, position, callback) {
    // position is not handled in Titanium streams
    callback = maybeCallback(arguments[arguments.length - 1]);
    if (util.isFunction(position)) {
        position = undefined;
    }
    if (util.isFunction(length)) {
        length = undefined;
    }
    if (util.isFunction(offset)) {
        offset = undefined;
    }

    // TODO: This should be Ti.Stream.write(), but it doesn't appear to do
    // anything when targeting a FileStream, despite the docs.
    setTimeout(function() {
        var bytes = null,
            err = null;
        try {
            bytes = fs.writeSync(fd, buffer, offset, length, position);
        } catch (e) {
            err = e;
        }
        return callback(err, bytes, buffer);
    }, 0);
};

// Android improperly handles undefined args passed to offset and/or length
if (IS_ANDROID) {
    fs.writeSync = function writeSync(fd, buffer, offset, length, position) {
        if (offset == null && length == null) {
            return fd.write(buffer);
        } else {
            return fd.write(buffer, offset, length);
        }
    };
} else {
    fs.writeSync = function writeSync(fd, buffer, offset, length, position) {
        return fd.write(buffer, offset, length);
    };
}

fs.rename = function rename(oldPath, newPath, callback) {
    setTimeout(function() {
        var err = null,
            good = false;
        try {
            good = $F.getFile(oldPath).move(newPath);
            if (!good) {
                err = new Error('could not move file');
            }
        } catch (e) {
            err = e;
        }
        return callback(err);
    }, 0);
};

fs.renameSync = function renameSync(oldPath, newPath) {
    $F.getFile(oldPath).move(newPath);
};

fs.truncate = function truncate(path, len, callback) {
    callback = maybeCallback(arguments[arguments.length - 1]);
    if (!len || util.isFunction(len)) {
        len = 0;
    }

    if (len) {
        fs.open(path, 'r', function(err, fd) {
            if (err) {
                return callback(err);
            }
            var buffer = Ti.createBuffer({
                length: len
            });
            fs.read(fd, buffer, 0, len, function(err, bytes, buffer) {
                if (err) {
                    return callback(err);
                }
                fs.close(fd, function(err) {
                    if (err) {
                        return callback(err);
                    }
                    fs.writeFile(path, buffer, callback);
                });
            });
        });
    } else {
        fs.writeFile(path, '', callback);
    }
};

fs.truncateSync = function truncateSync(path, len) {
    len = len || 0;
    if (len) {
        var fd = fs.openSync(path, 'r'),
            buffer = Ti.createBuffer({
                length: len
            });
        fs.readSync(fd, buffer, 0, len);
        fs.closeSync(fd);
        fs.writeFileSync(path, buffer);
    } else {
        fs.writeFileSync(path, '');
    }
};

fs.ftruncate = function ftruncate(fd, len, callback) {
    if (!fd.__path) {
        throw new Error('invalid file descriptor');
    }

    callback = maybeCallback(arguments[arguments.length - 1]);
    if (!len || util.isFunction(len)) {
        len = 0;
    }

    if (len) {
        var buffer = Ti.createBuffer({
            length: len
        });
        fs.open(fd.__path, 'r', function(err, fd2) {
            if (err) {
                return callback(err);
            }
            fs.read(fd2, buffer, 0, len, function(err, bytes, buffer) {
                if (err) {
                    return callback(err);
                }
                fs.close(fd2, function(err) {
                    if (err) {
                        return callback(err);
                    }
                    fs.writeFile(fd.__path, buffer, callback);
                });
            });
        });
    } else {
        fs.writeFile(fd.__path, '', callback);
    }
};

fs.ftruncateSync = function ftruncateSync(fd, len) {
    len = len || 0;
    if (!fd.__path) {
        throw new Error('invalid file descriptor');
    }

    if (len) {
        var buffer = Ti.createBuffer({
            length: len
        }),
            fd2 = fs.openSync(fd.__path, 'r');
        fs.readSync(fd2, buffer, 0, len);
        fs.closeSync(fd2);
        fs.writeFileSync(fd.__path, buffer);
    } else {
        fs.writeFileSync(fd.__path, '');
    }
};

fs.rmdir = function rmdir(path, callback) {
    setTimeout(function() {
        var err = null;
        try {
            if (!$F.getFile(path).deleteDirectory()) {
                err = new Error('could not delete directory');
            }
        } catch (e) {
            err = e;
        }
        return callback(err);
    }, 0);
};

fs.rmdirSync = function rmdirSync(path) {
    if (!$F.getFile(path).deleteDirectory()) {
        throw new Error('could not delete directory');
    }
};

if (IS_ANDROID) {
    fs.mkdir = function mkdir(path, mode, callback) {
        callback = maybeCallback(arguments[arguments.length - 1]);
        setTimeout(function() {
            var err = null;
            try {
                $F.getFile(path).createDirectory();
                if (!$F.getFile(path).exists()) {
                    throw new Error('could not create directory');
                }
            } catch (e) {
                err = e;
            }
            return callback(err);
        }, 0);
    };
} else {
    fs.mkdir = function mkdir(path, mode, callback) {
        callback = maybeCallback(arguments[arguments.length - 1]);
        setTimeout(function() {
            var err = null;
            try {
                if (!$F.getFile(path).createDirectory()) {
                    err = new Error('could not create directory');
                }
            } catch (e) {
                err = e;
            }
            return callback(err);
        }, 0);
    };
}

if (IS_ANDROID) {
    fs.mkdirSync = function mkdirSync(path, mode) {
        $F.getFile(path).createDirectory();
        if (!$F.getFile(path).exists()) {
            throw new Error('could not create directory');
        }
    };
} else {
    fs.mkdirSync = function mkdirSync(path, mode) {
        if (!$F.getFile(path).createDirectory()) {
            throw new Error('could not create directory');
        }
    };
}

fs.readdir = function readdir(path, callback) {
    setTimeout(function() {
        var files = [],
            err = null;
        try {
            files = fs.readdirSync(path);
        } catch (e) {
            err = e;
        }
        return callback(err, files);
    }, 0);
};

fs.readdirSync = function readdirSync(path) {
    return $F.getFile(path).getDirectoryListing();
};

fs.fstat = function fstat(fd, callback) {
    setTimeout(function() {
        var stats = null,
            err = null;
        try {
            stats = fs.fstatSync(fd);
        } catch (e) {
            err = e;
        }
        return callback(err, stats);
    }, 0);
};

fs.lstat = function lstat(path, callback) {
    setTimeout(function() {
        var stats = null,
            err = null;
        try {
            stats = fs.lstatSync(path);
        } catch (e) {
            err = e;
        }
        return callback(err, stats);
    }, 0);
};

fs.stat = function stat(path, callback) {
    setTimeout(function() {
        var stats = null,
            err = null;
        try {
            stats = fs.statSync(path);
        } catch (e) {
            err = e;
        }
        return callback(err, stats);
    }, 0);
};

fs.fstatSync = function fstatSync(fd) {
    if (fd.__path) {
        return fs.statSync(fd.__path);
    } else {
        throw new Error('invalid file descriptor');
    }
};

fs.lstatSync = function lstatSync(path) {
    return fs.statSync(path);
};

fs.statSync = function statSync(path) {
    return new fs.Stats(path);
};

fs.readlink = function readlink(path, callback) {
    setTimeout(function() {
        var result = null,
            err = null;
        try {
            result = fs.readlinkSync(path);
        } catch (e) {
            err = e;
        }
        return callback(err, result);
    }, 0);
};

fs.readlinkSync = function readlinkSync(path) {
    var file = $F.getFile(path);
    if (!file.symbolicLink) {
        throw new Error('invalid argument \'' + path + '\'');
    }
    return file.resolve();
};

fs.unlink = function unlink(path, callback) {
    setTimeout(function() {
        var err = null;
        try {
            fs.unlinkSync(path);
        } catch (e) {
            err = e;
        }
        return callback(err);
    }, 0);
};

fs.unlinkSync = function unlinkSync(path) {
    var file = $F.getFile(path);
    if (file.isFile() || file.symbolicLink) {
        if (!file.deleteFile()) {
            throw new Error('unable to delete file');
        }
    } else {
        throw new Error('operation not permitted \'' + path + '\'');
    }
};

fs.writeFile = function writeFile(path, data, options, callback) {
    callback = maybeCallback(arguments[arguments.length - 1]);
    if (!options || util.isFunction(options)) {
        options = {};
    }

    setTimeout(function() {
        var err = null;
        try {
            fs.writeFileSync(path, data, options);
        } catch (e) {
            err = e;
        }
        return callback(err);
    }, 0);
};

fs.writeFileSync = function writeFileSync(path, data, options) {
    options = options || {};
    var encoding = options.encoding || 'utf8',
        fd = fs.openSync(path, 'w'),
        buffer;

    if (data.apiName === 'Ti.Buffer') {
        buffer = data;
    } else {
        buffer = Ti.createBuffer({
            value: data
        });
    }
    fs.writeSync(fd, buffer);
    fs.closeSync(fd);
};

fs.appendFile = function appendFile(path, data, options, callback_) {
    var callback = maybeCallback(arguments[arguments.length - 1]);
    if (!options || util.isFunction(options)) {
        options = {};
    }

    setTimeout(function() {
        var err = null;
        try {
            fs.appendFileSync(path, data, options);
        } catch (e) {
            err = e;
        }
        return callback(err);
    }, 0);
};

fs.appendFileSync = function appendFileSync(path, data, options) {
    options = options || {};
    var encoding = options.encoding || 'utf8',
        fd = fs.openSync(path, 'a'),
        buffer;

    if (data.apiName === 'Ti.Buffer') {
        buffer = data;
    } else {
        buffer = Ti.createBuffer({
            value: data
        });
    }
    fs.writeSync(fd, buffer);
    fs.closeSync(fd);
};

// var splitRootRe = /^[\/]*/;
// var nextPartRe = /(.*?)(?:[\/]+|$)/g;
fs.realpathSync = function realpathSync(p, cache) {
    return $F.getFile(p).resolve();

    // p = $F.getFile(p).resolve();

    // if (cache && Object.prototype.hasOwnProperty.call(cache, p)) {
    // 	return cache[p];
    // }

    // var original = p,
    // 	seenLinks = {},
    // 	knownHard = {};

    // // current character position in p
    // var pos;
    // // the partial path so far, including a trailing slash if any
    // var current;
    // // the partial path without a trailing slash (except when pointing at a root)
    // var base;
    // // the partial path scanned in the previous round, with slash
    // var previous;

    // start();

    // function start() {
    // 	// Skip over roots
    // 	var m = splitRootRe.exec(p);
    // 	pos = m[0].length;
    // 	current = m[0];
    // 	base = m[0];
    // 	previous = '';
    // }

    // // walk down the path, swapping out linked pathparts for their real
    //  // values
    //  // NB: p.length changes.
    //  while (pos < p.length) {
    //    // find the next part
    //    nextPartRe.lastIndex = pos;
    //    var result = nextPartRe.exec(p);
    //    previous = current;
    //    current += result[0];
    //    base = previous + result[1];
    //    pos = nextPartRe.lastIndex;

    //    // continue if not a symlink
    //    if (knownHard[base] || (cache && cache[base] === base)) {
    //      continue;
    //    }

    //    var resolvedLink;
    //    if (cache && Object.prototype.hasOwnProperty.call(cache, base)) {
    //      // some known symbolic link.  no need to stat again.
    //      resolvedLink = cache[base];
    //    } else {
    //      var stat = fs.lstatSync(base);
    //      if (!stat.isSymbolicLink()) {
    //        knownHard[base] = true;
    //        if (cache) cache[base] = base;
    //        continue;
    //      }

    //      fs.statSync(base);
    //      var linkTarget = fs.readlinkSync(base);
    //      resolvedLink = pathModule.resolve(previous, linkTarget);
    //      // track this, if given a cache.
    //      if (cache) cache[base] = resolvedLink;
    //    }

    //    // resolve the link, then start over
    //    p = pathModule.resolve(resolvedLink, p.slice(pos));
    //    start();
    //  }

    //  if (cache) cache[original] = p;

    //  return p;
};

fs.realpath = function realpath(p, cache, cb) {
    cb = maybeCallback(arguments[arguments.length - 1]);
    if (!cache || util.isFunction(cache)) {
        cache = {};
    }

    setTimeout(function() {
        var err = null,
            res = null;
        try {
            res = fs.realpathSync(p, cache);
        } catch (e) {
            err = e;
        }
        return cb(err, res);
    }, 0);
};

fs.createReadStream = function createReadStream(path, options) {
    throw new Error('createReadStream not implemented');
};

fs.ReadStream = function ReadStream(path, options) {
    throw new Error('ReadStream not implemented');
};

fs.FileReadStream = function FileReadStream(path, options) {
    throw new Error('FileReadStream not implemented');
};

fs.createWriteStream = function createWriteStream(path, options) {
    throw new Error('createWriteStream not implemented');
};

fs.WriteStream = function WriteStream(path, options) {
    throw new Error('WriteStream not implemented');
};

fs.FileWriteStream = function FileWriteStream(path, options) {
    throw new Error('FileWriteStream not implemented');
};

// no-ops
fs.fsync = function fsync(fd, callback) {
    return callback();
};
fs.fsyncSync = function fsyncSync(fd) {};
fs.fchmod = function fchmod(fd, mode, callback) {
    return callback();
};
fs.fchmodSync = function fchmodSync(fd, mode) {};
fs.lchmod = function lchmod(path, mode, callback) {
    return callback();
};
fs.lchmodSync = function lchmodSync(path, mode) {};
fs.chmod = function chmod(path, mode, callback) {
    return callback();
};
fs.chmodSync = function chmodSync(path, mode) {};
fs.lchown = function lchown(path, uid, gid, callback) {
    return callback();
};
fs.lchownSync = function lchownSync(path, uid, gid) {};
fs.fchown = function fchown(fd, uid, gid, callback) {
    return callback();
};
fs.fchownSync = function fchownSync(fd, uid, gid) {};
fs.chown = function chown(path, uid, gid, callback) {
    return callback();
};
fs.chownSync = function chownSync(path, uid, gid) {};
fs.symlink = function symlink(destination, path, type_, callback) {
    return maybeCallback(arguments[arguments.length - 1])();
};
fs.symlinkSync = function symlinkSync(destination, path, type) {};
fs.link = function link(srcpath, dstpath, callback) {
    return callback();
};
fs.linkSync = function linkSync(srcpath, dstpath) {};
fs.watch = function watch(filename) {};
fs.watchFile = function watchFile(filename) {};
fs.unwatchFile = function unwatchFile(filename, listener) {};
fs.utimes = function utimes(path, atime, mtime, callback) {
    return callback();
};
fs.utimesSync = function utimesSync(path, atime, mtime) {};
fs.futimes = function futimes(fd, atime, mtime, callback) {
    return callback();
};
fs.futimesSync = function futimesSync(fd, atime, mtime) {};

// helpers
function maybeCallback(o) {
    return o && util.isFunction(o) ? o : function(err) {
        if (err) {
            throw err;
        }
    };
}

function assertFlags(flags) {
    var tiMode = MODE_MAP[flags];
    if (tiMode == null) {
        throw new Error('Unknown file open flag: ' + flags);
    }
    return tiMode;
}

var ENCODINGS = ['ascii', 'utf8', 'utf-8', 'base64', 'binary'];

function assertEncoding(encoding) {
    if (encoding && ENCODINGS.indexOf(encoding.toLowerCase()) === -1) {
        throw new Error('Unknown encoding: ' + encoding);
    }
}

function convertBuffer(buffer, encoding) {
    switch (encoding.toLowerCase()) {
        case 'ascii':
        case 'binary':
            var ret = '';
            for (var i = 0; i < buffer.length; i++) {
                ret += String.fromCharCode(Ti.Codec.decodeNumber({
                    source: buffer,
                    type: Ti.Codec.TYPE_BYTE,
                    position: i
                }));
            }
            return ret;
        case 'utf8':
        case 'utf-8':
            return buffer.toString();
        case 'base64':
            return Ti.Utils.base64encode(buffer.toString()).toString();
        default:
            throw new Error('Unknown encoding: ' + encoding);
    }
} 