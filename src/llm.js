import { CliError } from "./errors.js";
import { cleanMessage } from "./prompt.js";

/**
 * @param {object} opts
 * @param {string} opts.baseUrl
 * @param {string} opts.model
 * @param {string} opts.apiKey
 * @param {string} opts.systemPrompt
 * @param {string} opts.userPrompt
 */
export async function completeChat({
  baseUrl,
  model,
  apiKey,
  systemPrompt,
  userPrompt,
  maxTokens = 1500,
}) {
  const root = String(baseUrl || "").replace(/\/+$/, "");
  const url = `${root}/chat/completions`;
  const headers = {
    "content-type": "application/json",
  };
  if (apiKey) headers.authorization = `Bearer ${apiKey}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 60_000);

  let res;
  try {
    res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model,
        temperature: 0.3,
        max_tokens: maxTokens,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
      signal: controller.signal,
    });
  } catch (err) {
    if (err && err.name === "AbortError") {
      throw new CliError("The model request timed out.");
    }
    throw new CliError(`Could not reach ${root}: ${err.message}`);
  } finally {
    clearTimeout(timer);
  }

  const raw = await res.text();
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    data = null;
  }

  if (!res.ok) {
    const msg =
      data?.error?.message ||
      data?.message ||
      raw.slice(0, 400) ||
      res.statusText;
    throw new CliError(`API error ${res.status}: ${msg}`);
  }

  const content = data?.choices?.[0]?.message?.content;
  const message = cleanMessage(content);
  if (!message) {
    throw new CliError("The model returned an empty commit message.");
  }
  return message;
}
