# yf-commit

AI commit message from your staged git diff.

Writes `emoji type(scope): …` plus WHY, WHAT CHANGED, and FILES IMPACTED. Does **not** run your test suite. Does **not** append worktree / branch / machine trailers.

YourFam does not give you an API key. Use your own OpenAI-compatible key.

- **Source / README:** https://github.com/YourFam/yf-commit
- **npm:** https://www.npmjs.com/package/@yourfam/yf-commit
- **Issues:** https://github.com/YourFam/yf-commit/issues

## Install

Node 20+.

```bash
npm install -g @yourfam/yf-commit
```

Then from any git repo:

```bash
yf-commit
```

The command is `yf-commit`.

## Alternate modes of install

**-g** = on **your machine** (global).  
**-D** = in **this project** (devDependency).

| | `npm install -g @yourfam/yf-commit` | `npm install -D @yourfam/yf-commit` |
|---|---|---|
| Where it goes | Global npm prefix (your user/system) | `node_modules/` + `package.json` of the current repo |
| Command | `yf-commit` from any folder | `npx yf-commit` (or a script) **in that repo** |
| Other repos | Works | Not installed there |
| Git | Not committed | Listed in `package.json`; teammates get it with `npm install` |
| Typical use | A CLI you want everywhere | A tool this project uses in scripts/CI |

For `yf-commit` as a daily command, use **-g**. Use **-D** only if this one repo should own the tool.

With **-D**, the binary lives in that repo’s `node_modules/.bin/`. Your shell PATH does not include that, so **plain `yf-commit` will not work**. From that repo:

```bash
npx yf-commit
```

A `package.json` script also works, because npm puts `node_modules/.bin` on PATH **for the script**:

```json
"scripts": {
  "commit": "yf-commit"
}
```

```bash
npm run commit
```

Plain `yf-commit` anywhere on the machine is only after **-g**.

No install at all (npm fetches and runs the published package):

```bash
npx @yourfam/yf-commit
```

## First run

The first `yf-commit` with no key is setup.

1. Provider: OpenAI, DeepSeek, xAI (Grok), Groq, or Ollama (local).
2. Model: **Auto (recommended)**, or a named model.
3. API key (hidden). Skipped for Ollama.

Saved to `~/.yf-commit/config.json` (Windows: `%USERPROFILE%\.yf-commit\config.json`). Never commit that file.

```bash
yf-commit init         # wizard
yf-commit init --show  # masked status
yf-commit init --reset # delete config
```

Or set **`YF_COMMIT_API_KEY`**. `OPENAI_API_KEY` is also accepted if the others are unset.

Need a host we don’t list? Set `YF_COMMIT_BASE_URL` and `YF_COMMIT_MODEL`.

| Env | Config | Default |
|---|---|---|
| `YF_COMMIT_API_KEY` | `apiKey` | — |
| `YF_COMMIT_BASE_URL` | `baseUrl` | `https://api.openai.com/v1` |
| `YF_COMMIT_MODEL` | `model` | `auto` |

## Use

Flags combine. Typical paths:

**You stage, then generate**

```bash
git add path/to/file
yf-commit              # print draft → confirm → git commit
yf-commit -y           # same, skip confirm (also --yes, --auto)
```

**Skip staging — let yf-commit `git add -A`**

`--all` runs `git add -A` first (tracked changes and untracked files, except ignored), then the same as above.

```bash
yf-commit --all        # add everything → print draft → confirm → commit
yf-commit --all -y     # add everything → commit now (no confirm)
```

**Other flags (mix with `--all` / `-y` as needed)**

```bash
yf-commit --print      # print only; do not commit (still needs a staged diff, or add --all)
yf-commit --all --print
yf-commit --type fix   # force type
yf-commit --type 4     # same (1–11)
yf-commit --all -y --type feat
```

The JS does not classify the **type**. It does measure **size** (insertions + deletions, plus file count) and tells the model a length budget: tiny diffs get exactly 1 WHY + 1 WHAT; large diffs get more WHAT, grouped. WHY does not grow with every extra hundred lines. Mixed diffs still get **one** dominant type (`feat` / `fix` usually). Override with `--type`. Default still prints the draft so you can cancel.

| # | Type | Meaning |
|---|---|---|
| 1 | `chore` | Maintenance that is none of the below |
| 2 | `docs` | Docs only |
| 3 | `feat` | User-visible new capability |
| 4 | `fix` | User-visible bug |
| 5 | `refactor` | Same behavior, different structure |
| 6 | `test` | Tests only |
| 7 | `build` | Compile, bundler, packaging |
| 8 | `ci` | Pipeline / GitHub Actions / hooks |
| 9 | `perf` | Same behavior, measurably faster |
| 10 | `style` | Formatting only, zero logic |
| 11 | `revert` | Undoes a previous commit |

Priority on mixed diffs: `revert` → `fix` → `feat` → `test` → `docs` → `perf` → `refactor` → `style` → `ci` → `build` → `chore`.

Default prints the draft in the terminal. Enter or `y` to commit, `n` or Ctrl+C to cancel. It does not open an editor.

Nothing staged → error, exit 1. No `git add` unless `--all`.

Scripts / CI: `--print` or `-y`. It will not wait for a paste or a confirm.

## Format

```
✨ feat(cli): add --print to skip git commit

💡 WHY:
- Preview a message without committing

🔧 WHAT CHANGED:
- --print writes the draft to stdout and exits

📁 FILES IMPACTED:
- src/index.js
- README.md
```

## Development

This is the GitHub repo, not a second package. Docs and source live here; `npx` / `npm install` still install whatever version is **published on npm**.

```bash
git clone https://github.com/YourFam/yf-commit.git
cd yf-commit
npm install
npm test
node ./bin/yf-commit.js --help
```

Maintainer: YourFam (`kamal-yourfam` on npm). MIT.

## License

MIT © 2026 YourFam. See [LICENSE](./LICENSE).
