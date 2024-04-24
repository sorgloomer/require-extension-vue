// @ts-check

const fse = require('fs-extra');
const path = require('node:path');
const log = require('loglevel');
const _findCacheDir = require('find-cache-dir');
const u = require('./utils');

const findCacheDir = (options = {}) => {
  return _findCacheDir({ name: moduleName, ...options });
};

/**
 * @typedef { import('./types').SfcMetadata } SfcMetadata
 *
 * @typedef { Object } CacheMetadataV2
 * @property { number } version
 * @property { string } vueVersion
 * @property { Record<string, CacheMetadataEntry> } entries
 *
 * @typedef { Record<string, CacheMetadataEntry> } CacheMetadataV1
 *
 * @typedef { Object } CacheMetadataEntry
 * @property { number | null } mtimeMs
 * @property { { path: string, mtimeMs: number } | null  } externalTemplate
 * @property { { path: string, mtimeMs: number } | null } externalScript
 */

const CURRENT_VERSION = 2;
const ENCODING_UTF8 = 'utf8';
const moduleName = 'require-extension-vue';
const cacheMetadataFile = 'revue.json';
const cwd = path.resolve('.');

/**
 * @type { CacheMetadataV2 }
 */
let _cacheMetadata;

/**
 * @type { string }
 */
let _currentVueVersion;

/**
 * @type {() => void}
 */
const initialize = () => {
  log.info('[require-extension-vue info] initializing permanent cache');
  _currentVueVersion = getCurrentVueVersion();
  _cacheMetadata = getCacheMetadata() || getDefaultCacheMetadata();
};

/**
 * @type {() => CacheMetadataV2 | null}
 */
const getCacheMetadata = () => {
  const cacheMetadataFilePath = getCacheMetadataFilePath();
  const isCacheMetadataFileExists = fse.existsSync(cacheMetadataFilePath);
  log.info(
    `[require-extension-vue info] cache metadata is ${
      isCacheMetadataFileExists ? 'exists' : 'not exists'
    }`
  );
  if (!isCacheMetadataFileExists) return null;

  /** @type { CacheMetadataV2 | CacheMetadataV1 | null} */
  let readCacheMetadata = null;

  try {
    log.info(
      `[require-extension-vue info] reading cache metadata from ${cacheMetadataFilePath}`
    );
    readCacheMetadata = JSON.parse(
      fse.readFileSync(cacheMetadataFilePath, 'utf8')
    );
  } catch {
    log.error(
      `[require-extension-vue error] failed to read cache metadata from: ${cacheMetadataFilePath}`
    );
  }

  if (
    readCacheMetadata?.version !== CURRENT_VERSION ||
    readCacheMetadata?.vueVersion !== _currentVueVersion
  ) {
    cleanCache();
    return null;
  }

  return /** @type { CacheMetadataV2 } */ (readCacheMetadata);
};

/**
 * @type {() => void}
 */
const cleanCache = () => {
  const cachePath = findCacheDir();
  if (!cachePath) return;
  fse.emptyDirSync(cachePath);
};

/**
 * @type { (filePath: string) => string | null }
 */
const getCachedFile = (filePath) => {
  if (!hasCachedFile(filePath)) {
    log.info('[require-extension-vue info] cached compiled file not found');
    return null;
  }
  const cachedFilePath = getCachedFilePath(filePath);
  log.info(
    `[require-extension-vue info] cached compiled file found: ${cachedFilePath}`
  );
  return fse.readFileSync(cachedFilePath, ENCODING_UTF8);
};

/**
 * @type {(sfcMetadata: SfcMetadata, content: string) => void}
 */
const setCachedFile = (sfcMetadata, content) => {
  const cachedFilePath = getCachedFilePath(sfcMetadata.filePath);
  log.info(
    `[require-extension-vue info] caching compiled file at: ${cachedFilePath}`
  );

  log.info(
    `[require-extension-vue info] writing compiled file to cache: ${sfcMetadata.filePath} => ${cachedFilePath}`
  );
  fse.outputFileSync(cachedFilePath, content, ENCODING_UTF8);

  updateCacheMetadata(sfcMetadata);
};

/**
 * @type {(sfcMetadata: SfcMetadata) => void}
 */
