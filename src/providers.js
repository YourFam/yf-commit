/** Locked V1 provider table. Bump auto + named lists in patch releases. */

export const PROVIDERS = [
  {
    id: "openai",
    label: "OpenAI",
    baseUrl: "https://api.openai.com/v1",
    autoModel: "gpt-4o-mini",
    models: ["gpt-4o-mini", "gpt-4o"],
  },
  {
    id: "deepseek",
    label: "DeepSeek",
    baseUrl: "https://api.deepseek.com/v1",
    autoModel: "deepseek-chat",
    models: ["deepseek-chat"],
  },
  {
    id: "xai",
    label: "xAI (Grok)",
    baseUrl: "https://api.x.ai/v1",
    autoModel: "grok-4-fast-non-reasoning",
    models: ["grok-4-fast-non-reasoning", "grok-4"],
  },
  {
    id: "groq",
    label: "Groq",
    baseUrl: "https://api.groq.com/openai/v1",
    autoModel: "llama-3.3-70b-versatile",
    models: ["llama-3.3-70b-versatile"],
  },
  {
    id: "ollama",
    label: "Ollama (local)",
    baseUrl: "http://127.0.0.1:11434/v1",
    autoModel: "llama3.2",
    models: ["llama3.2"],
  },
];

export const DEFAULT_PROVIDER_ID = "openai";

/**
 * @param {string} id
 */
export function providerById(id) {
  return PROVIDERS.find((p) => p.id === id) ?? null;
}

/**
 * @param {string} baseUrl
 */
export function providerByBaseUrl(baseUrl) {
  const normalized = String(baseUrl || "").replace(/\/+$/, "");
  return (
    PROVIDERS.find(
      (p) => p.baseUrl.replace(/\/+$/, "") === normalized,
    ) ?? null
  );
}

/**
 * @param {string} providerId
 * @param {string} [baseUrl]
 */
export function resolveAutoModel(providerId, baseUrl) {
  const p =
    providerById(providerId) ||
    providerByBaseUrl(baseUrl || "") ||
    providerById(DEFAULT_PROVIDER_ID);
  return p.autoModel;
}

/**
 * @param {string} providerId
 * @param {string} baseUrl
 */
export function isOllama(providerId, baseUrl) {
  if (providerId === "ollama") return true;
  return /11434/.test(String(baseUrl || ""));
}
