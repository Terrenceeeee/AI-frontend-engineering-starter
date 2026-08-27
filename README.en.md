# Front-End Engineering Practice Project Collection

> Builds a complete enterprise-level front-end engineering system, covering the full chain of code standards, CI/CD, performance optimization, and AI-assisted review.

---

## 1. Project Introduction

This project is based on the **Vue 3 + TypeScript + Vite + pnpm** stack. Through 28 topic demos and 2 AI Code Review tool, it fully practices the engineering workflow from local development to online deployment.

**Core goal**: solve common team pain points such as uncontrollable code quality in multi-person collaboration, cumbersome deployment processes, and difficult online issue diagnosis.

---

## 2. Project Structure

```
A folder name starting with a dot `.` means it is a hidden folder.
```

```text
demo/
├── .github/
│   └── workflows/
│       ├── ci.yml # CI pipeline
│       ├── deploy.yml # CD pipeline
│       └──ai-review.yml # AI Code Review
├── .vscode/
│   └── setting.json # VS Code configuration, live server port configuration
├── Demo1 pnpm hard link and symbolic link mechanism verification/
│   ├── npm/ # npm verification area
│   └── pnpm/ # pnpm verification area
├── Demo2/
│   └── demo2-env/
│       ├── package.json
│       ├── pnpm-lock.yaml
│       ├── index.html
│       ├── visualize.html
│       ├── knowledge-graph.json
│       ├── tsconfig.json
│       ├── vite.config.ts
│       ├── playwright.config.js
|       ├── public/
|       ├── favicon.svg
|       ├── icons.svg
|       └── sw.js
|       ├── deploy/                         # Now build production artifacts
|       │   ├── index.html
|       │   ├── favicon.svg
|       │   ├── icons.svg
|       │   └── assets/
|       │       ├── index-yMkJyNDY.js
|       │       ├── index-yMkJyNDY.js.map
|       │       ├── vue-vendor-Ys7FJ5fz.js
|       │       ├── vue-vendor-Ys7FJ5fz.js.map
|       │       └── vue-vendor-DAacDxeL.css
|       │
|       ├── backups/                        # History build backup
|       │   ├── dist-2026-08-03T06-54-51-273Z/
|       │   │   ├── index.html
|       │   │   ├── favicon.svg
|       │   │   ├── icons.svg
|       │   │   └── assets/
|       │   │       ├── index-yMkJyNDY.js
|       │   │       ├── index-yMkJyNDY.js.map
|       │   │       ├── vue-vendor-Ys7FJ5fz.js
|       │   │       ├── vue-vendor-Ys7FJ5fz.js.map
|       │   │       └── vue-vendor-DAacDxeL.css
|       │   │
|       │   └── dist-2026-08-03T08-04-27-411Z/
|       │       ├── index.html
|       │       ├── favicon.svg
|       │       ├── icons.svg
|       │       └── assets/
|       │           ├── index-yMkJyNDY.js
|       │           ├── index-yMkJyNDY.js.map
|       │           ├── vue-vendor-Ys7FJ5fz.js
|       │           ├── vue-vendor-Ys7FJ5fz.js.map
|       │           └── vue-vendor-DAacDxeL.css
|       │
|       ├── router/
|       │   └── index.ts
|       │
|       ├── scripts/
|       │   ├── build-graph.ts
|       │   ├── deploy.ts
|       │   ├── generate.ts
|       │   └── rollback.ts
|       │
|       ├── e2e/
|       │   └── homepage.spec.ts
|       │
|       └── src/
|            ├── App.vue
|            ├── main.js
|            ├── style.css
|            │
|            ├── assets/                      # Static resource source
|            │   ├── hero.png
|            │   ├── vite.svg
|            │   └── vue.svg
|            │
|            ├── api/
|            │   ├── product.ts
|            │   └── testApi.ts
|            │
|            ├── components/
|            │   ├── HelloWorld.vue
|            │   ├── LogoDebugTrigger.vue
|            │   └── WebSocketDemo.vue
|            │
|            ├── composables/
|            │   └── useVConsole.ts
|            │
|            ├── stores/
|            │   └── modules/
|            │       └── product.ts
|            │
|            ├── types/
|            │   ├── global.d.ts
|            │   ├── logger.d.ts
|            │   └── vconsole.d.ts
|            │
|            ├── utils/
|            │   ├── logger.ts
|            │   ├── performanceReporter.ts
|            │   ├── request.ts
|            │   ├── requestPool.ts
|            │   ├── retry.ts
|            │   └── _tests_/
|            │       └── math.test.ts
|            │
|            └── views/
|               ├── Admin.vue
|               ├── Home.vue
|               ├── User.vue
|               └── product/
|                   └── index.vue
├── screenshots/
├── Architect.MD
├── Architect.en.MD
├── LICENSE
├── .gitignore
└── README.md

Omitted:
.git/
node_modules/
Build outputs, source maps, and some static asset details
```

## 3. Tech Stack And Toolchain

```text
- | Framework | Vue 3 + TypeScript |
- | Build Tool | Vite |
- | Package Manager | pnpm |
- | Code Standards | ESLint + Prettier |
- | CI/CD | GitHub Actions + GitHub Pages |
- | Unit Testing | Vitest |
- | Code Standards | ESLint + Prettier + Husky + Lint-Staged |
- | E2E Testing | Playwright |
- | Network Governance | Axios + request pool + exponential backoff retry |
- | Packet Capture Proxy | whistle |
- | Debugging Tools | vConsole + SourceMap + remote log retrieval |
- | Performance Optimization | Lighthouse |
- | Performance Monitoring | Web Vitals (LCP/INP/CLS)
Largest Contentful Paint (loading performance)
Cumulative Layout Shift (page layout stability)
Interaction to Next Paint (interaction response)
- | Code Review | AI Code Review |
- | AI-Assisted Review | Knowledge graph generation + AI Code Review |
```

