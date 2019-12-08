const fse = require('fs-extra');
const path = require('path');
const { expect } = require('chai');
const sinon = require('sinon');
const { expectComponent } = require('./common');

describe('permanent cache', () => {
  beforeEach(() => {
    sinon.stub(fse, 'existsSync');
    sinon.stub(fse, 'statSync');
    sinon.stub(fse, 'readFileSync');
    sinon.stub(fse, 'outputFileSync');
    sinon.stub(fse, 'outputFile');
  });

  it('should store compiled file in cache if caching enabled and not already cached', function() {
    const cacheMetadataFile = path.resolve('node_modules/.cache/require-extension-vue/revue.json');
    const vueFileRelative = path.normalize('test/fixtures/permanent-cache/index.vue');
    const vueFileAbsolute = path.resolve(vueFileRelative);
    const vueFileStat = { mtimeMs: 1 };

    fse.existsSync.withArgs(cacheMetadataFile).returns(false);
    fse.statSync.withArgs(vueFileAbsolute).returns(vueFileStat);

    require('..')({
      permanentCache: true,
      babel: {
        cwd: path.resolve(__dirname, 'fixtures', 'permanent-cache'),
        babelrc: false
      }
    });

    const component = require('./fixtures/permanent-cache').default;

    expect(fse.readFileSync.notCalled).to.equal(true);

    expect(fse.outputFileSync.calledTwice).to.equal(true);

    // save compiled file to cache
    expect(fse.outputFileSync.firstCall.args[0]).to.equal(
      path.resolve('node_modules/.cache/require-extension-vue/test/fixtures/permanent-cache/index.vue')
    );
    expect(fse.outputFileSync.firstCall.args[1]).to.match(/Permanent Cache/);
    expect(fse.outputFileSync.firstCall.args[2]).to.equal('utf8');

    // write cache metadata
    expect(fse.outputFileSync.secondCall.args).to.eql([
      cacheMetadataFile,
      JSON.stringify(
        {
          [vueFileRelative.replace(/\\/g, '/')]: {
            mtimeMs: vueFileStat.mtimeMs,
            externalScript: null,
            externalTemplate: null
          }
        },
        null,
        2
      ),
      'utf8'
    ]);

    expectComponent(component, {
      name: 'PermanentCache',
      renderContains: 'Permanent Cache'
    });
  });

  it('should return cached compiled file if caching enabled and original not changed', function() {
    const cacheMetadataFile = path.resolve('node_modules/.cache/require-extension-vue/revue.json');
    const vueFileRelative = path.normalize('test/fixtures/permanent-cache/index.vue');
    const vueFileAbsolute = path.resolve(vueFileRelative);
    const stat = { mtimeMs: 2 };
    const vueFileStat = stat;

    fse.existsSync.withArgs(cacheMetadataFile).returns(true);
    fse.readFileSync.withArgs(cacheMetadataFile, 'utf8').returns(
      JSON.stringify(
        {
          [vueFileRelative.replace(/\\/g, '/')]: { mtimeMs: stat.mtimeMs, externalScript: null, externalTemplate: null }
        },
        null,
        2
      )
    );
    fse.statSync.withArgs(vueFileAbsolute).returns(vueFileStat);

    // cached file content
    fse.readFileSync
      .withArgs(
        path.resolve('node_modules/.cache/require-extension-vue/test/fixtures/permanent-cache/index.vue'),
        'utf8'
      )
      .returns("exports = module.exports = 'Permanent Cache';");

    require('..')({
      permanentCache: true,
      babel: {
        cwd: path.resolve(__dirname, 'fixtures', 'permanent-cache'),
        babelrc: false
      }
    });

    const component = require('./fixtures/permanent-cache');

    expect(fse.readFileSync.calledTwice).to.equal(true);
    expect(fse.outputFileSync.notCalled).to.equal(true);

    expect(component).to.equal('Permanent Cache');
  });

  it('should update cached compiled file if caching enabled and original changed', function() {
    const cacheMetadataFile = path.resolve('node_modules/.cache/require-extension-vue/revue.json');
    const vueFileRelative = path.normalize('test/fixtures/permanent-cache/index.vue');
    const vueFileAbsolute = path.resolve(vueFileRelative);
    const vueFileStat = { mtimeMs: 3 };

    fse.existsSync.withArgs(cacheMetadataFile).returns(true);
    fse.readFileSync
      .withArgs(cacheMetadataFile, 'utf8')
      .returns(
        JSON.stringify(
          { [vueFileRelative.replace(/\\/g, '/')]: { mtimeMs: 2, externalScript: null, externalTemplate: null } },
          null,
          2
        )
      );
    fse.statSync.withArgs(vueFileAbsolute).returns(vueFileStat);

    require('..')({
      permanentCache: true,
      babel: {
        cwd: path.resolve(__dirname, 'fixtures', 'permanent-cache'),
        babelrc: false
      }
    });

    const component = require('./fixtures/permanent-cache').default;

    expect(fse.readFileSync.calledOnce).to.equal(true);
    expect(fse.outputFileSync.calledTwice).to.equal(true);

    // save compiled file to cache
    expect(fse.outputFileSync.firstCall.args[0]).to.equal(
      path.resolve('node_modules/.cache/require-extension-vue/test/fixtures/permanent-cache/index.vue')
    );
    expect(fse.outputFileSync.firstCall.args[1]).to.match(/Permanent Cache/);
    expect(fse.outputFileSync.firstCall.args[2]).to.equal('utf8');

    // write cache metadata
    expect(fse.outputFileSync.secondCall.args).to.eql([
      cacheMetadataFile,
      JSON.stringify(
        {
          [vueFileRelative.replace(/\\/g, '/')]: {
            mtimeMs: vueFileStat.mtimeMs,
            externalScript: null,
            externalTemplate: null
          }
        },
        null,
        2
      ),
      'utf8'
    ]);

    expectComponent(component, {
      name: 'PermanentCache',
      renderContains: 'Permanent Cache'
    });
  });

  it('should return cached compiled file if caching enabled and original external script not changed ', function() {
    const cacheMetadataFile = path.resolve('node_modules/.cache/require-extension-vue/revue.json');
    const vueFileRelative = path.normalize('test/fixtures/permanent-cache-external-script/index.vue');
    const vueScriptFileRelative = path.normalize('test/fixtures/permanent-cache-external-script/script.js');
    const vueFileAbsolute = path.resolve(vueFileRelative);
    const vueScriptFileAbsolute = path.resolve(vueScriptFileRelative);
    const vueFileStat = { mtimeMs: 2 };
    const vueScriptFileStat = { mtimeMs: 3 };

    fse.existsSync.withArgs(cacheMetadataFile).returns(true);
    fse.readFileSync.withArgs(cacheMetadataFile, 'utf8').returns(
      JSON.stringify(
        {
          [vueFileRelative.replace(/\\/g, '/')]: {
            mtimeMs: vueFileStat.mtimeMs,
            externalScript: { mtimeMs: vueScriptFileStat.mtimeMs, path: vueScriptFileRelative.replace(/\\/g, '/') },
            externalTemplate: null
          }
        },
        null,
        2
      )
    );

    fse.statSync.withArgs(vueFileAbsolute).returns(vueFileStat);
    fse.statSync.withArgs(vueScriptFileAbsolute).returns(vueScriptFileStat);

    // cached file content
    fse.readFileSync
      .withArgs(
        path.resolve(
          'node_modules/.cache/require-extension-vue/test/fixtures/permanent-cache-external-script/index.vue'
        ),
        'utf8'
      )
      .returns("exports = module.exports = 'Permanent Cache External Script';");

    require('..')({
      permanentCache: true,
      babel: {
        cwd: path.resolve(__dirname, 'fixtures', 'permanent-cache-external-script'),
        babelrc: false
      }
    });

    const component = require('./fixtures/permanent-cache-external-script');

    expect(fse.readFileSync.calledTwice).to.equal(true);
    expect(fse.outputFileSync.notCalled).to.equal(true);

    expect(component).to.equal('Permanent Cache External Script');
  });

  it('should update cached compiled file if caching enabled and original external script changed', function() {
    const cacheMetadataFile = path.resolve('node_modules/.cache/require-extension-vue/revue.json');
    const vueFileRelative = path.normalize('test/fixtures/permanent-cache-external-script/index.vue');
    const vueScriptFileRelative = path.normalize('test/fixtures/permanent-cache-external-script/script.js');
    const vueFileAbsolute = path.resolve(vueFileRelative);
    const vueScriptFileAbsolute = path.resolve(vueScriptFileRelative);
    const vueFileStat = { mtimeMs: 2 };
    const vueScriptFileStat = { mtimeMs: 4 };

    fse.existsSync.withArgs(cacheMetadataFile).returns(true);
    fse.readFileSync.withArgs(cacheMetadataFile, 'utf8').returns(
      JSON.stringify(
        {
          [vueFileRelative.replace(/\\/g, '/')]: {
            mtimeMs: vueFileStat.mtimeMs,
            externalScript: { mtimeMs: 3, path: vueScriptFileRelative.replace(/\\/g, '/') },
            externalTemplate: null
          }
        },
        null,
        2
      )
    );
    fse.readFileSync.withArgs(vueScriptFileAbsolute, 'utf8').returns(`
      export default {
        name: 'PermanentCacheExternalScript'
      };
    `);
    fse.statSync.withArgs(vueFileAbsolute).returns(vueFileStat);
    fse.statSync.withArgs(vueScriptFileAbsolute).returns(vueScriptFileStat);

    require('..')({
      permanentCache: true,
      babel: {
        cwd: path.resolve(__dirname, 'fixtures', 'permanent-cache-external-script'),
        babelrc: false
      }
    });

    const component = require('./fixtures/permanent-cache-external-script').default;

    expect(fse.readFileSync.calledTwice).to.equal(true);
    expect(fse.outputFileSync.calledTwice).to.equal(true);

    // save compiled file to cache
    expect(fse.outputFileSync.firstCall.args[0]).to.equal(
      path.resolve('node_modules/.cache/require-extension-vue/test/fixtures/permanent-cache-external-script/index.vue')
    );
    expect(fse.outputFileSync.firstCall.args[1]).to.match(/Permanent Cache External Script/);
    expect(fse.outputFileSync.firstCall.args[2]).to.equal('utf8');

    // write cache metadata
    expect(fse.outputFileSync.secondCall.args).to.eql([
      cacheMetadataFile,
      JSON.stringify(
        {
          [vueFileRelative.replace(/\\/g, '/')]: {
            mtimeMs: vueFileStat.mtimeMs,
            externalScript: { path: vueScriptFileRelative.replace(/\\/g, '/'), mtimeMs: vueScriptFileStat.mtimeMs },
            externalTemplate: null
          }
        },
        null,
        2
      ),
      'utf8'
    ]);

    expectComponent(component, {
      name: 'PermanentCacheExternalScript',
      renderContains: 'Permanent Cache External Script'
    });
  });

  it('should return cached compiled file if caching enabled and original external template not changed ', function() {
    const cacheMetadataFile = path.resolve('node_modules/.cache/require-extension-vue/revue.json');
    const vueFileRelative = path.normalize('test/fixtures/permanent-cache-external-template/index.vue');
    const vueTemplateFileRelative = path.normalize('test/fixtures/permanent-cache-external-template/script.js');
    const vueFileAbsolute = path.resolve(vueFileRelative);
    const vueTemplateFileAbsolute = path.resolve(vueTemplateFileRelative);
    const vueFileStat = { mtimeMs: 2 };
    const vueTemplateFileStat = { mtimeMs: 3 };

    fse.existsSync.withArgs(cacheMetadataFile).returns(true);
    fse.readFileSync.withArgs(cacheMetadataFile, 'utf8').returns(
      JSON.stringify(
        {
          [vueFileRelative.replace(/\\/g, '/')]: {
            mtimeMs: vueFileStat.mtimeMs,
            externalScript: null,
            externalTemplate: {
              path: vueTemplateFileRelative.replace(/\\/g, '/'),
              mtimeMs: vueTemplateFileStat.mtimeMs
            }
          }
        },
        null,
        2
      )
    );

    fse.statSync.withArgs(vueFileAbsolute).returns(vueFileStat);
    fse.statSync.withArgs(vueTemplateFileAbsolute).returns(vueTemplateFileStat);

    // cached file content
    fse.readFileSync
      .withArgs(
        path.resolve(
          'node_modules/.cache/require-extension-vue/test/fixtures/permanent-cache-external-template/index.vue'
        ),
        'utf8'
      )
      .returns("exports = module.exports = 'Permanent Cache External Template';");

    require('..')({
      permanentCache: true,
      babel: {
        cwd: path.resolve(__dirname, 'fixtures', 'permanent-cache-external-template'),
        babelrc: false
      }
    });

    const component = require('./fixtures/permanent-cache-external-template');

    expect(fse.readFileSync.calledTwice).to.equal(true);
    expect(fse.outputFileSync.notCalled).to.equal(true);

    expect(component).to.equal('Permanent Cache External Template');
  });

  it('should update cached compiled file if caching enabled and original external template changed', function() {
    const cacheMetadataFile = path.resolve('node_modules/.cache/require-extension-vue/revue.json');
    const vueFileRelative = path.normalize('test/fixtures/permanent-cache-external-template/index.vue');
    const vueTemplateFileRelative = path.normalize('test/fixtures/permanent-cache-external-template/template.html');
    const vueFileAbsolute = path.resolve(vueFileRelative);
    const vueTemplateFileAbsolute = path.resolve(vueTemplateFileRelative);
    const vueFileStat = { mtimeMs: 2 };
    const vueTemplateFileStat = { mtimeMs: 4 };

    fse.existsSync.withArgs(cacheMetadataFile).returns(true);
    fse.readFileSync.withArgs(cacheMetadataFile, 'utf8').returns(
      JSON.stringify(
        {
          [vueFileRelative.replace(/\\/g, '/')]: {
            mtimeMs: vueFileStat.mtimeMs,
            externalScript: null,
            externalTemplate: { path: vueTemplateFileRelative.replace(/\\/g, '/'), mtimeMs: 3 }
          }
        },
        null,
        2
      )
    );
    fse.readFileSync.withArgs(vueTemplateFileAbsolute, 'utf8').returns(`
      <p class="blue">Permanent Cache External Template</p>
    `);
    fse.statSync.withArgs(vueFileAbsolute).returns(vueFileStat);
    fse.statSync.withArgs(vueTemplateFileAbsolute).returns(vueTemplateFileStat);

    require('..')({
      permanentCache: true,
      babel: {
        cwd: path.resolve(__dirname, 'fixtures', 'permanent-cache-external-template'),
        babelrc: false
      }
    });

    const component = require('./fixtures/permanent-cache-external-template').default;

    expect(fse.readFileSync.calledTwice).to.equal(true);
    expect(fse.outputFileSync.calledTwice).to.equal(true);

    // save compiled file to cache
    expect(fse.outputFileSync.firstCall.args[0]).to.equal(
      path.resolve(
        'node_modules/.cache/require-extension-vue/test/fixtures/permanent-cache-external-template/index.vue'
      )
    );
    expect(fse.outputFileSync.firstCall.args[1]).to.match(/Permanent Cache External Template/);
    expect(fse.outputFileSync.firstCall.args[2]).to.equal('utf8');

    // write cache metadata
    expect(fse.outputFileSync.secondCall.args).to.eql([
      cacheMetadataFile,
      JSON.stringify(
        {
          [vueFileRelative.replace(/\\/g, '/')]: {
            mtimeMs: vueFileStat.mtimeMs,
            externalScript: null,
            externalTemplate: {
              path: vueTemplateFileRelative.replace(/\\/g, '/'),
              mtimeMs: vueTemplateFileStat.mtimeMs
            }
          }
        },
        null,
        2
      ),
      'utf8'
    ]);

    expectComponent(component, {
      name: 'PermanentCacheExternalTemplate',
      renderContains: 'Permanent Cache External Template'
    });
  });

  it('should not read from cache nor write to it when caching is disabled', function() {
    require('..')({
      permanentCache: false,
      babel: {
        cwd: path.resolve(__dirname, 'fixtures', 'permanent-cache'),
        babelrc: false
      }
    });

    const component = require('./fixtures/permanent-cache').default;

    expect(fse.existsSync.notCalled).to.equal(true);
    expect(fse.statSync.notCalled).to.equal(true);
    expect(fse.readFileSync.notCalled).to.equal(true);
    expect(fse.outputFileSync.notCalled).to.equal(true);

    expectComponent(component, {
      name: 'PermanentCache',
      renderContains: 'Permanent Cache'
    });
  });
});
