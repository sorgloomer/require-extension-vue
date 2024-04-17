module.exports = {
  env: {
    commonjs: true,
    es6: true,
    node: true,
  },

  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },

  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },

  plugins: ['unicorn', 'mocha'],

  extends: [
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:mocha/recommended',
    'plugin:n/recommended',
    'plugin:promise/recommended',
    'plugin:unicorn/recommended',
    'plugin:vue/recommended',
    'prettier',
  ],

  rules: {
    // general
    //

    // import plugin
    'import/no-cycle': 'error',

    // unicorn
    'unicorn/expiring-todo-comments': 'off',
    'unicorn/no-array-callback-reference': 'off',
    'unicorn/no-array-for-each': 'off',
    'unicorn/no-fn-reference-in-iterator': 'off',
    'unicorn/no-null': 'off',
    'unicorn/no-process-exit': 'off',
    'unicorn/prefer-module': 'off',
    'unicorn/prevent-abbreviations': 'off',

    // mocha
    'mocha/no-global-tests': 'off',
    'mocha/no-mocha-arrows': 'off',
    'mocha/no-top-level-hooks': 'off',
    'mocha/no-skipped-tests': 'off',
  },

  overrides: [
    {
      files: ['test/**/*.spec.js'],

      env: {
        mocha: true,
      },

      globals: {
        expect: 'readonly',
      },
    },
  ],
};
