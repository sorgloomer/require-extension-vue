const R = require('ramda');

// unary<T>(fn: (a: T, ...args: readonly any[]) => any): (a: T) => any;
/**
 * @type {(...args: readonly any[]) => () => any}
 */
const nullary = R.nAry(0);

/**
 * @type {(name: string, obj: Object<string, any>) => boolean}
 */
const propEqTrue = R.propEq(R.__, true, R.__);

/**
 * @type {(name: string, obj: Object<string, any>) => boolean}
 */
const propEqFalse = R.propEq(R.__, false, R.__);

/**
 * @type {(type: string, value: any) => boolean}
 */
const isOfType = R.curry((type, value) => Object.prototype.toString.call(value) === type);

/**
 * @type {(value: any) => boolean}
 */
const isBoolean = isOfType('[object Boolean]');

/**
 * @type {(value: any) => boolean}
 */
const isNotEmpty = R.complement(R.isEmpty);

/**
 * @template T
 * @type {(arr: T[], value: T) => boolean}
 */
const contained = R.curry((arr, value) => (arr || []).includes(value));

/**
 * @type {(value: any) => boolean}
 */
const isObject = isOfType('[object Object]');

/**
 * @type {(value: any) => boolean}
 */
const isNotObject = R.complement(isObject);

/**
 * @type {(value: any) => boolean}
 */
const isNotEmptyObject = R.both(isObject, isNotEmpty);

/**
 * @type {(value: any) => boolean}
 */
const _isFunction = isOfType('[object Function]');

/**
 * @type {(value: any) => boolean}
 */
const isAsyncFunction = isOfType('[object AsyncFunction]');

/**
 * @type {(value: any) => boolean}
 */
const isFunction = R.either(_isFunction, isAsyncFunction);

exports = module.exports = {
  ...R,

  contained,
  isBoolean,
  isFunction,
  isNotEmpty,
  isNotEmptyObject,
  isNotObject,
  isObject,
  nullary,
  propEqTrue,
  propEqFalse
};
