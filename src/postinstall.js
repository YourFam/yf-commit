/**
 * Print a short hint after `npm install -g` only.
 * Stay silent for -D, CI, npx, and repo `npm install`.
 */
export function isGlobalNpmInstall(env = process.env) {
  return env.npm_config_global === "true";
}

export function installHint() {
  return `yf-commit installed. Run: yf-commit
First time: provider → model → API key
Docs: https://github.com/YourFam/yf-commit`;
}

export function runPostinstall(
  env = process.env,
  write = (s) => process.stderr.write(s),
) {
  if (!isGlobalNpmInstall(env)) return false;
  write(`${installHint()}\n`);
  return true;
}
