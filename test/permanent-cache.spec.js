const fse = require('fs-extra');
const path = require('path');
const { expect } = require('chai');
const sinon = require('sinon');
const { expectComponent } = require('./common');

describe('permanent cache', () => {
  beforeEach(() => {
    sinon.stub(fse, 'statSync');
    sinon.stub(fse, 'readFileSync');
    sinon.stub(fse, 'outputFileSync');
  });

  it('should store compiled file in cache if caching enabled and not already cached', function() {
    require('..')({
      permanentCache: true,
      babel: {
        cwd: path.resolve(__dirname, 'fixtures', 'permanent-cache'),
        babelrc: false
      }
    });
    fse.statSync.throws(new Error('Cached file not found!'));

    const component = require('./fixtures/permanent-cache').default;

    expect(fse.readFileSync.notCalled).to.equal(true);
    expect(fse.outputFileSync.calledOnce).to.equal(true);
    expect(fse.outputFileSync.firstCall.args[0]).to.equal(
      path.resolve('node_modules/.cache/require-extension-vue/test/fixtures/permanent-cache/index.vue')
    );
    expect(fse.outputFileSync.firstCall.args[1]).to.match(/Permanent Cache/);
    expect(fse.outputFileSync.firstCall.args[2]).to.equal('utf8');

    expectComponent(component, {
      name: 'PermanentCache',
      renderContains: 'Permanent Cache'
    });
  });

  it('should return cached compiled file if caching enabled and original not changed', function() {
    require('..')({
      permanentCache: true,
      babel: {
        cwd: path.resolve(__dirname, 'fixtures', 'permanent-cache'),
        babelrc: false
      }
    });

    // cached file mod timestamp
    const cachedVueFile = path.resolve(
      'node_modules/.cache/require-extension-vue/test/fixtures/permanent-cache/index.vue'
    );
    fse.statSync.withArgs(cachedVueFile).returns({ mtimeMs: 2 });
    // original file mod timestamp
    fse.statSync.withArgs(path.resolve('test/fixtures/permanent-cache/index.vue')).returns({ mtimeMs: 1 });
    // cached file content
    fse.readFileSync.withArgs(cachedVueFile, 'utf8').returns("exports = module.exports = 'Permanent Cache';");

    const component = require('./fixtures/permanent-cache');

    expect(fse.readFileSync.calledOnce).to.equal(true);
    expect(fse.outputFileSync.notCalled).to.equal(true);

    expect(component).to.equal('Permanent Cache');
  });

  it('should update cached compiled file if caching enabled and original changed', function() {
    require('..')({
      permanentCache: true,
      babel: {
        cwd: path.resolve(__dirname, 'fixtures', 'permanent-cache'),
        babelrc: false
      }
    });

    // cached file mod timestamp
    const cachedVueFile = path.resolve(
      'node_modules/.cache/require-extension-vue/test/fixtures/permanent-cache/index.vue'
    );
    fse.statSync.withArgs(cachedVueFile).returns({ mtimeMs: 2 });
    // original file mod timestamp
    fse.statSync.withArgs(path.resolve('test/fixtures/permanent-cache/index.vue')).returns({ mtimeMs: 3 });

    const component = require('./fixtures/permanent-cache').default;

    expect(fse.readFileSync.notCalled).to.equal(true);
    expect(fse.outputFileSync.calledOnce).to.equal(true);
    expect(fse.outputFileSync.firstCall.args[0]).to.equal(
      path.resolve('node_modules/.cache/require-extension-vue/test/fixtures/permanent-cache/index.vue')
    );
    expect(fse.outputFileSync.firstCall.args[1]).to.match(/Permanent Cache/);
    expect(fse.outputFileSync.firstCall.args[2]).to.equal('utf8');

    expectComponent(component, {
      name: 'PermanentCache',
      renderContains: 'Permanent Cache'
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

    expect(fse.statSync.notCalled).to.equal(true);
    expect(fse.readFileSync.notCalled).to.equal(true);
    expect(fse.outputFileSync.notCalled).to.equal(true);

    expectComponent(component, {
      name: 'PermanentCache',
      renderContains: 'Permanent Cache'
    });
  });
});
