/* eslint-disable unicorn/no-empty-file */
/**
 * @typedef {Object} SFCDescriptor
 * @property {SFCBlock | null} template
 * @property {SFCBlock | null} script
 * @property {SFCBlock[]} styles
 * @property {SFCCustomBlock[]} customBlocks
 * @property {string[]} errors
 */

/**
 * @typedef {Object} SFCCustomBlock
 * @property {string} type
 * @property {string} content
 * @property {{ [key: string]: string | true }} attrs
 * @property {number} start
 * @property {number} end
 * @property {RawSourceMap} [map]
 */

/**
 * @typedef {Object} SFCBlock
 * @property {string} type
 * @property {string} content
 * @property {{ [key: string]: string | true }} attrs
 * @property {number} start
 * @property {number} end
 * @property {RawSourceMap} [map]
 * @property {string} [lang]
 * @property {string} [src]
 * @property {boolean} [scoped]
 * @property {string | boolean} [module]
 */
