# Contributing Guide

Thank you for contributing to this frontend engineering practice repository.

This project is a complete engineering-demo collection covering the most important parts of modern frontend delivery: package management, code quality, automation, CI/CD, testing, deployment, observability, networking, offline capability, and AI-assisted code review.

We welcome contributions of all kinds, including bug fixes, documentation improvements, tooling enhancements, and engineering workflow refinements.

## 1. About This Project

The goal of this repository is to demonstrate how to build a practical frontend engineering system from the ground up.

The stack is centered on:

- Vue 3
- Vite
- TypeScript
- pnpm
- Vitest
- Playwright
- ESLint + Prettier
- Husky + lint-staged
- GitHub Actions
- AI code review
- project knowledge graph generation

## 2. Prerequisites

### 2.1 Required Tools

- Node.js 18+
- pnpm 10+
- Git
- VS Code

Recommended editor extensions:

- ESLint
- Prettier
- GitHub Copilot (optional)

### 2.2 Install Dependencies

From the repository root:

```bash
pnpm install
```

If you want to work on the main demo app:

```bash
cd Demo2/demo2-env
pnpm install
```

### 2.3 Set API Key for AI Review

If you use AI review features locally, set the DeepSeek API key in your current terminal session:

```powershell
$env:DEEPSEEK_API_KEY="your_api_key_here"
```

> Note: VS Code tasks and the terminal are separate processes. If a task still complains about a missing variable, re-run the command in the same active terminal session.

## 3. Development Workflow

### 3.1 Create a Branch

```bash
git checkout -b feature/your-change
```

Common branch names:

- feature/xxx
- fix/xxx
- docs/xxx
- chore/xxx
- refactor/xxx

### 3.2 Run the Project Locally

```bash
cd Demo2/demo2-env
pnpm dev
```

Useful commands:

```bash
pnpm test
pnpm build
pnpm type-check
pnpm lint:check
pnpm format:check
pnpm graph
pnpm ai-review
```

For local review of current changes:

```bash
pnpm exec ts-node --esm scripts/review-changes.ts all
```

## 4. Commit Standards

This repository recommends Conventional Commits:

```bash
git commit -m "feat: add package manager comparison demo"
git commit -m "fix: resolve vite env loading issue"
git commit -m "docs: update contribution guide"
git commit -m "refactor: simplify deployment scripts"
```

Recommended types:

- feat
- fix
- docs
- style
- refactor
- perf
- test
- chore
- build
- ci

## 5. Code Quality Expectations

### 5.1 Linting and Formatting

Please ensure your changes do not introduce obvious lint or format issues.

Run:

```bash
pnpm lint:check
pnpm format:check
```

### 5.2 Testing

Before finalizing a change, run the relevant verification:

```bash
pnpm test
```

When working on deployment logic, routing, visualization, or environment configuration, consider also running:

```bash
pnpm test:e2e
```

### 5.3 Module and Path Rules

This project uses ESM. Please keep code consistent with that model:

- prefer import / export syntax
- avoid legacy CommonJS patterns
- use ESM-safe path handling in Node scripts
- keep config and script semantics aligned

## 6. Git Hooks and Automation

This repository is configured with Husky and lint-staged. Typical hooks include:

- pre-commit: checks staged files
- pre-push: runs test validation
- commit-msg: validates commit message format

If hook checks block your commit, verify:

- the hooks path points to the correct repository root
- there is no duplicate .husky directory
- the commit message follows the expected convention
- environment variables and script paths are correct

## 7. Pull Request Checklist

Before opening a PR, confirm that:

- the change has been validated locally
- relevant tests have been run
- the scope is focused and not noisy
- the PR summary explains what changed and why
- AI review feedback has been reviewed critically rather than blindly accepted

Recommended PR structure:

- problem/background
- change summary
- validation steps
- risks or follow-ups

## 8. AI Review Usage

This project includes AI review scripts such as:

- scripts/ai-review.ts
- scripts/review-changes.ts

These scripts help with:

- reviewing local changes for risk
- analyzing PR diff quality
- surfacing engineering issues early

AI review is a support tool, not a replacement for engineering judgment. Use it as a starting point and validate the recommendations against the actual code and test results.

## 9. What Not to Commit

Please do not include the following in your commits:

- node_modules
- pnpm cache directories
- dist / deploy / backups generated artifacts
- local environment files or API keys
- temporary logs or debug output
- large screenshots not required for documentation

## 10. Contribution Principles

High-quality contributions generally:

- explain the reason behind the change
- keep the patch focused and minimal
- match the project’s engineering direction
- document new scripts, env vars, or config
- avoid unrelated cleanup in the same PR

## 11. Need Help?

If you run into problems, check first:

- whether you are in the correct repository root
- whether dependencies are installed
- whether the terminal session lost the environment variable
- whether Git hooks are configured correctly
- whether the project is being run in ESM-compatible mode

Relevant references:

- [README.md](README.md)
- [README.en.md](README.en.md)
- [USAGE.md](USAGE.md)
- [USAGE.en.md](USAGE.en.md)
- [Architecture.MD](Architecture.MD)
- [Architecture.en.md](Architecture.en.md)

We appreciate every contribution that helps this project better reflect real-world frontend engineering practices.
