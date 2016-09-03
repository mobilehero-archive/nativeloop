#! /usr/bin/env node

var yargs = require("yargs");
var Promise = require("bluebird");
Promise.promisifyAll(require("fs-extra"));
const _ = require('lodash');

require('yargs')
  .commandDir('commands', {
    recurse: false
  })
  .demand(1, "must provide a valid command")
  .help()
  .argv

