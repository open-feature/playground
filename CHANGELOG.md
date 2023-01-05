# Changelog

## [0.6.2](https://github.com/open-feature/playground/compare/v0.6.1...v0.6.2) (2023-01-05)


### Bug Fixes

* package lock issue ([2b6e7c5](https://github.com/open-feature/playground/commit/2b6e7c5d4858cdf030891e98935d6392e6dfd4ea))

## [0.6.1](https://github.com/open-feature/playground/compare/v0.6.0...v0.6.1) (2023-01-05)


### Bug Fixes

* **deps:** update dependencies ([#148](https://github.com/open-feature/playground/issues/148)) ([e0a9c37](https://github.com/open-feature/playground/commit/e0a9c37421f0cbee8df0f3e0b333a5c3f80b3b74))

## [0.6.0](https://github.com/open-feature/playground/compare/v0.5.0...v0.6.0) (2023-01-05)


### Features

* Add feature flag support in the fib service ([#142](https://github.com/open-feature/playground/issues/142)) ([81c133b](https://github.com/open-feature/playground/commit/81c133b686ae9e9dc213b3c7daf12f2ec474ed56))


### Bug Fixes

* **docker-compose:** update sync provider flagd argument ([#146](https://github.com/open-feature/playground/issues/146)) ([c9fb7e8](https://github.com/open-feature/playground/commit/c9fb7e820bb2a301ef882014d063275f85205301))

## [0.5.0](https://github.com/open-feature/playground/compare/v0.4.0...v0.5.0) (2022-12-07)


### Features

* show error icon on calc error ([#124](https://github.com/open-feature/playground/issues/124)) ([7f9accc](https://github.com/open-feature/playground/commit/7f9acccdcb23824e7530c16f34104a8a54ecfa2c))


### Bug Fixes

* mounted volumes use relative paths ([#118](https://github.com/open-feature/playground/issues/118)) ([bb5957e](https://github.com/open-feature/playground/commit/bb5957e2c79564416db54877b64e74a79cad44ef))
* openfeature hook log level ([#115](https://github.com/open-feature/playground/issues/115)) ([e77364d](https://github.com/open-feature/playground/commit/e77364d4d2e2ad47f6d9bb5d7a0c097c90c9f6fa))

## [0.4.0](https://github.com/open-feature/playground/compare/v0.3.0...v0.4.0) (2022-11-08)


### Features

* add pino logger support ([#112](https://github.com/open-feature/playground/issues/112)) ([2f5b22a](https://github.com/open-feature/playground/commit/2f5b22a3cbde8d8a266bc132a0bf8369bce11043))

## [0.3.0](https://github.com/open-feature/playground/compare/v0.2.0...v0.3.0) (2022-11-02)


### Features

* Slim down playground container images ([#110](https://github.com/open-feature/playground/issues/110)) ([d006ee7](https://github.com/open-feature/playground/commit/d006ee799a4a4a9f1a9cc28f067b0cf8bfb7f815))

## [0.2.0](https://github.com/open-feature/playground/compare/v0.1.1...v0.2.0) (2022-10-19)


### Features

* hide editor when flags config is not editable ([#101](https://github.com/open-feature/playground/issues/101)) ([d1cefeb](https://github.com/open-feature/playground/commit/d1cefeb048b8bffc8f206ebcac24adc28114d27c))


### Bug Fixes

* auth guard returns proper error code ([#102](https://github.com/open-feature/playground/issues/102)) ([7dd5c9c](https://github.com/open-feature/playground/commit/7dd5c9c4c586e0eb329c75ff7f4ba4a7e86c8167))

## [0.1.1](https://github.com/open-feature/playground/compare/v0.1.0...v0.1.1) (2022-10-11)


### Bug Fixes

* disable auth in fib service when env var aren't defined ([#95](https://github.com/open-feature/playground/issues/95)) ([18eff6b](https://github.com/open-feature/playground/commit/18eff6b75eb7bce6dbe07f52308cc9cfa0b3e307))
* improve timing of fib demo ([#96](https://github.com/open-feature/playground/issues/96)) ([b4106df](https://github.com/open-feature/playground/commit/b4106df0203f55ad1f1fd2aa3c54c6e7d9bc7868))

## [0.1.0](https://github.com/open-feature/playground/compare/v0.0.12...v0.1.0) (2022-10-11)


### Features

* add flagsmith support to the playground ([#80](https://github.com/open-feature/playground/issues/80)) ([ef85b84](https://github.com/open-feature/playground/commit/ef85b84710592c5e1a0a4d916ebd4df3720f92f3))
* add optional remote fib service ([#85](https://github.com/open-feature/playground/issues/85)) ([d5c9120](https://github.com/open-feature/playground/commit/d5c9120e2f9355b7d28e2dedab47cc2ea9300838))
* use image in docker compose ([#72](https://github.com/open-feature/playground/issues/72)) ([66c554e](https://github.com/open-feature/playground/commit/66c554ee702971429219330d8db3d3bdd1a97b9a))


### Bug Fixes

* add qemu ([f2991b7](https://github.com/open-feature/playground/commit/f2991b7ee56ff52e460b6477ba92fe06c694724f))
* address grammatical issues discovered in the tutorial ([#77](https://github.com/open-feature/playground/issues/77)) ([4834fcf](https://github.com/open-feature/playground/commit/4834fcf11037d656543068dd5f198d89622c6184)), closes [#74](https://github.com/open-feature/playground/issues/74)
* bump ci step versions ([#92](https://github.com/open-feature/playground/issues/92)) ([23aaddf](https://github.com/open-feature/playground/commit/23aaddff89a4bf173844dd7b5e92f5dc33c0cd49))
* container build process ([74f67b2](https://github.com/open-feature/playground/commit/74f67b25da9f0f18cf4a1480576bf837ec7169b4))
* disable monorepo tags in release please ([3a64a68](https://github.com/open-feature/playground/commit/3a64a68e5def97e8291c9f29fe84f792048ca5ca))
* disable QEMU ([#70](https://github.com/open-feature/playground/issues/70)) ([ecfcf84](https://github.com/open-feature/playground/commit/ecfcf8469287faae1d311c4d965a3d360545b35c))
* fix images ([eff82c3](https://github.com/open-feature/playground/commit/eff82c3459f1c12d35e190762ac9350ee5df3e44))
* remove component from tag ([febd5c0](https://github.com/open-feature/playground/commit/febd5c07d2667a0141b20bfea61ceb2e2c61c12d))
* remove unused asset option from the build target ([c940a3e](https://github.com/open-feature/playground/commit/c940a3e35b26ee144b04ad05486d8600b6ea5cd1))
* set default fib value to 45 ([1ec403a](https://github.com/open-feature/playground/commit/1ec403a69b6827daf80f43c1134161af75f85b3f))

## [0.0.12](https://github.com/open-feature/playground/compare/openfeature-v0.0.11...openfeature-v0.0.12) (2022-10-11)


### Bug Fixes

* bump ci step versions ([#92](https://github.com/open-feature/playground/issues/92)) ([23aaddf](https://github.com/open-feature/playground/commit/23aaddff89a4bf173844dd7b5e92f5dc33c0cd49))

## [0.0.11](https://github.com/open-feature/playground/compare/openfeature-v0.0.10...openfeature-v0.0.11) (2022-10-11)


### Bug Fixes

* disable monorepo tags in release please ([3a64a68](https://github.com/open-feature/playground/commit/3a64a68e5def97e8291c9f29fe84f792048ca5ca))

## [0.0.10](https://github.com/open-feature/playground/compare/openfeature-v0.0.9...openfeature-v0.0.10) (2022-10-11)


### Bug Fixes

* remove unused asset option from the build target ([c940a3e](https://github.com/open-feature/playground/commit/c940a3e35b26ee144b04ad05486d8600b6ea5cd1))

## [0.0.9](https://github.com/open-feature/playground/compare/openfeature-v0.0.8...openfeature-v0.0.9) (2022-10-11)


### Bug Fixes

* container build process ([74f67b2](https://github.com/open-feature/playground/commit/74f67b25da9f0f18cf4a1480576bf837ec7169b4))

## [0.0.8](https://github.com/open-feature/playground/compare/openfeature-v0.0.7...openfeature-v0.0.8) (2022-10-11)


### Features

* add optional remote fib service ([#85](https://github.com/open-feature/playground/issues/85)) ([d5c9120](https://github.com/open-feature/playground/commit/d5c9120e2f9355b7d28e2dedab47cc2ea9300838))


### Bug Fixes

* set default fib value to 45 ([1ec403a](https://github.com/open-feature/playground/commit/1ec403a69b6827daf80f43c1134161af75f85b3f))

## [0.0.7](https://github.com/open-feature/playground/compare/openfeature-v0.0.6...openfeature-v0.0.7) (2022-10-06)


### Features

* add flagsmith support to the playground ([#80](https://github.com/open-feature/playground/issues/80)) ([ef85b84](https://github.com/open-feature/playground/commit/ef85b84710592c5e1a0a4d916ebd4df3720f92f3))

## [0.0.6](https://github.com/open-feature/playground/compare/openfeature-v0.0.5...openfeature-v0.0.6) (2022-10-05)


### Bug Fixes

* address grammatical issues discovered in the tutorial ([#77](https://github.com/open-feature/playground/issues/77)) ([4834fcf](https://github.com/open-feature/playground/commit/4834fcf11037d656543068dd5f198d89622c6184)), closes [#74](https://github.com/open-feature/playground/issues/74)

## [0.0.5](https://github.com/open-feature/playground/compare/openfeature-v0.0.4...openfeature-v0.0.5) (2022-10-04)


### Features

* use image in docker compose ([#72](https://github.com/open-feature/playground/issues/72)) ([66c554e](https://github.com/open-feature/playground/commit/66c554ee702971429219330d8db3d3bdd1a97b9a))

## [0.0.4](https://github.com/open-feature/playground/compare/openfeature-v0.0.3...openfeature-v0.0.4) (2022-10-04)


### Bug Fixes

* disable QEMU ([#70](https://github.com/open-feature/playground/issues/70)) ([ecfcf84](https://github.com/open-feature/playground/commit/ecfcf8469287faae1d311c4d965a3d360545b35c))

## [0.0.3](https://github.com/open-feature/playground/compare/openfeature-v0.0.2...openfeature-v0.0.3) (2022-10-04)


### Bug Fixes

* add qemu ([f2991b7](https://github.com/open-feature/playground/commit/f2991b7ee56ff52e460b6477ba92fe06c694724f))

## [0.0.2](https://github.com/open-feature/playground/compare/openfeature-v0.0.1...openfeature-v0.0.2) (2022-10-04)


### Bug Fixes

* fix images ([eff82c3](https://github.com/open-feature/playground/commit/eff82c3459f1c12d35e190762ac9350ee5df3e44))
