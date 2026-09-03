import * as p from "@clack/prompts";
import { CliError } from "./errors.js";
import {
  configPath,
  deleteConfig,
  loadConfig,
  maskKey,
  saveConfig,
} from "./config.js";
import { PROVIDERS, providerById } from "./providers.js";

export function printSetupBlock() {
  console.error(`This tool needs an OpenAI-compatible API key (OpenAI, DeepSeek, xAI, Groq, Ollama).
Create a key at the provider; YourFam does not issue keys.

Then either:
  yf-commit init
  export YF_COMMIT_API_KEY=...
`);
}

export function isTTY() {
  return Boolean(process.stdin.isTTY && process.stdout.isTTY);
}

export async function runInitCommand({ show, reset }) {
  if (reset) {
    const removed = deleteConfig();
    if (removed) console.error(`Deleted ${configPath()}`);
    else console.error("No config file to delete.");
    return 0;
  }
  if (show) {
    showStatus();
    return 0;
  }
  if (!isTTY()) {
    printSetupBlock();
    throw new CliError("Non-interactive stdin: set YF_COMMIT_API_KEY or run yf-commit init in a terminal.");
  }
  await runWizard();
  return 0;
}

export function showStatus() {
  const file = loadConfig();
  if (!file) {
    console.error("No config at " + configPath());
    console.error("Run yf-commit init or set YF_COMMIT_API_KEY.");
    return;
  }
  console.error(`provider: ${file.provider || "(none)"}`);
  console.error(`model:    ${file.model || "(none)"}`);
  console.error(`baseUrl:  ${file.baseUrl || "(none)"}`);
  console.error(`apiKey:   ${maskKey(file.apiKey || "")}`);
  console.error(`file:     ${configPath()}`);
}

export async function offerInitNow() {
  const yes = await p.confirm({
    message: "Set up now (provider, model, key)?",
    initialValue: true,
  });
  if (p.isCancel(yes) || !yes) {
    p.cancel("Setup skipped.");
    return false;
  }
  await runWizard();
  return true;
}

export async function runWizard() {
  p.intro("yf-commit setup");

  const providerId = await p.select({
    message: "Provider",
    initialValue: "openai",
    options: PROVIDERS.map((prov) => ({
      value: prov.id,
      label: prov.label,
    })),
  });
  if (p.isCancel(providerId)) {
    p.cancel("Setup cancelled.");
    throw new CliError("Setup cancelled.", 1);
  }

  const provider = providerById(providerId);
  const model = await p.select({
    message: "Model",
    initialValue: "auto",
    options: [
      { value: "auto", label: "Auto (recommended)" },
      ...provider.models.map((id) => ({ value: id, label: id })),
    ],
  });
  if (p.isCancel(model)) {
    p.cancel("Setup cancelled.");
    throw new CliError("Setup cancelled.", 1);
  }

  /** @type {string | undefined} */
  let apiKey;
  if (providerId !== "ollama") {
    const pasted = await p.password({
      message: "API key",
      validate(value) {
        if (!value || !String(value).trim()) return "Paste a non-empty key.";
      },
    });
    if (p.isCancel(pasted)) {
      p.cancel("Setup cancelled.");
      throw new CliError("Setup cancelled.", 1);
    }
    apiKey = String(pasted).trim();
  }

  const data = {
    provider: providerId,
    baseUrl: provider.baseUrl,
    model,
  };
  if (apiKey) data.apiKey = apiKey;
  saveConfig(data);
  p.outro(`Saved to ${configPath()}`);
}
