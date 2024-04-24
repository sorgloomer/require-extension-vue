// @ts-check

/**
 * based on https://github.com/vuejs/vue-loader/blob/bf901cbffd7211e22d83972811db0e979e4f577a/lib/resolveScript.js
 */

const { resolveCompiler } = require('./resolve-compiler');

/**
 * @typedef { import('vue2/compiler-sfc').SFCDescriptor } SFCDescriptor
 * @typedef { import('vue2/compiler-sfc').SFCScriptBlock } SFCScriptBlock
 */

/**
 * @type {WeakMap<SFCDescriptor, SFCScriptBlock>}
 */
const cache = new WeakMap();

/**
 * @type {(filename: string, descriptor: SFCDescriptor) => SFCScriptBlock | null}
 */
const resolveScript = (filename, descriptor) => {
  if (!descriptor.script && !descriptor.scriptSetup) return null;

  const cached = cache.get(descriptor);
  if (cached) return cached;

  const { compiler } = resolveCompiler();

  /** @type {SFCScriptBlock} */
  let compiled;

  try {
    compiled = compiler.compileScript(descriptor, {
      id: filename, // vue-loader uses short file path, query.id
      isProd: false, // relevant for CSS hashing
      sourceMap: true,
      // babelParserPlugins: undefined, // not relevant yet
    });
  } catch (error) {
    throw new Error(
      `[require-extension-vue] compiler error: failed to compile script of ${filename}: ${error}`
    );
  }

  cache.set(descriptor, compiled);
  return compiled;
};

exports.resolveScript = resolveScript;
