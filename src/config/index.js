const u = require('../utils');
const Ajv = require('ajv');
const log = require('loglevel');
const optionsSchema = require('./options-schema');

/**
 * @type {() => Object<string, any>}
 */
const getDefaultConfig = () => ({
  logLevel: 'warn',
  emitEsmodule: false,
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

/**
 * @type {() => Object<string, any>}
 */
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
 * @type {config: Object<string, any>, () => boolean}
 */
const isParserErrorsOutputEnabled = (config) => {
  return (
    !config.noLogParserErrors && !process.env.REQ_EXT_VUE_SILENCE_PARSER_ERRORS
  );
};

/**
 * @type {(config: Object<string, any>, ) => boolean}
 */
const isTemplateCompilerErrorsOutputEnabled = (config) => {
  return (
    !config.noLogTemplateCompilerErrors &&
    !process.env.REQ_EXT_VUE_SILENCE_TEMPLATE_COMPILER_ERRORS
  );
};

/**
 * @type {(config: Object<string, any>, ) => boolean}
 */
const isTemplateCompilerTipsOutputEnabled = (config) => {
  return (
    !config.noLogTemplateCompilerTips &&
    !process.env.REQ_EXT_VUE_SILENCE_TEMPLATE_COMPILER_TIPS
  );
};

/**
 * @type {(config: Object<string, any>, error: string) => boolean}
 */
const parserErrorMessageFilter = (config, error) => {
  return messageFilter(config.parser.errors.exclude, error);
};

/**
 * @type {(config: Object<string, any>, error: string) => boolean}
 */
const templateCompilerErrorMessageFilter = (config, error) => {
  return messageFilter(config.templateCompiler.errors.exclude, error);
};

/**
 * @type {(config: Object<string, any>, tip: string) => boolean}
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
 * @type {(config: Object<string, any>) => boolean}
 */
const isPermanentCacheEnabled = u.propEqTrue('permanentCache');

/**
 * @type {(config: Object<string, any>) => boolean}
 */
const isBabelEnabled = u.compose(
  u.either(u.equals(true), u.isNotEmptyObject),
  u.prop('babel')
);

/**
 * @type {(config: Object<string, any>) => boolean}
 */
const isBabelConfigured = u.compose(u.isNotEmptyObject, u.prop('babel'));

/**
 * @type {(config: Object<string, any>) => boolean}
 */
const emitEsmodule = u.compose(u.equals(true), u.prop('emitEsmodule'));

/**
 * @type {(config: Object<string, any>) => Object<string, any>}
 */
const getBabelOptions = u.ifElse(
  isBabelConfigured,
  u.prop('babel'),
  u.always({})
);

/**
 * @type {(config: Object<string, any>) => void}
 */
const initLogging = (config) => {
  log.setDefaultLevel(process.env.REQ_EXT_VUE_LOG_LEVEL || config.logLevel);
};

/**
 * @type {(options: Object<string, any>, config: Object<string, any>) => Object<string, any>}
 */
const initConfig = (options) => {
  if (options) verifyOptions(options);
  return u.mergeDeepRight(getDefaultConfig(), options || {});
};

/**
 * @type {(options: Object<string, any>) => void}
 */
const verifyOptions = (options) => {
  const ajv = new Ajv();
  const isValid = ajv.validate(optionsSchema, options);
  if (!isValid) {
    log.error(
      '[require-extension-vue: error] Invalid options are provided:\n\n',
      ajv.errors
    );
    process.exit(1);
  }
};

let _config = getDefaultConfig();

exports = module.exports = {
  getBabelOptions: () => getBabelOptions(_config),
  getDefaultBabelOptions,
  emitEsmodule: () => emitEsmodule(_config),
  isBabelConfigured: () => isBabelConfigured(_config),
  isBabelEnabled: () => isBabelEnabled(_config),
  isPermanentCacheEnabled: () => isPermanentCacheEnabled(_config),
  initConfig: (options) => (_config = initConfig(options)),
  initLogging: () => initLogging(_config),
  isParserErrorsOutputEnabled: () => isParserErrorsOutputEnabled(_config),
  isTemplateCompilerErrorsOutputEnabled: () =>
    isTemplateCompilerErrorsOutputEnabled(_config),
  isTemplateCompilerTipsOutputEnabled: () =>
    isTemplateCompilerTipsOutputEnabled(_config),
  parserErrorMessageFilter: (error) => parserErrorMessageFilter(_config, error),
  templateCompilerErrorMessageFilter: (error) =>
    templateCompilerErrorMessageFilter(_config, error),
  templateCompilerTipMessageFilter: (tip) =>
    templateCompilerTipMessageFilter(_config, tip),
};
