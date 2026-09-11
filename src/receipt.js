import pc from "picocolors";

/** Unicode minus, as in `+87/−12`. */
const MINUS = "\u2212";

/**
 * @param {string} text `git diff-tree --shortstat` output
 * @returns {{ files: number, insertions: number, deletions: number }}
 */
export function parseShortstat(text) {
  const s = String(text || "").trim();
  const files = /(\d+) files? changed/.exec(s);
  const ins = /(\d+) insertions?/.exec(s);
  const del = /(\d+) deletions?/.exec(s);
  return {
    files: files ? Number(files[1]) : 0,
    insertions: ins ? Number(ins[1]) : 0,
    deletions: del ? Number(del[1]) : 0,
  };
}

/**
 * @param {{ files: number, insertions: number, deletions: number }} stats
 */
export function formatStats(stats) {
  const n = stats.files;
  const fileLabel = n === 1 ? "1 file" : `${n} files`;
  return `${fileLabel}, +${stats.insertions}${MINUS}${stats.deletions}`;
}

/**
 * Color when stdout is a TTY, unless NO_COLOR / --no-color.
 * FORCE_COLOR / --color turns it on even when piped.
 */
export function receiptColors() {
  const argv = process.argv;
  if (process.env.NO_COLOR || argv.includes("--no-color")) {
    return pc.createColors(false);
  }
  if (process.env.FORCE_COLOR || argv.includes("--color")) {
    return pc.createColors(true);
  }
  return pc.createColors(Boolean(process.stdout.isTTY));
}

/**
 * @param {{ shortSha: string, branch: string, shortstat: string }} info
 * @param {ReturnType<typeof pc.createColors>} [colors]
 */
export function formatReceipt(info, colors = receiptColors()) {
  const stats = formatStats(parseShortstat(info.shortstat));
  const where = info.branch || "(detached HEAD)";
  return [
    colors.green("committed"),
    colors.cyan(colors.bold(info.shortSha)),
    colors.magenta(where),
    colors.dim(stats),
  ].join("  ");
}

/**
 * @param {{ shortSha: string, branch: string, shortstat: string }} info
 * @param {string} message
 */
export function printAutoReceipt(info, message) {
  console.log(formatReceipt(info));
  console.log();
  console.log(message);
}

/**
 * @param {{ shortSha: string, branch: string, shortstat: string }} info
 */
export function printConfirmReceipt(info) {
  console.log(formatReceipt(info));
}
