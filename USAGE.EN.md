# Usage Guide

This guide applies to the runnable demo project in this repository: `Demo2/demo2-env`.

## 1. Install dependencies

Run the following in the project directory:

```bash
cd Demo2/demo2-env
pnpm install
```

If pnpm is not installed on your machine, install it first:

```bash
npm install -g pnpm
```

---

## 2. Start the development server

```bash
cd Demo2/demo2-env
pnpm dev
```

The default local address is usually:

```text
http://127.0.0.1:5173
```

To preview a production build:

```bash
pnpm build
pnpm preview
```

---

## 3. Run tests

### Unit tests

```bash
cd Demo2/demo2-env
pnpm test
```

### Coverage tests

```bash
pnpm test:coverage
```

### E2E tests

```bash
pnpm test:e2e
```

Open the UI version:

```bash
pnpm test:e2e:ui
```

---

## 4. Trigger AI review

The AI review scripts are located in `Demo2/demo2-env/scripts/ai-review.ts` and `scripts/review-changes.ts`.

### 4.1 Local review

Review unstaged changes:

```bash
cd Demo2/demo2-env
pnpm exec ts-node --esm scripts/review-changes.ts unstaged
```

Review staged changes:

```bash
pnpm exec ts-node --esm scripts/review-changes.ts staged
```

Review all changes:

```bash
pnpm exec ts-node --esm scripts/review-changes.ts all
```

You can also run:

```bash
pnpm ai-review
```

> The script reads `git diff` and sends the change content to the DeepSeek API for code review.

### 4.2 PR-based review

This repo includes a GitHub Actions workflow: `.github/workflows/ai-review.yml`.

Trigger conditions:

- Pull request opened or updated
- Target branch is `master`
- Changed files are under `Demo2/demo2-env/**`
- Manual trigger via `workflow_dispatch` is also supported (shortcut: `ctrl + shift + n`)

During execution, the workflow automatically reads `DEEPSEEK_API_KEY` from repository secrets and posts the AI review result as a PR comment.

---

## 5. Configure the API key

AI review requires the `DEEPSEEK_API_KEY` environment variable.

### Local development

Windows PowerShell:

```powershell
$env:DEEPSEEK_API_KEY="sk-your-key"
```

macOS / Linux:

```bash
export DEEPSEEK_API_KEY=sk-your-key
```

Then run:

```bash
pnpm ai-review
```

or:

```bash
pnpm exec ts-node --esm scripts/review-changes.ts all
```

### GitHub Actions / PR environment

Go to:

```text
Settings -> Secrets and variables -> Actions
```

Create a new secret:

```text
Name: DEEPSEEK_API_KEY
Value: sk-your-key
```

Then the PR review workflow can use the key automatically.

---

## 6. Quick command reference

```bash
cd Demo2/demo2-env
pnpm install
pnpm dev
pnpm test
pnpm test:e2e
pnpm build
pnpm ai-review
```

If you see a `DEEPSEEK_API_KEY` missing error locally, check whether the variable is defined in the same terminal session where the script is run, and confirm that VS Code tasks inherit the same environment.
