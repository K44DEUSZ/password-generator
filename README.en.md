# password-generator

[Wersja polska](README.md)

The generator builds passwords from the character sets you select. It runs in browsers and Node.js using Web Crypto. Each enabled set contributes at least one character, then the result is shuffled.

Release 1.0.1 includes the audit fixes and preserves the existing API. The changelog stays in the repository and is excluded from the package.

## Usage

Download the package for your chosen version from [Releases](https://github.com/K44DEUSZ/password-generator/releases), then install it in your project:

```sh
npm install ./k44deusz-password-generator-1.0.1.tgz
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

## API

| Export                                                    | Contract                                                                                                           |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `generatePassword(length = 24, options = defaultOptions)` | Synchronously returns an ASCII string of the requested length. `length` must be an integer number in `1..1024`.    |
| `PasswordOptions`                                         | An object with four required booleans: `lower`, `upper`, `numbers`, `symbols`. At least one group must be enabled. |
| `characterSets`                                           | A frozen object exposing each group's alphabet. Read it; it is not configuration.                                  |
| `defaultOptions`                                          | A frozen object enabling all four groups. Copy it to change settings.                                              |
| `PasswordError`, `PasswordErrorCode`                      | An error class extending `Error` and a TypeScript union of codes.                                                  |

The generator selects one character from each group, fills the rest from their combined alphabet, then applies a Fisher-Yates shuffle. Every index sample rejects the incomplete part of the 32-bit range. After 128 rejected attempts for one index, generation fails instead of hanging on a broken source. Disabled groups cannot appear in the result.

| `PasswordError.code`        | Cause                                                             |
| --------------------------- | ----------------------------------------------------------------- |
| `invalid_length`            | A non-number, fraction or length outside the limits.              |
| `invalid_options`           | A required boolean is missing or the options have the wrong type. |
| `empty_character_set`       | All groups are disabled.                                          |
| `length_below_group_count`  | The length is below the enabled group count.                      |
| `secure_random_unavailable` | `crypto.getRandomValues` is unavailable.                          |
| `random_source_failure`     | The source threw or exhausted the retry limit.                    |

Arguments are not coerced. Passing `undefined` uses the default; `null` is invalid.

## Node.js and browsers

This ESM package has no DOM or framework dependency. In Node.js, use `.mjs` or `"type": "module"` and a runtime exposing global Web Crypto. In browsers, use a bundler or import `dist/index.js` as a module. There is no separate CommonJS export. The library does not render a UI, copy to the clipboard or store its result.

```js
import { generatePassword, defaultOptions, PasswordError } from "@k44deusz/password-generator";

try {
  const password = generatePassword(24, { ...defaultOptions, symbols: false });
  // Pass the result to your interface; do not log passwords.
  password.length; // 24
} catch (error) {
  if (!(error instanceof PasswordError)) throw error;
  // Display a translated message; never replace Web Crypto with Math.random.
  console.error(error.code);
}
```

## Development

Use Node.js 24 for development. The source is TypeScript; releases contain ESM JavaScript and type declarations.

```sh
npm ci
npm run check
npm test
npm run check:package
```

A push to `main` runs checks and tests. Releases are published separately through GitHub Actions, using the version saved in `package.json`. Automation does not change that version or overwrite an existing release. A published release updates the dependency used by the website after its checks pass.

## License

MIT. Copyright 2026 Bartosz Golat.
