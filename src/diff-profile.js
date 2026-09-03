const ORDER = ["tiny", "small", "medium", "large", "xl"];

export const PROFILES = {
  tiny: {
    id: "tiny",
    why: "exactly 1 bullet",
    what: "exactly 1 bullet",
    groupWhat: false,
    maxTokens: 400,
  },
  small: {
    id: "small",
    why: "1–2 bullets",
    what: "2–3 bullets",
    groupWhat: false,
    maxTokens: 700,
  },
  medium: {
    id: "medium",
    why: "2–3 bullets",
    what: "4–6 bullets",
    groupWhat: false,
    maxTokens: 1200,
  },
  large: {
    id: "large",
    why: "2–3 bullets",
    what: "6–10 bullets, grouped by area if needed",
    groupWhat: true,
    maxTokens: 1800,
  },
  xl: {
    id: "xl",
    why: "2–4 bullets (do not grow WHY with every file)",
    what: "8–14 bullets, grouped by area",
    groupWhat: true,
    maxTokens: 2500,
  },
};

/**
 * Count changed lines (+ and −, excluding +++ / --- headers) and files.
 * @param {string} diff
 */
export function countDiff(diff) {
  const lines = String(diff).split(/\r?\n/);
  let loc = 0;
  const files = new Set();

  for (const line of lines) {
    if (line.startsWith("diff --git ")) {
      const m = line.match(/^diff --git a\/(.+) b\/(.+)$/);
      if (m) {
        const path = m[2] === "/dev/null" ? m[1] : m[2];
        files.add(path.replace(/^"|"$/g, ""));
      }
      continue;
    }
    if (line.startsWith("Binary files ")) {
      loc += 1;
      continue;
    }
    if (line.startsWith("+") && !line.startsWith("+++")) {
      loc += 1;
      continue;
    }
    if (line.startsWith("-") && !line.startsWith("---")) {
      loc += 1;
    }
  }

  return { loc, files: files.size };
}

function profileIdFromLoc(loc) {
  if (loc <= 20) return "tiny";
  if (loc <= 80) return "small";
  if (loc <= 300) return "medium";
  if (loc <= 800) return "large";
  return "xl";
}

function applyFileFloor(id, fileCount) {
  let i = ORDER.indexOf(id);
  if (fileCount >= 8) i = Math.max(i, ORDER.indexOf("small"));
  if (fileCount >= 20) i = Math.max(i, ORDER.indexOf("medium"));
  return ORDER[i];
}

/**
 * @param {string} diff
 */
export function diffProfile(diff) {
  const { loc, files } = countDiff(diff);
  const id = applyFileFloor(profileIdFromLoc(loc), files);
  const spec = PROFILES[id];
  return { ...spec, loc, files };
}

/**
 * @param {ReturnType<typeof diffProfile>} profile
 */
export function lengthInstruction(profile) {
  const fileNote =
    profile.files >= 8
      ? "FILES IMPACTED: list real paths; group under area headings if that helps. Never write \"Updated N files.\""
      : "FILES IMPACTED: list each real path. Never write \"Updated N files.\"";

  return `Diff size: ${profile.loc} line(s), ${profile.files} file(s). Profile: ${profile.id}.
WHY: ${profile.why}. Reasons only — do not recap every file.
WHAT CHANGED: ${profile.what}.
${fileNote}
Do not add extra bullets to look complete. Do not pad.`;
}
