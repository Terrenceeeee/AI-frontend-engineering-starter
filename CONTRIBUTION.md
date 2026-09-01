# 贡献指南

感谢你参与这个前端工程化实战项目的建设。

这个仓库是一套完整的工程化演练项目，覆盖了前端工程中的关键能力：包管理、代码规范、自动化脚本、CI/CD、测试、部署、性能监控、调试链路、网络治理、离线缓存，以及 AI 辅助代码评审与知识图谱可视化。

我们欢迎任何形式的贡献，包括修复问题、补充示例、改进文档、增强脚本与优化工程流程。

## 1. 项目定位

本仓库的目标不是“只写一个 Demo”，而是通过一组真实工程实践，展示如何从 0 到 1 构建一套企业级前端工程化体系。

当前项目以 Vue 3 + Vite + TypeScript + pnpm 为核心栈，并结合：

- ESLint + Prettier
- Husky + lint-staged
- Vitest + Playwright
- GitHub Actions
- GitHub Pages
- AI Review
- 知识图谱构建与可视化

## 2. 贡献前准备

### 2.1 环境要求

建议使用：

- Node.js 18+
- pnpm 10+
- Git
- VS Code

建议安装：

- ESLint
- Prettier
- GitHub Copilot（可选）

### 2.2 安装依赖

在仓库根目录执行：

```bash
pnpm install
```

如果你需要直接运行 Demo2 工程：

```bash
cd Demo2/demo2-env
pnpm install
```

### 2.3 API Key 配置

如果你要执行 AI 代码评审相关脚本，需要在当前终端中设置 DeepSeek API Key：

```powershell
$env:DEEPSEEK_API_KEY="your_api_key_here"
```

> 注意：VS Code 任务和终端是不同进程。若任务提示缺少环境变量，通常需要在同一个已打开的终端中重新配置一次。

## 3. 开发流程

### 3.1 创建分支

推荐使用清晰的分支命名：

```bash
git checkout -b feature/your-change
```

常见命名方式：

- feature/xxx
- fix/xxx
- docs/xxx
- chore/xxx
- refactor/xxx

### 3.2 本地开发

启动 Demo2 工程：

```bash
cd Demo2/demo2-env
pnpm dev
```

常用脚本：

```bash
pnpm test
pnpm build
pnpm type-check
pnpm lint:check
pnpm format:check
pnpm graph
pnpm ai-review
```

如需本地审查当前改动：

```bash
pnpm exec ts-node --esm scripts/review-changes.ts all
```

## 4. 提交规范

项目推荐遵循 Conventional Commits：

```bash
git commit -m "feat: add package manager comparison demo"
git commit -m "fix: resolve vite env loading issue"
git commit -m "docs: update contribution guide"
git commit -m "refactor: simplify deployment scripts"
```

推荐的提交类型：

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

> 这类提交信息有助于维护清晰的历史记录，并更容易追踪变更范围。

## 5. 代码质量要求

### 5.1 代码风格

项目已接入 ESLint + Prettier + lint-staged。提交前请确保：

- 没有明显 lint 报错
- 代码格式符合项目规则
- 不保留无意义的调试日志
- 不将缓存、构建产物或本地临时文件混入提交

可执行检查：

```bash
pnpm lint:check
pnpm format:check
```

### 5.2 测试要求

修改功能逻辑时，建议至少执行：

```bash
pnpm test
```

如果涉及：

- 路由
- CI/CD
- 部署脚本
- 可视化图谱
- 环境变量逻辑

建议补充或更新对应测试，包括：

```bash
pnpm test:e2e
```

### 5.3 模块规范

这个项目已统一为 ESM 形式，尽量保持：

- 使用 import / export
- 不混用旧的 CommonJS 语法
- Node 脚本保持 ESM 兼容方式
- 配置项和脚本语义保持一致

## 6. Git Hooks 与工程约束

本项目已接入 Husky 与 lint-staged，常见 hook 包括：

- pre-commit：检查暂存区文件
- pre-push：执行测试校验
- commit-msg：校验提交信息格式

如果本地提交被 hook 拦住，优先检查：

- Git hooks 路径是否指向真实仓库根目录
- 是否出现重复的 .husky 目录
- 提交信息是否不符合规范
- 环境变量、脚本路径是否错误

## 7. Pull Request 检查清单

提交 PR 前，建议至少确认：

- 代码已在本地验证通过
- 相关测试已执行
- 变更说明清晰、目的明确
- 不涉及无关改动或大规模噪声提交
- 若使用 AI 审查，已认真评估建议并做选择性采纳

推荐的 PR 内容结构：

- 背景说明
- 修改内容
- 验证方式
- 风险说明（如有）

## 8. AI 评审说明

这个项目包含了 AI Review 相关脚本，例如：

- scripts/ai-review.ts
- scripts/review-changes.ts

这些脚本用于：

- 分析本地改动风险
- 审查 PR 代码差异
- 帮助发现潜在工程问题

AI 审查是辅助工具，不是最终决策依据。请根据实际代码语义和测试结果做判断，尤其注意：

- 不要把本地缓存文件、构建产物、锁文件混入 Git
- 不要因为 AI 建议直接删掉必要的截图或文档资源
- 代码仍需以真实测试和业务理解为准

## 9. 不建议提交的内容

请勿将以下内容纳入提交：

- node_modules
- .pnpm cache 目录
- dist / deploy / backups 等无关构建产物
- 本地环境文件或 API Key
- 无意义的大量日志与临时调试文件
- 未经筛选的截图或缓存数据

## 10. 贡献原则

高质量贡献通常具备以下特征：

- 说明变更原因
- 保持最小化改动范围
- 与现有工程实践一致
- 对新增脚本、环境变量或配置项补充说明
- 文档与代码同步更新

## 11. 需要帮助？

如果遇到问题，优先检查：

- 是否在正确的仓库根目录执行命令
- 是否已完成依赖安装
- 是否是终端切换导致环境变量失效
- 是否存在 Husky / Git hooks 配置错误
- 是否符合当前 ESM 项目运行方式

相关参考文档：

- [README.md](README.md)
- [README.en.md](README.en.md)
- [USAGE.md](USAGE.md)
- [USAGE.en.md](USAGE.en.md)
- [Architecture.MD](Architecture.MD)
- [Architecture.en.md](Architecture.en.md)

我们欢迎你的参与，也希望每一份贡献都能让这个项目更接近真实生产环境的工程实践。
