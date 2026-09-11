import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { test } from "node:test";
import { commitWithMessage, getHeadReceipt, requireStagedDiff } from "../src/git.js";
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

test("getHeadReceipt reads short sha, branch, and shortstat", () => {
  const dir = mkdtempSync(path.join(tmpdir(), "yf-commit-"));
  const gitCmd = (args) => {
    const r = spawnSync("git", args, { cwd: dir, encoding: "utf8", windowsHide: true });
    assert.equal(r.status, 0, r.stderr || r.stdout);
    return r.stdout;
  };
  try {
    gitCmd(["init"]);
    gitCmd(["config", "user.email", "t@example.com"]);
    gitCmd(["config", "user.name", "t"]);
    writeFileSync(path.join(dir, "a.txt"), "hello\n");
    writeFileSync(path.join(dir, "b.txt"), "world\n");
    gitCmd(["add", "-A"]);
    commitWithMessage(dir, "test: two files");
    const rec = getHeadReceipt(dir);
    assert.match(rec.shortSha, /^[0-9a-f]{4,}$/);
    assert.ok(rec.branch, "expected a branch name");
    assert.match(rec.shortstat, /2 files changed/);
    assert.match(rec.shortstat, /insertions?\(\+\)/);

    gitCmd(["switch", "--detach", "HEAD"]);
    const detached = getHeadReceipt(dir);
    assert.equal(detached.branch, "");
    assert.equal(detached.shortSha, rec.shortSha);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
