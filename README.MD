[![CI Status](https://img.shields.io/badge/CI-passing-brightgreen)](https://github.com/Terrenceeeee/AI-frontend-engineering-starter/actions)
[![Coverage](https://img.shields.io/badge/coverage-78%25-brightgreen)](https://github.com/Terrenceeeee/AI-frontend-engineering-starter)
[![License](https://img.shields.io/badge/license-MIT-blue)](./LICENSE)
[![Deploy](https://img.shields.io/badge/GitHub%20Pages-online-blueviolet)](https://terrenceeeee.github.io/AI-frontend-engineering-starter/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen)](https://github.com/Terrenceeeee/AI-frontend-engineering-starter/pulls)

# “从零到一，亲手搭建一套生产级前端工程化体系。28 个实战 Demo，打通编码、测试、部署、监控全链路。”

# 🚀 前端工程化实战项目集

> 从0搭建完整的企业级前端工程化体系，覆盖代码规范，CI/CD,性能优化，AI辅助审查全链路

---

## 一、项目简介

本仓库实现了一套**前端工程化最小可行产品（MVP）**，技术栈基于 **Vue 3 + TypeScript + Vite + pnpm**，系统完整演示了从本地代码开发到线上运维的全链路工程化实践。

项目覆盖包管理、代码规范、构建优化、自动化脚本、CI/CD 流水线、单元测试与 E2E 测试、性能监控、调试工具链、请求治理、离线缓存、AI 辅助开发等前端工程化核心领域，通过 Demo1、Demo2 两套示例完成流程验证。当前可直接运行的 Demo2，重点实现了环境配置、路由代码分割、网络治理、调试工具、自动化测试、部署回滚以及 AI 代码评审能力。

### 解决的问题

- 多人协作场景下代码风格不统一
- 部署流程繁琐，极易出现人为错误
- 线上故障难以快速定位排查
- 缺少体系化的前端工程化知识框架

### 适用人群

- 希望系统学习前端工程化的初中级开发者
- 正在搭建团队工程化基础设施的技术负责人
- 备考高级前端岗位的面试求职者

### 核心目标

解决团队开发中的典型痛点：协作开发时代码质量参差不齐、部署流程冗长繁琐、线上问题难以诊断。

### 全流程实践

本仓库完整记录了项目初始化、编码、测试到部署的整套流程。克隆仓库，参照文档即可上手体验。

---

## 二、项目结构

```
文件夹名字开头带点 `.`，代表这是隐藏文件夹
```

```text
demo/
├── .github/
│ └── workflows/
│ ├── ci.yml # CI 流水线
│ ├── deploy.yml # CD 流水线
│ └──ai-review.yml # AI Code Review
├── .vscode/
│ |—— setting.json # vscode 配置 此处是live server的端口配置 以及保存prettier自动化
| |—— tasks.json # 定义申明一些开发者自己加入的新功能
| └── keybindings.json # VS Code内部快捷键触发定义 点击即触发
├── Demo1 pnpm 硬链接与符号链接机制验证/
│ ├── npm/ # npm 验证区
│ └── pnpm/ # pnpm 验证区
|── Demo2/
| └── demo2-env/
|    ├── package.json
|    ├── pnpm-lock.yaml
|    ├── index.html
|    ├── visualize.html
|    ├── knowledge-graph.json
|    ├── tsconfig.json
|    ├── vite.config.ts
|    ├── playwright.config.js
|    │
|    ├── public/
|    │   ├── favicon.svg
|    │   ├── icons.svg
|    │   └── sw.js
|    │
|    ├── deploy/                         # 当前构建部署产物
|    │   ├── index.html
|    │   ├── favicon.svg
|    │   ├── icons.svg
|    │   └── assets/
|    │       ├── index-yMkJyNDY.js
|    │       ├── index-yMkJyNDY.js.map
|    │       ├── vue-vendor-Ys7FJ5fz.js
|    │       ├── vue-vendor-Ys7FJ5fz.js.map
|    │       └── vue-vendor-DAacDxeL.css
|    │
|    ├── backups/                        # 历史构建备份
|    │   ├── dist-2026-08-03T06-54-51-273Z/
|    │   │   ├── index.html
|    │   │   ├── favicon.svg
|    │   │   ├── icons.svg
|    │   │   └── assets/
|    │   │       ├── index-yMkJyNDY.js
|    │   │       ├── index-yMkJyNDY.js.map
|    │   │       ├── vue-vendor-Ys7FJ5fz.js
|    │   │       ├── vue-vendor-Ys7FJ5fz.js.map
|    │   │       └── vue-vendor-DAacDxeL.css
|    │   │
|    │   └── dist-2026-08-03T08-04-27-411Z/
|    │       ├── index.html
|    │       ├── favicon.svg
|    │       ├── icons.svg
|    │       └── assets/
|    │           ├── index-yMkJyNDY.js
|    │           ├── index-yMkJyNDY.js.map
|    │           ├── vue-vendor-Ys7FJ5fz.js
|    │           ├── vue-vendor-Ys7FJ5fz.js.map
|    │           └── vue-vendor-DAacDxeL.css
|    │
|    ├── router/
|    │   └── index.ts
|    │
|    ├── scripts/
|    │   ├── build-graph.ts
|    │   ├── deploy.ts
|    │   ├── generate.ts
|    │   ├── ai-review.ts
|    │   ├── review-changes.ts
|    │   └── rollback.ts
|    │
|    ├── e2e/
|    │   └── homepage.spec.ts
|    │
|    └── src/
|        ├── App.vue
|        ├── main.js
|        ├── style.css
|        │
|        ├── assets/                      # 源码静态资源
|        │   ├── hero.png
|        │   ├── vite.svg
|        │   └── vue.svg
|        │
|        ├── api/
|        │   ├── product.ts
|        │   └── testApi.ts
|        │
|        ├── components/
|        │   ├── HelloWorld.vue
|        │   ├── LogoDebugTrigger.vue
|        │   └── WebSocketDemo.vue
|        │
|        ├── composables/
|        │   └── useVConsole.ts
|        │
|        ├── stores/
|        │   └── modules/
|        │       └── product.ts
|        │
|        ├── types/
|        │   ├── global.d.ts
|        │   ├── logger.d.ts
|        │   ├── vue.d.ts   # 申明类型文件
|        │   └── vconsole.d.ts
|        │
|        ├── utils/
|        │   ├── logger.ts
|        │   ├── performanceReporter.ts
|        │   ├── request.ts
|        │   ├── requestPool.ts
|        │   ├── retry.ts
|        │   └── _tests_/
|        │       └── math.test.ts
|        │
|        └── views/
|            ├── Admin.vue
|            ├── Home.vue
|            ├── User.vue
|            └── product/
|                └── index.vue
├── screenshots/
├── Architecture.MD
├── Architecture.en.MD
├── .gitignore
├── LICENSE
├── README.en.md
└── README.md
省略:
.git/
node_modules/
构建产物、Source Map 和部分静态资源细节
```

## 三、技术栈与工具链

```
- | 框架 | Vue 3 + TypeScript |
- | 构建工具 | Vite |
- | 包管理工具 | pnpm |
- | 状态管理 | Pinia |
- | 路由 | Vue Router |
- | 代码规范 | ESLint+Prettier |
- | CI/CD | Github Actions + Github Pages|
- | 单元测试 | Vitest |
- | 代码规范 | ESLint+Prettier+Husky+Lint-Staged |
- | E2E测试 | Playwright |
- | 网络治理 | Axios + 请求池 + 指数退避重试 |
- | 抓包代理 | whistle |
- | 调试工具 | vConsole + SourceMap + 远程日志回捞 |
- | 性能优化 | Lighthouse |
- | 性能监控 | Web Vitals(LCP/INP/CLS)
Largest Contentful Paint(最大内容绘制【加载性能】)
Cumulative Layout Shift (累积布局偏移【页面会不会乱跳】)
Interaction to Next Paint (交互至下一次绘制【全部交互响应】)|
- | 代码审查 | AI Code Review |
- | AI辅助审查 | 知识图谱生成 + AI Code Review |
```

---

## 四、核心能力矩阵

### 1.开发环境与环境

```
- ESLint + Prettier + Husky 强制代码规范，不合格代码无法提交
- 多环境配置（.env.production/.env.staging/.env.development），不同环境不同配置 一套代码三套环境
- 自动化代码生成器(`pnpm gen`)，一键生成界面/ API / Store骨架
- 路径别名 `@` 指向 `src`，统一源码导入方式
- `pnpm type-check`、`pnpm lint:check`、`pnpm format:check` 分别校验类型、代码规范和格式
```

### 2.构建与性能优化

```
- 路由懒加载 + manualChunks分包，首屏体积减少40%-60%
- SourceMap生产报错精准定位源码
- CDN 路径配置 + 版本资源号 hash 控制浏览器缓存
- Lighthouse性能分析，性能优化
- Vite 通过 `manualChunks` 将 Vue 和 Vue Router 拆分为 `vue-vendor`，并保留 Source Map 方便定位生产问题
```

### 3.网络层治理

```
- Axios + 请求池控制并发数：同域名最多6个并发，防止浏览器崩溃
- 指数退避重试(500ms->1000ms->2000ms...)
- whistle抓包代理，模拟网络环境：Mock数据，重定向等/ 跨域CORS注入 / HTTPS 解密 /线上热替换
```

### 4.自动化测试与CI/CD

```
- 单元测试：Vitest，覆盖核心工具函数
- E2E测试：Playwright自动打开浏览器，模拟用户真实操作
- 当前 E2E 冒烟用例覆盖首页加载和用户中心路由跳转
- CI流水线：Github Actions，push后自动执行 lint+test+build,失败则阻止合并
- CD流水线：CI通过后自动构建并发布到Github Pages
- 部署与回滚：`pnpm deploy` 备份+部署+冒烟测试，`pnpm rollback` 回滚一键恢复
```

### 5.调试与线上可观测性

```
- vconsole隐藏入口：连续点击5次，显示调试入口，无需发版即可线上调试
- 远程日志回捞：错误日志存localStorage，用户一键导出JSON
- ServiceWorke：断网刷新页面依然可访问（PWA 离线缓存）
- WebSockets:全双工实时消息推送，实时更新数据
- Web Vitals:LCP/INP/CLS/TTFB性能监控实时采集
```

### 6.AI辅助研发

```
- 知识图谱生成：`ts-morph` 静态分析源码，`d3.js` 可视化展示函数依赖关系
 AI Code Review 三种方式：
   - 方式一：手动复制 Prompt 喂给 AI（最低成本）
   - 方式二：基于 `pnpm graph` 生成知识图谱后半自动整理 Prompt
   - 方式三：配置 API Key 全自动调用 AI 生成报告
- `pnpm ai-review` 会读取 Git Diff 和 `knowledge-graph.json`，结合 `DEEPSEEK_API_KEY` 生成影响范围与合并建议

```

### 7.当前可访问页面

- `/`：环境信息、请求池并发控制、重试、Whistle Mock、WebSocket、远程日志和隐藏调试入口
- `/user`：用户中心懒加载页面
- `/admin`：管理后台懒加载页面
- `/product`：由代码生成器生成的 Product 页面示例

```

```

---

## 五、快速启动

# 进入当前主项目

cd Demo2/demo2-env

# 1. 安装依赖

pnpm i

- pnpm i

# 2. 启动开发环境（默认 http://127.0.0.1:5173）

pnpm dev

- pnpm dev

# 3. 类型检查、代码检查与格式检查

pnpm type-check
pnpm lint:check
pnpm format:check

# 4. 启动生产预览

pnpm build
pnpm preview

- pnpm preview

# 5. 启动测试

pnpm test # 单元测试
pnpm test:coverage # 单元测试并生成覆盖率
pnpm test:e2e # Playwright E2E 测试
pnpm test:e2e:ui # Playwright UI 模式

- pnpm test:e2e # E2E测试

# 6. 构建与部署

pnpm deploy # 构建、备份、部署并执行冒烟测试

- pnpm deploy # 自动化部署

# 7. 回滚

pnpm rollback

- pnpm rollback # 一键回滚

# 8. AI 辅助研发

pnpm graph # 生成 knowledge-graph.json 和 visualize.html

# 配置 DEEPSEEK_API_KEY 后再执行

pnpm ai-review

# 9. 代码生成

pnpm gen # 交互式生成 view + api + store

# pnpm gen -- --force # 允许覆盖已存在文件

````

### 环境变量

项目提供 `.env.development`、`.env.staging`、`.env.production` 和 `.env.test` 配置文件。复制 `.env.example` 后，根据运行场景调整 `VITE_BASE_PATH` 等变量；AI Review 还需要配置 `DEEPSEEK_API_KEY`，不要将密钥提交到仓库。

```bash
# 例如使用 staging 配置启动
pnpm vite --mode staging
````

### 知识图谱与 AI Review

```bash
# 先生成源码依赖图
pnpm graph

# 打开生成的可视化页面
# visualize.html

# 配置密钥后自动生成 Review
# PowerShell：$env:DEEPSEEK_API_KEY="sk-xxx"; pnpm ai-review
```

## 六、项目亮点

```
✅ 所有工程化能力均可复用：6 个工具函数即插即用（requestPool、retry、logger、useVConsole 等）

✅ CI/CD 全流程无人值守：从 git push 到自动部署到 GitHub Pages，完全自动化

✅ 线上调试无需重新发版：vConsole 隐藏入口 + 远程日志回捞，线上问题 5 分钟内定位

✅ AI 辅助 Code Review：知识图谱精准分析影响范围，AI 自动生成 Review 意见


```

## 七、在线演示

```
GitHub Pages 地址：https://terrenceeeee.github.io/AI-frontend-engineering-starter/

知识图谱示例：运行 pnpm graph 后生成 visualize.html 打开即可查看
```

---

## 八、可复用资产清单

```
  类型	         文件	                                          复用方式
工具函数	utils/requestPool.ts	                            直接复制到新项目
工具函数	utils/retry.ts	                                  直接复制到新项目
工具函数	utils/logger.ts	                                  直接复制到新项目
工具函数	composables/useVConsole.ts	                      直接复制到新项目
工具函数	src/utils/performanceReporter.ts	                直接复制到新项目
工具函数	src/components/LogoDebugTrigger.vue	              直接复制到新项目
工具函数	src/components/WebSocketDemo.vue	                直接复制到新项目
配置文件	.eslintrc.cjs	                            复制 + 微调（是 React 项目，去掉 plugin:vue，换成 React 规则集）
配置文件	.prettierrc.cjs	                          复制 + 微调（改改 printWidth（行宽）、singleQuote（单引号）偏好）
配置文件	.husky/pre-commit                                 复制 + 微调（改规则集）
配置文件	vite.config.ts 的 build.rollupOptions                复制 + 微调（改规则集）
配置文件	.github/workflows/deploy.yml                复制 + 微调（改VITE_BASE_PATH（部署子路径）、Node 版本）
配置文件	playwright.config.js                        复制 + 微调（改baseURL（http://127.0.0.1:5173→新项目端口）、testDir（./e2e））
配置文件	vite.config.ts 的 resolve.alias             复制 + 微调（改'@': path.resolve(__dirname, 'src') 路径）
配置文件	vite.config.ts 的 test 配置                       复制 + 微调（改规则集）
配置文件	.github/workflows/ci.yml	                         复制 + 微调（改 Node 版本）
  脚本	     scripts/generate.ts	                          改模板内容后复用
  脚本	     scripts/deploy.ts	                            改部署目标后复用
  脚本	     scripts/rollback.ts	                          改备份路径后复用
```

## 九、关于作者

- 作者：ChamLerrence
- GitHub: https://github.com/terrenceeeee
- 完成时间：2026 年 9 月
- 学习路径：从零搭建 28 个工程化 Demo + AI Code Review 项目

---

## License

MIT © 2026 Terrenceeeee
