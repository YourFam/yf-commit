# yf-commit

AI commit message from your staged git diff.

```
npx @yourfam/yf-commit
```

Writes a conventional first line (`emoji type(scope): …`) plus WHY, WHAT CHANGED, and FILES IMPACTED. It does **not** run your test suite and does **not** append worktree / branch / machine trailers.

YourFam does not give you an API key. Use your own OpenAI-compatible key.

## Install

Node 20+. Friend one-liner:

```bash
npx @yourfam/yf-commit
```

Or install once:

```bash
npm install -g @yourfam/yf-commit
yf-commit
```

The command is `yf-commit` (not `ai-commit` — that name is already used by other packages).

## First run / `yf-commit init`

The first `yf-commit` with no key **is** setup (same idea as `gh auth login`).

1. Pick a provider (numbered list): OpenAI, DeepSeek, xAI (Grok), Groq, Ollama (local).
2. Pick a model. First item is always **Auto (recommended)** — a cheap, fast Chat Completions model for summarizing a diff. Named picks stay pinned; Auto tracks our lightweight default.
3. Paste an API key (hidden). Skipped for Ollama.

Saved to `~/.yf-commit/config.json` (Windows: `%USERPROFILE%\.yf-commit\config.json`). Mode `0600` where the OS allows. This file lives in your home directory; never commit it.

```bash
yf-commit init         # wizard
yf-commit init --show  # provider, model, base URL, masked key
yf-commit init --reset # delete saved config
```

Primary env var: **`YF_COMMIT_API_KEY`**. You can also:

```bash
export YF_COMMIT_API_KEY=...
```

`OPENAI_API_KEY` is also accepted if the others are unset.

Need a host we don't list? Set `YF_COMMIT_BASE_URL` and `YF_COMMIT_MODEL`.

| Env | Config key | Default |
|---|---|---|
| `YF_COMMIT_API_KEY` | `apiKey` | — |
| `YF_COMMIT_BASE_URL` | `baseUrl` | `https://api.openai.com/v1` |
| `YF_COMMIT_MODEL` | `model` | `auto` → lightweight model for that provider |

## Usage

Stage files, then:

```bash
yf-commit              # print draft in the terminal → confirm → git commit
yf-commit -y           # no confirm (also --yes, --auto)
yf-commit --print      # print only; do not commit
yf-commit --all        # git add -A, then same as default
yf-commit --type fix   # force type
yf-commit --type 4     # same (1–6: chore, docs, feat, fix, refactor, test)
```

Default: the draft is printed in the terminal. Press Enter or `y` to commit, `n` or Ctrl+C to cancel. It does not open an editor.

If nothing is staged: one-line error, exit non-zero. It will not `git add -A` unless you pass `--all`.

Non-interactive (CI / scripts): pass `--print` or `-y`. It will not hang waiting for a paste or a confirm.

## Message format

```
✨ feat(cli): add --print to skip git commit

💡 WHY:
- Friends can preview a message without committing

🔧 WHAT CHANGED:
- Added a --print flag that writes the draft to stdout and exits

📁 FILES IMPACTED:
- src/index.js
- README.md
```

## License

MIT
