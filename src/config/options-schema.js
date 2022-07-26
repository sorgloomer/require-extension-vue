const optionsSchema = {
  type: 'object',
  properties: {
    logLevel: {
      default: 'warn',
      description: 'logging level: trace|debug|info|warn|error|silent',
      type: 'string',
      enum: ['trace', 'debug', 'info', 'warn', 'error', 'silent'],
    },

    emitEsmodule: {
      default: false,
      description: 'Emit ESM modules if set to true otherwise CJS modules.',
      type: 'boolean',
    },

    permanentCache: {
      default: false,
      description: 'Use permanent caching of compiled files.',
      type: 'boolean',
    },

    babel: {
      default: 'false',
      description:
        'Use babel for script block transpilation. `true` will use your project' +
        ' babel config if found, if not it will use a default setting with `babel-preset-env`' +
        ' to set to `current node`. Using an object you can provide additional babel options,' +
        ' will merge with your babel config if found, if not the provided options will' +
        ' be used as is.',
      oneOf: [{ type: 'boolean' }, { type: 'object' }],
    },

    noLogParserErrors: {
      default: false,
      description: '',
      type: 'boolean',
    },

    noLogTemplateCompilerErrors: {
      default: false,
      description: '',
      type: 'boolean',
    },

    noLogTemplateCompilerTips: {
      default: false,
      description: '',
      type: 'boolean',
    },

    parser: {
      default: { errors: { exclude: [] } },
      description: '',
      type: 'object',

      properties: {
        errors: {
          default: { exclude: [] },
          description: '',
          type: 'object',

          properties: {
            exclude: {
              default: [],
              description: '',
              type: 'array',
              items: {
                oneOf: [{ type: 'string' }, { type: 'object' }],
              },
            },
          },

          additionalProperties: false,
        },
      },

      additionalProperties: false,
    },

    templateCompiler: {
      default: { errors: { exclude: [] }, tips: { exclude: [] } },
      description: '',
      type: 'object',

      properties: {
        errors: {
          default: { exclude: [] },
          description: '',
          type: 'object',

          properties: {
            exclude: {
              default: [],
              description: '',
              type: 'array',
              items: {
                oneOf: [{ type: 'string' }, { type: 'object' }],
              },
            },
          },

          additionalProperties: false,
        },

        tips: {
          default: { exclude: [] },
          description: '',
          type: 'object',

          properties: {
            exclude: {
              default: [],
              description: '',
              type: 'array',
              items: {
                oneOf: [{ type: 'string' }, { type: 'object' }],
              },
            },
          },

          additionalProperties: false,
        },
      },

      additionalProperties: false,
    },
  },

  additionalProperties: false,
};

exports = module.exports = optionsSchema;
