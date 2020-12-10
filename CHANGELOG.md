# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [1.0.4](https://github.com/prepair/require-extension-vue/compare/v1.0.3...v1.0.4) (2020-12-10)


### Bug Fixes

* fix case when cache metadata external script or template not exists anymore ([0e71ab1](https://github.com/prepair/require-extension-vue/commit/0e71ab10bd1ee67907605595333da9384a583cf7))

### [1.0.3](https://github.com/prepair/require-extension-vue/compare/v1.0.2...v1.0.3) (2020-03-14)

### [1.0.2](https://github.com/prepair/require-extension-vue/compare/v1.0.1...v1.0.2) (2020-03-14)

### [1.0.1](https://github.com/prepair/require-extension-vue/compare/v1.0.0...v1.0.1) (2019-12-13)


### Bug Fixes

* **permanent cache:** external scripts and templates should be considered in cache validation to avoid staled cached vue file usage ([d42d641](https://github.com/prepair/require-extension-vue/commit/d42d64189f818fce95c6d3525b35f764f66a8211))
* **source-map:** generate source map from external script if referenced from vue file ([724a475](https://github.com/prepair/require-extension-vue/commit/724a475d730d1ef5ea87cbb012333639b648809e))

## 1.0.0 (2019-12-03)


### Features

* add 'logLevel' option ([0fee3ce](https://github.com/prepair/require-extension-vue/commit/0fee3ced669f0f4fcbc54341c97cc078963954fa))
* add babel transformation option ([ab6237b](https://github.com/prepair/require-extension-vue/commit/ab6237bc371305aacb0e38ccfd04f52dacd4a462))
* add env silence flags to be able to disable console output for parser/template compiler stuff ([1d3e44a](https://github.com/prepair/require-extension-vue/commit/1d3e44ac26c1e9ca17f49b7222c503b365b765d9))
* add source map support ([355236d](https://github.com/prepair/require-extension-vue/commit/355236d081a8c7d0becf2b903e6f326aed037843))
* add support for disabling/filtering errors and tips of parser and template compiler ([29765e4](https://github.com/prepair/require-extension-vue/commit/29765e445f4d1f2e06f8af14674d3d7518a95cb0))
* add support for permanent caching ([4c61d2f](https://github.com/prepair/require-extension-vue/commit/4c61d2f2f6248c67a14dad27d652220c16783ff1))
* implement vue file parsing and template compilation ([4a5280e](https://github.com/prepair/require-extension-vue/commit/4a5280e1f152627ce8727a2dd43ce7d148360323))
* initial hook sketch for vue files ([966280f](https://github.com/prepair/require-extension-vue/commit/966280f13efd461a0bd0b69c70e869f8c8914440))
