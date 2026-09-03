import { CliError } from "./errors.js";

/** Alphabetical 1–6 map: chore, docs, feat, fix, refactor, test */
export const TYPES = ["chore", "docs", "feat", "fix", "refactor", "test"];

export const TYPE_EMOJI = {
  feat: "✨",
  fix: "🐛",
  refactor: "♻️",
  chore: "🔧",
  docs: "📝",
  test: "🧪",
};

/**
 * @param {string | null | undefined} raw
 * @returns {string | null}
 */
export function parseType(raw) {
  if (raw == null || raw === "") return null;
  const s = String(raw).trim().toLowerCase();
  if (/^[1-6]$/.test(s)) return TYPES[Number(s) - 1];
  if (TYPES.includes(s)) return s;
  throw new CliError(
    `Unknown type "${raw}". Use feat, fix, refactor, chore, docs, test, or 1–6.`,
  );
}
