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
test("a rejected random request reports a stable API error", (context) => {
  context.mock.method(globalThis.crypto, "getRandomValues", () => {
    throw new Error("Random source rejected the request");
  });
  assert.throws(() => generatePassword(), { name: "PasswordError", code: "random_source_failure" });
});

test("every nonempty group combination stays within its alphabet and required length", (context) => {
  let state = 123456789;
  context.mock.method(globalThis.crypto, "getRandomValues", (values) => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    values[0] = state;
    return values;
  });
  const keys = Object.keys(defaultOptions);
  for (let mask = 1; mask < 16; mask += 1) {
    const options = Object.fromEntries(
      keys.map((key, index) => [key, Boolean(mask & (1 << index))]),
    );
    const enabled = keys.filter((key) => options[key]);
    const alphabet = enabled.map((key) => characterSets[key]).join("");
    for (const length of [enabled.length, 12, 24, 1024]) {
      const value = generatePassword(length, options);
      assert.equal(value.length, length);
      assert.ok([...value].every((character) => alphabet.includes(character)));
      for (const key of enabled)
        assert.ok([...value].some((character) => characterSets[key].includes(character)));
    }
    if (enabled.length > 1)
      assert.throws(() => generatePassword(enabled.length - 1, options), {
        code: "length_below_group_count",
      });
  }
});

test("rejection sampling accepts its last unbiased value and bounds broken-provider retries", (context) => {
  const options = { lower: false, upper: false, numbers: true, symbols: false };
  const limit = Math.floor(0x100000000 / 10) * 10;
  let calls = 0;
  context.mock.method(globalThis.crypto, "getRandomValues", (values) => {
    calls += 1;
    values[0] = calls < 128 ? limit : limit - 1;
    return values;
  });
  assert.equal(generatePassword(1, options), "9");
  assert.equal(calls, 128);
  calls = 0;
  context.mock.method(globalThis.crypto, "getRandomValues", (values) => {
    calls += 1;
    values[0] = limit;
    return values;
  });
  assert.throws(() => generatePassword(1, options), {
    name: "PasswordError",
    code: "random_source_failure",
  });
  assert.equal(calls, 128);
});

test("invalid JavaScript arguments fail before requesting randomness", (context) => {
  context.mock.method(globalThis.crypto, "getRandomValues", () => {
    assert.fail("Invalid input requested randomness");
  });
  for (const length of [null, "24", 24n, {}, [], Number.MAX_SAFE_INTEGER, -Infinity])
    assert.throws(() => generatePassword(length), {
      name: "PasswordError",
      code: "invalid_length",
    });
  for (const options of [false, "lower", 1, [], {}, null, { ...defaultOptions, upper: undefined }])
    assert.throws(() => generatePassword(24, options), {
      name: "PasswordError",
      code: "invalid_options",
    });
});
