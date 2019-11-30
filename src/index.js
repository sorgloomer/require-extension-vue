const { addHook } = require('pirates');
const compileHook = require('./compile-hook');

const VUE_EXTENSION = '.vue';

let piratesRevert = null;

const register = () => {
  if (piratesRevert) piratesRevert();
  piratesRevert = addHook(compileHook, { ext: VUE_EXTENSION, ignoreNodeModules: false });
};

register();

exports = module.exports = () => {
  register();
};

exports.revert = () => {
  if (piratesRevert) piratesRevert();
};
