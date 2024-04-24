const fse = require('fs-extra');
const path = require('node:path');
const { expect } = require('chai');
const sinon = require('sinon');
const { version: vuePkgVersion } = require('vue');
const { expectComponent } = require('./common');

describe('permanent cache', () => {
  const currentVersion = 2;
  const currentVueVersion = vuePkgVersion;

  beforeEach(() => {
    sinon.stub(fse, 'existsSync');
    sinon.stub(fse, 'statSync');
    sinon.stub(fse, 'readFileSync');
    sinon.stub(fse, 'outputFileSync');
    sinon.stub(fse, 'outputFile');
  });

  it('should store compiled file in cache if caching enabled and not already cached (esm)', () => {
    const cacheMetadataFile = path.resolve(
      'node_modules/.cache/require-extension-vue/revue.json'
    );
    const vueFileRelative = path.normalize(
      'test/fixtures/permanent-cache-esm/index.vue'
    );
    const vueFileAbsolute = path.resolve(vueFileRelative);
    const vueFileStat = { mtimeMs: 1 };

    fse.existsSync.withArgs(cacheMetadataFile).returns(false);
    fse.existsSync.withArgs(vueFileAbsolute).returns(true);
    fse.statSync.withArgs(vueFileAbsolute).returns(vueFileStat);

    require('../../..')({
      permanentCache: true,
      babel: {
        cwd: path.resolve(__dirname, 'fixtures', 'permanent-cache-esm'),
        babelrc: false,
      },
    });

    const component = require('./fixtures/permanent-cache-esm').default;

    expect(fse.readFileSync.notCalled).to.equal(true);

    expect(fse.outputFileSync.calledTwice).to.equal(true);

    // save compiled file to cache
    expect(fse.outputFileSync.firstCall.args[0]).to.equal(
      path.resolve(
        'node_modules/.cache/require-extension-vue/test/fixtures/permanent-cache-esm/index.vue'
      )
    );
    expect(fse.outputFileSync.firstCall.args[1]).to.match(/Permanent Cache/);
    expect(fse.outputFileSync.firstCall.args[2]).to.equal('utf8');

    // write cache metadata
    expect(fse.outputFileSync.secondCall.args).to.eql([
      cacheMetadataFile,
      JSON.stringify(
        {
          version: currentVersion,
          vueVersion: currentVueVersion,
          entries: {
            [vueFileRelative.replaceAll('\\', '/')]: {
              mtimeMs: vueFileStat.mtimeMs,
              externalScript: null,
              externalTemplate: null,
            },
          },
        },
        null,
        2
      ),
      'utf8',
    ]);

    expectComponent(component, {
      name: 'PermanentCacheEsm',
      renderContains: 'Permanent Cache (esm)',
    });
  });

  it('should return cached compiled file if caching enabled and original not changed (esm)', () => {
    const cacheMetadataFile = path.resolve(
      'node_modules/.cache/require-extension-vue/revue.json'
    );
    const vueFileRelative = path.normalize(
      'test/fixtures/permanent-cache-esm/index.vue'
    );
    const vueFileAbsolute = path.resolve(vueFileRelative);
    const stat = { mtimeMs: 2 };
    const vueFileStat = stat;

    fse.existsSync.withArgs(cacheMetadataFile).returns(true);
    fse.readFileSync.withArgs(cacheMetadataFile, 'utf8').returns(
      JSON.stringify(
        {
          version: currentVersion,
          vueVersion: currentVueVersion,
          entries: {
            [vueFileRelative.replaceAll('\\', '/')]: {
              mtimeMs: stat.mtimeMs,
              externalScript: null,
              externalTemplate: null,
            },
          },
        },
        null,
        2
      )
    );
    fse.existsSync.withArgs(vueFileAbsolute).returns(true);
    fse.statSync.withArgs(vueFileAbsolute).returns(vueFileStat);

    // cached file content
    fse.readFileSync
      .withArgs(
        path.resolve(
          'node_modules/.cache/require-extension-vue/test/fixtures/permanent-cache-esm/index.vue'
        ),
        'utf8'
      )
      .returns("exports = module.exports = 'Permanent Cache (esm)';");

    require('../../..')({
      permanentCache: true,
      babel: {
        cwd: path.resolve(__dirname, 'fixtures', 'permanent-cache-esm'),
        babelrc: false,
      },
    });

    const component = require('./fixtures/permanent-cache-esm');

    expect(fse.readFileSync.calledTwice).to.equal(true);
    expect(fse.outputFileSync.notCalled).to.equal(true);

    expect(component).to.equal('Permanent Cache (esm)');
  });

  it('should update cached compiled file if caching enabled and original changed (esm)', () => {
    const cacheMetadataFile = path.resolve(
      'node_modules/.cache/require-extension-vue/revue.json'
    );
    const vueFileRelative = path.normalize(
      'test/fixtures/permanent-cache-esm/index.vue'
    );
    const vueFileAbsolute = path.resolve(vueFileRelative);
    const vueFileStat = { mtimeMs: 3 };

    fse.existsSync.withArgs(cacheMetadataFile).returns(true);
    fse.readFileSync.withArgs(cacheMetadataFile, 'utf8').returns(
      JSON.stringify(
        {
          version: currentVersion,
          vueVersion: currentVueVersion,
          entries: {
            [vueFileRelative.replaceAll('\\', '/')]: {
              mtimeMs: 2,
              externalScript: null,
              externalTemplate: null,
            },
          },
        },
        null,
        2
      )
    );
    fse.existsSync.withArgs(vueFileAbsolute).returns(true);
    fse.statSync.withArgs(vueFileAbsolute).returns(vueFileStat);

    require('../../..')({
      permanentCache: true,
      babel: {
        cwd: path.resolve(__dirname, 'fixtures', 'permanent-cache-esm'),
        babelrc: false,
      },
    });

    const component = require('./fixtures/permanent-cache-esm').default;

    expect(fse.readFileSync.calledOnce).to.equal(true);
    expect(fse.outputFileSync.calledTwice).to.equal(true);

    // save compiled file to cache
    expect(fse.outputFileSync.firstCall.args[0]).to.equal(
      path.resolve(
        'node_modules/.cache/require-extension-vue/test/fixtures/permanent-cache-esm/index.vue'
      )
    );
    expect(fse.outputFileSync.firstCall.args[1]).to.match(/Permanent Cache/);
    expect(fse.outputFileSync.firstCall.args[2]).to.equal('utf8');

    // write cache metadata
    expect(fse.outputFileSync.secondCall.args).to.eql([
      cacheMetadataFile,
      JSON.stringify(
        {
          version: currentVersion,
          vueVersion: currentVueVersion,
          entries: {
            [vueFileRelative.replaceAll('\\', '/')]: {
              mtimeMs: vueFileStat.mtimeMs,
              externalScript: null,
              externalTemplate: null,
            },
          },
        },
        null,
        2
      ),
      'utf8',
    ]);

    expectComponent(component, {
      name: 'PermanentCacheEsm',
      renderContains: 'Permanent Cache (esm)',
    });
  });

  it('should return cached compiled file if caching enabled and original external script not changed (esm)', () => {
    const cacheMetadataFile = path.resolve(
      'node_modules/.cache/require-extension-vue/revue.json'
    );
    const vueFileRelative = path.normalize(
      'test/fixtures/permanent-cache-external-script-esm/index.vue'
    );
    const vueScriptFileRelative = path.normalize(
      'test/fixtures/permanent-cache-external-script-esm/script.js'
    );
    const vueFileAbsolute = path.resolve(vueFileRelative);
    const vueScriptFileAbsolute = path.resolve(vueScriptFileRelative);
    const vueFileStat = { mtimeMs: 2 };
    const vueScriptFileStat = { mtimeMs: 3 };

    fse.existsSync.withArgs(cacheMetadataFile).returns(true);
    fse.readFileSync.withArgs(cacheMetadataFile, 'utf8').returns(
      JSON.stringify(
        {
          version: currentVersion,
          vueVersion: currentVueVersion,
          entries: {
            [vueFileRelative.replaceAll('\\', '/')]: {
              mtimeMs: vueFileStat.mtimeMs,
              externalScript: {
                mtimeMs: vueScriptFileStat.mtimeMs,
                path: vueScriptFileRelative.replaceAll('\\', '/'),
              },
              externalTemplate: null,
            },
          },
        },
        null,
        2
      )
    );

    fse.existsSync.withArgs(vueFileAbsolute).returns(true);
    fse.statSync.withArgs(vueFileAbsolute).returns(vueFileStat);
    fse.existsSync.withArgs(vueScriptFileAbsolute).returns(true);
    fse.statSync.withArgs(vueScriptFileAbsolute).returns(vueScriptFileStat);

    // cached file content
    fse.readFileSync
      .withArgs(
        path.resolve(
          'node_modules/.cache/require-extension-vue/test/fixtures/permanent-cache-external-script-esm/index.vue'
        ),
        'utf8'
      )
      .returns(
        "exports = module.exports = 'Permanent Cache External Script (esm)';"
      );

    require('../../..')({
      permanentCache: true,
      babel: {
        cwd: path.resolve(
          __dirname,
          'fixtures',
          'permanent-cache-external-script-esm'
        ),
        babelrc: false,
      },
    });

    const component = require('./fixtures/permanent-cache-external-script-esm');

    expect(fse.readFileSync.calledTwice).to.equal(true);
    expect(fse.outputFileSync.notCalled).to.equal(true);

    expect(component).to.equal('Permanent Cache External Script (esm)');
  });

  it('should update cached compiled file if caching enabled and original external script changed (esm)', () => {
    const cacheMetadataFile = path.resolve(
      'node_modules/.cache/require-extension-vue/revue.json'
    );
    const vueFileRelative = path.normalize(
      'test/fixtures/permanent-cache-external-script-esm/index.vue'
    );
    const vueScriptFileRelative = path.normalize(
      'test/fixtures/permanent-cache-external-script-esm/script.js'
    );
    const vueFileAbsolute = path.resolve(vueFileRelative);
    const vueScriptFileAbsolute = path.resolve(vueScriptFileRelative);
    const vueFileStat = { mtimeMs: 2 };
    const vueScriptFileStat = { mtimeMs: 4 };

    fse.existsSync.withArgs(cacheMetadataFile).returns(true);
    fse.readFileSync.withArgs(cacheMetadataFile, 'utf8').returns(
      JSON.stringify(
        {
          version: currentVersion,
          vueVersion: currentVueVersion,
          entries: {
            [vueFileRelative.replaceAll('\\', '/')]: {
              mtimeMs: vueFileStat.mtimeMs,
              externalScript: {
                mtimeMs: 3,
                path: vueScriptFileRelative.replaceAll('\\', '/'),
              },
              externalTemplate: null,
            },
          },
        },
        null,
        2
      )
    );
    fse.readFileSync.withArgs(vueScriptFileAbsolute, 'utf8').returns(`
      export default {
        name: 'PermanentCacheExternalScriptEsm'
      };
    `);
    fse.existsSync.withArgs(vueFileAbsolute).returns(true);
    fse.statSync.withArgs(vueFileAbsolute).returns(vueFileStat);
    fse.existsSync.withArgs(vueScriptFileAbsolute).returns(true);
    fse.statSync.withArgs(vueScriptFileAbsolute).returns(vueScriptFileStat);

    require('../../..')({
      permanentCache: true,
      babel: {
        cwd: path.resolve(
          __dirname,
          'fixtures',
          'permanent-cache-external-script-esm'
        ),
        babelrc: false,
      },
    });

    const component =
      require('./fixtures/permanent-cache-external-script-esm').default;

    expect(fse.readFileSync.calledTwice).to.equal(true);
    expect(fse.outputFileSync.calledTwice).to.equal(true);

    // save compiled file to cache
    expect(fse.outputFileSync.firstCall.args[0]).to.equal(
      path.resolve(
        'node_modules/.cache/require-extension-vue/test/fixtures/permanent-cache-external-script-esm/index.vue'
      )
    );
    expect(fse.outputFileSync.firstCall.args[1]).to.match(
      /Permanent Cache External Script/
    );
    expect(fse.outputFileSync.firstCall.args[2]).to.equal('utf8');

    // write cache metadata
    expect(fse.outputFileSync.secondCall.args).to.eql([
      cacheMetadataFile,
      JSON.stringify(
        {
          version: currentVersion,
          vueVersion: currentVueVersion,
          entries: {
            [vueFileRelative.replaceAll('\\', '/')]: {
              mtimeMs: vueFileStat.mtimeMs,
              externalScript: {
                path: vueScriptFileRelative.replaceAll('\\', '/'),
                mtimeMs: vueScriptFileStat.mtimeMs,
              },
              externalTemplate: null,
            },
          },
        },
        null,
        2
      ),
      'utf8',
    ]);

    expectComponent(component, {
      name: 'PermanentCacheExternalScriptEsm',
      renderContains: 'Permanent Cache External Script (esm)',
    });
  });

  it('should update cached compiled file if caching enabled and original external script not exists anymore (esm)', () => {
    const cacheMetadataFile = path.resolve(
      'node_modules/.cache/require-extension-vue/revue.json'
    );
    const vueFileRelative = path.normalize(
      'test/fixtures/permanent-cache-esm/index.vue'
    );
    const vueScriptFileRelative = path.normalize(
      'test/fixtures/permanent-cache-esm/script.js'
    );
    const vueFileAbsolute = path.resolve(vueFileRelative);
    const vueScriptFileAbsolute = path.resolve(vueScriptFileRelative);
    const vueFileStat = { mtimeMs: 2 };

    fse.existsSync.withArgs(cacheMetadataFile).returns(true);
    fse.readFileSync.withArgs(cacheMetadataFile, 'utf8').returns(
      JSON.stringify(
        {
          version: currentVersion,
          vueVersion: currentVueVersion,
          entries: {
            [vueFileRelative.replaceAll('\\', '/')]: {
              mtimeMs: vueFileStat.mtimeMs,
              externalScript: {
                mtimeMs: 3,
                path: vueScriptFileRelative.replaceAll('\\', '/'),
              },
              externalTemplate: null,
            },
          },
        },
        null,
        2
      )
    );
    fse.existsSync.withArgs(vueFileAbsolute).returns(true);
    fse.statSync.withArgs(vueFileAbsolute).returns(vueFileStat);
    fse.existsSync.withArgs(vueScriptFileAbsolute).returns(false);

    require('../../..')({
      permanentCache: true,
      babel: {
        cwd: path.resolve(__dirname, 'fixtures', 'permanent-cache-esm'),
        babelrc: false,
      },
    });

    const component = require('./fixtures/permanent-cache-esm').default;

    expect(fse.readFileSync.calledOnce).to.equal(true);
    expect(fse.outputFileSync.calledTwice).to.equal(true);

    // save compiled file to cache
    expect(fse.outputFileSync.firstCall.args[0]).to.equal(
      path.resolve(
        'node_modules/.cache/require-extension-vue/test/fixtures/permanent-cache-esm/index.vue'
      )
    );
    expect(fse.outputFileSync.firstCall.args[1]).to.match(/Permanent Cache/);
    expect(fse.outputFileSync.firstCall.args[2]).to.equal('utf8');

    // write cache metadata
    expect(fse.outputFileSync.secondCall.args).to.eql([
      cacheMetadataFile,
      JSON.stringify(
        {
          version: currentVersion,
          vueVersion: currentVueVersion,
          entries: {
            [vueFileRelative.replaceAll('\\', '/')]: {
              mtimeMs: vueFileStat.mtimeMs,
              externalScript: null,
              externalTemplate: null,
            },
          },
        },
        null,
        2
      ),
      'utf8',
    ]);

    expectComponent(component, {
      name: 'PermanentCacheEsm',
      renderContains: 'Permanent Cache (esm)',
    });
  });

  it('should return cached compiled file if caching enabled and original external template not changed (esm) ', () => {
    const cacheMetadataFile = path.resolve(
      'node_modules/.cache/require-extension-vue/revue.json'
    );
    const vueFileRelative = path.normalize(
      'test/fixtures/permanent-cache-external-template-esm/index.vue'
    );
    const vueTemplateFileRelative = path.normalize(
      'test/fixtures/permanent-cache-external-template-esm/script.js'
    );
    const vueFileAbsolute = path.resolve(vueFileRelative);
    const vueTemplateFileAbsolute = path.resolve(vueTemplateFileRelative);
    const vueFileStat = { mtimeMs: 2 };
    const vueTemplateFileStat = { mtimeMs: 3 };

    fse.existsSync.withArgs(cacheMetadataFile).returns(true);
    fse.readFileSync.withArgs(cacheMetadataFile, 'utf8').returns(
      JSON.stringify(
        {
          version: currentVersion,
          vueVersion: currentVueVersion,
          entries: {
            [vueFileRelative.replaceAll('\\', '/')]: {
              mtimeMs: vueFileStat.mtimeMs,
              externalScript: null,
              externalTemplate: {
                path: vueTemplateFileRelative.replaceAll('\\', '/'),
                mtimeMs: vueTemplateFileStat.mtimeMs,
              },
            },
          },
        },
        null,
        2
      )
    );

    fse.existsSync.withArgs(vueFileAbsolute).returns(true);
    fse.statSync.withArgs(vueFileAbsolute).returns(vueFileStat);
    fse.existsSync.withArgs(vueTemplateFileAbsolute).returns(true);
    fse.statSync.withArgs(vueTemplateFileAbsolute).returns(vueTemplateFileStat);

    // cached file content
    fse.readFileSync
      .withArgs(
        path.resolve(
          'node_modules/.cache/require-extension-vue/test/fixtures/permanent-cache-external-template-esm/index.vue'
        ),
        'utf8'
      )
      .returns(
        "exports = module.exports = 'Permanent Cache External Template (esm)';"
      );

    require('../../..')({
      permanentCache: true,
      babel: {
        cwd: path.resolve(
          __dirname,
          'fixtures',
          'permanent-cache-external-template-esm'
        ),
        babelrc: false,
      },
    });

    const component = require('./fixtures/permanent-cache-external-template-esm');

    expect(fse.readFileSync.calledTwice).to.equal(true);
    expect(fse.outputFileSync.notCalled).to.equal(true);

    expect(component).to.equal('Permanent Cache External Template (esm)');
  });

  it('should update cached compiled file if caching enabled and original external template changed (esm)', () => {
    const cacheMetadataFile = path.resolve(
      'node_modules/.cache/require-extension-vue/revue.json'
    );
    const vueFileRelative = path.normalize(
      'test/fixtures/permanent-cache-external-template-esm/index.vue'
    );
    const vueTemplateFileRelative = path.normalize(
      'test/fixtures/permanent-cache-external-template-esm/template.html'
    );
    const vueFileAbsolute = path.resolve(vueFileRelative);
    const vueTemplateFileAbsolute = path.resolve(vueTemplateFileRelative);
    const vueFileStat = { mtimeMs: 2 };
    const vueTemplateFileStat = { mtimeMs: 4 };

    fse.existsSync.withArgs(cacheMetadataFile).returns(true);
    fse.readFileSync.withArgs(cacheMetadataFile, 'utf8').returns(
      JSON.stringify(
        {
          version: currentVersion,
          vueVersion: currentVueVersion,
          entries: {
            [vueFileRelative.replaceAll('\\', '/')]: {
              mtimeMs: vueFileStat.mtimeMs,
              externalScript: null,
              externalTemplate: {
                path: vueTemplateFileRelative.replaceAll('\\', '/'),
                mtimeMs: 3,
              },
            },
          },
        },
        null,
        2
      )
    );
    fse.readFileSync.withArgs(vueTemplateFileAbsolute, 'utf8').returns(`
      <p class="blue">Permanent Cache External Template (esm)</p>
    `);
    fse.existsSync.withArgs(vueFileAbsolute).returns(true);
    fse.statSync.withArgs(vueFileAbsolute).returns(vueFileStat);
    fse.existsSync.withArgs(vueTemplateFileAbsolute).returns(true);
    fse.statSync.withArgs(vueTemplateFileAbsolute).returns(vueTemplateFileStat);

    require('../../..')({
      permanentCache: true,
      babel: {
        cwd: path.resolve(
          __dirname,
          'fixtures',
          'permanent-cache-external-template-esm'
        ),
        babelrc: false,
      },
    });

    const component =
      require('./fixtures/permanent-cache-external-template-esm').default;

    expect(fse.readFileSync.calledTwice).to.equal(true);
    expect(fse.outputFileSync.calledTwice).to.equal(true);

    // save compiled file to cache
    expect(fse.outputFileSync.firstCall.args[0]).to.equal(
      path.resolve(
        'node_modules/.cache/require-extension-vue/test/fixtures/permanent-cache-external-template-esm/index.vue'
      )
    );
    expect(fse.outputFileSync.firstCall.args[1]).to.match(
      /Permanent Cache External Template/
    );
    expect(fse.outputFileSync.firstCall.args[2]).to.equal('utf8');

    // write cache metadata
    expect(fse.outputFileSync.secondCall.args).to.eql([
      cacheMetadataFile,
      JSON.stringify(
        {
          version: currentVersion,
          vueVersion: currentVueVersion,
          entries: {
            [vueFileRelative.replaceAll('\\', '/')]: {
              mtimeMs: vueFileStat.mtimeMs,
              externalScript: null,
              externalTemplate: {
                path: vueTemplateFileRelative.replaceAll('\\', '/'),
                mtimeMs: vueTemplateFileStat.mtimeMs,
              },
            },
          },
        },
        null,
        2
      ),
      'utf8',
    ]);

    expectComponent(component, {
      name: 'PermanentCacheExternalTemplateEsm',
      renderContains: 'Permanent Cache External Template (esm)',
    });
  });

  it('should update cached compiled file if caching enabled and original external template not exists anymore (esm)', () => {
    const cacheMetadataFile = path.resolve(
      'node_modules/.cache/require-extension-vue/revue.json'
    );
    const vueFileRelative = path.normalize(
      'test/fixtures/permanent-cache-esm/index.vue'
    );
    const vueTemplateFileRelative = path.normalize(
      'test/fixtures/permanent-cache-esm/template.html'
    );
    const vueFileAbsolute = path.resolve(vueFileRelative);
    const vueTemplateFileAbsolute = path.resolve(vueTemplateFileRelative);
    const vueFileStat = { mtimeMs: 2 };

    fse.existsSync.withArgs(cacheMetadataFile).returns(true);
    fse.readFileSync.withArgs(cacheMetadataFile, 'utf8').returns(
      JSON.stringify(
        {
          version: currentVersion,
          vueVersion: currentVueVersion,
          entries: {
            [vueFileRelative.replaceAll('\\', '/')]: {
              mtimeMs: vueFileStat.mtimeMs,
              externalScript: null,
              externalTemplate: {
                path: vueTemplateFileRelative.replaceAll('\\', '/'),
                mtimeMs: 3,
              },
            },
          },
        },
        null,
        2
      )
    );
    fse.existsSync.withArgs(vueFileAbsolute).returns(true);
    fse.statSync.withArgs(vueFileAbsolute).returns(vueFileStat);
    fse.existsSync.withArgs(vueTemplateFileAbsolute).returns(false);

    require('../../..')({
      permanentCache: true,
      babel: {
        cwd: path.resolve(__dirname, 'fixtures', 'permanent-cache-esm'),
        babelrc: false,
      },
    });

    const component = require('./fixtures/permanent-cache-esm').default;

    expect(fse.readFileSync.calledOnce).to.equal(true);
    expect(fse.outputFileSync.calledTwice).to.equal(true);

    // save compiled file to cache
    expect(fse.outputFileSync.firstCall.args[0]).to.equal(
      path.resolve(
        'node_modules/.cache/require-extension-vue/test/fixtures/permanent-cache-esm/index.vue'
      )
    );
    expect(fse.outputFileSync.firstCall.args[1]).to.match(/Permanent Cache/);
    expect(fse.outputFileSync.firstCall.args[2]).to.equal('utf8');

    // write cache metadata
    expect(fse.outputFileSync.secondCall.args).to.eql([
      cacheMetadataFile,
      JSON.stringify(
        {
          version: currentVersion,
          vueVersion: currentVueVersion,
          entries: {
            [vueFileRelative.replaceAll('\\', '/')]: {
              mtimeMs: vueFileStat.mtimeMs,
              externalScript: null,
              externalTemplate: null,
            },
          },
        },
        null,
        2
      ),
      'utf8',
    ]);

    expectComponent(component, {
      name: 'PermanentCacheEsm',
      renderContains: 'Permanent Cache (esm)',
    });
  });

  it('should not read from cache nor write to it when caching is disabled (esm)', () => {
    require('../../..')({
      permanentCache: false,
      babel: {
        cwd: path.resolve(__dirname, 'fixtures', 'permanent-cache-esm'),
        babelrc: false,
      },
    });

    const component = require('./fixtures/permanent-cache-esm').default;

    expect(fse.existsSync.notCalled).to.equal(true);
    expect(fse.statSync.notCalled).to.equal(true);
    expect(fse.readFileSync.notCalled).to.equal(true);
    expect(fse.outputFileSync.notCalled).to.equal(true);

    expectComponent(component, {
      name: 'PermanentCacheEsm',
      renderContains: 'Permanent Cache (esm)',
    });
  });
});
