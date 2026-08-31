# 使用文档

本文档适用于当前仓库中的可运行示例项目：`Demo2/demo2-env`。它是一个以 Vue 3 + Vite + TypeScript + pnpm 为核心的前端工程化 Demo，除了基础开发流程外，还包含：

- 组件/页面/Store/Api 模板生成
- 单元测试与 E2E 测试
- 构建、部署、回滚
- AI 代码评审
- 环境变量配置
- GitHub Actions 自动化审查

如果你只是想“跑起来”，可以先看“快速开始”；如果想理解项目的完整开发流程，再参考后面的“常用脚本与工作流”。

---

## 1. 准备工作

### 1.1 依赖要求

推荐环境：

- Node.js 20+ / 22+
- pnpm 10+
- Git
- 一个能访问 DeepSeek API 的网络环境

### 1.2 安装 pnpm

如果尚未安装 pnpm：

```bash
npm install -g pnpm
```

### 1.3 安装项目依赖

在根目录或项目目录执行：

```bash
cd Demo2/demo2-env
pnpm install
```

如果依赖安装失败，先清理缓存再重试：

```bash
pnpm store prune
pnpm install
```

---

## 2. 快速开始

### 2.1 启动开发服务器

```bash
cd Demo2/demo2-env
pnpm dev
```

默认访问地址通常是：

```text
http://127.0.0.1:5173
```

如果你想先构建并预览正式产物：

```bash
pnpm build
pnpm preview
```

---

## 3. 常用脚本说明

在 `Demo2/demo2-env/package.json` 中，已定义以下主要脚本：

```bash
pnpm dev          # 启动开发服务器
pnpm build        # 构建生产包
pnpm preview      # 预览构建产物
pnpm test         # 运行 Vitest 单测
pnpm test:coverage # 运行覆盖率测试
pnpm test:e2e     # 运行 Playwright E2E 测试
pnpm test:e2e:ui  # 运行 Playwright UI 模式
pnpm type-check   # TypeScript 类型检查
pnpm lint         # 运行 ESLint 修复
pnpm format       # 运行 Prettier 格式化
pnpm gen          # 交互式生成页面/Api/Store 模板
pnpm graph        # 生成项目知识图谱
pnpm deploy       # 构建并复制到 deploy 目录
pnpm rollback     # 从备份中回滚构建产物
pnpm ai-review    # 执行 AI 代码审查
```

> 这个项目本身是 ESM 语法风格，因此直接运行 TypeScript 脚本时，通常使用 `ts-node --esm`，而不是 CommonJS 方式。

---

## 4. 运行测试

### 4.1 Vitest 单元测试

```bash
cd Demo2/demo2-env
pnpm test
```

### 4.2 覆盖率

```bash
pnpm test:coverage
```

### 4.3 Playwright E2E

```bash
pnpm test:e2e
```

如果你要打开浏览器交互 UI：

```bash
pnpm test:e2e:ui
```

### 4.4 TypeScript 类型检查

```bash
pnpm type-check
```

### 4.5 ESLint 和 Prettier

```bash
pnpm lint
pnpm format
```

---

## 5. 生成模板代码

这个项目提供了一个生成器，用于快速生成页面、API 和 Store 模板。

```bash
cd Demo2/demo2-env
pnpm gen
```

脚本会交互式询问模块名称，如：

- user
- product
- order

生成后通常会输出：

```text
src/views/{name}/index.vue
src/api/{name}.ts
src/stores/modules/{name}.ts
```

如果需要覆盖已存在文件：

```bash
pnpm gen -- --force
```

---

## 6. 构建、部署与回滚

### 6.1 构建生产包

```bash
cd Demo2/demo2-env
pnpm build
```

### 6.2 预览构建结果

```bash
pnpm preview
```

### 6.3 部署

```bash
pnpm deploy
```

这个脚本会：

1. 先执行 `pnpm build`
2. 复制当前 dist 到 `deploy/`
3. 生成备份版本号
4. 模拟部署完成

### 6.4 回滚

```bash
pnpm rollback
```

