const path = require('path');
const { expect } = require('chai');
const sinon = require('sinon');
const log = require('loglevel');
const { expectComponent, expectFunctionalComponent } = require('./common');

describe('', () => {
  beforeEach(() => {
    sinon.spy(log, 'error');
    sinon.spy(log, 'warn');
  });

  it('should parse an empty vue file', function() {
    require('..');
    const component = require('./fixtures/empty');
    expectComponent(component);
  });

  it('should parse a vue file with empty blocks', function() {
    require('..');
    const component = require('./fixtures/empty');
    expectComponent(component);
  });

  it('should parse a simple vue file with default export', function() {
    require('..');
    const component = require('./fixtures/simple-exports-default').default;
    expectComponent(component, { name: 'SimpleExportsDefault', renderContains: 'Simple Exports Default' });
  });

  it('should parse a simple vue file with exports', function() {
    require('..');
    const component = require('./fixtures/simple-exports');
    expectComponent(component, { name: 'SimpleExports', renderContains: 'Simple Exports' });
  });

  it('should parse a vue file with template only', function() {
    require('..');
    const component = require('./fixtures/template-only');
    expectComponent(component, { renderContains: 'Template Only' });
  });

  it('should parse a vue file with script only', function() {
    require('..');
    const component = require('./fixtures/script-only');
    expectComponent(component, { name: 'ScriptOnly' });
  });

  it('should parse a vue file with template + empty script', function() {
    require('..');
    const component = require('./fixtures/template-empty-script');
    expectComponent(component, { renderContains: 'Template Empty Script' });
  });

  it('should parse a vue file with external sources', function() {
    require('..');
    const component = require('./fixtures/external-template-script-style');
    expectComponent(component, {
      name: 'ExternalTemplateScriptStyle',
      renderContains: 'External Template Script Style'
    });
  });

  it('should parse a functional vue component (template)', function() {
    require('..');
    const component = require('./fixtures/functional-template');
    expectFunctionalComponent(component, {
      name: 'FunctionalTemplate',
      renderContains: 'Functional Template'
    });
  });

  it('should parse a functional vue component (external template)', function() {
    require('..');
    const component = require('./fixtures/functional-external-template.vue');
    expectFunctionalComponent(component, {
      name: 'FunctionalExternalTemplate',
      renderContains: 'Functional External Template'
    });
  });

  it('should parse a functional vue component (render)', function() {
    require('..');
    const component = require('./fixtures/functional-render');
    expectFunctionalComponent(component, {
      name: 'FunctionalRender',
      renderContains: 'Functional Render',
      _compiled: false
    });
  });

  it('should ignore template when render fn provided (normal)', function() {
    require('..');
    const component = require('./fixtures/render-fn-normal');
    expectComponent(component, {
      name: 'RenderFnNormal',
      renderContains: 'Render Fn Normal',
      _compiled: false
    });
  });

  it('should ignore template when render fn provided (functional)', function() {
    require('..');
    const component = require('./fixtures/render-fn-functional');
    expectFunctionalComponent(component, {
      name: 'RenderFnFunctional',
      renderContains: 'Render Fn Functional',
      _compiled: false
    });
  });

  it('should print error on console when parser error happens', function() {
    require('..');
    const component = require('./fixtures/error-parser');
    expect(log.error.calledTwice).to.equal(true);
    expect(log.error.firstCall.args[0]).to.match(/\[require-extension-vue] parser errors in file: .*error-parser.vue$/);
    expect(log.error.secondCall.args[0]).to.equal(
      '[require-extension-vue: parser error] tag <templatet> has no matching end tag.'
    );
    expectComponent(component);
  });

  it('should print error on console when template has multiple root elements', function() {
    require('..');
    const component = require('./fixtures/error-multi-root');
    expect(log.error.calledTwice).to.equal(true);
    expect(log.error.firstCall.args[0]).to.match(
      /\[require-extension-vue] compiler errors in file: .*error-multi-root.vue$/
    );
    expect(log.error.secondCall.args[0]).to.equal(
      '[require-extension-vue: compiler error] Component template should contain exactly one root element. If you are using v-if on multiple elements, use v-else-if to chain them instead.'
    );
    expectComponent(component, { name: 'ErrorMultiRoot' });
  });
});

it('should parse a simple vue file with es module export when `babel` option is true and no babel config', function() {
  require('..')({ babel: true });
  const component = require('./fixtures/simple-export-babel-no-ext-conf').default;
  expectComponent(component, {
    name: 'SimpleExportBabelNoExtConf',
    renderContains: 'Simple Export Babel No Ext Conf'
  });
});

it('should parse a vue file with external es module export when `babel` option is true and no babel config', function() {
  require('..')({ babel: true });
  const component = require('./fixtures/external-script-babel-no-ext-conf').default;
  expectComponent(component, {
    name: 'ExternalScriptBabelNoExtConf',
    renderContains: 'External Script Babel No Ext Conf'
  });
});

it('should parse a simple vue file with es module export when `babel` option configured', function() {
  require('..')({
    babel: {
      presets: [
        [
          '@babel/preset-env',
          {
            targets: 'current node'
          }
        ]
      ]
    }
  });
  const component = require('./fixtures/simple-export-babel-no-ext-conf').default;
  expectComponent(component, {
    name: 'SimpleExportBabelNoExtConf',
    renderContains: 'Simple Export Babel No Ext Conf'
  });
});

it('should parse a simple vue file with es module export when .babelrc is used', function() {
  require('..')({
    babel: {
      cwd: path.resolve(__dirname, 'fixtures', 'simple-export-babel-babelrc'),
      babelrc: true
    }
  });
  const component = require('./fixtures/simple-export-babel-babelrc').default;
  expectComponent(component, { name: 'SimpleExportBabelBabelrc', renderContains: 'Simple Export Babel Babelrc' });
});

it('should parse a simple vue file with es module export when babel.config.js is used', function() {
  require('..')({
    babel: {
      cwd: path.resolve(__dirname, 'fixtures', 'simple-export-babel-babel-config-js'),
      babelrc: false
    }
  });
  const component = require('./fixtures/simple-export-babel-babel-config-js').default;
  expectComponent(component, {
    name: 'SimpleExportBabelBabelConfigJs',
    renderContains: 'Simple Export Babel Babel Config Js'
  });
});
