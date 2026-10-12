# password-generator

[Wersja polska](README.md)

The generator builds passwords from the character sets you select. It runs in browsers and Node.js using Web Crypto. Each enabled set contributes at least one character, then the result is shuffled.

## Usage

Download the package for your chosen version from [Releases](https://github.com/K44DEUSZ/password-generator/releases), then install it in your project:

```sh
npm install ./k44deusz-password-generator-1.0.0.tgz
```

```ts
import { generatePassword } from "@k44deusz/password-generator";

const password = generatePassword(24, {
  lower: true,
  upper: true,
  numbers: true,
  symbols: true,
});
```

## Details

Length must be an integer from 1 to 1024 and fit every selected set. The defaults are 24 characters and all four sets; `characterSets` exposes their contents.

Sampling rejects values that would bias a modulo operation. It requires `crypto.getRandomValues`, with no `Math.random` fallback. Use HTTPS or localhost in a browser. A missing or broken source raises `PasswordError` with a stable `code`.

Requiring a character from each set constrains the output space. The library does not calculate entropy or claim uniform sampling across every password that meets those conditions.

## Development

Use Node.js 24 for development. The source is TypeScript; releases contain ESM JavaScript and type declarations.

```sh
npm ci
npm run check
npm test
```

A push to `main` runs checks and tests. Releases are published separately through GitHub Actions, using the version saved in `package.json`. Automation does not change that version or overwrite an existing release. A published release updates the dependency used by the website after its checks pass.

## License

MIT. Copyright 2026 Bartosz Golat.
