var path = require("path");
var fs = require('fs-extra');
var _ = require('lodash');
// var conf = require('rc')('nativeloop', {});
var pathExists = require('path-exists');
var npm = require('@geek/npm');


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
var copy_template = function(argv) {

	console.info("copy template  ----------------------------------------------");
	console.info("path: " + argv["path"]);
	// process.chdir(argv["path"]);
	console.info("__dirname: " + __dirname);
	console.info("process.cwd(): " + process.cwd());

	var source = path.join(__dirname, "..", "templates", "required");
	var target = argv["path"];
	console.error("source: " + source);
	console.info("target: " + target);

	console.warn("pathExists.sync(source): " + pathExists.sync(source));
	console.warn("pathExists.sync(target): " + pathExists.sync(target));


	if (!pathExists.sync(source)) {
		console.error("source does not exist: " + source);
		return;
	}

	if (!pathExists.sync(target)) {
		console.error("target does not exist: " + target);
		return;
	}


	Promise.resolve(() => console.error("pathExists.sync(target): " + pathExists.sync(target)))
		.then(() => console.warn("copying files to target directory: " + target))
		.then(() => fs.copyAsync(source, target, {
			clobber: true
		}))
		.then(() => console.warn("installing nativeloop mobile"))
		.then(() => npm.install(['brentonhouse/nativeloop'], {
			cwd: target
		}))
		.then(() => console.warn("executing npm dedupe"))
		.then(() => npm.dedupe)
		.then(() => console.warn("all done."))
		.catch(err => console.error("Error occurred: " + err));



}

var handler = function(argv) {

	copy_template(argv);

}

exports.handler = handler;
exports.builder = builder;