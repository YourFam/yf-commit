import assert from "node:assert/strict";
import { test } from "node:test";
import { parseType, TYPES } from "../src/types.js";
import { CliError } from "../src/errors.js";

test("1–6 stay chore docs feat fix refactor test", () => {
  assert.equal(TYPES[0], "chore");
  assert.equal(TYPES[1], "docs");
  assert.equal(TYPES[2], "feat");
  assert.equal(TYPES[3], "fix");
  assert.equal(TYPES[4], "refactor");
  assert.equal(TYPES[5], "test");
  assert.equal(parseType("1"), "chore");
  assert.equal(parseType("4"), "fix");
  assert.equal(parseType("6"), "test");
});

test("7–11 are build ci perf style revert", () => {
  assert.deepEqual(TYPES.slice(6), ["build", "ci", "perf", "style", "revert"]);
  assert.equal(parseType("7"), "build");
  assert.equal(parseType("8"), "ci");
  assert.equal(parseType("9"), "perf");
  assert.equal(parseType("10"), "style");
  assert.equal(parseType("11"), "revert");
});

test("names are accepted", () => {
  assert.equal(parseType("Feat"), "feat");
  assert.equal(parseType("CI"), "ci");
  assert.equal(parseType("style"), "style");
  assert.equal(parseType(null), null);
});

test("unknown type", () => {
  assert.throws(() => parseType("wip"), CliError);
  assert.throws(() => parseType("12"), CliError);
  assert.throws(() => parseType("0"), CliError);
});
