const path = require('node:path');
const { expect } = require('chai');
const sinon = require('sinon');
const log = require('loglevel');
const { expectComponent } = require('./common');

// eslint-disable-next-line mocha/no-empty-description
describe('', () => {
  beforeEach(() => {
    sinon.spy(log, 'error');
    sinon.spy(log, 'warn');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should work comment node before a div (ts)', () => {
    require('../../..')({ babel: true });
    const component = require('./fixtures/comment-node-ts').default;
    expectComponent(component, {
      name: 'CommentNodeTs',
      renderContains: 'Comment Node (ts)',
    });
    expect(log.error.notCalled).to.equal(true);
  });

  it('should work comment node before a div (esm)', () => {
    require('../../..')({ babel: true });
    const component = require('./fixtures/comment-node-esm').default;
    expectComponent(component, {
      name: 'CommentNodeEsm',
      renderContains: 'Comment Node (esm)',
    });
    expect(log.error.notCalled).to.equal(true);
  });

  it('should work comment node before a div (cjs)', () => {
    require('../../..')();
    const component = require('./fixtures/comment-node-cjs');
    expectComponent(component, {
      name: 'CommentNodeCjs',
      renderContains: 'Comment Node (cjs)',
    });
    expect(log.error.notCalled).to.equal(true);
  });

  it('should parse a vue file with script setup + script (esm)', () => {
    require('../../..')({ babel: true });
    const component = require('./fixtures/script-setup-script-esm').default;
    expectComponent(component, {
      name: 'ScriptSetupScriptEsm',
      renderContains: 'template: Script Setup Script (esm):',
      setupContains: `script setup: Hello Script Setup Script (esm)`,
    });
    expect(log.error.notCalled).to.equal(true);
  });

  it('should parse a vue file with script setup + script (cjs)', () => {
    require('../../..')();
    const component = require('./fixtures/script-setup-script-cjs');
    expectComponent(component, {
      name: 'ScriptSetupScriptCjs',
      renderContains: 'template: Script Setup Script (cjs):',
      setupContains: `script setup: Hello Script Setup Script (cjs)`,
    });
    expect(log.error.notCalled).to.equal(true);
  });

  it('should parse a vue file with script setup + script (ts)', () => {
    require('../../..')({ babel: true });
    const component = require('./fixtures/script-setup-script-ts').default;
    expectComponent(component, {
      name: 'ScriptSetupScriptTs',
      renderContains: 'template: Script Setup Script (ts):',
      setupContains: `script setup: Hello Script Setup Script (ts)`,
    });
    expect(log.error.notCalled).to.equal(true);
  });

  it('should parse a vue file with script setup + script only (esm)', () => {
    require('../../..')({ babel: true });
    const component =
      require('./fixtures/script-setup-script-only-esm').default;
    expectComponent(component, {
      name: 'ScriptSetupScriptOnlyEsm',
      setupContains: `script setup: Hello Script Setup Script Only (esm)`,
    });
    expect(log.error.notCalled).to.equal(true);
  });

  it('should parse a vue file with script setup + script only (cjs)', () => {
    require('../../..')();
    const component = require('./fixtures/script-setup-script-only-cjs');
    expectComponent(component, {
      name: 'ScriptSetupScriptOnlyCjs',
      setupContains: `script setup: Hello Script Setup Script Only (cjs)`,
    });
    expect(log.error.notCalled).to.equal(true);
  });

  it('should parse a vue file with script setup + script only (ts)', () => {
    require('../../..')({ babel: true });
    const component = require('./fixtures/script-setup-script-only-ts').default;
    expectComponent(component, {
      name: 'ScriptSetupScriptOnlyTs',
      setupContains: `script setup: Hello Script Setup Script Only (ts)`,
    });
    expect(log.error.notCalled).to.equal(true);
  });

  it('should parse a vue file with script setup (esm)', () => {
    require('../../..')({ babel: true });
    const component = require('./fixtures/script-setup-esm').default;
    expectComponent(component, {
      name: 'script-setup-esm',
      renderContains: 'template: Script Setup (esm):',
      setupContains: `script setup: Hello Script Setup (esm)`,
    });
    expect(log.error.notCalled).to.equal(true);
  });

  it('should parse a vue file with script setup (cjs)', () => {
    require('../../..')();
    const component = require('./fixtures/script-setup-cjs');
    expectComponent(component, {
      name: 'script-setup-cjs',
      renderContains: 'template: Script Setup (cjs):',
      setupContains: `script setup: Hello Script Setup (cjs)`,
    });
    expect(log.error.notCalled).to.equal(true);
  });

  it('should parse a vue file with script setup (ts)', () => {
    require('../../..')({ babel: true });
    const component = require('./fixtures/script-setup-ts').default;
    expectComponent(component, {
      name: 'script-setup-ts',
      renderContains: 'template: Script Setup (ts):',
      setupContains: `script setup: Hello Script Setup (ts)`,
    });
    expect(log.error.notCalled).to.equal(true);
  });

  it('should parse a vue file with script setup only (esm)', () => {
    require('../../..')({ babel: true });
    const component = require('./fixtures/script-setup-only-esm').default;
    expectComponent(component, {
      name: 'script-setup-only-esm',
      setupContains: `script setup: Hello Script Setup Only (esm)'`,
    });
    expect(log.error.notCalled).to.equal(true);
  });

  it('should parse a vue file with script setup only (cjs)', () => {
    require('../../..')();
    const component = require('./fixtures/script-setup-only-cjs');
    expectComponent(component, {
      name: 'script-setup-only-cjs',
      setupContains: `script setup: Hello Script Setup Only (cjs)'`,
    });
    expect(log.error.notCalled).to.equal(true);
  });

  it('should parse a vue file with script setup only (ts)', () => {
    require('../../..')({ babel: true });
    const component = require('./fixtures/script-setup-only-ts').default;
    expectComponent(component, {
      name: 'script-setup-only-ts',
      setupContains: `script setup: Hello Script Setup Only (ts)`,
    });
    expect(log.error.notCalled).to.equal(true);
  });

  it('should parse a vue file with script (esm)', () => {
    require('../../..')({ babel: true });
    const component = require('./fixtures/script-esm').default;
    expectComponent(component, {
      name: 'ScriptEsm',
      renderContains: 'template: Script (esm):',
    });
    expect(log.error.notCalled).to.equal(true);
  });

  it('should parse a vue file with script (cjs)', () => {
    require('../../..')();
    const component = require('./fixtures/script-cjs');
    expectComponent(component, {
      name: 'ScriptCjs',
      renderContains: 'template: Script (cjs):',
    });
    expect(log.error.notCalled).to.equal(true);
  });

  it('should parse a vue file with script (ts)', () => {
    require('../../..')({ babel: true });
    const component = require('./fixtures/script-ts').default;
    expectComponent(component, {
      name: 'ScriptTs',
      renderContains: 'template: Script (ts):',
    });
    expect(log.error.notCalled).to.equal(true);
  });

  it('should parse a vue file with setup fn (cjs)', () => {
    require('../../..')();
    const component = require('./fixtures/setup-fn-cjs');
    expectComponent(component, {
      name: 'SetupFnCjs',
      renderContains: 'template: Setup Fn (cjs):',
      setupContains: `setup: Hello Setup Fn (cjs)`,
    });
    expect(log.error.notCalled).to.equal(true);
  });

  it('should parse a vue file with setup fn (esm)', () => {
    require('../../..')({ babel: true });
    const component = require('./fixtures/setup-fn-esm').default;
    expectComponent(component, {
      name: 'SetupFnEsm',
      renderContains: 'template: Setup Fn (esm):',
      setupContains: `setup: Hello Setup Fn (esm)`,
    });
    expect(log.error.notCalled).to.equal(true);
  });

  it('should parse a vue file with setup fn (ts)', () => {
    require('../../..')({ babel: true });
    const component = require('./fixtures/setup-fn-ts').default;
    expectComponent(component, {
      name: 'SetupFnTs',
      renderContains: 'template: Setup Fn (ts):',
      setupContains: `setup: Hello Setup Fn (ts)`,
    });
    expect(log.error.notCalled).to.equal(true);
  });

  it('should parse a vue file with empty tags (esm)', () => {
    require('../../..')({ babel: true });
    const component = require('./fixtures/empty-tags').default;
    expectComponent(component, { renderContains: 'return null' });
    expect(log.error.notCalled).to.equal(true);
  });

  it('should parse a vue file with empty tags (cjs)', () => {
    require('../../..')();
    const component = require('./fixtures/empty-tags');
    expectComponent(component, { renderContains: 'return null' });
    expect(log.error.notCalled).to.equal(true);
  });

  it('should parse an empty vue file (esm)', () => {
    require('../../..')({ babel: true });
    const component = require('./fixtures/empty').default;
    expectComponent(component);
    expect(log.error.calledTwice).to.equal(true);
    expect(log.error.firstCall.args[0]).to.match(
      /\[require-extension-vue] parser errors in file: .*empty.vue$/
    );
    expect(log.error.secondCall.args[0]).to.equal(
      '[require-extension-vue: parser error] SyntaxError: At least one <template> or <script> is required in a single file component.'
    );
  });

  it('should parse an empty vue file (cjs)', () => {
    require('../../..')();
    const component = require('./fixtures/empty');
    expectComponent(component);
    expect(log.error.calledTwice).to.equal(true);
    expect(log.error.firstCall.args[0]).to.match(
      /\[require-extension-vue] parser errors in file: .*empty.vue$/
    );
    expect(log.error.secondCall.args[0]).to.equal(
      '[require-extension-vue: parser error] SyntaxError: At least one <template> or <script> is required in a single file component.'
    );
  });

  it('should parse a vue file with template only (esm)', () => {
    require('../../..')({ babel: true });
    const component = require('./fixtures/template-only').default;
    expectComponent(component, { renderContains: 'Template Only' });
    expect(log.error.notCalled).to.equal(true);
  });

  it('should parse a vue file with template only (cjs)', () => {
    require('../../..')();
    const component = require('./fixtures/template-only');
    expectComponent(component, { renderContains: 'Template Only' });
    expect(log.error.notCalled).to.equal(true);
  });

  it('should parse a vue file with script only (cjs)', () => {
    require('../../..')();
    const component = require('./fixtures/script-only-cjs');
    expectComponent(component, { name: 'ScriptOnlyCjs' });
    expect(log.error.notCalled).to.equal(true);
  });

  it('should parse a vue file with script only (esm)', () => {
    require('../../..')({ babel: true });
    const component = require('./fixtures/script-only-esm').default;
    expectComponent(component, { name: 'ScriptOnlyEsm' });
    expect(log.error.notCalled).to.equal(true);
  });

  it('should parse a vue file with script only (ts)', () => {
    require('../../..')({ babel: true });
    const component = require('./fixtures/script-only-ts').default;
    expectComponent(component, { name: 'ScriptOnlyTs' });
    expect(log.error.notCalled).to.equal(true);
  });

  it('should parse a vue file with template + empty script (esm)', () => {
    require('../../..')({ babel: true });
    const component = require('./fixtures/template-empty-script').default;
    expectComponent(component, { renderContains: 'Template Empty Script' });
    expect(log.error.notCalled).to.equal(true);
  });

  it('should parse a vue file with template + empty script (cjs)', () => {
    require('../../..')();
    const component = require('./fixtures/template-empty-script');
    expectComponent(component, { renderContains: 'Template Empty Script' });
    expect(log.error.notCalled).to.equal(true);
  });

  it('should parse a vue file with template + empty script setup (esm)', () => {
    require('../../..')({ babel: true });
    const component = require('./fixtures/template-empty-script-setup').default;
    expectComponent(component, {
      renderContains: 'Template Empty Script Setup',
    });
    expect(log.error.notCalled).to.equal(true);
  });

  it('should parse a vue file with template + empty script setup (cjs)', () => {
    require('../../..')();
    const component = require('./fixtures/template-empty-script-setup');
    expectComponent(component, {
      renderContains: 'Template Empty Script Setup',
    });
    expect(log.error.notCalled).to.equal(true);
  });

  it('should parse a vue file with external sources (esm)', () => {
    require('../../..')({ babel: true });
    const component =
      require('./fixtures/external-template-script-style-esm').default;
    expectComponent(component, {
      name: 'ExternalTemplateScriptStyleEsm',
      renderContains: 'template: External Template Script Style (esm):',
      setupContains: "setup: External Template Script Style (esm)'",
    });
    expect(log.error.notCalled).to.equal(true);
  });

  it('should parse a vue file with external sources (cjs)', () => {
    require('../../..')();
    const component = require('./fixtures/external-template-script-style-cjs');
    expectComponent(component, {
      name: 'ExternalTemplateScriptStyleCjs',
      renderContains: 'template: External Template Script Style (cjs):',
      setupContains: "setup: External Template Script Style (cjs)'",
    });
    expect(log.error.notCalled).to.equal(true);
  });

  it('should parse a vue file with external sources (ts)', () => {
    require('../../..')({ babel: true });
    const component =
      require('./fixtures/external-template-script-style-ts').default;
    expectComponent(component, {
      name: 'ExternalTemplateScriptStyleTs',
      renderContains: 'template: External Template Script Style (ts):',
      setupContains: "setup: External Template Script Style (ts)'",
    });
    expect(log.error.notCalled).to.equal(true);
  });

  it('should ignore template when render fn provided (cjs)', () => {
    require('../../..')();
    const component = require('./fixtures/render-fn-cjs');
    expectComponent(component, {
      name: 'RenderFnCjs',
      renderContains: 'Render Fn (cjs)',
    });
    expect(log.error.notCalled).to.equal(true);
  });

  it('should ignore template when render fn provided (esm)', () => {
    require('../../..')({ babel: true });
    const component = require('./fixtures/render-fn-esm').default;
    expectComponent(component, {
      name: 'RenderFnEsm',
      renderContains: 'Render Fn (esm)',
    });
    expect(log.error.notCalled).to.equal(true);
  });

  it('should ignore template when render fn provided (ts)', () => {
    require('../../..')({ babel: true });
    const component = require('./fixtures/render-fn-ts').default;
    expectComponent(component, {
      name: 'RenderFnTs',
      renderContains: 'Render Fn (ts)',
    });
    expect(log.error.notCalled).to.equal(true);
  });

  it('should ignore template when render fn setup provided (cjs)', () => {
    require('../../..')();
    const component = require('./fixtures/render-fn-setup-cjs');
    expectComponent(component, {
      name: 'RenderFnSetupCjs',
      setupContains: 'Render Fn Setup (cjs)',
    });
    expect(log.error.notCalled).to.equal(true);
  });

  it('should ignore template when render fn setup provided (esm)', () => {
    require('../../..')({ babel: true });
    const component = require('./fixtures/render-fn-setup-esm').default;
    expectComponent(component, {
      name: 'RenderFnSetupEsm',
      setupContains: 'Render Fn Setup (esm)',
    });
    expect(log.error.notCalled).to.equal(true);
  });

  it('should ignore template when render fn setup provided (ts)', () => {
    require('../../..')({ babel: true });
    const component = require('./fixtures/render-fn-setup-ts').default;
    expectComponent(component, {
      name: 'RenderFnSetupTs',
      setupContains: 'Render Fn Setup (ts)',
    });
    expect(log.error.notCalled).to.equal(true);
  });

  it('should print error on console when parser error happens (ts)', () => {
    require('../../..')({ babel: true });
    const component = require('./fixtures/error-parser-ts');
    expect(log.error.calledThrice).to.equal(true);
    expect(log.error.firstCall.args[0]).to.match(
      /\[require-extension-vue] parser errors in file: .*error-parser-ts.vue$/
    );
    expect(log.error.secondCall.args[0]).to.equal(
      '[require-extension-vue: parser error] SyntaxError: Element is missing end tag.'
    );
    expect(log.error.thirdCall.args[0]).to.equal(
      '[require-extension-vue: parser error] SyntaxError: At least one <template> or <script> is required in a single file component.'
    );
    expectComponent(component);
  });

  it('should print error on console when parser error happens (esm)', () => {
    require('../../..')({ babel: true });
    const component = require('./fixtures/error-parser-esm').default;
    expect(log.error.calledThrice).to.equal(true);
    expect(log.error.firstCall.args[0]).to.match(
      /\[require-extension-vue] parser errors in file: .*error-parser-esm.vue$/
    );
    expect(log.error.secondCall.args[0]).to.equal(
      '[require-extension-vue: parser error] SyntaxError: Element is missing end tag.'
    );
    expect(log.error.thirdCall.args[0]).to.equal(
      '[require-extension-vue: parser error] SyntaxError: At least one <template> or <script> is required in a single file component.'
    );
    expectComponent(component);
  });

  it('should print error on console when parser error happens (cjs)', () => {
    require('../../..')();
    const component = require('./fixtures/error-parser-cjs');
    expect(log.error.calledThrice).to.equal(true);
    expect(log.error.firstCall.args[0]).to.match(
      /\[require-extension-vue] parser errors in file: .*error-parser-cjs.vue$/
    );
    expect(log.error.secondCall.args[0]).to.equal(
      '[require-extension-vue: parser error] SyntaxError: Element is missing end tag.'
    );
    expect(log.error.thirdCall.args[0]).to.equal(
      '[require-extension-vue: parser error] SyntaxError: At least one <template> or <script> is required in a single file component.'
    );
    expectComponent(component);
  });
});

