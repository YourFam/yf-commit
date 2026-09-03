import assert from "node:assert/strict";
import { test } from "node:test";
import { requireStagedDiff } from "../src/git.js";
import { CliError } from "../src/errors.js";

test("empty staging is a one-line error", () => {
  assert.throws(() => requireStagedDiff(""), (err) => {
    assert.ok(err instanceof CliError);
    assert.equal(err.message, "Nothing staged. Stage files first, or pass --all.");
    assert.equal(err.exitCode, 1);
    return true;
  });
  assert.throws(() => requireStagedDiff("   \n  "), CliError);
});

test("non-empty diff passes through", () => {
  const diff = "diff --git a/a b/a\n+hi\n";
  assert.equal(requireStagedDiff(diff), diff);
});
