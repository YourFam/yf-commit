import { CliError } from "./errors.js";

/**
 * 1–6 stay stable (chore, docs, feat, fix, refactor, test).
 * 7–11 are the extra conventional types.
 */
export const TYPES = [
  "chore",
  "docs",
  "feat",
  "fix",
  "refactor",
  "test",
  "build",
  "ci",
  "perf",
  "style",
  "revert",
];

export const TYPE_EMOJI = {
  feat: "✨",
  fix: "🐛",
  refactor: "♻️",
  chore: "🔧",
  docs: "📝",
  test: "🧪",
  build: "📦",
  ci: "👷",
  perf: "⚡",
  style: "🎨",
  revert: "⏪",
};

export const TYPE_DEFS = {
  feat: "User-visible new capability",
  fix: "User-visible bug",
  docs: "Documentation only, no product code",
  test: "Tests only",
  revert: "Undoes a previous commit",
  perf: "Same behavior, measurably faster",
  refactor: "Same behavior, different structure",
  style: "Formatting only, zero logic",
  ci: "Pipeline / GitHub Actions / hooks only",
  build: "Compile, bundler, packaging only",
  chore: "Maintenance that is none of the above",
};

/** Mixed diffs: one primary type, not a blend. */
export const TYPE_PRIORITY = `Pick exactly one type for the whole commit. Mixed diffs are normal — choose the dominant type, in this order:
1. revert — the change undoes a previous commit
2. fix — any user-visible bug
3. feat — any user-visible new capability (tests/docs/formatting in the same diff stay feat)
4. test — tests only
5. docs — docs only
6. perf — same feature, measurably faster (not a bugfix)
7. refactor — same behavior, different structure (not formatting-only)
8. style — formatting / lint only, zero logic
9. ci — CI / GitHub Actions / hooks only
10. build — compile, bundler, native addons, packaging only
11. chore — everything else (deps, ignore files, version bump with no product change)
Do not invent extra types. Do not combine types.`;

/**
 * @param {string | null | undefined} raw
 * @returns {string | null}
 */
export function parseType(raw) {
  if (raw == null || raw === "") return null;
  const s = String(raw).trim().toLowerCase();
  if (/^\d+$/.test(s)) {
    const n = Number(s);
    if (n >= 1 && n <= TYPES.length) return TYPES[n - 1];
  }
  if (TYPES.includes(s)) return s;
  throw new CliError(
    `Unknown type "${raw}". Use ${TYPES.join(", ")}, or 1–${TYPES.length}.`,
  );
}

export function typeHelpLines() {
  return TYPES.map((name, i) => {
    const n = i + 1;
    return `  ${n}. ${TYPE_EMOJI[name]} ${name} — ${TYPE_DEFS[name]}`;
  }).join("\n");
}
