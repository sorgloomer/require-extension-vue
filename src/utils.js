// @ts-check

const R = require('ramda');

/**
 * @typedef {Object} VueVersion
 * @property {string} version
 * @property {number} major
 * @property {number} minor
 * @property {number} patch
 */

/**
 * @type {VueVersion}
 */
let _currentVueVersion;

/**
 * @type {() => VueVersion}
 */
const getCurrentVueVersion = () => {
  if (_currentVueVersion) return _currentVueVersion;

  const vuePkgJson = /** @type {{ version: string }} */ (
    loadFromContext('vue/package.json')
  );

  const { version } = vuePkgJson;
  const [major, minor, patch] = vuePkgJson.version.split('.').map(Number);

  return {
    version,
    major: major,
    minor: minor,
    patch: patch,
  };
};

/**
 * @type { (path: string) => unknown }
 */
const loadFromContext = (path) => {
  return require(
    require.resolve(path, {
      paths: [process.cwd()],
    })
  );
};

// unary<T>(fn: (a: T, ...args: readonly any[]) => any): (a: T) => any;
/**
 * @type {(...args: readonly any[]) => () => any}
 */
const nullary = R.nAry(0);

const isOfType = R.curry(
  (type, value) => Object.prototype.toString.call(value) === type
);

/**
 * @type {(value: unknown) => value is RegExp}
 */
const isRegExp = isOfType('[object RegExp]');

/**
 * @type {(value: unknown) => value is string}
 */
const isString = isOfType('[object String]');

/**
 * @type {(value: unknown) => value is boolean}
 */
const isBoolean = isOfType('[object Boolean]');

/**
 * @type {(value: unknown) => boolean}
 */
const isNotEmpty = R.complement(R.isEmpty);

/**
 * @type {(value: unknown) => boolean}
 */
const isObject = isOfType('[object Object]');

/**
 * @type {(value: unknown) => boolean}
 */
const isNotObject = R.complement(isObject);

/**
 * @type {(value: unknown) => boolean}
 */
const isNotEmptyObject = R.both(isObject, isNotEmpty);

/**
 * @type {(value: unknown) => value is Function}
 */
const _isFunction = isOfType('[object Function]');

/**
 * @type {(value: unknown) => boolean}
 */
const isAsyncFunction = isOfType('[object AsyncFunction]');

/**
 * @type {(value: unknown) => boolean}
 */
const isFunction = R.either(_isFunction, isAsyncFunction);

exports = module.exports = {
  ...R,

  isBoolean,
  isFunction,
  isNotEmpty,
  isNotEmptyObject,
  isNotObject,
  isObject,
  isRegExp,
  isString,
  nullary,
  getCurrentVueVersion,
  loadFromContext,
};
