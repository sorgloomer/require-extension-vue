const fse = require('fs-extra');
const path = require('path');
const log = require('loglevel');
const _findCacheDir = require('find-cache-dir');

const findCacheDir = (options = {}) => {
  return _findCacheDir({ name: moduleName, ...options });
};

const ENCODING_UTF8 = 'utf8';
const moduleName = 'require-extension-vue';
const cwd = path.resolve('.');

/**
 * @type {() => void}
 */
// const cleanCache = () => {
//   fse.emptyDirSync(cachePath);
// };

/**
 * @type {(filePath: string) => string}
 */
const getCachedFile = filePath => {
  if (!hasCachedFile(filePath)) {
    log.info('[require-extension-vue info] cached compiled file not found');
    return null;
  }

  const cachedFilePath = getCachedFilePath(filePath);
  log.info(`[require-extension-vue info] cached compiled file found: ${cachedFilePath}`);
  return fse.readFileSync(cachedFilePath, ENCODING_UTF8);
};

/**
 * @type {(filePath: string, content: string) => void}
 */
const setCachedFile = (filePath, content) => {
  const cachedFilePath = getCachedFilePath(filePath);
  log.info(`[require-extension-vue info] caching compiled file at: ${cachedFilePath}`);
  fse.outputFileSync(cachedFilePath, content, ENCODING_UTF8);
};

/**
 * @type {(filePath: string) => boolean}
 */
const hasCachedFile = filePath => {
  const cachedFilePath = getCachedFilePath(filePath);
  let cachedModifiedTime = 0;
  try {
    cachedModifiedTime = fse.statSync(cachedFilePath).mtimeMs;
  } catch (error) {
    // file might not exists eg not cached yet
    return false;
  }

  let currentModifiedTime = fse.statSync(filePath).mtimeMs;
  // check if file modified since cached version
  if (currentModifiedTime >= cachedModifiedTime) return false;

  return true;
};

/**
 * @type {(filePath: string) => string}
 */
const getCachedFilePath = filePath => {
  const thunk = findCacheDir({ thunk: true });
  return thunk(filePath.replace(cwd, ''));
};

exports = module.exports = {
  getCachedFile,
  setCachedFile
};
