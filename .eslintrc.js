module.exports = {
  root: true,

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
    parser: '@typescript-eslint/parser',
    sourceType: 'module',
    ecmaVersion: 2022,
  },

  plugins: ['@typescript-eslint', 'mocha', 'unicorn'],

  extends: [
    'eslint:recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:mocha/recommended',
    'plugin:n/recommended',
    'plugin:promise/recommended',
    'plugin:unicorn/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:vue/recommended',
    'prettier',
  ],

  settings: {
    n: {
      tryExtensions: ['.js', '.json', '.node', '.ts', '.vue'],
    },
  },

  rules: {
    // general
    //

    // import plugin
    'import/no-cycle': 'error',

    // n
    'n/no-unpublished-require': 'off',

    // unicorn
    'unicorn/expiring-todo-comments': 'off',
    'unicorn/no-array-callback-reference': 'off',
    'unicorn/no-array-for-each': 'off',
    'unicorn/no-fn-reference-in-iterator': 'off',
    'unicorn/no-null': 'off',
    'unicorn/no-process-exit': 'off',
    'unicorn/prefer-module': 'off',
    'unicorn/prevent-abbreviations': 'off',

    // vue
    'vue/multi-word-component-names': 'off',

    // mocha
    'mocha/no-global-tests': 'off',
    'mocha/no-mocha-arrows': 'off',
    'mocha/no-top-level-hooks': 'off',
    'mocha/no-skipped-tests': 'off',

    // typescript
    '@typescript-eslint/no-var-requires': 'off',
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
