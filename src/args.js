import { CliError } from "./errors.js";
import { parseType, typeHelpLines } from "./types.js";

/**
 * @typedef {object} ParsedArgs
 * @property {"commit" | "init"} command
 * @property {boolean} auto
 * @property {boolean} all
 * @property {boolean} print
 * @property {string | null} type
 * @property {boolean} show
 * @property {boolean} reset
 * @property {boolean} help
 * @property {boolean} version
 */

/**
 * @param {string[]} argv process.argv
 * @returns {ParsedArgs}
 */
export function parseArgs(argv) {
  const args = argv.slice(2);
  /** @type {ParsedArgs} */
  const result = {
    command: "commit",
    auto: false,
    all: false,
    print: false,
    type: null,
    show: false,
    reset: false,
    help: false,
    version: false,
  };

  let i = 0;
  if (args[0] === "init") {
    result.command = "init";
    i = 1;
  }

  while (i < args.length) {
    const a = args[i];
    if (a === "--auto" || a === "--yes" || a === "-y") {
      result.auto = true;
    } else if (a === "--all") {
      result.all = true;
    } else if (a === "--print") {
      result.print = true;
    } else if (a === "--show") {
      result.show = true;
    } else if (a === "--reset") {
      result.reset = true;
    } else if (a === "--help" || a === "-h") {
      result.help = true;
    } else if (a === "--version" || a === "-V") {
      result.version = true;
    } else if (a === "--type") {
      const value = args[i + 1];
      if (value == null || value.startsWith("-")) {
        throw new CliError("Flag --type requires a value: feat|fix|… or 1–11.");
      }
      result.type = parseType(value);
      i += 1;
    } else if (a.startsWith("--type=")) {
      result.type = parseType(a.slice("--type=".length));
    } else if (a.startsWith("-")) {
      throw new CliError(
        `Unknown flag: ${a}\nSee yf-commit --help`,
      );
    } else {
      throw new CliError(
        `Unknown argument: ${a}\nNot a command. Use yf-commit, yf-commit init, or flags like -y / --auto.`,
      );
    }
    i += 1;
  }

  if (result.command === "commit") {
    if (result.show) {
      throw new CliError("Use yf-commit init --show");
    }
    if (result.reset) {
      throw new CliError("Use yf-commit init --reset");
    }
  }

  return result;
}

export function helpText() {
  return `yf-commit — AI commit message from your staged git diff

Usage:
  yf-commit              Generate, print draft, confirm, then git commit
  yf-commit -y           Commit immediately (also --yes, --auto)
  yf-commit --print      Print message only; do not commit
  yf-commit --all        git add -A, then same as default
  yf-commit --type fix   Force type (name or 1–11)
  yf-commit init         Provider, model, API key → ~/.yf-commit/config.json
  yf-commit init --show  Masked status
  yf-commit init --reset Delete saved config

Types (mixed diffs: one dominant type, not a blend):
${typeHelpLines()}

This does not run your test suite. YourFam does not give you an API key.

Need a host we don't list? Set YF_COMMIT_BASE_URL and YF_COMMIT_MODEL.`;
}
