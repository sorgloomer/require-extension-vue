/**
 * Based on https://github.com/vuejs/vue-loader/blob/bf901cbffd7211e22d83972811db0e979e4f577a/lib/resolveScript.js
 */

const { resolveCompiler } = require('./resolve-compiler');

const cache = new WeakMap();

const resolveScript = (filename, descriptor) => {
  if (!descriptor.script && !descriptor.scriptSetup) return null;

  const { compiler } = resolveCompiler();

  if (!compiler.compileScript) {
    if (descriptor.scriptSetup) {
      throw new Error(
        'The version of Vue you are using does not support <script setup>. ' +
          'Please upgrade to 2.7 or above.'
      );
    }
    return descriptor.script;
  }

  const cached = cache.get(descriptor);
  if (cached) return cached;

  let resolved = null;

  try {
    resolved = compiler.compileScript(descriptor, {
      // id: undefined, // relevant for scoped CSS
      isProd: false, // relevant for CSS hashing
      // babelParserPlugins: undefined, // not relevant yet
    });
  } catch (error) {
    throw new Error(
      `[require-extension-vue] compiler error: failed to compile script of ${filename}: ${error}`
    );
  }

  cache.set(descriptor, resolved);
  return resolved;
};

exports.resolveScript = resolveScript;
