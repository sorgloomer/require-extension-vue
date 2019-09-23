const log = require('loglevel');
const compile = require('./compile');

let compiling = false;

const compileHook = (code, filename) => {
  if (compiling) {
    log.info('[require-extension-vue info] compiling is already in progress, returning `code` as is');
    return code;
  }

  try {
    compiling = true;
    return compile(code, filename);
  } finally {
    compiling = false;
  }
};

exports = module.exports = compileHook;
