const path = require('node:path');
const { expect } = require('chai');
const { isFunction } = require('../../../src/utils');

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

const expectComponent = (component, details = {}) => {
  component = component || {};
  const { name, setupContains = '', renderContains = '' } = details;
  // todo
  // console.log('######## component keys/values:', Object.entries(value).map(([key, value]) => `${key}: ${value}`));
  const componentName = component.name ?? component.__name;
  const renderFn = component.render;
  const checkRenderFn = renderContains !== '';
  const setupFn = component.setup;
  const checkSetupFn = setupContains !== '';

  expect(componentName).to.equal(name, `"component.name" should be set`);

  expect(isFunction(renderFn)).to.equal(
    checkRenderFn,
    `component.render should${checkRenderFn ? ' ' : ' not '}be a function`
  );

  expect(String(renderFn)).to.include(
    renderContains,
    'component.render should include text'
  );

  expect(isFunction(setupFn)).to.equal(
    checkSetupFn,
    `"component.setup" should be a function`
  );

  expect(String(setupFn)).to.include(
    setupContains,
    'component.setup should include text'
  );
};

exports = module.exports = {
  clearRelatedRequireCache,
  expectComponent,
};
