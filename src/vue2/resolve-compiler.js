// @ts-check

/**
 * based on: https://github.com/vuejs/vue-loader/blob/bf901cbffd7211e22d83972811db0e979e4f577a/lib/compiler.js
 */
const u = require('../utils');

/**
 * @typedef {Object} CompilerSfc
 * @property {import('vue2/compiler-sfc').parse} parse
 * @property {import('vue2/compiler-sfc').compileTemplate} compileTemplate
 * @property {import('vue2/compiler-sfc').compileScript} compileScript
 * @property {import('vue2/compiler-sfc').generateCodeFrame} generateCodeFrame
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

  // check for min Vue 2.7
  const { major, minor } = u.getCurrentVueVersion();
  if ((major === 2 && minor < 7) || major > 2) {
    throw new Error(
      `[require-extension-vue] resolve compiler error: this version only supports Vue ^2.7.0`
    );
  }

  return (cached = {
    compiler: /** @type { CompilerSfc } */ (
      u.loadFromContext('vue/compiler-sfc')
    ),
  });
};

exports.resolveCompiler = resolveCompiler;
