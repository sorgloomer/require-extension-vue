/* eslint-env mocha */
const sinon = require('sinon');
const { clearRelatedRequireCache } = require('./common');

exports.mochaHooks = {
  beforeEach() {
    clearRelatedRequireCache();
  },

  afterEach() {
    sinon.restore();
  },
};
