/* eslint-env mocha */
const sinon = require('sinon');
const { clearRelatedRequireCache } = require('./common');

// eslint-disable-next-line mocha/no-hooks-for-single-case
beforeEach(() => {
  clearRelatedRequireCache();
});

// eslint-disable-next-line mocha/no-hooks-for-single-case
afterEach(() => {
  sinon.restore();
});
