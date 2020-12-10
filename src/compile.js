const path = require('path');
const fse = require('fs-extra');
const { parse, compileTemplate } = require('@vue/component-compiler-utils');
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
} = require('./config');
const u = require('./utils');

const REGEX_FUNCTIONAL_COMPONENT = /functional\s*:\s*true/;
const REGEX_RENDER_FUNCTION = /render\s*:?\s*\(/;

const ENCODING_UTF8 = 'utf8';
const COMPONENT_OPTIONS =
  '((module.exports.default || module.exports).options || module.exports.default || module.exports)';

const compile = (source, filename) => {
  log.info(`[require-extension-vue info] start compiling: '${filename}'`);
  const compiler = loadVueTemplateCompiler();
  const descriptor = parse({
    source,
    filename,
    compiler,
    needMap: true,
  });

  log.debug(
    `[require-extension-vue debug] parsed vue file descriptor: ${JSON.stringify(
      descriptor,
      null,
      2
    )}`
  );

  logParserErrors(filename, descriptor.errors);

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
      descriptor.style ? 'has' : 'has no'
    } style block`
  );

  const [compiledTemplateContent, externalTemplatePath] = processTemplateBlock(
    filename,
    descriptor,
    compiler
  );
  const [scriptContent, scriptMap, externalScriptPath] = processScriptBlock(
    filename,
    descriptor.script
  );
  const result =
    [scriptContent, compiledTemplateContent, `\n${scriptMap}`]
      .join('\n')
      .trim() + '\n';

  log.debug(`[require-extension-vue debug] compiled vue file ${result}`);
  log.info(`[require-extension-vue info] finished compiling: '${filename}'`);

  return {
    code: result,
    vueMetadata: {
      filePath: filename,
      externalScriptPath,
      externalTemplatePath,
    },
  };
};

/**
 * @type {(filename: string, scriptDescriptor: SFCBlock) => [string, string]}
 */
const processScriptBlock = (filename, scriptDescriptor) => {
  let scriptContent = '';
  let scriptMap = '';
  let externalScriptPath = null;
  let content = '';
  if (!scriptDescriptor) return [scriptContent, scriptMap, externalScriptPath];

  let vueMap = scriptDescriptor.map || null;
  [content, externalScriptPath] = getBlockContent(scriptDescriptor, filename);

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
  scriptContent = transformed.code;
  const transformMap = transformed.map || null;

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
      ? merge(vueMap, transformMap)
      : transformMap || vueMap;
  scriptMap = sourceMap ? convert.fromObject(sourceMap).toComment() : '';
  return [scriptContent, scriptMap, externalScriptPath];
};

/**
 * @type {(filename: string, content: string) => Object<string, any>}
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
 * @type {(filename: string, descriptor: SFCDescriptor, compiler: Object<string, any>) => [string, string]}
 */
const processTemplateBlock = (filename, descriptor, compiler) => {
  let templateContent = '';
  let externalTemplatePath = null;
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

  if (descriptor.template && !hasRenderFn) {
    [templateContent, externalTemplatePath] = getBlockContent(
      descriptor.template,
      filename
    );
    log.debug(
      `[require-extension-vue debug] template content ${templateContent}`
    );
  }

  const compiledTemplateContent = !hasRenderFn
    ? getCompiledTemplate({
        source: templateContent,
        isFunctional,
        compiler,
        filename,
      })
    : [
        `;${COMPONENT_OPTIONS}._compiled=false`,
        `;${COMPONENT_OPTIONS}.functional=${isFunctional}`,
        `;${COMPONENT_OPTIONS}.staticRenderFns = []`,
      ]
        .join('\n')
        .trim();

  log.debug(
    `[require-extension-vue debug] compiled template content ${compiledTemplateContent}`
  );
  return [compiledTemplateContent, externalTemplatePath];
};

/**
 * @type {(filename: string, scriptContent: string) => string}
 */
const nullTransform = (filename, scriptContent) => ({
  code: scriptContent,
  map: null,
});

/**
 * @type {(filename: string, scriptContent: string) => string}
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
  const opts = partialConfig.hasFilesystemConfig()
    ? partialConfig.options
    : { ...partialConfig.options, ...getDefaultBabelOptions() };

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

const getCompiledTemplate = ({
  source,
  filename,
  compiler,
  isFunctional,
} = {}) => {
  const compiled = compileTemplate({
    source,
    filename,
    compiler,
    // note: transformAssetUrls might be needed, see how relative asset urls work in templates
    isProduction: false,
    isFunctional,
  });

  log.debug(
    `[require-extension-vue debug] compiled template descriptor ${JSON.stringify(
      u.pick(['code', 'source', 'tips', 'errors'], compiled),
      null,
      2
    )}`
  );

  logTemplateCompilerErrors(filename, compiled.errors);
  logTemplateCompilerTips(filename, compiled.tips);

  return [
    compiled.code,
    `;${COMPONENT_OPTIONS}._compiled=true`,
    `;${COMPONENT_OPTIONS}.functional=${isFunctional}`,
    `;${COMPONENT_OPTIONS}.render = render`,
    `;${COMPONENT_OPTIONS}.staticRenderFns = staticRenderFns`,
  ]
    .join('\n')
    .trim();
};

/**
 * @type {(block: SFCBlock, filename: string) => string}
 */
const getBlockContent = (block, filename) => {
  log.info(
    `[require-extension-vue info] get ${block.type} content from ${
      block.src
        ? `external file '${path.join(path.dirname(filename), block.src)}'`
        : 'inline block'
    }`
  );

  const blockPath = block.src
    ? path.join(path.dirname(filename), block.src)
    : null;
  const content = blockPath
    ? fse.readFileSync(blockPath, ENCODING_UTF8)
    : block.content;
  return [content, blockPath];
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
 * @type {(filename: string, errors: string[]) => void}
 */
const logParserErrors = (filename, errors) => {
  log.info(
    `[require-extension-vue info] parser errors output is ${
      isParserErrorsOutputEnabled() ? 'enabled' : 'disabled'
    }`
  );
  if (!isParserErrorsOutputEnabled()) return;

  errors = errors
    .map((error) => `[require-extension-vue: parser error] ${error}`)
    .filter(parserErrorMessageFilter);

  if (errors.length > 0) {
    log.error(`[require-extension-vue] parser errors in file: ${filename}`);
  }

  errors.forEach((error) => log.error(error));
};

/**
 * @type {(filename: string, errors: string[]) => void}
 */
const logTemplateCompilerErrors = (filename, errors) => {
  log.info(
    `[require-extension-vue info] template compiler errors output is ${
      isTemplateCompilerErrorsOutputEnabled() ? 'enabled' : 'disabled'
    }`
  );
  if (!isTemplateCompilerErrorsOutputEnabled()) return;

  errors = errors
    .map((error) => `[require-extension-vue: compiler error] ${error}`)
    .filter(templateCompilerErrorMessageFilter);

  if (errors.length > 0) {
    log.error(`[require-extension-vue] compiler errors in file: ${filename}`);
  }

  errors.forEach((error) => log.error(error));
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

const loadVueTemplateCompiler = () => {
  let compiler = null;
  try {
    compiler = require('vue-template-compiler');
  } catch {
    throw new Error(
      `[require-extension-vue: error] vue-template-compiler must be installed as a peer dependency.`
    );
  }
  return compiler;
};

exports = module.exports = compile;
