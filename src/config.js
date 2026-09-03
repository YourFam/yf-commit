import { mkdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import {
  DEFAULT_PROVIDER_ID,
  isOllama,
  providerById,
  resolveAutoModel,
} from "./providers.js";

export function configDir() {
  return path.join(homedir(), ".yf-commit");
}

export function configPath() {
  return path.join(configDir(), "config.json");
}

/**
 * @returns {Record<string, string> | null}
 */
export function loadConfig() {
  try {
    const raw = readFileSync(configPath(), "utf8");
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * @param {object} data
 */
export function saveConfig(data) {
  const dir = configDir();
  mkdirSync(dir, { recursive: true, mode: 0o700 });
  const payload = { ...data };
  if (!payload.apiKey) delete payload.apiKey;
  writeFileSync(configPath(), `${JSON.stringify(payload, null, 2)}\n`, {
    encoding: "utf8",
    mode: 0o600,
  });
}

export function deleteConfig() {
  try {
    unlinkSync(configPath());
    return true;
  } catch (err) {
    if (err && err.code === "ENOENT") return false;
    throw err;
  }
}

/**
 * @param {string} key
 */
export function maskKey(key) {
  if (!key) return "(none)";
  const last = key.slice(-4);
  if (key.startsWith("sk-")) return `sk-…${last}`;
  if (key.length <= 4) return "…";
  return `…${last}`;
}

/**
 * @param {Record<string, string> | null} fileConfig
 */
export function resolveSettings(fileConfig = null) {
  const file = fileConfig && typeof fileConfig === "object" ? fileConfig : {};
  const provider = file.provider || DEFAULT_PROVIDER_ID;
  const fallback = providerById(provider) || providerById(DEFAULT_PROVIDER_ID);
  const baseUrl =
    process.env.YF_COMMIT_BASE_URL || file.baseUrl || fallback.baseUrl;
  const model = process.env.YF_COMMIT_MODEL || file.model || "auto";
  const resolvedModel =
    model === "auto" ? resolveAutoModel(provider, baseUrl) : model;
  const apiKey =
    process.env.YF_COMMIT_API_KEY ||
    file.apiKey ||
    process.env.OPENAI_API_KEY ||
    "";
  return {
    provider,
    baseUrl,
    model,
    resolvedModel,
    apiKey,
  };
}

/**
 * @param {ReturnType<typeof resolveSettings>} settings
 */
export function hasUsableKey(settings) {
  if (isOllama(settings.provider, settings.baseUrl)) return true;
  return Boolean(settings.apiKey);
}