它会读取 `backups/` 下的历史产物，并让你选择回滚到哪个版本。

---

## 7. AI 代码审查

AI 审查脚本在下面这些文件中：

- `Demo2/demo2-env/scripts/ai-review.ts`
- `Demo2/demo2-env/scripts/review-changes.ts`
- `.github/workflows/ai-review.yml`

### 7.1 本地审查：未提交改动

```bash
cd Demo2/demo2-env
pnpm exec ts-node --esm scripts/review-changes.ts unstaged
```

### 7.2 本地审查：已暂存改动

```bash
pnpm exec ts-node --esm scripts/review-changes.ts staged
```

### 7.3 本地审查：所有改动

```bash
pnpm exec ts-node --esm scripts/review-changes.ts all
```

### 7.4 直接执行 AI Review 脚本

```bash
pnpm ai-review
```

> 这类脚本会读取 `git diff`，把代码差异整理成 Prompt，然后调用 DeepSeek API 进行代码审查。

### 7.5 PR 自动审查

仓库中已声明自动化工作流：

```text
.github/workflows/ai-review.yml
```

触发条件：

- Pull Request 被创建或更新
- 目标分支是 `master`
- 变更路径位于 `Demo2/demo2-env/**`
- 也支持手动触发 `workflow_dispatch`

执行时，GitHub Actions 会：

1. 安装 Node.js 和 pnpm
2. 安装依赖
3. 生成知识图谱（如果不存在）
4. 读取 `DEEPSEEK_API_KEY`
5. 执行 `pnpm ai-review --pr`
6. 在 PR 上发表评论审查结果

---

## 8. 配置 API Key

AI 审查依赖环境变量 `DEEPSEEK_API_KEY`。

### 8.1 本地终端配置

Windows PowerShell：

```powershell
$env:DEEPSEEK_API_KEY="sk-your-key"
```

macOS / Linux：

```bash
export DEEPSEEK_API_KEY=sk-your-key
```

随后执行：

```bash
cd Demo2/demo2-env
pnpm ai-review
```

或者：

```bash
pnpm exec ts-node --esm scripts/review-changes.ts all
```

### 8.2 GitHub 仓库配置

在 GitHub 里进入：

```text
Settings -> Secrets and variables -> Actions
```

新增 secret：

```text
Name: DEEPSEEK_API_KEY
Value: sk-your-key
```

这样 PR 审查流程就能自动读取到 API Key。

### 8.3 注意事项

如果你在本地看见类似下面的报错：

```text
❌ 请设置环境变量 DEEPSEEK_API_KEY
```

通常有两种原因：

1. 没有在当前终端中设置该变量
2. VS Code 任务/终端和 shell 进程不是同一个环境，变量未被继承

解决思路：

- 先在当前终端执行一次 `export` / `$env:`
- 再重新运行脚本
- 若通过 VS Code 任务运行，确认任务环境里也能读取到该变量

---

## 9. 典型开发流程示例

### 9.1 日常开发

```bash
cd Demo2/demo2-env
pnpm install
pnpm dev
```

### 9.2 修改之后做检查

```bash
pnpm type-check
pnpm test
pnpm lint
```

### 9.3 提交前本地 AI 审查

```bash
pnpm exec ts-node --esm scripts/review-changes.ts staged （快捷键 Ctrl + Shift + P -> AI Review Staged Changes） 或者 （快捷键 Ctrl + Alt + N -> AI Review All Changes）
```

### 9.4 生成知识图谱

```bash
pnpm graph
```

---

## 10. 常用命令速查

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

## 11. 结论

这个项目并不止于“启动一个 Vue 页面”，它本质上是一个前端工程化训练项目，重点是：

- 工程规范
- 测试体系
- 自动化脚本
- 部署回滚
- AI 辅助审查
- 环境变量管理

如果你在本地开发时遇到报错，优先确认：

- `pnpm install` 是否成功
- Node / pnpm 版本是否正确
- `DEEPSEEK_API_KEY` 是否已设置
- 是否在同一个终端中执行脚本

这样能大幅减少“脚本正常但环境变量缺失”的问题。
