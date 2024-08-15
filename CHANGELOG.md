# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [5.0.1](https://github.com/prepair/require-extension-vue/compare/v5.0.0...v5.0.1) (2024-08-15)


### Bug Fixes

* don't cache compilations with parser or compilation errors ([325d4f4](https://github.com/prepair/require-extension-vue/commit/325d4f4635e95b15836a749be33a33750e1bef5c))

### Chores

* Update dependencies

## [5.0.0](https://github.com/prepair/require-extension-vue/compare/v4.1.0...v5.0.0) (2024-04-24)


### ⚠ BREAKING CHANGES

* only support last minor version of Vue 2 (^2.7.0)
* drop `emitEsmodule` config option

### Features

* add Vue 3 support \o/ ([e0090ce](https://github.com/prepair/require-extension-vue/commit/e0090cea9c900a0eb7b3f3d7e19d0564d352b728))
* add babel preset typescript to default babel config ([2911b6f](https://github.com/prepair/require-extension-vue/commit/2911b6f8aca4d0f96b8a08b82293710e4b420e30))
* only support last minor version of Vue (^2.7.0) ([1768425](https://github.com/prepair/require-extension-vue/commit/1768425f145f8303235d4c8d935a3cc85bae706e))
* drop emitEsmodule config option ([f63db8a](https://github.com/prepair/require-extension-vue/commit/f63db8a4eb9d6cd2c719c5523428e37dfbc8cb3e))

## [4.1.0](https://github.com/prepair/require-extension-vue/compare/v4.0.0...v4.1.0) (2024-04-24)


### Features

* **cache:** version cache file and add vueVersion to invalidate when changes ([6917cbb](https://github.com/prepair/require-extension-vue/commit/6917cbb7740e83f390a922b48a292fbb832ec749))

## [4.0.0](https://github.com/prepair/require-extension-vue/compare/v3.0.0...v4.0.0) (2024-04-17)


### ⚠ BREAKING CHANGES

* The minimum supported Node.js version is 18.18.2

### Chores

* Update dependencies


## [3.0.1](https://github.com/prepair/require-extension-vue/compare/v3.0.0...v3.0.1) (2024-01-30)

### Chores

* Remove unnecessary npm engine restriction to allow unrestricted usage

## [3.0.0](https://github.com/prepair/require-extension-vue/compare/v2.0.3...v3.0.0) (2022-07-28)

### ⚠ BREAKING CHANGES

* The minimum supported Node.js version is 14.18.3

### Features

* support Vue 2.7 ([0c00636](https://github.com/prepair/require-extension-vue/commit/0c00636ab7742578501c579b3d9ba95771c99584))

### Chores

* update dependencies

## [2.0.3](https://github.com/prepair/require-extension-vue/compare/v2.0.2...v2.0.3) (2021-11-05)

### Bug Fixes

* revert: use virtual script.js/.ts filename for babel transform ([82af506](https://github.com/prepair/require-extension-vue/commit/82af506ff710c0d3fa63f68789f101c7ca1ad03a))

## [2.0.2](https://github.com/prepair/require-extension-vue/compare/v2.0.1...v2.0.2) (2021-10-22)

### Bug Fixes

* use virtual script.js/.ts filename for babel transform ([0f61449](https://github.com/prepair/require-extension-vue/commit/0f614499308db04effa0b6ad3cb80ed401ff7a14))

## [2.0.1](https://github.com/prepair/require-extension-vue/compare/v2.0.0...v2.0.1) (2021-05-28)

## [2.0.0](https://github.com/prepair/require-extension-vue/compare/v1.0.4...v2.0.0) (2021-05-28)

### ⚠ BREAKING CHANGES

* **package.json:** upgrading fs-extra to latest raises the minimum
supported Node.js version to 12

* **package.json:** update dependencies ([9daeb3e](https://github.com/prepair/require-extension-vue/commit/9daeb3e0a84513982ffef9491122b4f24e4a1cad))

## [1.0.4](https://github.com/prepair/require-extension-vue/compare/v1.0.3...v1.0.4) (2020-12-10)

### Bug Fixes

* fix case when cache metadata external script or template not exists anymore ([0e71ab1](https://github.com/prepair/require-extension-vue/commit/0e71ab10bd1ee67907605595333da9384a583cf7))

## [1.0.3](https://github.com/prepair/require-extension-vue/compare/v1.0.2...v1.0.3) (2020-03-14)

## [1.0.2](https://github.com/prepair/require-extension-vue/compare/v1.0.1...v1.0.2) (2020-03-14)

## [1.0.1](https://github.com/prepair/require-extension-vue/compare/v1.0.0...v1.0.1) (2019-12-13)

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
