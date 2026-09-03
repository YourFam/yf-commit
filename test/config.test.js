import assert from "node:assert/strict";
import { test } from "node:test";
import { hasUsableKey, maskKey, resolveSettings } from "../src/config.js";

const ENV_KEYS = [
  "YF_COMMIT_API_KEY",
  "YF_COMMIT_BASE_URL",
  "YF_COMMIT_MODEL",
  "OPENAI_API_KEY",
];

function withEnv(overrides, fn) {
  const prev = {};
  for (const k of ENV_KEYS) {
    prev[k] = process.env[k];
    delete process.env[k];
  }
  for (const [k, v] of Object.entries(overrides)) {
    if (v == null) delete process.env[k];
    else process.env[k] = v;
  }
  try {
    return fn();
  } finally {
    for (const k of ENV_KEYS) {
      if (prev[k] == null) delete process.env[k];
      else process.env[k] = prev[k];
    }
  }
}

test("maskKey never returns the full key", () => {
  const key = "sk-abcdefghijklmnopqrstuvwxyz";
  const masked = maskKey(key);
  assert.equal(masked, "sk-…wxyz");
  assert.equal(masked.includes(key), false);
});

test("resolveSettings: env key wins over file", () => {
  withEnv({ YF_COMMIT_API_KEY: "from-env" }, () => {
    const s = resolveSettings({ apiKey: "from-file", provider: "openai" });
    assert.equal(s.apiKey, "from-env");
  });
});

test("auto model resolves per provider", () => {
  withEnv({}, () => {
    const s = resolveSettings({ provider: "xai", model: "auto" });
    assert.equal(s.resolvedModel, "grok-4-fast-non-reasoning");
    assert.equal(s.baseUrl, "https://api.x.ai/v1");
  });
});

test("named model stays pinned", () => {
  withEnv({}, () => {
    const s = resolveSettings({ provider: "openai", model: "gpt-4o" });
    assert.equal(s.resolvedModel, "gpt-4o");
  });
});

test("ollama does not need a key", () => {
  withEnv({}, () => {
    const s = resolveSettings({ provider: "ollama", model: "auto" });
    assert.equal(s.apiKey, "");
    assert.equal(hasUsableKey(s), true);
    assert.equal(s.resolvedModel, "llama3.2");
  });
});

test("openai without key is not usable", () => {
  withEnv({}, () => {
    const s = resolveSettings({ provider: "openai" });
    assert.equal(hasUsableKey(s), false);
  });
});
