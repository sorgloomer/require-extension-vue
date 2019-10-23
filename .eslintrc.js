module.exports = {
  env: {
    commonjs: true,
    es6: true,
    node: true
  },

  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly'
  },

  parserOptions: {
    ecmaVersion: 2019,
    sourceType: 'module'
  },

  plugins: ['unicorn', 'mocha'],

  extends: [
    'semistandard',
    'plugin:import/errors',
    'plugin:import/warnings',
    "plugin:mocha/recommended",
    'plugin:unicorn/recommended',
    'plugin:vue/recommended',
    'plugin:prettier/recommended',
    'prettier/standard',
    'prettier/unicorn',
    'prettier/vue'
  ],

  rules: {
    // general
    "prefer-const": "off", // annoying

    // import plugin
    "import/no-cycle": "error",

    // unicorn
    "unicorn/prevent-abbreviations": "off",
    "unicorn/no-process-exit": "off",

    // mocha
    "mocha/no-global-tests": "off",
    "mocha/no-mocha-arrows": "off",
    "mocha/no-top-level-hooks": "off",
    "mocha/no-skipped-tests": "off"
  },

  "overrides": [
    {
      "files": ["test/**/*.spec.js"],

      "env": {
        "mocha": true
      },

      "globals": {
        'expect': 'readonly'
      }
    }
  ]
};
