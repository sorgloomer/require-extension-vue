const path = require('path');
const fse = require('fs-extra');
const { parse, compileTemplate } = require('@vue/component-compiler-utils');
const log = require('loglevel');
const { getDefaultBabelOptions, getBabelOptions, isBabelEnabled, isBabelConfigured } = require('./config');
const { nthArg } = require('./utils');

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
    // todo: enable when the time comes
    needMap: false
  });

  log.debug(`[require-extension-vue debug] parsed vue file descriptor: ${JSON.stringify(descriptor, null, 2)}`);

  if (descriptor.errors.length > 0) {
    log.error(`[require-extension-vue] parser errors in file: ${filename}`);
  }
  descriptor.errors.forEach(error => log.error(`[require-extension-vue: parser error] ${error}`));

  const isFunctional = isFunctionalComponent(descriptor);
  const hasRenderFn = hasRenderFunction(descriptor);

  log.info(`[require-extension-vue info] ${descriptor.template ? 'has' : 'has no'} template block`);
  log.info(`[require-extension-vue info] ${descriptor.script ? 'has' : 'has no'} script block`);
  log.info(`[require-extension-vue info] ${descriptor.style ? 'has' : 'has no'} style block`);
  log.info(`[require-extension-vue info] ${isFunctional ? 'functional' : 'regular'} component`);
  log.info(`[require-extension-vue info] ${hasRenderFn ? 'has' : 'has no'} render function`);

  // template
  let templateContent = '';
  if (descriptor.template && !hasRenderFn) {
    templateContent = getBlockContent(descriptor.template, filename);
    log.debug(`[require-extension-vue debug] template content ${templateContent}`);
  }

  const compiledTemplateContent = !hasRenderFn
    ? getCompiledTemplate({ source: templateContent, isFunctional, compiler, filename })
    : [
        `;${COMPONENT_OPTIONS}._compiled=false`,
        `;${COMPONENT_OPTIONS}.functional=${isFunctional}`,
        `;${COMPONENT_OPTIONS}.staticRenderFns = []`
      ]
        .join('\n')
        .trim();

  log.debug(`[require-extension-vue debug] compiled template content ${compiledTemplateContent}`);

  // script
  let scriptContent = '';
  if (descriptor.script) {
    const transform = isBabelEnabled() ? babelTransform : nullTransform;
    scriptContent = transform(filename, getBlockContent(descriptor.script, filename));
    log.debug(`[require-extension-vue debug] ${isBabelEnabled() ? 'transformed' : ''} script content ${scriptContent}`);
  }

  const result = [scriptContent, compiledTemplateContent].join('\n').trim() + '\n';
  log.debug(`[require-extension-vue debug] compiled vue file ${result}`);
  log.info(`[require-extension-vue info] finished compiling: '${filename}'`);
  return result;
};

/**
 * @type {(filename: string, scriptContent: string) => string}
 */
const nullTransform = nthArg(1);

/**
 * @type {(filename: string, scriptContent: string) => string}
 */
const babelTransform = (filename, scriptContent) => {
  log.info('[require-extension-vue info] start transpiling script content');
  log.debug(`[require-extension-vue debug] provided babel options: ${JSON.stringify(getBabelOptions(), null, 2)}`);
  const { transformSync, loadPartialConfig } = loadBabel();
  const babelFilename = `${filename}.js`;
  // merge in base options and resolve all the plugins and presets relative to this file
  let partialConfig = loadPartialConfig({
    // primary
    caller: {
      name: 'require-extension-vue'
    },

    filename: babelFilename,
    ast: false,

    // source map
    // sourceMaps: opts.sourceMaps === undefined ? 'both' : opts.sourceMaps,
    // sourceRoot: path.dirname(babelFilename),
    // todo
    // ...deepClone(transformOpts),

    ...(isBabelConfigured() ? getBabelOptions() : {})
  });

  // note: that .babelrc works mystically, it is not returned by partialConfig
  //  so here we might overwrite it with our defaults but that doesn't happen
  //  for some reason and the thing still works ¯\_(ツ)_/¯
  let opts = partialConfig.hasFilesystemConfig()
    ? partialConfig.options
    : { ...partialConfig.options, ...getDefaultBabelOptions() };

  log.debug(`[require-extension-vue debug] actual babel options: ${JSON.stringify(opts)}`);
  const transformedContent = transformSync(scriptContent, opts);
  log.info('[require-extension-vue info] finished transpiling script content');
  return transformedContent.code;
};

const getCompiledTemplate = ({ source, filename, compiler, isFunctional } = {}) => {
  const compiled = compileTemplate({
    source,
    filename,
    compiler,
    // note: transformAssetUrls might be needed, see how relative asset urls work in templates
    isProduction: false,
    isFunctional
  });

  log.debug(`[require-extension-vue debug] compiled template descriptor ${JSON.stringify(compiled, null, 2)}`);

  if (compiled.errors.length > 0) {
    log.error(`[require-extension-vue] compiler errors in file: ${filename}`);
  }
  compiled.errors.forEach(error => log.error(`[require-extension-vue: compiler error] ${error}`));

  if (compiled.tips.length > 0) {
    log.warn(`[require-extension-vue] compiler tips in file: ${filename}`);
  }
  compiled.tips.forEach(tip => log.warn(`[require-extension-vue: compiler tip] ${tip}`));

  return [
    compiled.code,
    `;${COMPONENT_OPTIONS}._compiled=true`,
    `;${COMPONENT_OPTIONS}.functional=${isFunctional}`,
    `;${COMPONENT_OPTIONS}.render = render`,
    `;${COMPONENT_OPTIONS}.staticRenderFns = staticRenderFns`
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
      block.src ? "external file 'path.join(path.dirname(filename), block.src)'" : 'inline block'
    }`
  );
  return block.src ? fse.readFileSync(path.join(path.dirname(filename), block.src), ENCODING_UTF8) : block.content;
};

/**
 * @type {(descriptor: SFCDescriptor ) => boolean}
 */
const hasRenderFunction = descriptor => {
  return Boolean(descriptor.script && REGEX_RENDER_FUNCTION.test(descriptor.script.content));
};

/**
 * @type {(descriptor: SFCDescriptor ) => boolean}
 */
const isFunctionalComponent = descriptor => {
  return Boolean(
    (descriptor.template && descriptor.template.attrs.functional) ||
      (descriptor.script && REGEX_FUNCTIONAL_COMPONENT.test(descriptor.script.content))
  );
};

const loadBabel = () => {
  let babel = null;
  try {
    babel = require('@babel/core');
  } catch (error) {
    throw new Error(`[require-extension-vue: error] @babel/core must be installed if you want to use it.`);
  }
  return babel;
};

const loadVueTemplateCompiler = () => {
  let compiler = null;
  try {
    compiler = require('vue-template-compiler');
  } catch (error) {
    throw new Error(`[require-extension-vue: error] vue-template-compiler must be installed as a peer dependency.`);
  }
  return compiler;
};

exports = module.exports = compile;
