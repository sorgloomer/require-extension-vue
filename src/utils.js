// @ts-check

const R = require('ramda');

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
};
