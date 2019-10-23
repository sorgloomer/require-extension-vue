const { addHook } = require('pirates');
const log = require('loglevel');
const compileHook = require('./compile-hook');
const { initConfig } = require('./config');

const VUE_EXTENSION = '.vue';

let piratesRevert = null;

log.setDefaultLevel(process.env.REQ_EXT_VUE_LOG_LEVEL || log.levels.WARN);

const register = options => {
  log.debug(`[require-extension-vue debug] provided options: ${JSON.stringify(options)}`);
  initConfig(options);
  if (piratesRevert) {
    log.info('[require-extension-vue info]: removing installed hook');
    piratesRevert();
  }

  log.info('[require-extension-vue info]: installing hook');
  piratesRevert = addHook(compileHook, { ext: VUE_EXTENSION, ignoreNodeModules: false });
};

register();

exports = module.exports = options => {
  register(options);
};

exports.revert = () => {
  if (piratesRevert) piratesRevert();
};
