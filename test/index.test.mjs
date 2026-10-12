import assert from "node:assert/strict";
import test from "node:test";
import { generatePassword, defaultOptions, characterSets, PasswordError } from "../dist/index.js";

test("generates the requested length and includes every enabled group", () => {
  for (const length of [4, 12, 24, 64, 1024]) {
    const value = generatePassword(length);
    assert.equal(value.length, length);
    for (const group of Object.values(characterSets))
      assert.ok([...value].some((character) => group.includes(character)));
  }
  for (const group of Object.keys(defaultOptions)) {
    const options = Object.fromEntries(
      Object.keys(defaultOptions).map((key) => [key, key === group]),
    );
    for (const length of [1, 32]) {
      const value = generatePassword(length, options);
      assert.equal(value.length, length);
      assert.ok([...value].every((character) => characterSets[group].includes(character)));
    }
  }
  assert.ok(Object.isFrozen(characterSets));
  assert.ok(Object.isFrozen(defaultOptions));
});

test("validates public API inputs before producing output", () => {
  for (const length of [0, -1, 1025, 2.5, NaN, Infinity, "24"])
    assert.throws(() => generatePassword(length), { code: "invalid_length" });
  for (const options of [null, {}, { ...defaultOptions, lower: "yes" }])
    assert.throws(() => generatePassword(24, options), { code: "invalid_options" });
  assert.throws(
    () => generatePassword(24, { lower: false, upper: false, numbers: false, symbols: false }),
    { code: "empty_character_set" },
  );
  assert.throws(() => generatePassword(3), { code: "length_below_group_count" });
});

test("rejects biased tail values and never calls Math.random", (context) => {
  context.mock.method(Math, "random", () => {
    throw new Error("Insecure fallback called");
  });
  let calls = 0;
  context.mock.method(globalThis.crypto, "getRandomValues", (values) => {
    values[0] = calls++ === 0 ? 0xffffffff : 0;
    return values;
  });
  assert.equal(
    generatePassword(1, { lower: false, upper: false, numbers: true, symbols: false }),
    "0",
  );
  assert.equal(calls, 2);
});

test("fails rather than silently replacing a missing or broken secure source", (context) => {
  context.mock.method(globalThis.crypto, "getRandomValues", (values) => {
    values[0] = 0xffffffff;
    return values;
  });
  assert.throws(
    () => generatePassword(1, { lower: false, upper: false, numbers: true, symbols: false }),
    { code: "random_source_failure" },
  );
  assert.ok(new PasswordError("invalid_length") instanceof Error);
});

test("missing Web Crypto is rejected explicitly", () => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, "crypto");
  try {
    Object.defineProperty(globalThis, "crypto", { configurable: true, value: undefined });
    assert.throws(() => generatePassword(), { code: "secure_random_unavailable" });
  } finally {
    Object.defineProperty(globalThis, "crypto", descriptor);
  }
});
