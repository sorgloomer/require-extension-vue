const path = require('path');
const { expect } = require('chai');

describe('source map', () => {
  it('should output proper stack trace backed up by inlined source map when babel is used', function() {
    require('..')({
      babel: {
        cwd: path.resolve(__dirname, 'fixtures', 'source-map-babel'),
        babelrc: false
      }
    });
    const component = require('./fixtures/source-map-babel').default;

    let errorStack = null;
    try {
      component.methods.test();
    } catch (error) {
      errorStack = error.stack;
    }

    expect(errorStack).to.include('Error: just tracing');
    expect(errorStack).to.include(`at Object.test (${path.resolve('test/fixtures/source-map-babel/index.vue')}:11:1)`);
  });

  it('should output proper stack trace backed up by inlined source map when babel is not used', function() {
    require('..')({ babel: false });
    const component = require('./fixtures/source-map');

    let errorStack = null;
    try {
      component.methods.test();
    } catch (error) {
      errorStack = error.stack;
    }

    expect(errorStack).to.include('Error: just tracing');
    expect(errorStack).to.include(`at Object.test (${path.resolve('test/fixtures/source-map.vue')}:11:1)`);
  });

  it('should output proper stack trace backed up by inlined source map when external script and babel is used', function() {
    require('..')({
      babel: {
        cwd: path.resolve(__dirname, 'fixtures', 'source-map-external-babel'),
        babelrc: false
      }
    });
    const component = require('./fixtures/source-map-external-babel').default;

    let errorStack = null;
    try {
      component.methods.test();
    } catch (error) {
      errorStack = error.stack;
    }

    expect(errorStack).to.include('Error: just tracing');
    expect(errorStack).to.include(
      `at Object.test (${path.resolve('test/fixtures/source-map-external-babel/script.js')}:6:13)`
    );
  });

  it('should output proper stack trace backed up by inlined source map when external script is used', function() {
    require('..')({ babel: false });
    const component = require('./fixtures/source-map-external');

    let errorStack = null;
    try {
      component.methods.test();
    } catch (error) {
      errorStack = error.stack;
    }

    expect(errorStack).to.include('Error: just tracing');
    expect(errorStack).to.include(
      `at Object.test (${path.resolve('test/fixtures/source-map-external/script.js')}:6:1)`
      // note: should be the one below but to achieve this need to create a proper self source map
      // `at Object.test (${path.resolve('test/fixtures/source-map-external/script.js')}:6:13)`
    );
  });
});
