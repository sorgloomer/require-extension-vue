const R = require('ramda');

/**
 * @type {(value: any) => boolean}
 */
const _isFunction = value => Object.prototype.toString.call(value) === '[object Function]';

/**
 * @type {(value: any) => boolean}
 */
const isAsyncFunction = value => Object.prototype.toString.call(value) === '[object AsyncFunction]';

exports.isFunction = R.either(_isFunction, isAsyncFunction);
