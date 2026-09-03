import { TYPE_EMOJI } from "./types.js";

const MAX_DIFF_CHARS = 100_000;

export function buildSystemPrompt({ forcedType } = {}) {
  const typeLine = forcedType
    ? `You MUST use type "${forcedType}" and emoji ${TYPE_EMOJI[forcedType]} on line 1.`
    : "Use conventional commit types: feat, fix, refactor, chore, docs, test.";

  return `You are a commit message generator. Output only the commit message. No preamble, no markdown fences, no extra commentary.

Follow this exact format:

emoji type(scope): brief description

💡 WHY:
- …

🔧 WHAT CHANGED:
- …

📁 FILES IMPACTED:
- path/relative/to/this/repo

Rules:
- ${typeLine}
- Emoji on line 1 (✨ feat, 🐛 fix, ♻️ refactor, 🔧 chore, 📝 docs, 🧪 test).
- First line under 72 characters.
- WHY: user/business impact, plain language.
- WHAT CHANGED: technical, from the diff, not staging stats.
- FILES IMPACTED: paths relative to this repository's root (the current working directory).
- Adaptive length: tiny diffs → few bullets; large diffs → more, grouped if needed. Never pad. Never write "Updated N staged file(s)."
- No footer. Do not add WORKTREE, BRANCH, MACHINE, or hostname lines.
- Do not mention any product or company unless it appears in the diff.`;
}

export function buildUserPrompt(diff) {
  let body = String(diff);
  if (body.length > MAX_DIFF_CHARS) {
    body = `${body.slice(0, MAX_DIFF_CHARS)}\n\n[diff truncated]`;
  }
  return `Generate a commit message for this staged git diff:\n\n${body}`;
}

export function cleanMessage(text) {
  let t = String(text || "").trim();
  if (!t) return "";
  if (t.startsWith("```")) {
    t = t.replace(/^```[a-zA-Z]*\r?\n?/, "").replace(/\r?\n?```$/, "").trim();
  }
  t = t.replace(/\n(?:WORKTREE|BRANCH|MACHINE)\b.*$/gim, "").trim();
  return t;
}

export function looksLikeLockedFormat(message) {
  return (
    /💡 WHY:/m.test(message) &&
    /🔧 WHAT CHANGED:/m.test(message) &&
    /📁 FILES IMPACTED:/m.test(message)
  );
}
