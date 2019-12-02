const { addHook } = require('pirates');
const log = require('loglevel');
const sourceMapSupport = require('source-map-support');
const compileHook = require('./compile-hook');
const { initConfig, initLogging } = require('./config');

const VUE_EXTENSION = '.vue';

let piratesRevert = null;

const register = options => {
  initConfig(options);
  initLogging();
  log.debug(`[require-extension-vue debug] provided options: ${JSON.stringify(options)}`);
  if (piratesRevert) {
    log.info('[require-extension-vue info]: removing installed hook');
    piratesRevert();
  }

  log.info('[require-extension-vue info]: installing hook');
  piratesRevert = addHook(compileHook, { ext: VUE_EXTENSION, ignoreNodeModules: false });
};

sourceMapSupport.install({
  handleUncaughtExceptions: false,
  environment: 'node',
  hookRequire: true
});

register();

exports = module.exports = options => {
  register(options);
};

exports.revert = () => {
  if (piratesRevert) piratesRevert();
};
