/**
 * based on: https://github.com/vuejs/vue-loader/blob/bf901cbffd7211e22d83972811db0e979e4f577a/lib/compiler.js
 */
const log = require('loglevel');

let cached;

const resolveCompiler = () => {
  if (cached) return cached;

  // check 2.7
  try {
    const vuePkg = loadFromContext('vue/package.json');
    const [major, minor] = vuePkg.version.split('.');
    if (major === '2' && Number(minor) >= 7) {
      return (cached = {
        compiler: loadFromContext('vue/compiler-sfc'),
        templateCompiler: undefined,
      });
    }
  } catch (error) {
    if (/Cannot find module 'vue\/package\.json/.test(error.toString())) {
      throw new Error(
        `[require-extension-vue] resolve compiler error: vue package must be available.`
      );
    }
    log.error(`[require-extension-vue] resolve compiler error: \n\n`);
    throw error;
  }

  return (cached = {
    compiler: require('@vue/component-compiler-utils'),
    templateCompiler: loadTemplateCompiler(),
  });
};

const loadTemplateCompiler = () => {
  try {
    return loadFromContext('vue-template-compiler');
  } catch (error) {
    throw /version mismatch/.test(error.toString())
      ? new Error(
          '[require-extension-vue] vue-template-compiler version must match with vue version.'
        )
      : new Error(
          `[require-extension-vue] vue-template-compiler must be installed as a peer dependency, ` +
            `or a compatible compiler implementation must be passed via options (not supported yet though :)).`
        );
  }
};

const loadFromContext = (path) => {
  return require(require.resolve(path, {
    paths: [process.cwd()],
  }));
};

exports.resolveCompiler = resolveCompiler;