const updateCacheMetadata = (sfcMetadata) => {
  const cacheMetadataFilePath = getCacheMetadataFilePath();
  const cacheEntryKey = toCwdRelativeMetadataPath(sfcMetadata.filePath);
  log.info(
    `[require-extension-vue info] updating cache metadata of '${cacheEntryKey}' in memory and on disk at ${cacheMetadataFilePath}`
  );
  _cacheMetadata = u.assocPath(
    ['entries', cacheEntryKey],
    getCacheMetadataEntry(sfcMetadata),
    _cacheMetadata
  );
  fse.outputFileSync(
    cacheMetadataFilePath,
    JSON.stringify(_cacheMetadata, null, 2),
    ENCODING_UTF8
  );
};

/**
 * @type {(filePath: string) => boolean}
 */
const hasCachedFile = (filePath) => {
  const cachedMetadataEntry =
    _cacheMetadata.entries[toCwdRelativeMetadataPath(filePath)];
  if (!cachedMetadataEntry) return false;
  const currentMetadataEntry = getCacheMetadataEntry({
    filePath,
    externalScriptPath: u.pathOr(
      null,
      ['externalScript', 'path'],
      cachedMetadataEntry
    ),
    externalTemplatePath: u.pathOr(
      null,
      ['externalTemplate', 'path'],
      cachedMetadataEntry
    ),
  });
  return u.equals(cachedMetadataEntry, currentMetadataEntry);
};

/**
 * @type {(filePath: string) => string}
 */
const toCwdRelativeMetadataPath = (filePath) =>
  filePath
    .replace(cwd, '')
    .replace(/^[/\\]/, '')
    // note: we want unix style paths in metadata json
    .replaceAll('\\', '/');

/**
 * @type {(sfcMetadata: SfcMetadata) => CacheMetadataEntry}
 */
const getCacheMetadataEntry = (sfcMetadata) => {
  // note: sfcMetadata.filePath always exists for sure that is what triggered the
  //  hook in the first place
  const vueMtimeMs = mtimeMs(sfcMetadata.filePath);
  const extScriptMtimeMs = mtimeMs(sfcMetadata.externalScriptPath);
  const extTemplateMtimeMs = mtimeMs(sfcMetadata.externalTemplatePath);

  return {
    mtimeMs: vueMtimeMs,

    externalScript: extScriptMtimeMs
      ? {
          path: toCwdRelativeMetadataPath(
            /** @type string */ (sfcMetadata.externalScriptPath)
          ),
          mtimeMs: extScriptMtimeMs,
        }
      : null,

    externalTemplate: extTemplateMtimeMs
      ? {
          path: toCwdRelativeMetadataPath(
            /** @type string */ (sfcMetadata.externalTemplatePath)
          ),
          mtimeMs: extTemplateMtimeMs,
        }
      : null,
  };
};

/**
 * @type {(filePath: string | null | undefined) => number | null}
 */
const mtimeMs = (filePath) => {
  if (!filePath) return null;
  const _path = path.resolve(filePath);
  if (!fse.existsSync(_path)) return null;
  return fse.statSync(_path).mtimeMs;
};

/**
 * @type {() => string}
 */
const getCacheMetadataFilePath = () => {
  const thunk = /** @type {(s: string) => string} */ (
    /** @type { unknown } */ (findCacheDir({ thunk: true }))
  );
  return thunk(cacheMetadataFile);
};

/**
 * @type {(filePath: string) => string}
 */
const getCachedFilePath = (filePath) => {
  const thunk = /** @type {(s: string) => string} */ (
    /** @type { unknown } */ (findCacheDir({ thunk: true }))
  );
  return thunk(filePath.replace(cwd, ''));
};

/**
 * @type { () => CacheMetadataV2 }
 */
function getDefaultCacheMetadata() {
  return {
    version: CURRENT_VERSION,
    vueVersion: getCurrentVueVersion(),
    entries: {},
  };
}

/**
 * @type {() => string}
 */
const getCurrentVueVersion = () => {
  if (_currentVueVersion) return _currentVueVersion;
  const vuePkg = /** @type {{ version: string }} */ (
    loadFromContext('vue/package.json')
  );
  return vuePkg.version;
};

/**
 * @type { (path: string) => unknown }
 */
// todo: dedupe
const loadFromContext = (path) => {
  return require(
    require.resolve(path, {
      paths: [process.cwd()],
    })
  );
};

exports = module.exports = {
  getCachedFile,
  setCachedFile,
  initialize,
};
