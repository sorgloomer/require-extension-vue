module.exports = {
  overrides: [
    {
      files: ['test/**/*.vue'],
      extends: ['plugin:vue/vue3-recommended', 'prettier'],
      rules: {
        // vue
        'vue/multi-word-component-names': 'off',
      },
    },

    {
      files: ['test/**/*.spec.js'],

      env: {
        mocha: true,
      },

      globals: {
        expect: 'readonly',
      },
    },

    {
      files: ['test/**/*.js', 'test/**/*.ts', 'test/**/*.vue'],
      rules: {
        // n
        'n/no-unpublished-import': 'off',
      },
    },
  ],
};
