const fse = require('fs-extra');
const path = require('path');
const log = require('loglevel');
const _findCacheDir = require('find-cache-dir');
const u = require('./utils');

const findCacheDir = (options = {}) => {
  return _findCacheDir({ name: moduleName, ...options });
};

const ENCODING_UTF8 = 'utf8';
const moduleName = 'require-extension-vue';
const cacheMetadataFile = 'revue.json';
const cwd = path.resolve('.');

let _cacheMetadata = {};

/**
 * @type {() => void}
 */
const initialize = () => {
  log.info('[require-extension-vue info] initializing permanent cache');
  _cacheMetadata = getCacheMetadata() || {};
};

/**
 * @type {() => Object<string, any>}
 */
const getCacheMetadata = () => {
  let cacheMetadata = null;

  const cacheMetadataFilePath = getCacheMetadataFilePath();
  const isCacheMetadataFileExists = fse.existsSync(cacheMetadataFilePath);
  log.info(`[require-extension-vue info] cache metadata is ${isCacheMetadataFileExists ? 'exists' : 'not exists'}`);
  if (!isCacheMetadataFileExists) return cacheMetadata;

  try {
    log.info(`[require-extension-vue info] reading cache metadata from ${cacheMetadataFilePath}`);
    cacheMetadata = JSON.parse(fse.readFileSync(cacheMetadataFilePath, 'utf8'));
  } catch (error) {
    log.error(`[require-extension-vue error] failed to read cache metadata from: ${cacheMetadataFilePath}`);
  }

  return cacheMetadata;
};

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
 * @type {(vueMetada: Object<string, any>, content: string) => void}
 */
const setCachedFile = (vueMetadata, content) => {
  const cachedFilePath = getCachedFilePath(vueMetadata.filePath);
  log.info(`[require-extension-vue info] caching compiled file at: ${cachedFilePath}`);

  log.info(`[require-extension-vue info] writing compiled file to cache: ${vueMetadata.filePath} => ${cachedFilePath}`);
  fse.outputFileSync(cachedFilePath, content, ENCODING_UTF8);

  updateCacheMetadata(vueMetadata);
};

/**
 * @type {(vueMetada: Object<string, any>) => void}
 */
const updateCacheMetadata = vueMetadata => {
  const cacheMetadataFilePath = getCacheMetadataFilePath();
  const cacheKey = toCwdRelativeMetadataPath(vueMetadata.filePath);
  log.info(
    `[require-extension-vue info] updating cache metadata of '${cacheKey}' in memory and on disk at ${cacheMetadataFilePath}`
  );
  _cacheMetadata = u.assoc(cacheKey, getCacheMetadataValue(vueMetadata), _cacheMetadata);
  fse.outputFileSync(cacheMetadataFilePath, JSON.stringify(_cacheMetadata, null, 2), ENCODING_UTF8);
};

/**
 * @type {(filePath: string) => boolean}
 */
const hasCachedFile = filePath => {
  const cachedMetadata = _cacheMetadata[toCwdRelativeMetadataPath(filePath)];
  if (!cachedMetadata) return false;
  const currentMetadata = getCacheMetadataValue({
    filePath,
    externalScriptPath: u.pathOr(null, ['externalScript', 'path'], cachedMetadata),
    externalTemplatePath: u.pathOr(null, ['externalTemplate', 'path'], cachedMetadata)
  });
  return u.equals(cachedMetadata, currentMetadata);
};

/**
 * @type {(filePath: string) => string}
 */
const toCwdRelativeMetadataPath = filePath =>
  filePath
    .replace(cwd, '')
    .replace(/^[/\\]/, '')
    // note: we want unix style paths in metadata json
    .replace(/\\/g, '/');

/**
 * @type {(vueMetada: Object<string, any>) => string}
 */
const getCacheMetadataValue = vueMetadata => {
  const vueMtimeMs = fse.statSync(vueMetadata.filePath).mtimeMs;
  const extScriptMtimeMs = vueMetadata.externalScriptPath
    ? fse.statSync(path.resolve(vueMetadata.externalScriptPath)).mtimeMs
    : null;
  const extTemplateMtimeMs = vueMetadata.externalTemplatePath
    ? fse.statSync(path.resolve(vueMetadata.externalTemplatePath)).mtimeMs
    : null;

  return {
    mtimeMs: vueMtimeMs,

    externalScript: extScriptMtimeMs
      ? {
          path: toCwdRelativeMetadataPath(vueMetadata.externalScriptPath),
          mtimeMs: extScriptMtimeMs
        }
      : null,

    externalTemplate: extTemplateMtimeMs
      ? {
          path: toCwdRelativeMetadataPath(vueMetadata.externalTemplatePath),
          mtimeMs: extTemplateMtimeMs
        }
      : null
  };
};

/**
 * @type {() => string}
 */
const getCacheMetadataFilePath = () => {
  const thunk = findCacheDir({ thunk: true });
  return thunk(cacheMetadataFile);
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
  setCachedFile,
  initialize
};
