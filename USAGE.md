# 使用文档

本文档适用于当前仓库中的可运行示例项目：`Demo2/demo2-env`。

## 1. 安装依赖

在项目目录中执行：

```bash
cd Demo2/demo2-env
pnpm install
```

如果本机还没有安装 pnpm，可先执行：

```bash
npm install -g pnpm
```

---

## 2. 启动开发服务器

```bash
cd Demo2/demo2-env
pnpm dev
```

默认地址通常为：

```text
http://127.0.0.1:5173
```

如需预览生产构建：

```bash
pnpm build
pnpm preview
```

---

## 3. 运行测试

### 单元测试

```bash
cd Demo2/demo2-env
pnpm test
```

### 覆盖率测试

```bash
pnpm test:coverage
```

### E2E 测试

```bash
pnpm test:e2e
```

打开 UI 版：

```bash
pnpm test:e2e:ui
```

---

## 4. 触发 AI 审查

这个项目中的 AI 审查脚本位于：`Demo2/demo2-env/scripts/ai-review.ts` 和 `scripts/review-changes.ts`。

### 4.1 本地审查

审查当前未提交的改动：

```bash
cd Demo2/demo2-env
pnpm exec ts-node --esm scripts/review-changes.ts unstaged
```

审查已暂存的改动：

```bash
pnpm exec ts-node --esm scripts/review-changes.ts staged
```

审查所有改动：

```bash
pnpm exec ts-node --esm scripts/review-changes.ts all
```

也可以直接调用：

```bash
pnpm ai-review
```

> 说明：脚本会读取 `git diff`，并将改动内容发给 DeepSeek API 做代码审查。

### 4.2 PR 方式

此仓库配置了 GitHub Actions 工作流：`.github/workflows/ai-review.yml`。

触发条件：

- Pull Request 创建/更新
- 分支为 `master`
- 受影响路径为 `Demo2/demo2-env/**`
- 也支持手动触发 `workflow_dispatch` (快捷键 `ctrl + shift + n`)

执行时会自动读取仓库 Secrets 中的 `DEEPSEEK_API_KEY`，并在 PR 上发表评论 AI Review 结果。

---

## 5. 配置 API Key

AI 审查依赖 `DEEPSEEK_API_KEY` 环境变量。

### 本地开发环境

Windows PowerShell：

```powershell
$env:DEEPSEEK_API_KEY="sk-your-key"
```

macOS / Linux：

```bash
export DEEPSEEK_API_KEY=sk-your-key
```

然后再运行：

```bash
pnpm ai-review
```

或者：

```bash
pnpm exec ts-node --esm scripts/review-changes.ts all
```

### GitHub Actions / PR 环境

在 GitHub 仓库中进入：

```text
Settings -> Secrets and variables -> Actions
```

新增一个 Secret：

```text
Name: DEEPSEEK_API_KEY
Value: sk-your-key
```

这样 PR 审查流程即可自动使用该 Key。

---

## 6. 常用命令速查

```bash
cd Demo2/demo2-env
pnpm install
pnpm dev
pnpm test
pnpm test:e2e
pnpm build
pnpm ai-review
```

如果你在本地开发中遇到 `DEEPSEEK_API_KEY` 缺失问题，优先检查是否在当前终端中设置了该环境变量，并确认 VS Code 任务/脚本运行时继承到了同一环境。
