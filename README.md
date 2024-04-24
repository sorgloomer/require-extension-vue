# require-extension-vue

[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

Simple vue file support for Node.js. Mainly for testing purposes.

Template block will be parsed and compiled to a render function which allows us early detection of some possible problems with the template.
Script block will be parsed and possibly can go through babel transpilation step.
Style block will be ignored and won't be processed for now.

Source maps are supported, both the vue parser (for external script files we generate one) and babel returns source maps which will be merged and inlined in the compiled vue file.

## Install

```bash
npm install --save-dev @prepair/require-extension-vue
```

## Usage

Can be used the same way as [@babel/register](https://babeljs.io/docs/en/babel-register).

```JavaScript
require('@prepair/require-extension-vue')
const SomeComponent = require('src/components/SomeComponent.vue')

// ...
// do something with the parsed and compiled `SomeComponent`
```

```JavaScript
// enabling permanent caching and babel
require('@prepair/require-extension-vue')({
  permanentCache: true,
  babel: true
})
const OtherComponent = require('src/components/OtherComponent.vue')

// ...
// do something with the parsed and compiled `OtherComponent`
```

### Example: usage with Mocha
```bash
mocha --require @prepair/require-extension-vue test
```

## Options
| name | type | default | description
| - | - | - | - |
| babel | boolean / object | false | if `true` or non empty object then it will transpile the script block via babel. `true` means that babel will try to load your babel configuration if found otherwise will fallback to `babel-preset-env` set to `current node` setting. Via object value you can provide any valid option to babel which could override/extend your babel configuration too. |
| logLevel | string | warn | logging level: `trace`/`debug`/`info`/`warn`/`error`/`silent`. note that this one can be overriden by `REQ_EXT_VUE_LOG_LEVEL` |
| noLogParserErrors | boolean | false | if `true` no parser errors will be logged in console |
| noLogTemplateCompilerErrors | boolean | false | if `true` no template compiler errors will be logged in console |
| noLogTemplateCompilerTips | boolean | false | if `true` no template compiler tips will be logged in console |
| parser.errors.exclude | array | [] | excludes for parser error logs. `string` or `RegExp` values are supported. `string` values will be compared as is, `RegExp` will call `.test(error)`  |
| permanentCache | boolean | false | if `true` enables permanent caching of compiled vue files on the disk |
| templateCompiler.errors.exclude | array | [] | excludes for template compiler error logs. `string` or `RegExp` values are supported. `string` values will be compared as is, `RegExp` will call `.test(error)` |
| templateCompiler.tips.exclude | array | [] | excludes for template compiler tip logs. `string` or `RegExp` values are supported. `string` values will be compared as is, `RegExp` will call `.test(tip)` |

### Examples

```JavaScript
// enable permanent cache
require('@prepair/require-extension-vue')({
  permanentCache: true
})
```

```JavaScript
// enable babel transpilation of script block
require('@prepair/require-extension-vue')({
  babel: true
})
```

```JavaScript
// enable permanent cache + setup babel with custom options
require('@prepair/require-extension-vue')({
  permanentCache: true,
  babel: {
    presets: [
    [
      '@babel/preset-env',
      {
        targets: 'current node'
      }
    ]
  ]
  }
})
```

## Environment Variables

| name | description|
| - | - |
| REQ_EXT_VUE_LOG_LEVEL | values can be `trace`, `debug`, `info`, `warn`, `error` and `silent`. for example if set to `info` then all errors, warnings and info messages will be logged in the console. the default log level is `warn`. if set it will override the `logLevel` option |
| REQ_EXT_VUE_SILENCE_PARSER_ERRORS | if set to *any* value, no parser error will be logged in the console. if `noLogParserErrors` is `true` then this won't have any effect |
| REQ_EXT_VUE_SILENCE_TEMPLATE_COMPILER_TIPS | if set to *any* value, no template compiler error will be logged in the console. if `noLogTemplateCompilerErrors` is `true` then this won't have any effect |
| REQ_EXT_VUE_SILENCE_TEMPLATE_COMPILER_ERRORS | if set to *any* value, no template compiler tip will be logged in the console. if `noLogTemplateCompilerTips` is `true` then this won't have any effect |

### Examples

```bash
# set log level to `debug`
REQ_EXT_VUE_LOG_LEVEL=debug npm test
```

```bash
# silence parser and template compiler errors
# (value can be any string)
REQ_EXT_VUE_SILENCE_PARSER_ERRORS=true REQ_EXT_VUE_SILENCE_TEMPLATE_COMPILER_ERRORS=dummy npm test
 npm test
```

## Related Projects

Taken some ideas from the following projects. Some of them are more robust and supports more use cases. Feel free to check them out.

- [@babel/register](https://github.com/babel/babel/tree/master/packages/babel-register)
- [jackmellis/require-extension-hooks-vue](https://github.com/jackmellis/require-extension-hooks-vue) and [require-extension-hooks](https://github.com/jackmellis/require-extension-hooks)
- [lixinliang/require-extension-vue](https://github.com/lixinliang/require-extension-vue)
- [vue-loader](https://github.com/vuejs/vue-loader)

## Development

- **Node.js** : >= 14.18.3
- **npm**     : ^8.4.1
