import { spawnSync } from "node:child_process";
import { CliError } from "./errors.js";

/**
 * @param {string} cwd
 * @param {string[]} args
 * @param {{ input?: string }} [opts]
 */
function git(cwd, args, opts = {}) {
  const result = spawnSync("git", args, {
    cwd,
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
    input: opts.input,
    windowsHide: true,
    env: opts.env ? { ...process.env, ...opts.env } : process.env,
  });
  if (result.error) {
    if (result.error.code === "ENOENT") {
      throw new CliError("git was not found on PATH.");
    }
    throw new CliError(result.error.message);
  }
  if (result.status !== 0) {
    const err = (result.stderr || result.stdout || "").trim();
    throw new CliError(err || `git ${args.join(" ")} failed`);
  }
  return result.stdout ?? "";
}

/**
 * @param {string} cwd
 */
export function ensureGitRepo(cwd) {
  try {
    const out = git(cwd, ["rev-parse", "--is-inside-work-tree"]).trim();
    if (out !== "true") {
      throw new CliError("Not a git work tree. Run this from a git repository.");
    }
  } catch (err) {
    if (err instanceof CliError) {
      if (/not a git repository/i.test(err.message)) {
        throw new CliError("Not a git work tree. Run this from a git repository.");
      }
      throw err;
    }
    throw new CliError("Not a git work tree. Run this from a git repository.");
  }
}

/**
 * @param {string} cwd
 */
export function gitAddAll(cwd) {
  git(cwd, ["add", "-A"]);
}

/**
 * @param {string} cwd
 */
export function getStagedDiff(cwd) {
  return git(cwd, ["diff", "--cached"]);
}

/**
 * Unstaged, untracked, or staged-but-uncommitted paths.
 * @param {string} cwd
 */
export function isWorkingTreeDirty(cwd) {
  return git(cwd, ["status", "--porcelain"]).trim() !== "";
}

/**
 * @param {string} diff
 * @param {{ all?: boolean, dirty?: boolean }} [opts]
 */
export function requireStagedDiff(diff, { all = false, dirty = false } = {}) {
  if (!diff || !String(diff).trim()) {
    if (all || !dirty) {
      throw new CliError("Nothing to commit, working tree clean.");
    }
    throw new CliError("Nothing staged. Stage files first, or pass --all.");
  }
  return diff;
}

/**
 * @param {string} cwd
 * @param {string} message
 */
export function commitWithMessage(cwd, message) {
  git(cwd, ["commit", "-F", "-"], { input: message });
}

/**
 * Identity of HEAD after a successful commit.
 * `branch` is empty when detached.
 * @param {string} cwd
 * @returns {{ shortSha: string, branch: string, shortstat: string }}
 */
export function getHeadReceipt(cwd) {
  const shortSha = git(cwd, ["rev-parse", "--short", "HEAD"]).trim();
  const branch = git(cwd, ["branch", "--show-current"]).trim();
  const shortstat = git(
    cwd,
    ["diff-tree", "--no-commit-id", "--shortstat", "-r", "--root", "HEAD"],
    { env: { LC_ALL: "C", LANG: "C" } },
  );
  return { shortSha, branch, shortstat };
}
