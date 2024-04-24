// @ts-check

const u = require('../utils');
const Ajv = require('ajv');
const log = require('loglevel');
const optionsSchema = require('./options-schema');

/**
 * @typedef {import('loglevel').LogLevelNames} LogLevelNames
 *
 * @typedef {Object} Config
 * @property {LogLevelNames} logLevel
 * @property {boolean} permanentCache
 * @property {boolean | BabelConfig} babel
 * @property {boolean} noLogParserErrors
 * @property {boolean} noLogTemplateCompilerErrors
 * @property {boolean} noLogTemplateCompilerTips
 * @property {ParserConfig} parser
 * @property {TemplateCompilerConfig} templateCompiler
 *
 * @typedef {Object} BabelConfig
 *
 * @typedef {Object} ParserConfig
 * @property {{ exclude: Array<string | RegExp>}} errors
 *
 * @typedef {Object} TemplateCompilerConfig
 * @property {{ exclude: Array<string | RegExp> }} errors
 * @property {{ exclude: Array<string | RegExp> }} tips
 */

/**
 * @type {() => Config}
 */
const getDefaultConfig = () => ({
  logLevel: 'warn',
  permanentCache: false,
  babel: false,
  noLogParserErrors: false,
  noLogTemplateCompilerErrors: false,
  noLogTemplateCompilerTips: false,

  parser: {
    errors: {
      exclude: [],
    },
  },

  templateCompiler: {
    errors: {
      exclude: [],
    },

    tips: {
      exclude: [],
    },
  },
});

const getDefaultBabelOptions = () => ({
  presets: [
    [
      '@babel/preset-env',
      {
        targets: 'current node',
      },
    ],
  ],

  exclude: /node_modules/,
});

/**
 * @type {(config: Config) => boolean}
 */
const isParserErrorsOutputEnabled = (config) => {
  return (
    !config.noLogParserErrors && !process.env.REQ_EXT_VUE_SILENCE_PARSER_ERRORS
  );
};

/**
 * @type {(config: Config) => boolean}
 */
const isTemplateCompilerErrorsOutputEnabled = (config) => {
  return (
    !config.noLogTemplateCompilerErrors &&
    !process.env.REQ_EXT_VUE_SILENCE_TEMPLATE_COMPILER_ERRORS
  );
};

/**
 * @type {(config: Config) => boolean}
 */
const isTemplateCompilerTipsOutputEnabled = (config) => {
  return (
    !config.noLogTemplateCompilerTips &&
    !process.env.REQ_EXT_VUE_SILENCE_TEMPLATE_COMPILER_TIPS
  );
};

/**
 * @type {(config: Config, error: string) => boolean}
 */
const parserErrorMessageFilter = (config, error) => {
  return messageFilter(config.parser.errors.exclude, error);
};

/**
 * @type {(config: Config, error: string) => boolean}
 */
const templateCompilerErrorMessageFilter = (config, error) => {
  return messageFilter(config.templateCompiler.errors.exclude, error);
};

/**
 * @type {(config: Config, tip: string) => boolean}
 */
const templateCompilerTipMessageFilter = (config, tip) => {
  return messageFilter(config.templateCompiler.tips.exclude, tip);
};

/**
 * @type {(excludes: (string | RegExp)[], message: string) => boolean}
 */
const messageFilter = (excludes, message) => {
  return !excludes.some((exclude) => {
    if (u.isString(exclude)) return message === exclude;
    if (u.isRegExp(exclude)) return exclude.test(message);
    return false;
  });
};

/**
 * @type {(config: Config) => boolean}
 */
const isPermanentCacheEnabled = u.propEq(true, 'permanentCache');

const isBabelEnabled = u.compose(
  u.either(u.equals(true), u.isNotEmptyObject),
  u.prop('babel')
);

/**
 * @type {(config: Config) => boolean}
 */
const isBabelConfigured = u.compose(u.isNotEmptyObject, u.prop('babel'));

const getBabelOptions = u.ifElse(
  isBabelConfigured,
  u.prop('babel'),
  u.always({})
);

/**
 * @type {(config: Config) => void}
 */
const initLogging = (config) => {
  log.setDefaultLevel(
    /** @type {LogLevelNames} */ (process.env.REQ_EXT_VUE_LOG_LEVEL) ||
      config.logLevel
  );
};

/**
 * @type {(options: Partial<Config>) => Config}
 */
const initConfig = (options) => {
  if (options) verifyOptions(options);
  return u.mergeDeepRight(getDefaultConfig(), options || {});
};

/**
 * @type {(options: Partial<Config>) => void}
 */
const verifyOptions = (options) => {
  // @ts-expect-error works just fine thank you TS :)
  const ajv = new Ajv();
  const isValid = ajv.validate(optionsSchema, options);
  if (!isValid) {
    log.error(
      '[require-extension-vue: error] Invalid options are provided:\n\n',
      ajv.errors
    );
    // eslint-disable-next-line n/no-process-exit
    process.exit(1);
  }
};

let _config = getDefaultConfig();

exports = module.exports = {
  getBabelOptions: () => getBabelOptions(_config),
  getDefaultBabelOptions,
  isBabelConfigured: () => isBabelConfigured(_config),
  isBabelEnabled: () => isBabelEnabled(_config),
  isPermanentCacheEnabled: () => isPermanentCacheEnabled(_config),
  initConfig: (/** @type {Partial<Config>} */ options) =>
    (_config = initConfig(options)),
  initLogging: () => initLogging(_config),
  isParserErrorsOutputEnabled: () => isParserErrorsOutputEnabled(_config),
  isTemplateCompilerErrorsOutputEnabled: () =>
    isTemplateCompilerErrorsOutputEnabled(_config),
  isTemplateCompilerTipsOutputEnabled: () =>
    isTemplateCompilerTipsOutputEnabled(_config),
  parserErrorMessageFilter: (/** @type {string} */ error) =>
    parserErrorMessageFilter(_config, error),
  templateCompilerErrorMessageFilter: (/** @type {string} */ error) =>
    templateCompilerErrorMessageFilter(_config, error),
  templateCompilerTipMessageFilter: (/** @type {string} */ tip) =>
    templateCompilerTipMessageFilter(_config, tip),
};
