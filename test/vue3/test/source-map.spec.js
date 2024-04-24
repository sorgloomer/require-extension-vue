const path = require('node:path');
const { expect } = require('chai');

describe('source map', () => {
  it('should output proper stack trace backed up by inlined source map when babel is used (esm)', () => {
    require('../../..')({
      babel: {
        cwd: path.resolve(__dirname, 'fixtures', 'source-map-babel-esm'),
        babelrc: false,
      },
    });
    const component = require('./fixtures/source-map-babel-esm').default;

    let errorStack = null;
    try {
      component.methods.test();
    } catch (error) {
      errorStack = error.stack;
    }

    expect(errorStack).to.include('Error: just tracing');
    expect(errorStack).to.include(
      `at Object.test (${path.resolve(
        'test/fixtures/source-map-babel-esm/index.vue'
      )}:13:13)`
    );
  });

  it('should output proper stack trace backed up by inlined source map when babel is not used (esm)', () => {
    require('../../..')({ babel: true });
    const component = require('./fixtures/source-map-esm').default;

    let errorStack = null;
    try {
      component.methods.test();
    } catch (error) {
      errorStack = error.stack;
    }

    expect(errorStack).to.include('Error: just tracing');
    expect(errorStack).to.include(
      `at Object.test (${path.resolve('test/fixtures/source-map-esm.vue')}`
    );
  });

  it('should output proper stack trace backed up by inlined source map when external script and babel is used (esm)', () => {
    require('../../..')({
      babel: {
        cwd: path.resolve(
          __dirname,
          'fixtures',
          'source-map-external-babel-esm'
        ),
        babelrc: false,
      },
    });
    const component =
      require('./fixtures/source-map-external-babel-esm').default;

    let errorStack = null;
    try {
      component.methods.test();
    } catch (error) {
      errorStack = error.stack;
    }

    expect(errorStack).to.include('Error: just tracing');
    expect(errorStack).to.include(
      `at Object.test (${path.resolve(
        'test/fixtures/source-map-external-babel-esm/script.js'
      )}:8:1)`
    );
  });

  it('should output proper stack trace backed up by inlined source map when external script is used (esm)', () => {
    require('../../..')({ babel: true });
    const component = require('./fixtures/source-map-external-esm').default;

    let errorStack = null;
    try {
      component.methods.test();
    } catch (error) {
      errorStack = error.stack;
    }

    expect(errorStack).to.include('Error: just tracing');
    expect(errorStack).to.include(
      `at Object.test (${path.resolve(
        'test/fixtures/source-map-external-esm/script.js'
      )}:8:1)`
      // note: should be the one below but to achieve this need to create a proper self source map
      // `at Object.test (${path.resolve('test/fixtures/source-map-external/script.js')}:6:13)`
    );
  });
});
