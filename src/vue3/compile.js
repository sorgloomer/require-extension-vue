// @ts-check

const path = require('node:path');
const fse = require('fs-extra');
const log = require('loglevel');
const {
  addMapping,
  fromMap,
  toEncodedMap,
  GenMapping,
  setSourceContent,
} = require('@jridgewell/gen-mapping');
const { TraceMap, eachMapping } = require('@jridgewell/trace-mapping');
const convert = require('convert-source-map');

const {
  getDefaultBabelOptions,
  getBabelOptions,
  isBabelEnabled,
  isBabelConfigured,
  isParserErrorsOutputEnabled,
  isTemplateCompilerErrorsOutputEnabled,
  isTemplateCompilerTipsOutputEnabled,
  parserErrorMessageFilter,
  templateCompilerErrorMessageFilter,
  templateCompilerTipMessageFilter,
} = require('../config');
const u = require('../utils');
const { resolveCompiler } = require('./resolve-compiler');
const { resolveScript } = require('./resolve-script');

/**
 * @typedef { import('vue3/compiler-sfc').SFCBlock } SFCBlock
 * @typedef { import('vue3/compiler-sfc').SFCDescriptor } SFCDescriptor
 * @typedef { import('vue3/compiler-sfc').SFCParseResult } SFCParseResult
 * @typedef { import('vue3/compiler-sfc').SFCScriptBlock } SFCScriptBlock
 * @typedef { import('vue3/compiler-sfc').SFCTemplateCompileResults } SFCTemplateCompileResults
 * @typedef { import('@vue/compiler-core').CompilerOptions } CompilerOptions
 * @typedef { import('@babel/core').BabelFileResult } BabelFileResult
 * @typedef { import('@babel/core').TransformOptions } TransformOptions
 * @typedef { import('../types').SfcMetadata } SfcMetadata
 * @typedef { import('source-map-js').RawSourceMap } RawSourceMap
 * @typedef { import('@jridgewell/trace-mapping').EncodedSourceMap } TraceEncodedSourceMap
 * @typedef { import('@jridgewell/gen-mapping').EncodedSourceMap } GenEncodedSourceMap
 */

