export type PasswordOptions = {
  lower: boolean;
  upper: boolean;
  numbers: boolean;
  symbols: boolean;
};
export type PasswordErrorCode =
  | "invalid_length"
  | "invalid_options"
  | "empty_character_set"
  | "length_below_group_count"
  | "secure_random_unavailable"
  | "random_source_failure";

export class PasswordError extends Error {
  constructor(public readonly code: PasswordErrorCode) {
    super(code);
    this.name = "PasswordError";
  }
}

export const characterSets = Object.freeze({
  lower: "abcdefghijklmnopqrstuvwxyz",
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{};:,.?/",
});
export const defaultOptions: Readonly<PasswordOptions> = Object.freeze({
  lower: true,
  upper: true,
  numbers: true,
  symbols: true,
});

function randomIndex(max: number): number {
  const source = globalThis.crypto;
  if (!source?.getRandomValues) throw new PasswordError("secure_random_unavailable");
  const limit = Math.floor(0x100000000 / max) * max;
  const values = new Uint32Array(1);
  // Reject the incomplete remainder to avoid modulo bias. Bound retries for broken sources.
  for (let attempt = 0; attempt < 128; attempt += 1) {
    source.getRandomValues(values);
    if (values[0] < limit) return values[0] % max;
  }
  throw new PasswordError("random_source_failure");
}

/** Uses Web Crypto only. The returned password is never stored or transmitted. */
export function generatePassword(length = 24, options: PasswordOptions = defaultOptions): string {
  if (!Number.isSafeInteger(length) || length < 1 || length > 1024)
    throw new PasswordError("invalid_length");
  const keys = Object.keys(characterSets) as (keyof PasswordOptions)[];
  if (
    !options ||
    typeof options !== "object" ||
    keys.some((key) => typeof options[key] !== "boolean")
  )
    throw new PasswordError("invalid_options");
  const enabled = keys.filter((key) => options[key]).map((key) => characterSets[key]);
  if (!enabled.length) throw new PasswordError("empty_character_set");
  if (length < enabled.length) throw new PasswordError("length_below_group_count");
  const pool = enabled.join("");
  const chars = enabled.map((group) => group[randomIndex(group.length)]);
  while (chars.length < length) chars.push(pool[randomIndex(pool.length)]);
  for (let index = chars.length - 1; index > 0; index -= 1) {
    const other = randomIndex(index + 1);
    [chars[index], chars[other]] = [chars[other], chars[index]];
  }
  return chars.join("");
}
