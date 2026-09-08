import assert from "node:assert/strict";
import { test } from "node:test";
import { requireStagedDiff } from "../src/git.js";
import { CliError } from "../src/errors.js";

const STAGE_HINT = "Nothing staged. Stage files first, or pass --all.";
const CLEAN = "Nothing to commit, working tree clean.";

test("empty staging with unstaged work hints to stage or --all", () => {
  assert.throws(() => requireStagedDiff("", { dirty: true }), (err) => {
    assert.ok(err instanceof CliError);
    assert.equal(err.message, STAGE_HINT);
    assert.equal(err.exitCode, 1);
    return true;
  });
  assert.throws(() => requireStagedDiff("   \n  ", { dirty: true }), (err) => {
    assert.equal(err.message, STAGE_HINT);
    return true;
  });
});

test("empty staging on a clean tree does not suggest --all", () => {
  assert.throws(() => requireStagedDiff(""), (err) => {
    assert.ok(err instanceof CliError);
    assert.equal(err.message, CLEAN);
    assert.equal(err.exitCode, 1);
    return true;
  });
  assert.throws(() => requireStagedDiff("", { dirty: false }), (err) => {
    assert.equal(err.message, CLEAN);
    return true;
  });
});

test("empty staging after --all does not suggest --all again", () => {
  assert.throws(() => requireStagedDiff("", { all: true, dirty: true }), (err) => {
    assert.ok(err instanceof CliError);
    assert.equal(err.message, CLEAN);
    return true;
  });
  assert.throws(() => requireStagedDiff("", { all: true, dirty: false }), (err) => {
    assert.equal(err.message, CLEAN);
    return true;
  });
});

test("non-empty diff passes through", () => {
  const diff = "diff --git a/a b/a\n+hi\n";
  assert.equal(requireStagedDiff(diff), diff);
  assert.equal(requireStagedDiff(diff, { all: true, dirty: true }), diff);
});
