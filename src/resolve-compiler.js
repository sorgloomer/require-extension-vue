// @ts-check

/**
 * based on: https://github.com/vuejs/vue-loader/blob/bf901cbffd7211e22d83972811db0e979e4f577a/lib/compiler.js
 */
const log = require('loglevel');

/**
 * @typedef {Object} CompilerSfc
 * @property {import('vue/compiler-sfc').parse} parse
 * @property {import('vue/compiler-sfc').compileTemplate} compileTemplate
 * @property {import('vue/compiler-sfc').compileScript} compileScript
 * @property {import('vue/compiler-sfc').generateCodeFrame} generateCodeFrame
 */

/**
 * @type { { compiler: CompilerSfc } }
 */

let cached;

/**
 * @type {() => { compiler: CompilerSfc }}
 */
const resolveCompiler = () => {
  if (cached) return cached;

  /** @type {{ version: string }} */
  let vuePkgJson;

  try {
    vuePkgJson = /** @type {{ version: string }} */ (
      loadFromContext('vue/package.json')
    );
  } catch (error) {
    if (
      /Cannot find module 'vue\/package\.json/.test(
        /** @type {Error} */ (error).toString()
      )
    ) {
      throw new Error(
        `[require-extension-vue] resolve compiler error: vue package must be available.`
      );
    }
    log.error(`[require-extension-vue] resolve compiler error: \n\n`);
    throw error;
  }

  // check for min Vue 2.7
  const [major, minor] = vuePkgJson.version.split('.');
  if ((Number(major) === 2 && Number(minor) < 7) || Number(major) > 2) {
    throw new Error(
      `[require-extension-vue] resolve compiler error: this version only supports Vue ^2.7.0`
    );
  }

  return (cached = {
    compiler: /** @type { CompilerSfc } */ (
      loadFromContext('vue/compiler-sfc')
    ),
  });
};

/**
 * @type { (path: string) => unknown }
 */
const loadFromContext = (path) => {
  return require(
    require.resolve(path, {
      paths: [process.cwd()],
    })
  );
};

exports.resolveCompiler = resolveCompiler;
