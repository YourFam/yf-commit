import assert from "node:assert/strict";
import { test } from "node:test";
import { parseType, TYPES } from "../src/types.js";
import { CliError } from "../src/errors.js";

test("1–6 map is chore docs feat fix refactor test", () => {
  assert.deepEqual(TYPES, ["chore", "docs", "feat", "fix", "refactor", "test"]);
  assert.equal(parseType("1"), "chore");
  assert.equal(parseType("2"), "docs");
  assert.equal(parseType("3"), "feat");
  assert.equal(parseType("4"), "fix");
  assert.equal(parseType("5"), "refactor");
  assert.equal(parseType("6"), "test");
});

test("names are accepted", () => {
  assert.equal(parseType("Feat"), "feat");
  assert.equal(parseType(null), null);
});

test("unknown type", () => {
  assert.throws(() => parseType("style"), CliError);
});