it('should parse a simple vue file with es module export when `babel` option is true and no babel config (esm)', () => {
  require('../../..')({ babel: true });
  const component =
    require('./fixtures/simple-export-babel-no-ext-conf-esm').default;
  expectComponent(component, {
    name: 'SimpleExportBabelNoExtConfEsm',
    renderContains: 'Simple Export Babel No Ext Conf (esm)',
  });
  // todo: for some reason log is not spied on
  // expect(log.error.notCalled).to.equal(true);
});

it('should parse a vue file with external es module export when `babel` option is true and no babel config (esm)', () => {
  require('../../..')({ babel: true });
  const component =
    require('./fixtures/external-script-babel-no-ext-conf-esm').default;
  expectComponent(component, {
    name: 'ExternalScriptBabelNoExtConfEsm',
    renderContains: 'External Script Babel No Ext Conf (esm)',
  });
  // todo: for some reason log is not spied on
  // expect(log.error.notCalled).to.equal(true);
});

it('should parse a simple vue file with es module export when `babel` option configured (esm)', () => {
  require('../../..')({
    babel: {
      presets: [
        [
          '@babel/preset-env',
          {
            targets: 'current node',
          },
        ],
      ],
    },
  });
  const component =
    require('./fixtures/simple-export-babel-no-ext-conf-esm').default;
  expectComponent(component, {
    name: 'SimpleExportBabelNoExtConfEsm',
    renderContains: 'Simple Export Babel No Ext Conf (esm)',
  });
  // todo: for some reason log is not spied on
  // expect(log.error.notCalled).to.equal(true);
});

it('should parse a simple vue file with es module export when .babelrc is used (esm)', () => {
  require('../../..')({
    babel: {
      cwd: path.resolve(
        __dirname,
        'fixtures',
        'simple-export-babel-babelrc-esm'
      ),
      babelrc: true,
    },
  });
  const component =
    require('./fixtures/simple-export-babel-babelrc-esm').default;
  expectComponent(component, {
    name: 'SimpleExportBabelBabelrcEsm',
    renderContains: 'Simple Export Babel Babelrc (esm)',
  });
  // todo: for some reason log is not spied on
  // expect(log.error.notCalled).to.equal(true);
});

it('should parse a simple vue file with es module export when babel.config.js is used (esm)', () => {
  require('../../..')({
    babel: {
      cwd: path.resolve(
        __dirname,
        'fixtures',
        'simple-export-babel-babel-config-js-esm'
      ),
      babelrc: false,
    },
  });
  const component =
    require('./fixtures/simple-export-babel-babel-config-js-esm').default;
  expectComponent(component, {
    name: 'SimpleExportBabelBabelConfigJsEsm',
    renderContains: 'Simple Export Babel Babel Config Js (esm)',
  });
  // todo: for some reason log is not spied on
  // expect(log.error.notCalled).to.equal(true);
});
