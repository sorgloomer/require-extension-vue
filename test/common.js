const path = require('node:path');
const { expect } = require('chai');
const { isFunction } = require('../src/utils');

const clearRelatedRequireCache = () => {
  // note: it is safer to always reset require.cache containing `test/*` stuff
  //  because the same fixture might be used in multiple tests and we might want
  //  to process it again from scratch and not use the cached module
  Object.keys(require.cache)
    .filter((key) => key.startsWith(path.resolve('test')))
    .forEach((key) => {
      delete require.cache[key];
    });
};

const expectFunctionalComponent = (value, details = {}) => {
  expectComponent(value, { ...details, functional: true });
};

const expectComponent = (value, details = {}) => {
  value = value || {};
  const {
    name,
    setupContains = '',
    renderContains = '',
    _compiled = true,
    functional = false,
    staticRenderFns = [],
  } = details;
  // todo
  // console.log('######## component keys/values:', Object.entries(value).map(([key, value]) => `${key}: ${value}`));
  expect(value.name).to.equal(name, `component.name should be set`);
  expect(isFunction(value.render)).to.equal(
    true,
    `component.render should be a function`
  );
  expect(String(value.setup)).to.include(
    setupContains,
    'component.setup should include text'
  );
  expect(String(value.render)).to.include(
    renderContains,
    'component.render should include text'
  );
  expect(value._compiled).to.equal(
    _compiled,
    `component._compiled should be set to true`
  );
  expect(value.functional).to.equal(
    functional,
    `component.functional should be set`
  );
  expect(value.staticRenderFns).to.eql(
    staticRenderFns,
    `component.staticRenderFns should be set`
  );
};

exports = module.exports = {
  clearRelatedRequireCache,
  expectComponent,
  expectFunctionalComponent,
};
