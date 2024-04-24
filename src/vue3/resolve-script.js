// @ts-check

/**
 * based on https://github.com/vuejs/vue-loader/blob/v17.4.2/src/resolveScript.ts
 */

/**
 * @typedef { import('vue3/compiler-sfc').SFCScriptBlock } SFCScriptBlock
 * @typedef { import('vue3/compiler-sfc').SFCDescriptor } SFCDescriptor
 */

const { resolveCompiler } = require('./resolve-compiler');

/**
 * @type { WeakMap<SFCDescriptor, SFCScriptBlock> }
 */
const cache = new WeakMap();

/**
 * @type { (filename: string, descriptor: SFCDescriptor) => SFCScriptBlock | null }
 */
const resolveScript = (filename, descriptor) => {
  if (!descriptor.script && !descriptor.scriptSetup) return null;

  const cached = cache.get(descriptor);
  if (cached) return cached;

  /** @type {SFCScriptBlock} */
  let compiled;

  const { compiler } = resolveCompiler();

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