const REGEX_RENDER_FUNCTION = /render\s*:?\s*\(/;

const ENCODING_UTF8 = 'utf8';

/**
 * @type {(source: string, filename: string) => { code: string, sfcMetadata: SfcMetadata}}
 */
const compile = (source, filename) => {
  log.info(`[require-extension-vue info] start compiling: '${filename}'`);

  const { compiler } = resolveCompiler();
  const { descriptor, errors: parseErrors } = compiler.parse(source, {
    filename,
    sourceMap: true,
    templateParseOptions: {
      // note: parseMode base and html fails with an error. sfc seems ok
      //  we can rely on default
      // parseMode: 'sfc',
    },
  });

  log.debug(
    `[require-extension-vue debug] parsed vue file descriptor: ${JSON.stringify(
      descriptor,
      null,
      2
    )}`
  );

  logParserErrors(filename, parseErrors);

  log.info(
    `[require-extension-vue info] ${
      descriptor.template ? 'has' : 'has no'
    } template block`
  );

  log.info(
    `[require-extension-vue info] ${
      descriptor.script ? 'has' : 'has no'
    } script block`
  );

  log.info(
    `[require-extension-vue info] ${
      descriptor.scriptSetup ? 'has' : 'has no'
    } script setup block`
  );

  log.info(
    `[require-extension-vue info] ${
      descriptor.styles.length > 0 ? 'has' : 'has no'
    } style(s) block`
  );

  const compiledScript = resolveScript(filename, descriptor);
  const [scriptContent, externalScriptPath] = compiledScript
    ? getBlockContent(compiledScript, filename)
    : ['const __sfc__ = {};', null];

  const hasRenderFn = REGEX_RENDER_FUNCTION.test(scriptContent);

  log.info(
    `[require-extension-vue info] ${
      hasRenderFn ? 'has' : 'has no'
    } render function`
  );

  const [compiledTemplate, externalTemplatePath] = processTemplateBlock({
    filename,
    descriptor,
    compiledScript,
    hasRenderFn,
  });

  const result = combineAndTransformContent({
    filename,
    compiledTemplate,
    compiledScript,
    scriptContent,
    externalScriptPath,
  });

  log.debug(`[require-extension-vue debug] compiled vue file ${result}`);
  log.info(`[require-extension-vue info] finished compiling: '${filename}'`);

  return {
    code: result,
    sfcMetadata: {
      filePath: filename,
      externalScriptPath,
      externalTemplatePath,
    },
  };
};

/**
 * @type {(options: { filename: string, compiledTemplate: SFCTemplateCompileResults | null, compiledScript: SFCScriptBlock | null, scriptContent: string, externalScriptPath: string | null }) => string}
 */
const combineAndTransformContent = ({
  filename,
  compiledTemplate,
  compiledScript,
  scriptContent,
  externalScriptPath,
}) => {
  scriptContent = scriptContent.includes('export default ')
    ? scriptContent.replace('export default ', 'const __sfc__ = ')
    : scriptContent;

  let templateContent = compiledTemplate?.code ?? '';
  const hasRenderFn = templateContent.includes('export function render(');
  templateContent = hasRenderFn
    ? templateContent.replace('export function render(', 'function render(')
    : templateContent;

  const relativeFilename = path
    .relative(process.cwd(), filename)
    .replaceAll(/[/\\]/g, '/');

  let combinedContent =
    [
      scriptContent,
      templateContent,
      hasRenderFn ? '__sfc__.render = render;' : '',
      `__sfc__.__file = "${relativeFilename}";`,
      'export default __sfc__;',
    ]
      .filter(Boolean)
      // warn: do not .trim() after join or scriptContent/templateContent!!
      //  script only case has \n as first line for some reason in scriptContent
      .join('\n') + '\n';

  //
  // based on: https://github.com/vitejs/vite-plugin-vue/blob/plugin-vue%405.0.4/packages/plugin-vue/src/main.ts#L188
  //
  let scriptMap = compiledScript?.map;
  const templateMap = compiledTemplate?.map;

  // note: for external script we need to create a basic map at least.
  //  alt: in script only case we could rely on babel though
  if (externalScriptPath && !scriptMap) {
    const map = new GenMapping({ file: externalScriptPath });
    setSourceContent(map, externalScriptPath, scriptContent);

    const splitContent = scriptContent.split('\n');
    for (const [i, line] of splitContent.entries()) {
      // note: we can ignore empty lines at least
      if (line.trim() === '') continue;
      addMapping(map, {
        source: externalScriptPath,
        generated: { line: i + 1, column: 0 },
        original: { line: i + 1, column: 0 },
      });
    }

    scriptMap = /** @type {RawSourceMap} */ (
      /** @type {Omit<GenEncodedSourceMap, 'version'>} */ (toEncodedMap(map))
    );
  }

  /** @type {RawSourceMap | null | undefined} */
  let sourceMap;

  if (scriptMap && templateMap) {
    const scriptGen = fromMap(
      /** @type {TraceEncodedSourceMap} */ (
        /** @type {Omit<RawSourceMap, 'version'>} */ (scriptMap)
      )
    );

    const templateTracer = new TraceMap(
      /** @type {TraceEncodedSourceMap} */ (
        /** @type {Omit<RawSourceMap, 'version'>} */ (templateMap)
      )
    );

    const offset = (scriptContent.match(/\r?\n/g)?.length ?? 0) + 1;
    eachMapping(templateTracer, (mapping) => {
      if (mapping.source == null) return;
      addMapping(scriptGen, {
        source: mapping.source,
        original: {
          line: mapping.originalLine,
          column: mapping.originalColumn,
        },
        generated: {
          line: mapping.generatedLine + offset,
          column: mapping.generatedColumn,
        },
      });
    });

    sourceMap = /** @type {RawSourceMap} */ (
      /** @type {Omit<GenEncodedSourceMap, 'version'>} */ (
        toEncodedMap(scriptGen)
      )
    );
    sourceMap.sourcesContent = templateMap.sourcesContent;
  } else if (!scriptMap && scriptContent.length > 0 && templateMap) {
    // note: for template map remap we use itself without the mappings
    const templateGen = fromMap(
      /** @type {TraceEncodedSourceMap} */ (
        /** @type {Omit<RawSourceMap, 'version'>} */ ({
          ...templateMap,
          mappings: '',
        })
      )
    );

    const templateTracer = new TraceMap(
      /** @type {TraceEncodedSourceMap} */ (
        /** @type {Omit<RawSourceMap, 'version'>} */ (templateMap)
      )
    );

    const offset = (scriptContent.match(/\r?\n/g)?.length ?? 0) + 1;
    eachMapping(templateTracer, (mapping) => {
      if (mapping.source == null) return;
      addMapping(templateGen, {
        source: mapping.source,
        original: {
          line: mapping.originalLine,
          column: mapping.originalColumn,
        },
        generated: {
          line: mapping.generatedLine + offset,
          column: mapping.generatedColumn,
        },
      });
    });

    sourceMap = /** @type {RawSourceMap} */ (
      /** @type {Omit<GenEncodedSourceMap, 'version'>} */ (
        toEncodedMap(templateGen)
      )
    );
    sourceMap.sourcesContent = templateMap.sourcesContent;
  } else {
    sourceMap = scriptMap ?? templateMap;
  }

  log.info(
    `[require-extension-vue info] babel is ${
      isBabelEnabled() ? 'enabled' : 'not enabled'
    }`
  );

  if (isBabelEnabled()) {
    const transformed = babelTransform({
      filename,
      content: combinedContent,
      vueMap: sourceMap,
    });

    combinedContent = transformed?.code ?? '';
    sourceMap = /** @type {RawSourceMap} */ (
      /** @type {Omit<BabelFileResult['map'], 'version'>} */ (transformed?.map)
    );

    log.debug(
      `[require-extension-vue debug] transformed script ${JSON.stringify(
        transformed,
        null,
        2
      )}`
    );
  } else {
    // note: no babel means we can only work with CJS from consumer side. vue compiled
    //  stuff needs to be manually CJSified as follows

    // note: having only script means we have our own export def like `module.exports = ... ` etc
    //  we need to normalize that to match the esm structure
    const hasScriptSetup = Boolean(compiledScript?.setup);

    // eslint-disable-next-line unicorn/prefer-ternary
    if (hasScriptSetup) {
      combinedContent = combinedContent.replace(
        /((?:exports = )?(?:module.)?exports = )/,
        'const __default__ = '
      );
    } else {
      combinedContent = combinedContent.replace(
        /((?:exports = )?(?:module.)?exports = )/,
        'const __sfc__ = '
      );
    }

    if (hasScriptSetup && combinedContent.includes('const __default__ = ')) {
      combinedContent = combinedContent.replace(
        'const __sfc__ = {',
        'const __sfc__ = {\n  ...__default__,'
      );
    }

    const hasSpecifiedName = /\bname: '[\w-]+'/.test(combinedContent);
    const hasInferredName = /\b__name: '[\w-]+'/.test(combinedContent);

    if (hasSpecifiedName && hasInferredName) {
      combinedContent = combinedContent.replace(/\b__name: '[\w-]+',?\n/, '');
    }

    // note: no babel so we need to ensure that we output a CJS module by hand
    combinedContent = combinedContent
      .replaceAll(
        /import ({[\w ,-]+}) from (["'][\w./@-]+["'])/gi,
        (match, what, from) => {
          what = what.replaceAll(' as ', ': ');
          return `const ${what} = require(${from});`;
        }
      )
      // import _imports_0 from '@assets/images/baggage_detail_trolley.png'
      //  => const _imports_0 = '';
      .replaceAll(
        /import ([\w-]+) from (["'][\w./@-]+\.(?:gif|jpg|png|svg)["'])/gi,
        "const $1 = ''; // $2"
      )
      .replace('export default ', `exports = module.exports = `);
  }

  if (sourceMap) {
    const sourceMapStr = convert.fromObject(sourceMap).toComment();
    combinedContent = `${combinedContent}\n\n${sourceMapStr}\n`;
  }

  return combinedContent;
};

/**
 * @type {(options: { filename: string, descriptor: SFCDescriptor, compiledScript: SFCScriptBlock | null, hasRenderFn: boolean }) => [SFCTemplateCompileResults | null, string | null]}
 */
const processTemplateBlock = ({
  filename,
  descriptor,
  compiledScript,
  hasRenderFn,
}) => {
  if (hasRenderFn || !descriptor.template) return [null, null];

  const [templateContent, externalTemplatePath] = getBlockContent(
    descriptor.template,
    filename
  );

  log.debug(
    `[require-extension-vue debug] template content ${templateContent}`
  );

  const lang = descriptor.scriptSetup?.lang ?? descriptor.script?.lang;
  const isTS = Boolean(lang && /tsx?/.test(lang)); // vue-loader way

  const compiledTemplate = getCompiledTemplate({
    descriptor,
    compiledScript,
    source: templateContent,
    filename: externalTemplatePath ?? filename,
    isTS,
  });

  log.debug(
    `[require-extension-vue debug] compiled template content ${compiledTemplate.code}`
  );

  return [compiledTemplate, externalTemplatePath];
};

/**
 * @type {(oprions: {filename: string, content: string, vueMap: RawSourceMap | undefined}) => BabelFileResult | null}
 */
const babelTransform = ({ filename, content, vueMap }) => {
  log.info('[require-extension-vue info] start transpiling script content');
  log.debug(
    `[require-extension-vue debug] provided babel options: ${JSON.stringify(
      getBabelOptions(),
      null,
      2
    )}`
  );
  const filenameRelative = path
    .relative(process.cwd(), filename)
    .replaceAll(/[/\\]/g, '/');

  const { transformSync, loadPartialConfig } = loadBabel();

  // merge in base options and resolve all the plugins and presets relative to this file
  const partialConfig = loadPartialConfig({
    // primary
    caller: {
      name: 'require-extension-vue',
    },

    filename,
    filenameRelative,
    ast: false,
    sourceMaps: true,
    inputSourceMap: /** @type {TransformOptions['inputSourceMap']} */ (
      /** @type {Omit<RawSourceMap, 'version'>} */ (vueMap)
    ),
    ...(isBabelConfigured() ? getBabelOptions() : {}),
  });

  // note: that .babelrc works mystically, it is not returned by partialConfig
  //  so here we might overwrite it with our defaults but that doesn't happen
  //  for some reason and the thing still works ¯\_(ツ)_/¯
  const opts = partialConfig?.hasFilesystemConfig()
    ? partialConfig.options
    : { ...partialConfig?.options, ...getDefaultBabelOptions() };

  log.debug(
    `[require-extension-vue debug] actual babel options: ${JSON.stringify(
      opts,
      null,
      2
    )}`
  );
  log.info('[require-extension-vue info] finished transpiling script content');
  return transformSync(content, opts);
};

/**
 * @type {(options: { descriptor: SFCDescriptor, compiledScript: SFCScriptBlock | null, source: string, filename: string, isTS: boolean }) => SFCTemplateCompileResults}
 */
const getCompiledTemplate = ({
  descriptor,
  compiledScript,
  source,
  filename,
  isTS,
}) => {
  const { compiler } = resolveCompiler();

  /**
   * @type {CompilerOptions}
   */
  const compilerOptions = {
    // note: parseMode 'sfc' fails with some components with Invalid end tag error
    //  base and html modes are seem to be ok. we might leave this at default too
    parseMode: 'html',
    mode: 'module',
    isTS, // adds some type annotations to render func params for example
    sourceMap: true,
    bindingMetadata: compiledScript ? compiledScript.bindings : undefined,
  };

  const compiled = compiler.compileTemplate({
    source,
    ast:
      descriptor.template && !descriptor.template.lang
        ? descriptor.template.ast
        : undefined,
    filename,
    id: filename, // vue-loader uses short file path, query.id
    // scoped: false, // ? vue-loader sets to `!!query.scoped`
    slotted: descriptor.slotted,
    isProd: false,
    // ssr: false, // ? vue-loader sets to `ssr: isServer`
    ssrCssVars: descriptor.cssVars,
    compilerOptions,
    // note: transformAssetUrls might be needed, see how relative asset urls work in templates
    //  vue-loader sets to `options.transformAssetUrls || true`
  });

  log.debug(
    `[require-extension-vue debug] compiled template descriptor ${JSON.stringify(
      u.pick(['code', 'source', 'tips', 'errors'], compiled),
      null,
      2
    )}`
  );

  if (compiled.errors.length > 0) {
    logTemplateCompilerErrors({
      source,
      filename,
      errors: compiled.errors,
    });
  }

  if (compiled.tips.length > 0) {
    logTemplateCompilerTips(filename, compiled.tips);
  }

  return compiled;
};

/**
 * @type {(block: SFCBlock, filename: string) => [string, string | null]}
 */
const getBlockContent = (block, filename) => {
  const externalPath = block.src
    ? path.join(path.dirname(filename), block.src)
    : null;

  log.info(
    `[require-extension-vue info] get ${block.type} content from ${
      externalPath ? `external file '${externalPath}'` : 'inline block'
    }`
  );

  const content = externalPath
    ? fse.readFileSync(externalPath, ENCODING_UTF8)
    : block.content;

  return [content, externalPath];
};

/**
 * @type {(filename: string, errors: SFCParseResult['errors']) => void}
 */
const logParserErrors = (filename, errors) => {
  log.info(
    `[require-extension-vue info] parser errors output is ${
      isParserErrorsOutputEnabled() ? 'enabled' : 'disabled'
    }`
  );
  if (!isParserErrorsOutputEnabled()) return;

  const errorsLog = errors
    .map((error) => `[require-extension-vue: parser error] ${error}`)
    .filter(parserErrorMessageFilter);

  if (errorsLog.length > 0) {
    log.error(`[require-extension-vue] parser errors in file: ${filename}`);
  }

  errorsLog.forEach((error) => log.error(error));
};

/**
 * @type {(params: { source: string, filename: string, errors: SFCTemplateCompileResults['errors'] }) => void}
 */
const logTemplateCompilerErrors = ({ source, filename, errors }) => {
  log.info(
    `[require-extension-vue info] template compiler errors output is ${
      isTemplateCompilerErrorsOutputEnabled() ? 'enabled' : 'disabled'
    }`
  );

  if (!isTemplateCompilerErrorsOutputEnabled()) return;

  const { compiler } = resolveCompiler();

  const errorsLog = errors
    .map((error) => {
      if (typeof error === 'string') return error;
      const { message, loc } = error;
      const frame = compiler.generateCodeFrame(
        source,
        loc?.start.offset,
        loc?.end.offset
      );
      return `  ${message}\n\n${pad(frame)}`;
    })
    .filter(templateCompilerErrorMessageFilter)
    .join(`\n\n`);

  if (errorsLog.length > 0) {
    log.error(`[require-extension-vue] compiler errors in file: ${filename}`);
    log.error(
      `\n\n[require-extension-vue: compiler errors:\n\n` + errorsLog + '\n'
    );
  }
};

/**
 * @type {(filename: string, tips: string[]) => void}
 */
const logTemplateCompilerTips = (filename, tips) => {
  log.info(
    `[require-extension-vue info] template compiler tips output is ${
      isTemplateCompilerTipsOutputEnabled() ? 'enabled' : 'disabled'
    }`
  );
  if (!isTemplateCompilerTipsOutputEnabled()) return;

  tips = tips
    .map((tip) => `[require-extension-vue: compiler tip] ${tip}`)
    .filter(templateCompilerTipMessageFilter);

  if (tips.length > 0) {
    log.warn(`[require-extension-vue] compiler tips in file: ${filename}`);
  }

  tips.forEach((tip) => log.warn(tip));
};

const loadBabel = () => {
  let babel = null;
  try {
    babel = require('@babel/core');
  } catch {
    throw new Error(
      '[require-extension-vue: error] @babel/core must be installed if you want to use it.'
    );
  }
  return babel;
};

/**
 * @type {(source: string) => string}
 */
const pad = (source) => {
  return source
    .split(/\r?\n/)
    .map((line) => `  ${line}`)
    .join('\n');
};

exports = module.exports = compile;