---

## 4. Core Capability Matrix

### 1. Development Environment And Environment Management

```text
- ESLint + Prettier + Husky enforce code standards; invalid code cannot be committed.
- Multi-environment configuration (.env.production/.env.staging/.env.development): one codebase supports three environments.
- Automated code generator (`pnpm gen`): one command generates page, API, and Store skeletons.
```

### 2. Build And Performance Optimization

```text
- Route lazy loading + manualChunks package splitting reduces first-screen bundle size by 30%-60%.
- SourceMap accurately maps production errors back to source code.
- CDN path configuration + versioned resource hash controls browser cache.
- Lighthouse performance analysis supports performance optimization.
```

### 3. Network Layer Governance

```text
- Axios + request pool controls concurrency: the same domain has a maximum concurrent request count to avoid browser overload.
- Exponential backoff retry: 500ms -> 1000ms -> 2000ms...
- whistle packet capture proxy simulates network environments: mock data, redirects, cross-domain CORS injection, HTTPS decryption, and online hot replacement.
```

### 4. Automated Testing And CI/CD

```text
- Unit testing: Vitest covers core utility functions.
- E2E testing: Playwright automatically opens the browser and simulates real user operations.
- CI pipeline: GitHub Actions automatically runs lint + test + build after push; failures block merging.
- CD pipeline: after CI passes, the project is automatically built and published to GitHub Pages.
- Deployment and rollback: `pnpm deploy` performs backup + deployment + smoke test, and `pnpm rollback` restores a previous version with one command.
```

### 5. Debugging And Online Observability

```text
- Hidden vConsole entry: click several times continuously to show the debugging entry; online debugging is possible without releasing a new version.
- Remote log retrieval: error logs are stored in localStorage, and users can export JSON with one click.
- Service Worker: the page can still be accessed after refresh while offline through PWA offline cache.
- WebSocket: full-duplex real-time message push and real-time data updates.
- Web Vitals: LCP/INP/CLS/TTFB performance metrics are collected in real time.
```

### 6. AI-Assisted Development

```text
- Knowledge graph generation: `ts-morph` statically analyzes source code, and `d3.js` visualizes function dependency relationships.
- Three AI Code Review approaches:
  - Method 1: manually copy the prompt to AI (lowest cost).
  - Method 2: run `pnpm graph`, then use the generated graph as AI review context.
  - Method 3: configure an API key and fully automatically call AI to generate the report.
```

---

## 5. Quick Start

```bash
# 1. Install dependencies
pnpm i

# 2. Start the development environment
pnpm dev

# 3. Start the production preview
pnpm build
pnpm preview

# 4. Start the test environment
pnpm test      # Unit tests
pnpm test:e2e  # E2E tests

# 5. Build and deploy
pnpm build  # Build production artifacts
pnpm deploy # Automated deployment

# 6. Rollback
pnpm rollback # One-command rollback

# 7. AI-assisted development
pnpm graph # Generate the knowledge graph
Use knowledge-graph.json as AI context to generate an AI Code Review
```

## 6. Project Highlights

```text
All engineering capabilities are reusable: utility functions can be copied into new projects directly, such as requestPool, retry, logger, and useVConsole.

The CI/CD workflow is fully automated: from git push to automatic deployment to GitHub Pages.

Online debugging does not require redeployment: hidden vConsole entry + remote log retrieval can locate online issues quickly.

AI-assisted Code Review: the knowledge graph precisely analyzes impact scope, and AI automatically generates review suggestions.
```

## 7. Online Demo

```text
GitHub Pages URL: https://terrenceeeee.github.io/Front-end-engineering/

Knowledge graph demo: run `pnpm graph` to generate `visualize.html`, then open it to view the graph.
```

---

## 8. Reusable Asset List

```text
Type                  File                                      Reuse Method
Utility function      utils/requestPool.ts                       Copy directly to a new project
Utility function      utils/retry.ts                             Copy directly to a new project
Utility function      utils/logger.ts                            Copy directly to a new project
Utility function      composables/useVConsole.ts                 Copy directly to a new project
Utility function      src/utils/performanceReporter.ts           Copy directly to a new project
Utility function      src/components/LogoDebugTrigger.vue        Copy directly to a new project
Utility function      src/components/WebSocketDemo.vue           Copy directly to a new project
Config file           .eslintrc.cjs                              Copy and fine-tune; for React projects, remove plugin:vue and switch to React rules
Config file           .prettierrc.cjs                            Copy and fine-tune printWidth, singleQuote, and other preferences
Config file           .husky/pre-commit                          Copy and fine-tune rule sets
Config file           vite.config.ts build.rollupOptions         Copy and fine-tune rule sets
Config file           .github/workflows/deploy.yml               Copy and fine-tune VITE_BASE_PATH and Node version
Config file           playwright.config.js                       Copy and fine-tune baseURL and testDir
Config file           vite.config.ts resolve.alias               Copy and fine-tune '@': path.resolve(__dirname, 'src')
Config file           vite.config.ts test config                 Copy and fine-tune rule sets
Config file           .github/workflows/ci.yml                   Copy and fine-tune Node version
Script                scripts/generate.ts                        Reuse after changing template content
Script                scripts/deploy.ts                          Reuse after changing deployment target
Script                scripts/rollback.ts                        Reuse after changing backup path
```

## 9. About The Author

- Author: ChamLerrence
- GitHub: https://github.com/terrenceeeee
- Completion time: September 2026
- Learning path: built 28 engineering demos + AI Code Review project from scratch

---

## License

MIT (c) 2026 Terrenceeeee
