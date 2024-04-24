// @ts-check

const u = require('../utils');

/**
 * based on: https://github.com/vuejs/vue-loader/blob/bf901cbffd7211e22d83972811db0e979e4f577a/lib/compiler.js
 */

/**
 * @type { { compiler: CompilerSfc } }
 */
let cached;

/**
 * @typedef {Object} CompilerSfc
 * @property {import('vue3/compiler-sfc').parse} parse
 * @property {import('vue3/compiler-sfc').compileTemplate} compileTemplate
 * @property {import('vue3/compiler-sfc').compileScript} compileScript
 * @property {import('vue3/compiler-sfc').generateCodeFrame} generateCodeFrame
 */

/**
 * @type {() => { compiler: CompilerSfc }}
 */
const resolveCompiler = () => {
  if (cached) return cached;

  return (cached = {
    compiler: /** @type { CompilerSfc } */ (
      u.loadFromContext('vue/compiler-sfc')
    ),
  });
};

exports.resolveCompiler = resolveCompiler;
