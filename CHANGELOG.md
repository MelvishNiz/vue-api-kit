## [1.12.1](https://github.com/MelvishNiz/vue-api-kit/compare/v1.12.0...v1.12.1) (2026-02-18)

### :bug: Fixes

* **core:** let boolean parsing on multipart ([f7ffea2](https://github.com/MelvishNiz/vue-api-kit/commit/f7ffea2ff971812b188a0192e41a910703c02ca1))

## [1.12.0](https://github.com/MelvishNiz/vue-api-kit/compare/v1.11.0...v1.12.0) (2026-02-18)

### :sparkles: Features

* **core:** enhance appendToFormData to handle Date and boolean types ([d4a6359](https://github.com/MelvishNiz/vue-api-kit/commit/d4a6359705fc9bd334bb589ff60db6ddc93de9ca))
* **tests:** add tests for preserving date values and serializing booleans in multipart requests ([b9a7339](https://github.com/MelvishNiz/vue-api-kit/commit/b9a7339f8dc1c62cd9bd65554891a351669f295a))

## [1.11.0](https://github.com/MelvishNiz/vue-api-kit/compare/v1.10.11...v1.11.0) (2026-02-13)

### :sparkles: Features

* **client:** add log Zod validation errors with method and path ([3f521c9](https://github.com/MelvishNiz/vue-api-kit/commit/3f521c9d50ce364033144e74688187f3608c9ed8))

## [1.10.11](https://github.com/MelvishNiz/vue-api-kit/compare/v1.10.10...v1.10.11) (2026-01-07)

### :bug: Fixes

* **core:** can't attach headers on query ([af72f5a](https://github.com/MelvishNiz/vue-api-kit/commit/af72f5a1a94e5b4044fd127deb15088423461561))

## [1.10.10](https://github.com/MelvishNiz/vue-api-kit/compare/v1.10.9...v1.10.10) (2026-01-05)

### :bug: Fixes

* add array indices to multipart nested objects in FormData ([84c95ad](https://github.com/MelvishNiz/vue-api-kit/commit/84c95add68837e78dc436d9a756ded96f9deb446))
* add array indices to primitive values in arrays for multipart FormData ([73151f4](https://github.com/MelvishNiz/vue-api-kit/commit/73151f4b047f0b870d5ac22c466425c0b7b51286))

### :white_check_mark: Tests

* add comprehensive test for various array field names ([1669df6](https://github.com/MelvishNiz/vue-api-kit/commit/1669df6c499675d1d66b8a99933ead484d5f159c))

## [1.10.9](https://github.com/MelvishNiz/vue-api-kit/compare/v1.10.8...v1.10.9) (2026-01-02)

### :bug: Fixes

* skip undefined values in multipart FormData ([eed9b0c](https://github.com/MelvishNiz/vue-api-kit/commit/eed9b0cda3ad8ae876ff38765807a657da2a7ea9))

### :memo: Documentation

* improve code examples clarity by removing ellipsis placeholders ([fe6fb49](https://github.com/MelvishNiz/vue-api-kit/commit/fe6fb49ce4dbd41870a268104cacf62b13882a06))
* simplify and restructure README for better readability ([07a75d9](https://github.com/MelvishNiz/vue-api-kit/commit/07a75d98ad23fbfd3ed7a4973e95ded334f95930))

## [1.10.8](https://github.com/MelvishNiz/vue-api-kit/compare/v1.10.7...v1.10.8) (2026-01-02)

### :bug: Fixes

* error handling in Axios response interceptor for multipart nested object support ([ead1703](https://github.com/MelvishNiz/vue-api-kit/commit/ead1703ba3c9ae1613db8430fe1e5d76fd2c4863))

### :zap: Refactor

* rename onErrorRequest to onError for consistency across API client ([f466311](https://github.com/MelvishNiz/vue-api-kit/commit/f4663113b02fc6b94d65c7e7b3b97810bbeb735a))

## [1.10.7](https://github.com/MelvishNiz/vue-api-kit/compare/v1.10.6...v1.10.7) (2025-12-29)

### :bug: Fixes

* change ZodError export from type to named export in index.ts ([f731975](https://github.com/MelvishNiz/vue-api-kit/commit/f7319750a8a2176b0d6ec5dacb9a2c036cd3daf8))

## [1.10.6](https://github.com/MelvishNiz/vue-api-kit/compare/v1.10.5...v1.10.6) (2025-12-29)

### :zap: Refactor

* simplify error handling by updating onErrorRequest to onError in API client ([cbb4541](https://github.com/MelvishNiz/vue-api-kit/commit/cbb4541c9440bfe9dee0efde3f351db851ec9658))

## [1.10.5](https://github.com/MelvishNiz/vue-api-kit/compare/v1.10.4...v1.10.5) (2025-12-29)

### :bug: Fixes

* remove redundant validation error check in nested structure tests ([96562ab](https://github.com/MelvishNiz/vue-api-kit/commit/96562ab5c3be067c70652ff9c0a6259067298d6e))

### :zap: Refactor

* update error handling and validation in API client and components ([3b2bf71](https://github.com/MelvishNiz/vue-api-kit/commit/3b2bf716c74650da15e967b91b167f6572136d73))

## [1.10.4](https://github.com/MelvishNiz/vue-api-kit/compare/v1.10.3...v1.10.4) (2025-12-21)

### :bug: Fixes

* set immediate option to false in createApiClient for consistent behavior ([5bae76f](https://github.com/MelvishNiz/vue-api-kit/commit/5bae76f482c4f1e96ad0caf5bf1eb4f14695997c))

## [1.10.3](https://github.com/MelvishNiz/vue-api-kit/compare/v1.10.2...v1.10.3) (2025-12-21)

### :bug: Fixes

* add params option check in createApiClient for enhanced flexibility ([daeea44](https://github.com/MelvishNiz/vue-api-kit/commit/daeea4446036e6dd3af6717e2bdb464826dc9545))

## [1.10.2](https://github.com/MelvishNiz/vue-api-kit/compare/v1.10.1...v1.10.2) (2025-12-21)

### :bug: Fixes

* update immediate option in createApiClient to respect loadOnMount setting ([6f7df33](https://github.com/MelvishNiz/vue-api-kit/commit/6f7df3352ddf0b624393e99bb761f06647b8e096))

## [1.10.1](https://github.com/MelvishNiz/vue-api-kit/compare/v1.10.0...v1.10.1) (2025-12-21)

### :bug: Fixes

* add url parameter to onErrorRequest for better error handling ([67ddda5](https://github.com/MelvishNiz/vue-api-kit/commit/67ddda5a8d21f6985361a05b5bbbad66d7b69664))

## [1.10.0](https://github.com/MelvishNiz/vue-api-kit/compare/v1.9.0...v1.10.0) (2025-12-19)

### :sparkles: Features

* **release:** only up version ([ec04305](https://github.com/MelvishNiz/vue-api-kit/commit/ec04305ae2d38822c1cd44cb35eb07359bfb280e))

## [1.9.0](https://github.com/MelvishNiz/vue-api-kit/compare/v1.8.1...v1.9.0) (2025-12-19)

### :sparkles: Features

* add feature nested mutations and queries ([359c004](https://github.com/MelvishNiz/vue-api-kit/commit/359c004a3996998b6f56bb06b33ae0d3290a93d4))

## [1.8.1](https://github.com/MelvishNiz/vue-api-kit/compare/v1.8.0...v1.8.1) (2025-12-18)

### :zap: Refactor

* **package:** remove package lock npm ([cd893a9](https://github.com/MelvishNiz/vue-api-kit/commit/cd893a970dac8ffcb7fb236837fa9da2dfad7bff))

## [1.8.0](https://github.com/MelvishNiz/vue-api-kit/compare/v1.7.0...v1.8.0) (2025-12-18)

### :sparkles: Features

* **onbeforerequest:** add onBeforeRequest handler ([0b0a29f](https://github.com/MelvishNiz/vue-api-kit/commit/0b0a29f2149b4697e5ade60c5b76ff857d6fd075))

## [1.7.0](https://github.com/MelvishNiz/vue-api-kit/compare/v1.6.0...v1.7.0) (2025-12-18)

### :sparkles: Features

* **client:** add automatic XSRF token handling and login functionality ([cd15c38](https://github.com/MelvishNiz/vue-api-kit/commit/cd15c383c1643256ce9187f34335361f7ca92f9f))

## [1.6.0](https://github.com/MelvishNiz/vue-api-kit/compare/v1.5.2...v1.6.0) (2025-12-17)

### :sparkles: Features

* **client:** implement automatic XSRF token handling and update documentation ([263fa48](https://github.com/MelvishNiz/vue-api-kit/commit/263fa48ad80bf289177cf1f3d0e15273aa9405e3))

## [1.5.2](https://github.com/MelvishNiz/vue-api-kit/compare/v1.5.1...v1.5.2) (2025-12-17)

### :bug: Fixes

* **client:** update axios headers configuration and improve CSRF error handling ([0b86b69](https://github.com/MelvishNiz/vue-api-kit/commit/0b86b6927e526163692a4dd387e1bfd92f0ed8d3))

## [1.5.1](https://github.com/MelvishNiz/vue-api-kit/compare/v1.5.0...v1.5.1) (2025-12-17)

### :bug: Fixes

* **client:** simplify axios headers configuration in createApiClient ([605f706](https://github.com/MelvishNiz/vue-api-kit/commit/605f70657cb9b898179b9494de1a7aa765b9863f))

## [1.5.0](https://github.com/MelvishNiz/vue-api-kit/compare/v1.4.2...v1.5.0) (2025-12-17)

### :sparkles: Features

* **csrf:** add automatic CSRF token refresh on 403/419 errors ([3e1912b](https://github.com/MelvishNiz/vue-api-kit/commit/3e1912bcde3fd913137443f7824a1425bd2edd9a))

### :bug: Fixes

* **types:** update mutate function signature to use optional args ([917b80f](https://github.com/MelvishNiz/vue-api-kit/commit/917b80faac3f94bbf081a28abfb6bbc490e68607))

### :white_check_mark: Tests

* **client:** add comprehensive tests for createApiClient interceptors and behavior ([65bd074](https://github.com/MelvishNiz/vue-api-kit/commit/65bd074bde57b02a21197876a07cc7bdf5832fa3))

## [1.4.2](https://github.com/MelvishNiz/vue-api-kit/compare/v1.4.1...v1.4.2) (2025-12-16)

### :bug: Fixes

* **types:** allow void return type for request lifecycle hooks ([c366242](https://github.com/MelvishNiz/vue-api-kit/commit/c3662424d20ea81f607252c0ed0ef17cb53860f3))

## [1.4.1](https://github.com/MelvishNiz/vue-api-kit/compare/v1.4.0...v1.4.1) (2025-12-16)

### :zap: Refactor

* remove unused afterEach import in client tests ([ae019b0](https://github.com/MelvishNiz/vue-api-kit/commit/ae019b0bd40d6489f70e239e35ca52b482a08d7b))

### :white_check_mark: Tests

* add coverage reporting to CI workflow ([b194889](https://github.com/MelvishNiz/vue-api-kit/commit/b194889254652435bb1866c9f30bd1ee3a17f715))
* add unit tests and CI workflow ([b904a71](https://github.com/MelvishNiz/vue-api-kit/commit/b904a71b01512a8b8043cc5843a31dd4f5b47c9f))
* improve CI workflow and add coverage thresholds ([cb24983](https://github.com/MelvishNiz/vue-api-kit/commit/cb249839ea5b120de60d864b38e28431d8010064))

### :repeat: CI

* add test step before release ([4892515](https://github.com/MelvishNiz/vue-api-kit/commit/489251549ac81dd3383228af289fc0fb01b27d79))
* remove push trigger from CI workflow ([158309d](https://github.com/MelvishNiz/vue-api-kit/commit/158309d21aff4bb2b0c4f9af771b825cadf2e31b))
* use Bun instead of npm in CI workflow ([9f7500c](https://github.com/MelvishNiz/vue-api-kit/commit/9f7500c8b36b43ec7eb6ca74ab7fa3703fe8d20c))

## [1.4.0](https://github.com/MelvishNiz/vue-api-kit/compare/v1.3.0...v1.4.0) (2025-12-16)

### :sparkles: Features

* add defineQuery and defineMutation helpers for better type inference ([0b845bc](https://github.com/MelvishNiz/vue-api-kit/commit/0b845bc6c30e7247083d7e1f67636c3461015db7))
* add modular API merge utilities with full type safety ([ebb7b94](https://github.com/MelvishNiz/vue-api-kit/commit/ebb7b94ca5d7840958c1ddb5922e24b52fac09d7))
* integrate product queries and mutations into the API client example ([26e8cc8](https://github.com/MelvishNiz/vue-api-kit/commit/26e8cc8d06d1d2df908ae23922179dbca6a1ce9a))

### :bug: Fixes

* improve type safety in mergeApiDefinitions implementation ([e70d184](https://github.com/MelvishNiz/vue-api-kit/commit/e70d18483176295c3e72654da7248ddb55fdd8c4))

### :memo: Documentation

* add badges for version, install size, bundle size, downloads, CI status, and license to README ([76f7a2d](https://github.com/MelvishNiz/vue-api-kit/commit/76f7a2da652b7cd19fdef8c07ea168e3b997849c))
* add comprehensive examples and guide for modular API feature ([5a55482](https://github.com/MelvishNiz/vue-api-kit/commit/5a554822baaee0f2b577698dbbce0f76173d6fed))
* add example comparing old vs new API with defineQuery/defineMutation ([ef27793](https://github.com/MelvishNiz/vue-api-kit/commit/ef277938d341ed4d17dc0f274cd52f9384514877))

### :zap: Refactor

* remove unused mergeApiDefinitions function and related code ([15fb593](https://github.com/MelvishNiz/vue-api-kit/commit/15fb593c4870d4b3243071ca2d702e9e5ac6ed79))
* remove upload progress handling from createApiClient and related types ([c88776e](https://github.com/MelvishNiz/vue-api-kit/commit/c88776e068647a0fa7487013d8fdd70cef62e8df))

## [1.3.0](https://github.com/MelvishNiz/vue-api-kit/compare/v1.2.0...v1.3.0) (2025-12-16)

### :sparkles: Features

* optimize build size by externalizing dependencies and using tree-shakeable imports ([5e8356f](https://github.com/MelvishNiz/vue-api-kit/commit/5e8356f728cd5a3d8964e3e8a9848fc5e5e81e02))

### :memo: Documentation

* add production-ready features and sideEffects flag for better tree-shaking ([5fdc2c3](https://github.com/MelvishNiz/vue-api-kit/commit/5fdc2c37c945e381015497b16392d91b94150f42))

## [1.2.0](https://github.com/MelvishNiz/vue-api-kit/compare/v1.1.1...v1.2.0) (2025-12-16)

### :sparkles: Features

* add POST method support to queries with full type safety ([f340fc3](https://github.com/MelvishNiz/vue-api-kit/commit/f340fc3c259764ec945d82a623de311434491fda))

### :zap: Refactor

* improve type safety and optimize upload progress handling ([fad85f8](https://github.com/MelvishNiz/vue-api-kit/commit/fad85f8b06c40cbe03075b73b0f2229ee27de978))

## [1.1.1](https://github.com/MelvishNiz/vue-api-kit/compare/v1.1.0...v1.1.1) (2025-12-16)

### :zap: Refactor

* Update mutation structure to use data object for consistency across API calls ([c24006c](https://github.com/MelvishNiz/vue-api-kit/commit/c24006c158cba10df3f02b8c4b2215e8089d8ea9))

## [1.1.0](https://github.com/MelvishNiz/vue-api-kit/compare/v1.0.0...v1.1.0) (2025-12-15)

### :sparkles: Features

* Add npm update step to release workflow for latest package management ([adcd03b](https://github.com/MelvishNiz/vue-api-kit/commit/adcd03b3560fc5e7dae4b0827a1133729a4819b4))
* Enhance API client with request lifecycle hooks for better logging and control ([4a6fd07](https://github.com/MelvishNiz/vue-api-kit/commit/4a6fd078a7e89af8ff3fe9eef79d27e00b2b2886))
* Update README and code documentation for improved clarity and usage examples ([98c54df](https://github.com/MelvishNiz/vue-api-kit/commit/98c54df44cc31ecd9012d5f67c1475275b20ad51))

### :bug: Fixes

* Remove local dependency on vue-api-kit from package.json ([35aa4ff](https://github.com/MelvishNiz/vue-api-kit/commit/35aa4ff231365219f57277f4944d14815722ad51))

### :zap: Refactor

* Update error handling to use errorMessage instead of error across components and API client ([62963a8](https://github.com/MelvishNiz/vue-api-kit/commit/62963a849d0da5c9d7d2f7be120e862a5950df6b))

## 1.0.0 (2025-12-15)

### :sparkles: Features

* add core client, mutation, and query functionalities ([2ae96b4](https://github.com/MelvishNiz/vue-api-kit/commit/2ae96b41cc5c3a18110e25439d0e662417fd4562))
* Add GitHub Actions workflow for automated releases ([8a14537](https://github.com/MelvishNiz/vue-api-kit/commit/8a14537d681690d813f9b53b58fa9572567d9f69))
* Add SinglePost, UpdatePost, and UploadImage components ([8260142](https://github.com/MelvishNiz/vue-api-kit/commit/82601429f13389714a7ad6e73ba4402f0960b762))

### :bug: Fixes

* Update GitHub Actions workflow for improved permissions and versioning ([c351e83](https://github.com/MelvishNiz/vue-api-kit/commit/c351e83dac4776bac7ad3788c03600a840837120))
