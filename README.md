# password-generator

Dependency-free password generation using Web Crypto and unbiased random sampling.

Independent TypeScript source, ESM JavaScript releases and generated type declarations. No React, Next.js, runtime dependencies, UI or private application configuration.

## Installation

Download a versioned package from [Releases](https://github.com/K44DEUSZ/password-generator/releases), then install it:

```sh
npm install ./k44deusz-password-generator-1.0.0.tgz
```

Packages are distributed as GitHub release assets; no npm-registry publication is implied.

## Usage

```ts
import { generatePassword } from "@k44deusz/password-generator";

const password = generatePassword(24, {
  lower: true,
  upper: true,
  numbers: true,
  symbols: true,
});
```

## Contract

`generatePassword(length = 24, options = defaultOptions)` returns a password with an integer length from 1 to 1024. Options contain the four boolean fields shown above. At least one set must be enabled, and length must be at least the number of enabled sets. Every enabled set contributes a character, then the result is shuffled.

Requires `globalThis.crypto.getRandomValues`, available in current browsers in secure contexts and Node.js 20+. There is no `Math.random` fallback, storage or networking. Sampling rejects the incomplete remainder before applying modulo; a broken random source is rejected after bounded attempts. Requiring each enabled group constrains the output distribution; passwords are not claimed to be uniformly sampled from every possible valid string. The library does not estimate strength or entropy.

`PasswordError.code` is stable: `invalid_length`, `invalid_options`, `empty_character_set`, `length_below_group_count`, `secure_random_unavailable`, `random_source_failure`. `characterSets` and `defaultOptions` are read-only exports.

## Development

Use Node.js 24 for development and CI.

```sh
npm ci
npm run check
npm test
```

A successful push to main creates a tested versioned release. If the package version already exists, the release workflow increments its patch version and commits that metadata. Explicit higher versions are preserved. Release artifacts include compiled JavaScript, declarations and this license.

## License

MIT. Copyright 2026 Bartosz Golat.
