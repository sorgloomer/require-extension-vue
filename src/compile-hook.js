const compile = require('./compile');

let compiling = false;

const compileHook = (code, filename) => {
  if (compiling) return code;

  try {
    compiling = true;
    return compile(code, filename);
  } finally {
    compiling = false;
  }
};

exports = module.exports = compileHook;
