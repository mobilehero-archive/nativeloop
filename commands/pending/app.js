// exports.command = 'app <command>'
exports.desc = 'Manage nativeloop mobile apps'
exports.builder = function(yargs) {
  return yargs.commandDir('./app')
    .demand(1, "must provide a valid command");
}
exports.handler = function(argv) {}