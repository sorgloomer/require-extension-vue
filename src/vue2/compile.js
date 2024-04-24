// @ts-check

const path = require('node:path');
const fse = require('fs-extra');
const log = require('loglevel');
const merge = require('merge-source-map');
const convert = require('convert-source-map');
const { SourceMapGenerator } = require('source-map');
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
 * @typedef { import('@babel/core').BabelFileResult } BabelFileResult
 * @typedef { import('source-map').RawSourceMap } RawSourceMap
 * @typedef { import('vue2/compiler-sfc').SFCBlock } SFCBlock
 * @typedef { import('vue2/compiler-sfc').SFCCustomBlock } SFCCustomBlock
 * @typedef { import('vue2/compiler-sfc').SFCDescriptor } SFCDescriptor
 * @typedef { import('vue2/compiler-sfc').WarningMessage } WarningMessage
 * @typedef { import('../types').SfcMetadata } SfcMetadata
 */

const REGEX_FUNCTIONAL_COMPONENT = /functional\s*:\s*true/;
const REGEX_RENDER_FUNCTION = /render\s*:?\s*\(/;

const ENCODING_UTF8 = 'utf8';
const COMPONENT_OPTIONS =
  '((module.exports.default || module.exports).options || module.exports.default || module.exports)';

/**
 * @type {(source: string, filename: string) => { code: string, sfcMetadata: SfcMetadata}}
 */
const compile = (source, filename) => {
  log.info(`[require-extension-vue info] start compiling: '${filename}'`);
  const { compiler } = resolveCompiler();
  const descriptor = compiler.parse({
    source,
    filename,
    needMap: true,
  });

  log.debug(
    `[require-extension-vue debug] parsed vue file descriptor: ${JSON.stringify(
      descriptor,
      null,
      2
    )}`
  );

  logParserErrors({ source, filename, errors: descriptor.errors });

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
      descriptor.styles.length > 0 ? 'has' : 'has no'
    } style block`
  );

  const [compiledTemplateContent, externalTemplatePath] = processTemplateBlock(
    filename,
    descriptor
  );
  const [scriptContent, scriptMap, externalScriptPath] = processScriptBlock(
    filename,
    descriptor
  );
  const result =
    [scriptContent, compiledTemplateContent, `\n${scriptMap}`].join('\n') +
    '\n';

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
 * @type {(filename: string, descriptor: SFCDescriptor) => [string, string, string | null]}
 */
const processScriptBlock = (filename, descriptor) => {
  let scriptContent = '';
  let scriptMap = '';

  /** @type {string | null} */
  let externalScriptPath = null;

  let content = '';
  const scriptBlock = resolveScript(filename, descriptor);
  if (!scriptBlock) return [scriptContent, scriptMap, externalScriptPath];

  let vueMap = /** @type {RawSourceMap} */ (
    /** @type {Omit<SFCCustomBlock['map'], 'version'>} */ (scriptBlock.map)
  );
  [content, externalScriptPath] = getBlockContent(scriptBlock, filename);

  if (
    descriptor.scriptSetup &&
    (hasCjsExports(descriptor.script?.content ?? '') ||
      !descriptor.script?.content)
  ) {
    // note: script setup is always compiled to `export default` ESM syntax so
    //  if we are in CJS land we need to transform it (if component is CJS too)
    content = content.replace(
      'export default {',
      '/*#__PURE__*/Object.assign(module.exports, {'
    );
    content += ');';
  }

  if (externalScriptPath) {
    filename = externalScriptPath;
  }

  if (!isBabelEnabled() && externalScriptPath) {
    // need to generate a basic 1-1 source map so stack trace will correctly point
    //  to external script at the correct line at least
    vueMap = generateBasicSelfSourceMap(filename, content);
  }

  log.info(
    `[require-extension-vue info] parsed script block ${
      vueMap ? 'has' : 'has no'
    } source map`
  );
  log.info(
    `[require-extension-vue info] babel is ${
      isBabelEnabled() ? 'enabled' : 'not enabled'
    }`
  );

  const transform = isBabelEnabled() ? babelTransform : nullTransform;
  const transformed = transform(filename, content);
  scriptContent = transformed?.code ?? '';
  const transformMap = transformed?.map || null;

  log.debug(
    `[require-extension-vue debug] transformed script ${JSON.stringify(
      transformed,
      null,
      2
    )}`
  );
  log.info(
    `[require-extension-vue info] transformed script ${
      transformMap ? 'has' : 'has no'
    } source map`
  );

  const sourceMap =
    vueMap && transformMap
      ? // @ts-expect-error oke oke oke ;)
        merge(vueMap, transformMap)
      : transformMap || vueMap;
  scriptMap = sourceMap ? convert.fromObject(sourceMap).toComment() : '';
  return [scriptContent, scriptMap, externalScriptPath];
};

/**
 * @type {(filename: string, content: string) => RawSourceMap}
 */
const generateBasicSelfSourceMap = (filename, content) => {
  filename = path.basename(filename);
  const map = new SourceMapGenerator({ file: filename });
  for (let i = 1; i <= content.split('\n').length; i++) {
    map.addMapping({
      source: filename,
      generated: { line: i, column: 0 },
      original: { line: i, column: 0 },
    });
  }
  map.setSourceContent(filename, content);
  return convert.fromJSON(map.toString()).toObject();
};

/**
 * @type {(filename: string, descriptor: SFCDescriptor) => [string, string | null]}
 */
const processTemplateBlock = (filename, descriptor) => {
  const isFunctional = isFunctionalComponent(descriptor);
  const hasRenderFn = hasRenderFunction(descriptor);

  log.info(
    `[require-extension-vue info] ${
      isFunctional ? 'functional' : 'regular'
    } component`
  );
  log.info(
    `[require-extension-vue info] ${
      hasRenderFn ? 'has' : 'has no'
    } render function`
  );

  let templateContent = '';

  /** @type {string | null } */
  let externalTemplatePath = null;

  if (descriptor.template && !hasRenderFn) {
    [templateContent, externalTemplatePath] = getBlockContent(
      descriptor.template,
      filename
    );
    log.debug(
      `[require-extension-vue debug] template content ${templateContent}`
    );
  }

  let compiledTemplateContent = '';

  // eslint-disable-next-line unicorn/prefer-ternary
  if (hasRenderFn) {
    compiledTemplateContent = [
      `;${COMPONENT_OPTIONS}._compiled=false`,
      `;${COMPONENT_OPTIONS}.functional=${isFunctional}`,
      `;${COMPONENT_OPTIONS}.staticRenderFns = []`,
    ]
      .join('\n')
      .trim();
  } else {
    compiledTemplateContent = getCompiledTemplate({
      descriptor,
      source: templateContent,
      filename,
    });
  }

  log.debug(
    `[require-extension-vue debug] compiled template content ${compiledTemplateContent}`
  );
  return [compiledTemplateContent, externalTemplatePath];
};

/**
 * @type {(filename: string, scriptContent: string) => BabelFileResult}
 */
const nullTransform = (filename, scriptContent) => ({
  code: scriptContent,
  map: null,
});

/**
 * @type {(filename: string, scriptContent: string) => BabelFileResult | null}
 */
const babelTransform = (filename, scriptContent) => {
  log.info('[require-extension-vue info] start transpiling script content');
  log.debug(
    `[require-extension-vue debug] provided babel options: ${JSON.stringify(
      getBabelOptions(),
      null,
      2
    )}`
  );
  const { transformSync, loadPartialConfig } = loadBabel();
  // merge in base options and resolve all the plugins and presets relative to this file
  const partialConfig = loadPartialConfig({
    // primary
    caller: {
      name: 'require-extension-vue',
    },

    filename,
    ast: false,
    sourceMaps: true,

    ...(isBabelConfigured() ? getBabelOptions() : {}),
  });

  // note: that .babelrc works mystically, it is not returned by partialConfig
  //  so here we might overwrite it with our defaults but that doesn't happen
  //  for some reason and the thing still works ¯\_(ツ)_/¯
  const opts = partialConfig?.hasFilesystemConfig()
    ? partialConfig?.options
    : { ...partialConfig?.options, ...getDefaultBabelOptions() };

  log.debug(
    `[require-extension-vue debug] actual babel options: ${JSON.stringify(
      opts,
      null,
      2
    )}`
  );
  log.info('[require-extension-vue info] finished transpiling script content');
  return transformSync(scriptContent, opts);
};

/**
 * @type {(options: {descriptor: SFCDescriptor, source: string, filename: string }) => string}
 */
const getCompiledTemplate = ({ descriptor, source, filename }) => {
  const { compiler } = resolveCompiler();
  const compilerOptions = {};
  const isFunctional = isFunctionalComponent(descriptor);
  const scriptBlock = resolveScript(filename, descriptor);
  const compiled = compiler.compileTemplate({
    source,
    filename,
    compilerOptions,
    // note: transformAssetUrls might be needed, see how relative asset urls work in templates
    isProduction: false,
    isFunctional,
    bindings: scriptBlock ? scriptBlock.bindings : undefined,
  });

  log.debug(
    `[require-extension-vue debug] compiled template descriptor ${JSON.stringify(
      u.pick(['code', 'source', 'tips', 'errors'], compiled),
      null,
      2
    )}`
  );

  if (compiled.errors) {
    logTemplateCompilerErrors({
      source,
      filename,
      errors: compiled.errors,
    });
  }

  if (compiled.tips) {
    logTemplateCompilerTips(filename, compiled.tips);
  }

  return [
    compiled.code,
    `;${COMPONENT_OPTIONS}._compiled=true`,
    `;${COMPONENT_OPTIONS}.functional=${isFunctional}`,
    `;${COMPONENT_OPTIONS}.render = render`,
    `;${COMPONENT_OPTIONS}.staticRenderFns = staticRenderFns`,
  ].join('\n');
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
 * @type {(descriptor: SFCDescriptor ) => boolean}
 */
const hasRenderFunction = (descriptor) => {
  return Boolean(
    descriptor.script && REGEX_RENDER_FUNCTION.test(descriptor.script.content)
  );
};

/**
 * @type {(descriptor: SFCDescriptor ) => boolean}
 */
const isFunctionalComponent = (descriptor) => {
  return Boolean(
    (descriptor.template && descriptor.template.attrs.functional) ||
      (descriptor.script &&
        REGEX_FUNCTIONAL_COMPONENT.test(descriptor.script.content))
  );
};

/**
 * @type {(options: { source: string, filename: string, errors: Array<string | WarningMessage>}) => void}
 */
const logParserErrors = ({ source, filename, errors }) => {
  log.info(
    `[require-extension-vue info] parser errors output is ${
      isParserErrorsOutputEnabled() ? 'enabled' : 'disabled'
    }`
  );
  if (!isParserErrorsOutputEnabled()) return;

  const { compiler } = resolveCompiler();
  errors = errors
    .map((error) => {
      if (u.isString(error)) return error;
      const { msg, start, end } = error;
      const frame = compiler.generateCodeFrame(source, start, end);
      return `  ${msg}\n\n${pad(frame)}`;
    })
    .filter(parserErrorMessageFilter);

  if (errors.length > 0) {
    log.error(`[require-extension-vue] parser errors in file: ${filename}`);
    errors.forEach((error) =>
      log.error(`[require-extension-vue: parser error] ${error}`)
    );
  }
};

/**
 * @type {(options: { source: string, filename: string, errors: Array<string | WarningMessage> }) => void}
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
      if (u.isString(error)) return error;
      const { msg, start, end } = error;
      const frame = compiler.generateCodeFrame(source, start, end);
      return `  ${msg}\n\n${pad(frame)}`;
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
 * @type {(filename: string, tips: Array<string | WarningMessage>) => void}
 */
const logTemplateCompilerTips = (filename, tips) => {
  log.info(
    `[require-extension-vue info] template compiler tips output is ${
      isTemplateCompilerTipsOutputEnabled() ? 'enabled' : 'disabled'
    }`
  );
  if (!isTemplateCompilerTipsOutputEnabled()) return;

  tips = tips
    .map((tip) => (u.isString(tip) ? tip : tip.msg))
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

/**
 * @type {(code: string) => boolean}
 */
const hasCjsExports = (code) => /(?:module\.)?exports\s*=\s*/.test(code);

exports = module.exports = compile;
