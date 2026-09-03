import assert from "node:assert/strict";
import { test } from "node:test";
import { parseArgs } from "../src/args.js";
import { CliError } from "../src/errors.js";

const sh = (...rest) => ["node", "yf-commit", ...rest];

test("default is commit with confirm", () => {
  const a = parseArgs(sh());
  assert.equal(a.command, "commit");
  assert.equal(a.auto, false);
  assert.equal(a.print, false);
});

test("--auto, --yes, and -y are the same", () => {
  for (const flag of ["--auto", "--yes", "-y"]) {
    const a = parseArgs(sh(flag));
    assert.equal(a.auto, true, flag);
  }
});

test("rejects positional yf / y", () => {
  for (const word of ["yf", "y"]) {
    assert.throws(() => parseArgs(sh(word)), CliError);
  }
});

test("init subcommand", () => {
  const a = parseArgs(sh("init", "--show"));
  assert.equal(a.command, "init");
  assert.equal(a.show, true);
});

test("--type name and number", () => {
  assert.equal(parseArgs(sh("--type", "fix")).type, "fix");
  assert.equal(parseArgs(sh("--type", "4")).type, "fix");
  assert.equal(parseArgs(sh("--type=3")).type, "feat");
  assert.equal(parseArgs(sh("--type", "ci")).type, "ci");
  assert.equal(parseArgs(sh("--type", "10")).type, "style");
});

test("--print and --all", () => {
  const a = parseArgs(sh("--print", "--all"));
  assert.equal(a.print, true);
  assert.equal(a.all, true);
});

test("unknown flag", () => {
  assert.throws(() => parseArgs(sh("--force")), CliError);
});
