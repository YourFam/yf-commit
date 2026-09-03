import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { helpText, parseArgs } from "./args.js";
import {
  hasUsableKey,
  loadConfig,
  resolveSettings,
} from "./config.js";
import { CliError } from "./errors.js";
import {
  commitWithMessage,
  ensureGitRepo,
  getStagedDiff,
  gitAddAll,
  requireStagedDiff,
} from "./git.js";
import {
  isTTY,
  offerInitNow,
  printSetupBlock,
  runInitCommand,
} from "./init.js";
import { completeChat } from "./llm.js";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildSystemPrompt, buildUserPrompt } from "./prompt.js";

const pkg = JSON.parse(
  readFileSync(
    path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "package.json"),
    "utf8",
  ),
);

export async function main(argv) {
  const args = parseArgs(argv);

  if (args.help) {
    console.log(helpText());
    return 0;
  }
  if (args.version) {
    console.log(pkg.version);
    return 0;
  }

  if (args.command === "init") {
    return runInitCommand(args);
  }

  const cwd = process.cwd();
  ensureGitRepo(cwd);

  if (args.all) gitAddAll(cwd);

  const diff = requireStagedDiff(getStagedDiff(cwd));

  let settings = resolveSettings(loadConfig());
  if (!hasUsableKey(settings)) {
    printSetupBlock();
    if (!isTTY()) {
      throw new CliError(
        "Non-interactive stdin: set YF_COMMIT_API_KEY or run yf-commit init in a terminal.",
      );
    }
    const ok = await offerInitNow();
    if (!ok) {
      throw new CliError("No API key. Run yf-commit init or export YF_COMMIT_API_KEY.");
    }
    settings = resolveSettings(loadConfig());
    if (!hasUsableKey(settings)) {
      throw new CliError("No API key. Run yf-commit init or export YF_COMMIT_API_KEY.");
    }
  }

  const message = await completeChat({
    baseUrl: settings.baseUrl,
    model: settings.resolvedModel,
    apiKey: settings.apiKey || "ollama",
    systemPrompt: buildSystemPrompt({ forcedType: args.type }),
    userPrompt: buildUserPrompt(diff),
  });

  if (args.print) {
    console.log(message);
    return 0;
  }

  console.log(message);

  if (!args.auto) {
    if (!isTTY()) {
      throw new CliError(
        "Non-interactive stdin: pass --auto / -y to commit, or --print to only print.",
      );
    }
    const yes = await confirmCommit();
    if (!yes) {
      throw new CliError("Cancelled.");
    }
  }

  commitWithMessage(cwd, message);
  return 0;
}

async function confirmCommit() {
  const rl = createInterface({ input, output });
  try {
    const answer = await rl.question(
      "\nCommit this message? Press Enter or y to commit, n to cancel: ",
    );
    const t = answer.trim().toLowerCase();
    return t === "" || t === "y" || t === "yes";
  } finally {
    rl.close();
  }
}

export function run(argv) {
  main(argv)
    .then((code) => {
      process.exit(typeof code === "number" ? code : 0);
    })
    .catch((err) => {
      const message = err instanceof CliError ? err.message : err.message || String(err);
      console.error(message);
      process.exit(err instanceof CliError ? err.exitCode : 1);
    });
}
