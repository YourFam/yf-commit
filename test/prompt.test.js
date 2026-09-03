import assert from "node:assert/strict";
import { test } from "node:test";
import {
  buildSystemPrompt,
  buildUserPrompt,
  cleanMessage,
  looksLikeLockedFormat,
} from "../src/prompt.js";

test("system prompt uses locked sections and no YourFam / Timentra", () => {
  const p = buildSystemPrompt();
  assert.match(p, /💡 WHY:/);
  assert.match(p, /🔧 WHAT CHANGED:/);
  assert.match(p, /📁 FILES IMPACTED:/);
  assert.doesNotMatch(p, /YourFam/);
  assert.doesNotMatch(p, /Timentra/);
  assert.doesNotMatch(p, /monorepo called/i);
  assert.match(p, /WORKTREE/);
  assert.match(p, /Do not add WORKTREE/);
  for (const t of ["feat", "fix", "ci", "build", "perf", "style", "revert"]) {
    assert.match(p, new RegExp(`\\b${t}\\b`));
  }
  assert.match(p, /dominant type/i);
  assert.match(p, /Mixed diffs are normal/);
});

test("forced type is required in the prompt", () => {
  const p = buildSystemPrompt({ forcedType: "fix" });
  assert.match(p, /MUST use type "fix"/);
  assert.match(p, /🐛/);
});

test("user prompt wraps the diff", () => {
  const u = buildUserPrompt("diff --git a/x b/x");
  assert.match(u, /staged git diff/);
  assert.match(u, /diff --git a\/x b\/x/);
});

test("cleanMessage strips fences and trailers", () => {
  const raw = "```\n✨ feat(x): hi\n\nWORKTREE: foo\n```";
  const cleaned = cleanMessage(raw);
  assert.match(cleaned, /✨ feat\(x\): hi/);
  assert.doesNotMatch(cleaned, /WORKTREE/);
  assert.doesNotMatch(cleaned, /```/);
});

test("looksLikeLockedFormat", () => {
  const msg = `✨ feat(cli): x

💡 WHY:
- a

🔧 WHAT CHANGED:
- b

📁 FILES IMPACTED:
- src/index.js
`;
  assert.equal(looksLikeLockedFormat(msg), true);
  assert.equal(looksLikeLockedFormat("feat: x"), false);
});
