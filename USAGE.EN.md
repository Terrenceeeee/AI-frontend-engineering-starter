# Usage Guide

This guide applies to the runnable project in this repository: `Demo2/demo2-env`. It is a Vue 3 + Vite + TypeScript + pnpm frontend engineering demo that includes more than just a basic app startup flow. It also covers:

- page, API, and store scaffolding
- unit and E2E testing
- build, deployment, and rollback
- AI code review
- environment variable configuration
- GitHub Actions automation

If you only want the shortest path to running the app, start with “Quick Start.” For the full engineering workflow, read the rest.

---

## 1. Prerequisites

Recommended environment:

- Node.js 20+ / 22+
- pnpm 10+
- Git
- Network access to the DeepSeek API

### Install pnpm

If pnpm is not installed:

```bash
npm install -g pnpm
```

### Install project dependencies

```bash
cd Demo2/demo2-env
pnpm install
```

If installation fails, try a clean reinstall:

```bash
pnpm store prune
pnpm install
```

---

## 2. Quick Start

### Start the development server

```bash
cd Demo2/demo2-env
pnpm dev
```

The default local URL is typically:

```text
http://127.0.0.1:5173
```

### Preview a production build

```bash
pnpm build
pnpm preview
```

---

## 3. Main Scripts

The project includes the following useful scripts in `Demo2/demo2-env/package.json`:

```bash
pnpm dev          # start dev server
pnpm build        # build production bundle
pnpm preview      # preview production build
pnpm test         # run Vitest unit tests
pnpm test:coverage # run coverage tests
pnpm test:e2e     # run Playwright E2E tests
pnpm test:e2e:ui  # run Playwright in UI mode
pnpm type-check   # run TypeScript checks
pnpm lint         # run ESLint with auto-fix
pnpm format       # run Prettier formatting
pnpm gen          # generate page/api/store template
pnpm graph        # generate a project knowledge graph
pnpm deploy       # build and copy app to deploy output
pnpm rollback     # restore a previous build from backups
pnpm ai-review    # run AI review
```

> This project follows ESM conventions, so TypeScript scripts are usually run via `ts-node --esm` instead of CommonJS patterns.

---

## 4. Run Tests

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

Open UI mode:

```bash
pnpm test:e2e:ui
```

### Type checking

```bash
pnpm type-check
```

### Linting and formatting

```bash
pnpm lint
pnpm format
```

---

## 5. Generate Project Templates

This project includes a generator to quickly scaffold pages, APIs, and stores.

```bash
cd Demo2/demo2-env
pnpm gen
```

The script will ask for a module name such as:

- user
- product
- order

It typically creates:

```text
src/views/{name}/index.vue
src/api/{name}.ts
src/stores/modules/{name}.ts
```

To overwrite existing files:

```bash
pnpm gen -- --force
```

---

## 6. Build, Deploy, and Rollback

### Build production assets

```bash
cd Demo2/demo2-env
pnpm build
```

### Preview the built result

```bash
pnpm preview
```

### Deploy

```bash
pnpm deploy
```

This script does the following:

1. runs a production build
2. copies the dist output to the `deploy/` folder
3. creates a backup version
4. simulates deployment completion

### Rollback

```bash
pnpm rollback
```

This reads the files in `backups/` and lets you select a previous build to restore.

---

## 7. AI Code Review

The AI review logic is defined in:

- `Demo2/demo2-env/scripts/ai-review.ts`
- `Demo2/demo2-env/scripts/review-changes.ts`
- `.github/workflows/ai-review.yml`

### Local review: unstaged changes

```bash
cd Demo2/demo2-env
pnpm exec ts-node --esm scripts/review-changes.ts unstaged
```

### Local review: staged changes

```bash
pnpm exec ts-node --esm scripts/review-changes.ts staged
```

### Local review: all changes

```bash
pnpm exec ts-node --esm scripts/review-changes.ts all
```

### Run AI review directly

```bash
pnpm ai-review
```

> These scripts read `git diff`, package the change set into a prompt, and send it to the DeepSeek API for review.

### PR review automation

The repository includes a GitHub Actions workflow:

```text
.github/workflows/ai-review.yml
```

It triggers when:

- a pull request is opened or updated
- target branch is `master`
- files under `Demo2/demo2-env/**` are changed
- or it is manually triggered via `workflow_dispatch`

During execution, the workflow:

1. installs Node.js and pnpm
2. installs dependencies
3. generates a knowledge graph if missing
4. reads `DEEPSEEK_API_KEY`
5. runs `pnpm ai-review --pr`
6. comments the review result on the PR

---

## 8. Configure the API Key

AI review depends on the `DEEPSEEK_API_KEY` environment variable.

### Local shell configuration

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
cd Demo2/demo2-env
pnpm ai-review
```

or:

```bash
pnpm exec ts-node --esm scripts/review-changes.ts all
```

### GitHub repository configuration

Go to:

```text
Settings -> Secrets and variables -> Actions
```

Add a new secret:

```text
Name: DEEPSEEK_API_KEY
Value: sk-your-key
```

This allows the PR review workflow to use the key automatically.

### Important note

If you see an error like:

```text
❌ Please set the DEEPSEEK_API_KEY environment variable
```

It usually means one of these:

1. the variable is not set in the current terminal
2. your VS Code task or script is running in a different environment than the terminal that set the variable

In practice, the fix is usually:

- set the variable in the same shell before running the script
- re-run the command in that same terminal session
- if using VS Code tasks, confirm the task is inheriting the environment correctly

---

## 9. Typical Development Workflow

### Daily local workflow

```bash
cd Demo2/demo2-env
pnpm install
pnpm dev
```

### Before submitting code

```bash
pnpm type-check
pnpm test
pnpm lint
```

### Staged review before commit

```bash
pnpm exec ts-node --esm scripts/review-changes.ts staged （shortcut: Ctrl + Shift + P -> AI Review Staged Changes） or （shortcut: Ctrl + Alt + N -> AI Review All Changes）
```

### Regenerate knowledge graph

```bash
pnpm graph
```

---

## 10. Quick Command Reference

```bash
cd Demo2/demo2-env

pnpm install
pnpm dev
pnpm build
pnpm preview
pnpm test
pnpm test:coverage
pnpm test:e2e
pnpm type-check
pnpm lint
pnpm format
pnpm gen
pnpm graph
pnpm deploy
pnpm rollback
pnpm ai-review
```

---

## 11. Summary

This project is more than a simple demo app. It is a practical frontend engineering exercise covering:

- environment and tooling setup
- project generation
- testing
- deployment and rollback
- AI-assisted review
- automation and CI/CD

If you hit environment issues, always check these first:

- `pnpm install` completed successfully
- Node and pnpm versions are correct
- `DEEPSEEK_API_KEY` is set in the same shell session
- the command is being run from the right project directory

That will resolve most of the confusion around local AI review and task execution.
