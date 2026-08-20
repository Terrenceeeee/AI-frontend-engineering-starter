# 🚀 前端工程化实战项目集

> 从0搭建完整的企业级前端工程化体系，覆盖代码规范，CI/CD,性能优化，AI辅助审查全链路

---

## 一、项目简介

本项目基于 **Vue3+Typescript+Vite+pnpm** 技术栈，通过23个专题Demo+1个AI Code Review工具，完整实践了从“本地开发”到“线上部署”的工程化全流程。

**核心目标**：解决多人协作线下代码质量不可控，部署流程繁琐，线上问题难定位等团队痛点。

---

## 二、技术栈与工具链

```
- | 框架 | Vue3+Typescript |
- | 构建工具 | Vite |
- | 包管理工具 | pnpm |
- | 代码规范 | ESLint+Prettier |
- | CI/CD | Github Actions + Github Pages|
- | 单元测试 | Vitest |
- | 代码规范 | ESLint+Prettier+Husky+Lint-Staged |
- | E2E测试 | Playwright |
- | 网络治理 | Axios + 请求池 +指数退避重试 |
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

## 三、核心能力矩阵

### 1.开发环境与环境

```
- ESLint + Prettier + Husky 强制代码规范，不合格代码无法提交
- 多环境配置（.env.production/.env.staging/.env.development），不同环境不同配置 一套代码三套环境
- 自动化代码生成器(`pnpm gen`)，一键生成界面/ API / Store骨架
```

### 2.构建与性能优化

```
- 路由懒加载 + manualChunks分包，首屏体积减少40%-60%
- SourceMap生产报错精准定位源码
- CDN 路径配置 + 版本资源号 hash 控制浏览器缓存
- Lighthouse性能分析，性能优化
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
- AI Code Review 三种方式：
  - 方式一：手动复制 Prompt 喂给 AI（最低成本）
  - 方式二：`pnpm ai-review` 半自动生成 Prompt
  - 方式三：配置 API Key 全自动调用 AI 生成报告
```

---

## 四、快速启动

```bash
# 1.安装依赖
- pnpm i

# 2.启动开发环境
- pnpm dev

# 3.启动生产环境
- pnpm build
- pnpm preview

# 4.启动测试环境
- pnpm test  # 单元测试
- pnpm test:e2e  # E2E测试

# 5.构建与部署
- pnpm build  # 构建生产产物
- pnpm deploy # 自动化部署

# 6.回滚
- pnpm rollback # 一键回滚

# 7.AI辅助研发
- pnpm graph # 知识图谱生成
- pnpm ai-review # AI辅助审查 生成 AI Code Review
```

## 五、项目亮点

```
✅ 所有工程化能力均可复用：6 个工具函数即插即用（requestPool、retry、logger、useVConsole 等）

✅ CI/CD 全流程无人值守：从 git push 到自动部署到 GitHub Pages，完全自动化

✅ 线上调试无需重新发版：vConsole 隐藏入口 + 远程日志回捞，线上问题 5 分钟内定位

✅ AI 辅助 Code Review：知识图谱精准分析影响范围，AI 自动生成 Review 意见


```

## 六、在线演示

```
GitHub Pages 地址：https://terrenceeeee.github.io/Front-end-engineering/

知识图谱示例：运行 pnpm graph 后生成 visualize.html 打开即可查看
```

---

## 七、可复用资产清单

```
  类型	         文件	                          复用方式
工具函数	utils/requestPool.ts	            直接复制到新项目
工具函数	utils/retry.ts	                  直接复制到新项目
工具函数	utils/logger.ts	                  直接复制到新项目
工具函数	composables/useVConsole.ts	      直接复制到新项目
工具函数	src/utils/performanceReporter.ts	      直接复制到新项目
工具函数	src/components/LogoDebugTrigger.vue	      直接复制到新项目
工具函数	src/components/WebSocketDemo.vue	      直接复制到新项目
配置文件	.eslintrc.cjs	                    复制 + 微调（是 React 项目，去掉 plugin:vue，换成 React 规则集）
配置文件	.prettierrc.cjs	                  复制 + 微调（改改 printWidth（行宽）、singleQuote（单引号）偏好）
配置文件	.husky/pre-commit                 复制 + 微调（改规则集）
配置文件	vite.config.ts 的 build.rollupOptions                复制 + 微调（改规则集）
配置文件	.github/workflows/deploy.yml         复制 + 微调（改VITE_BASE_PATH（部署子路径）、Node 版本）
配置文件	playwright.config.js                 复制 + 微调（改baseURL（http://127.0.0.1:5173→新项目端口）、testDir（./e2e））
配置文件	vite.config.ts 的 resolve.alias      复制 + 微调（改'@': path.resolve(__dirname, 'src') 路径）
配置文件	vite.config.ts 的 test 配置          复制 + 微调（改规则集）
配置文件	.github/workflows/ci.yml	           复制 + 微调（改 Node 版本）
  脚本	     scripts/generate.ts	             改模板内容后复用
  脚本	     scripts/deploy.ts	               改部署目标后复用
  脚本	     scripts/rollback.ts	             改备份路径后复用
```

## 八、关于作者

- 作者：ChamLerrence
- GitHub: https://github.com/terrenceeeee
- 完成时间：2026 年 9 月
- 学习路径：从零搭建 23 个工程化 Demo + AI Code Review 项目

---

## License

MIT © 2026 Terrenceeeee
