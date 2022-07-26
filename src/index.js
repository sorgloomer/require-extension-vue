const { addHook } = require('pirates');
const log = require('loglevel');
const sourceMapSupport = require('source-map-support');
const compileHook = require('./compile-hook');
const {
  initConfig,
  initLogging,
  isPermanentCacheEnabled,
} = require('./config');
const { initialize: initializeCache } = require('./cache');

const VUE_EXTENSION = '.vue';

let piratesRevert = null;

const register = (options) => {
  initConfig(options);
  if (isPermanentCacheEnabled()) initializeCache();
  // note: setLevel inside loglevel completely replaces all exposed functions when
  //  called. this makes stubbing/spying kinda impossible/hard to maintain
  if (process.env.NODE_ENV !== 'test') {
    initLogging();
  }
  log.debug(
    `[require-extension-vue debug] provided options: ${JSON.stringify(
      options,
      null,
      2
    )}`
  );
  if (piratesRevert) {
    log.info('[require-extension-vue info]: removing installed hook');
    piratesRevert();
  }

  log.info('[require-extension-vue info]: installing hook');
  piratesRevert = addHook(compileHook, {
    ext: VUE_EXTENSION,
    ignoreNodeModules: false,
  });
};

sourceMapSupport.install({
  handleUncaughtExceptions: false,
  environment: 'node',
  hookRequire: true,
});

register();

exports = module.exports = (options) => {
  register(options);
};

exports.revert = () => {
  if (piratesRevert) piratesRevert();
};
