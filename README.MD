# DEMO一. pnpm 和npm的不同点

# 图为在Git bash中 分别创建两个不同的依赖（npm pnpm）创建的相同的vue文件

![未加载成功](<./screenshots/Screenshot 2026-07-27 093856.png>)
其显示出的pnpm与npm所依赖的node_modules大小几乎一致 原因是二者的vue项目目前都是空的 依赖包数量少 体积小
如果创建了n个npm项目 那么内存就会成为n倍 而同样的情况下 pnpm的所占内存不变

# 查询inode等node_modules 目录内容 都是输入 ls -la node_modules/

# 如果vue和pnpm系统分区相同 那么他们的inode是相同的 反之一定不相同

# 相同则说明确实证明是硬链接，不是复制 这极大地省下了巨大的内存空间

---

# DEMO二.Vite 多环境配置与 mode 运行时验证

![未加载成功](<screenshots/Screenshot 2026-07-27 112654.png>)
![未加载成功](<screenshots/Screenshot 2026-07-27 113110.png>)

# 这两张图说明确实证明是硬链接，不是复制 这极大地省下了巨大的内存空间

# 证明pnpm强制的严格隔离性 lodash未申明未依赖 绝不安装

![未加载成功](<screenshots/Screenshot 2026-07-27 113202.png>)

# 未在所属环境中 引入VITE\_前缀的变量 在界面内直接引用 会报undefined

![未加载成功](<screenshots/Screenshot 2026-07-27 142038.png>)
![未加载成功](<screenshots/Screenshot 2026-07-27 144531.png>)

# 修改vite.config.js 以及为什么要修改

不修改它，Vite 就用默认配置：

1.端口 5173 2.不自动打开浏览器3.不生成 sourcemap 4.不区分环境加载变量（只能用默认的 development/production）

修改它，你可以定制 Vite 的行为：

1.改端口2.自动打开浏览器3.生成 sourcemap 4.根据 command 和 mode 做条件判断5.配置代理、别名、插件等

改完之后他会在终端中显示体现
![alt text](<screenshots/Screenshot 2026-07-27 151241.png>)

<code>
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import fs from 'fs';
import path from 'path';

// ============================================================
// 这部分代码在 Node 环境执行（终端里看输出）
// ============================================================
console.log('\n========== Vite 配置文件加载（pnpm 环境）==========');
console.log('当前命令:', process.argv[2]); // 'serve' 或 'build'
console.log('当前工作目录:', process.cwd());

// 验证 pnpm 的 .pnpm 目录是否存在
const pnpmDir = path.join(process.cwd(), 'node_modules', '.pnpm');
if (fs.existsSync(pnpmDir)) {
console.log('✅ 检测到 pnpm 的 .pnpm 目录（严格隔离模式）');

// 读取 .pnpm 目录下的内容，展示 pnpm 的存储结构
const items = fs.readdirSync(pnpmDir).slice(0, 6);
console.log(' .pnpm 目录内容（前6个）:', items.join(', '));
} else {
console.log('❌ 未检测到 .pnpm 目录，当前可能不是 pnpm 项目');
}

// 验证 node_modules 顶层只有声明过的依赖
const nodeModulesDir = path.join(process.cwd(), 'node_modules');
const topLevelDeps = fs.readdirSync(nodeModulesDir).filter((name) => !name.startsWith('.'));
console.log(' node_modules 顶层依赖:', topLevelDeps.join(', '));
console.log('==================================================\n');

// ============================================================
// Vite 配置导出
// ============================================================
export default defineConfig(({ command, mode }) => {
console.log('>> defineConfig 接收到的 command:', command);
console.log('>> defineConfig 接收到的 mode:', mode);
console.log('>> 将加载 .env.' + mode + ' 文件');

return {
plugins: [vue()],

    // 开发服务器配置
    server: {
      port: mode === 'test' ? 3000 : 5173,
      open: true, // 自动打开浏览器
    },

    // 构建配置
    build: {
      sourcemap: true, // 生成 sourcemap 便于调试
    },

};
});
</code>

# 添加的代码部分作用

拓展工具：fs+path 是为了做路径处理、本地文件读写，绝大多数用来配置路径别名、本地 https 证书

console.log('当前命令:', process.argv[2]); // 'serve' 或 'build' process.argv[]是node函数内置数组，记录终端启动的整条命令

<!-- pnpm dev → 这里打印serve
pnpm build → 这里打印build -->

console.log('当前工作目录:', process.cwd()); //获取你执行命令的文件夹路径（项目根目录）

# 2、核心：检测是否为 pnpm 项目（最关键）

const pnpmDir = path.join(process.cwd(), 'node_modules', '.pnpm');
if (fs.existsSync(pnpmDir)) { //fs.existsSync：Node 文件 API，判断这个文件夹是否存在
// 找到node_modules/.pnpm，判定是pnpm
const items = fs.readdirSync(pnpmDir).slice(0,6);
console.log('✅ 检测到 pnpm 的 .pnpm 目录（严格隔离模式）');
console.log(' .pnpm 目录内容(前6个):', items.join(','));
} else {
console.log('❌ 未检测到 .pnpm 目录，当前可能不是 pnpm 项目');
}

<!-- pnpm 独有特征：安装依赖后，node_modules里一定会有.pnpm隐藏文件夹。
所有真实依赖文件都存放在.pnpm，外面的包全是硬链接；
npm 没有.pnpm文件夹，因此只要检测这个文件夹存在，就能百分百确定是 pnpm 安装的依赖。 -->

const nodeModulesDir = path.join(process.cwd(), 'node_modules'); // 拼接路径：获取当前命令行所在根目录下 node_modules 文件夹的绝对路径

// 读取 node_modules 整个目录下所有文件/文件夹名称
// filter 过滤规则：保留「不以英文点 . 开头」的内容，剔除 .pnpm、.DS_Store 这类隐藏文件/隐藏目录
const topLevelDeps = fs.readdirSync(nodeModulesDir).filter(name => !name.startsWith('.'));

// 将过滤后的顶层依赖数组用英文逗号拼接为字符串，打印到终端
console.log(' node_modules 顶层依赖:', topLevelDeps.join(','));

# 返回Vite最终配置对象

return {
// 注册vue插件，让Vite支持解析.vue单文件组件
plugins: [vue()],

# 开发服务相关配置，只在pnpm dev生效

    server: {
      port: mode === 'test' ? 3000 : 5173, // 固定本地开发端口为5173，不使用随机端口
      <!-- defineConfig 回调写法优势：可以根据mode/command做动态配置 -->
      open: true, // 启动服务后自动打开默认浏览器访问项目地址
    },

# 打包构建配置，只在pnpm build打包时生效

build.sourcemap: true 生成 .map 文件，方便调试时看到源码位置（工程化实战中，这用于线上报错定位）

# 检测开发环境 pnpm dev

![alt text](<screenshots/Screenshot 2026-07-27 164314.png>)

# 检测生产环境 pnpm build

# 检测自定义 staging 环境 pnpm build -- --mode staging

![alt text](<screenshots/Screenshot 2026-07-27 164455.png>)

# 检测生产环境 pnpm build -- --mode test pnpm preview

![alt text](<screenshots/Screenshot 2026-07-27 164602.png>)

## 需要切回开发模式的话 直接pnpm dev即可 毫不影响 正是工程化“构建与交付分离”的核心设计思想

---

# DEMO3、ESLint + Prettier + Husky + lint-staged 全流程卡点实战 （直接在Demo2内操作）

在项目根目录执行：

# 第一步： 安装 ESLint 及相关 Vue 3 规则集

pnpm add -D eslint eslint-plugin-vue @vue/eslint-config-typescript @typescript-eslint/eslint-plugin @typescript-eslint/parser
包的作用：

<!-- eslint	JavaScript/TypeScript 代码检查核心库 -->
<!-- eslint-plugin-vue：	Vue 3 专用规则（检查 .vue 文件的模板和 script） -->
<!-- @vue/eslint-config-typescript	Vue 官方推荐的 TypeScript ESLint 配置 -->
<!-- @typescript-eslint/parser	让 ESLint 能解析 TypeScript 语法 -->
<!-- @typescript-eslint/eslint-pluginESLint： 专门适配 TypeScript 的规则插件。 -->

# 安装 Prettier 及相关插件

pnpm add -D prettier eslint-config-prettier eslint-plugin-prettier

<!-- prettier	：代码格式化工具（自动统一风格） -->
<!-- eslint-config-prettier	：关闭 ESLint 中与 Prettier 冲突的规则 -->
<!-- eslint-plugin-prettier	：把 Prettier 的格式化能力以 ESLint 规则形式运行 -->

# 安装 Husky 和 lint-staged

pnpm add -D husky lint-staged

<!-- husky	Git Hooks ：管理工具（在 .git/hooks/ 中插入脚本） -->
<!-- lint-staged	：只对 Git 暂存区文件执行检查 -->

# 第二步：配置ESLint cjs文件

# 比如说：.eslintrc.cjs

为什么在ESModule 项目中要使用CommonJS的写法？
：如果起名为xxxx.js Node会把它当成ESM ESM不可以直接写module.exports 语法报错
所以说要用xxx.cjs 强制走CommonJS 写法固定成熟 几乎不会出现解析BUG 稳定性更高

# 第三步：创建 Prettier 配置文件

项目根目录创建 .prettierrc.cjs：

# 第四步：创建 Prettier 忽略文件

在该文件中声明的文件/目录
Prettier 会跳过这些目录/文件，不进行格式化。
一般就是dist/
node*modules/
*.log
_.lock
_.yaml
_.yml
_.html
\_.svg 这些文件
总而言之 就是Prettier 只管手写的业务源码（ts、js、vue、css 等）；

# 第五步：在 package.json 中添加 scripts 和 lint-staged 配置

打开 package.json，在 "scripts" 中添加以下命令，并在根节点添加 "lint-staged" 字段：

具体操作：只改 3 个地方

1. 在 "scripts" 里添加 5 个新命令（原有的 dev、build、preview 不要动）
   json
   {
   "scripts": {
   "lint": "eslint . --ext .vue,.js,.ts --fix", // ← 新增
   "format": "prettier --write .", // ← 新增
   "lint:check": "eslint . --ext .vue,.js,.ts", // ← 新增
   "format:check": "prettier --check .", // ← 新增
   "prepare": "husky" // ← 新增 //"prepare": "husky" 的作用是让 pnpm install 时自动初始化 Husky，这样团队成员克隆项目后只需 pnpm install，Git Hooks 就会自动配置好
   }
   }
2. 在 package.json 的根节点（和 "scripts" 平级）添加 "lint-staged" 字段
   json
   {
   "name": "demo2-env",
   "private": true,
   "version": "0.0.0",
   "scripts": { /_ ... _/ },
   "lint-staged": { // ← 整个字段都是新增的
   "_.{js,ts,vue}": [
   "eslint --fix",
   "prettier --write"
   ],
   "_.{css,scss}": [
   "prettier --write"
   ],
   "_.{json,md}": [
   "prettier --write"
   ]
   },
   "dependencies": { /_ ... _/ },
   "devDependencies": { /_ ... \*/ } // ← 新增的 devDependencies 也在这里
   }
3. 在 "devDependencies" 中添加新包的列表（原有的 @vitejs/plugin-vue、vite、vue 等都要保留）
   json
   {
   "devDependencies": {
   "typescript": "^5.5.3",
   "vue-eslint-parser": "^9.4.3"
   }
   }

# 第六步：初始化 Husky 在Git bash终端中输入

# 必须是"prepare": "husky install" 否则钩子无法初始化！！

Husky 9.x 的初始化方式和使用 package.json 中的 "prepare": "husky" 脚本自动触发。为了让 Husky 立即生效，手动执行一次：
pnpm run prepare

# 但需要在当前文件夹内部申明 Git Husky若无Git(git init)存在 则无法初始化

这会在项目根目录创建 .husky/ 文件夹。然后手动创建 pre-commit 钩子文件：

# 一键生成钩子pre-commit :npx husky hook add pre-commit "npx lint-staged"

查看 .husky/pre-commit 文件内容，确保它是这样的：
<code>
#!/bin/sh
. "$(dirname "$0")/\_/husky.sh" //里面没有\

pnpm lint-staged
</code>

# 这个文件的作用： 当你执行 git commit 时，Git 会先执行这个脚本。脚本调用 pnpm lint-staged，而 lint-staged 只会检查你本次 git add 的那些文件。

# 第七步：验证安装是否成功

验证 1：ESLint 能正常运行 pnpm lint
验证 2：Prettier 能正常运行 pnpm format
验证 3：lint-staged 能正常运行
git add src/App.vue //先 add 一个文件到暂存区
pnpm lint-staged
![alt text](<screenshots/Screenshot 2026-07-28 111857.png>)
发现代码报错 原因是 eslint版本过新 不支持原本的.eslintrc.cjs文件 需要改用eslint.config.js

# 解决方案：

方案一：（最简单推荐：降级 ESLint 到 8.x，适配你现有的.eslintrc.cjs）
新版本 ESLint 改动极大，大量规则写法全部重写，新手最稳妥是降级回稳定的 v8 版本，兼容你现在所有配置：
卸载现有高版本 eslint 全套
powershell
pnpm remove eslint eslint-plugin-vue @vue/eslint-config-typescript @typescript-eslint/eslint-plugin @typescript-eslint/parser
固定安装 8 系列稳定版
powershell
pnpm add -D eslint@8 eslint-plugin-vue @vue/eslint-config-typescript @typescript-eslint/eslint-plugin @typescript-eslint/parser
再次执行
powershell
pnpm lint
.eslintrc.cjs 可以正常被识别，不用改配置代码。
方案二：（保留 ESLint 10，全面迁移新版配置）
需要做 3 件事：
把根目录的 .eslintrc.cjs 重命名为 eslint.config.js
把配置语法从 CommonJS module.exports 改成 ESM export default，重写整套规则格式（语法变动非常多）
适配插件导入写法，大部分旧规则名失效需要替换
pnpm add -D @eslint/js typescript-eslint eslint-config-prettier //10代需要添加的扁平包
缺点：改动量大，你整套 Vue+TS 规则都要重写，不适合现阶段。

# ESLint 9/10 是大版本破坏性更新，抛弃传统 .eslintrc 所有格式，强制全新扁平化配置

![alt text](<screenshots/Screenshot 2026-07-28 114743.png>)
运行正常 但是一堆报错 是因为他扫描了一堆本不该扫描的文档/文件
可以改为<code>"lint": "eslint src --ext .vue,.js,.ts --fix",</code>
![alt text](<screenshots/Screenshot 2026-07-28 115605.png>)
可以发现 改完不扫描无关文档/文件 就不会报错了

![alt text](<screenshots/Screenshot 2026-07-28 135458.png>)
Prettier正常运行

![alt text](<screenshots/Screenshot 2026-07-28 135622.png>)
Lint-staged正常运行

# 第八步：故意写一段“坏代码”（验证卡点）

如：故意用双引号，故意不加分号等

# 第九步：提交坏代码（观察被拦截）

<code>
#将坏代码添加到暂存区
git add src/App.vue

#尝试提交
git commit -m "test: 故意提交坏代码验证 ESLint 拦截"
</code>
而后就会看到Husky的日志 报错 阻止提交

# ESLint 和 Prettier 谁先执行？

lint-staged 配置里从左到右依次执行：["eslint --fix", "prettier --write"]。先 ESLint 修代码风格，再 Prettier 格式化，避免相互覆盖

# --fix 修不了的问题怎么办？

自动修复失败时，lint-staged 会终止提交，你需要手动修复后再 add 提交。这是故意的——宁可不让提交，也不能让坏代码进仓库。

---

# DEMO4 Vite 分包策略与路由懒加载效果验证

# 第一步：在现有项目里创建 3 个页面 Home User Admin

# 第二步：安装并配置路由

<code>pnpm add vue-router</code>
在router/index.ts里加上
<code>
// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router';

// ⭐ 关键：所有页面都用 () => import() 实现懒加载
const routes = [
{
path: '/',
name: 'Home',
component: () => import('@/views/Home.vue'),
},
{
path: '/user',
name: 'User',
component: () => import('@/views/User.vue'),
},
{
path: '/admin',
name: 'Admin',
component: () => import('@/views/Admin.vue'),
},
];

const router = createRouter({
history: createWebHistory(),
routes,
});

export default router;
</code>

# 在这段代码中 用component:()=>import('文件地址')实现路由的懒加载

# 第三步：修改(添加几行代码) src/main.ts 注册路由

<code>
import router from './router';

app.use(router);
</code>

# 第四步：修改 src/App.vue 显示路由出口

<code>
<template>
  <div style="padding: 20px; font-family: 'Courier New', monospace;">
    <h1 style="color: #42b883;">🌍 Vite 分包验证 Demo</h1>
    <p>当前环境：<strong>{{ mode }}</strong></p>  //import.meta.env.MODE无法在非js/ts我机组生效 此处现在替换为了mode 同时在下方声明

    <nav style="margin: 20px 0; padding: 12px; background: #f5f5f5; border-radius: 6px;">
      <router-link to="/" style="margin-right: 20px;">🏠 首页</router-link>
      <router-link to="/user" style="margin-right: 20px;">👤 用户中心</router-link>
      <router-link to="/admin">🔐 管理后台</router-link>
    </nav>

    <hr />

    <!-- 路由出口：当前页面的内容会渲染在这里 -->
    <router-view />

  </div>
</template>

<script setup>
console.log('App.vue 加载了（主入口）');
const mode =import.meta.env.MODE
</script>
</code>

# 第五步：修改 vite.config.ts 配置分包

这一步是关键——让 Vite 在打包时主动拆分代码： 修改vite.config.ts
保留所有原有配置，只新增 resolve 和 build.rollupOptions
<code>

export default defineConfig({
plugins: [vue()],

resolve: {
// 配置路径别名，让 @ 指向 src/
alias: {
'@': path.resolve(\_\_dirname, 'src'),
},
},

build: {
// 生成 sourcemap，便于调试时定位源码位置
sourcemap: true,
rollupOptions: {
output: {

# 分包拆分规范：手动分包：把 Vue 核心库单独打成一个 vendor 包 !!!!此处最新版Rollup要求使用函数形式而非对象形式

manualChunks(id) {
// 所有以 'vue' 开头的包（vue、vue-router 等）都打包到 vue-vendor 中
if (id.includes('vue') || id.includes('vue-router')) {
return 'vue-vendor'
}
},
// 每个 chunk 的文件名格式，[name] 会自动取 manualChunks 里定义的 key

# chunk里的[hash]值的作用：每次构建会生成唯一的hash值，重新构建会生成一个新的hash值，浏览器就会认为他变了，会重新强制加载一次缓存；如果hash值不变，则浏览器就只会一直读缓存里的，不会重复下载

chunkFileNames: 'assets/[name]-[hash].js',
},
},
},
});
</code>

# 第六步：在终端一次性验证所有场景

# 在开发环境下： pnpm dev ： 不做完整打包，按需加载文件，启动，热更新极快

![alt text](<Screenshot 2026-07-29 101232.png>)
可以看出：所有 .vue 组件是通过 ?import 请求分别加载的（因为 Vite 在开发模式下不做打包合并）
![alt text](<screenshots/Screenshot 2026-07-29 101246.png>)
再次观察：打开其他界面时（切换路由），浏览器network面板可以看见该界面的动态加载

# 在生产环境下： pnpm build

1.读取环境变量2.解析入口3.构建依赖图谱4.插件转换（把输入的.vue,.ts,.less转换为.js,.css 5.摇树优化6.代码拆分7.压缩混淆8.输出dist/目录+清单（manifest）
![alt text](<screenshots/Screenshot 2026-07-29 102514.png>)

# 在预览环境下： pnpm preview（最重要的一步）

![alt text](<screenshots/Screenshot 2026-07-29 102713.png>)
明显的发现Network面板少了不少加载的东西
没有出现 User-xxx.js 或 Admin-xxx.js。说明它们没有被加载，实现了“按需加载”
然后点击导航栏的“用户中心”，观察 Network 面板，或者也可以观察console面板
发现这时出现了我们点击对应的路由的名字
![alt text](<screenshots/Screenshot 2026-07-29 103241.png>)

# 这就是路由懒加载的效果——用户不访问的页面，代码不会提前加载

# 如果失去分包规范，即失去manualChunks的功能 会出现：文件重复下载

# manualChunks的功能：分包规范，Rollup 原生提供的手动分包配置项，Vue 核心库只加载一次，后续页面直接读浏览器缓存，减少重复下载，这个文件的 hash 只在这些库的版本号变化时才会改变——你改业务代码不会让 vendor 的 hash 变化，用户不需要重新下载 85KB 的 Vue 核心库，只下载被改动的业务 chunk

# 该步骤核心：分包的核心目标就是把首页必须加载的 JS 压缩到最小

---

# DEMO5:基于 fs + inquirer 的自动化代码生成器

# 第一步：安装依赖

用 Node.js 脚本，通过命令行交互询问用户，然后自动创建 view、api、store 三个目录下的文件骨架
inquirer 从 v9 开始是纯 ESM 包，如果项目是 ESM（"type": "module"），直接 import 即可。但我们这里用 CommonJS 方式写脚本（方便在终端直接运行），所以使用 inquirer@8.2.6（最后一个支持 CommonJS 的版本）
最新版本：
pnpm add -D inquirer @types/inquirer
支持cjs写法的8.2.6版本：
pnpm add -D inquirer@8.2.6

# 第二步：创建脚本文件

在项目根目录下创建scripts文件夹，然后创建 generate.ts
解决了：日常开发每个新业务模块都要手动新建 3 个文件、重复写基础模板，效率低且格式不统一：
不用反复复制粘贴 Vue、API、Pinia 样板代码
强制统一全项目代码格式、命名规范（大驼峰接口 / 小驼峰文件）
自带 TS 类型模板，不用从零手写 interface
内置文件覆盖保护，防止误删已有代码，支持--force强制覆盖

运行使用方式：
常规唤起交互
ts-node generate.ts

# 第三步：在 package.json 中添加脚本命令

"gen": "node scripts/generate.js"

<!-- 优势 1：开箱即用，环境要求更低
别的同事拉取代码后，不用安装 ts-node、typescript 等开发依赖，只要有 Node 就能跑。
优势 2：命令极简
不用记长路径、不用管 ts，统一用 npm run gen 新建业务模块，团队所有人操作一致。
优势 3：工程化规范
脚手架脚本统一收在 scripts 目录，项目结构干净，所有自动化脚本集中管理 -->

# 第四步：创建必要的目录结构

在 src/ 下创建 api/、stores/modules/、views/ 目录（如果还没有的话）： //mkdir = make directory -p 父目录不存在时自动逐级创建；文件夹已经存在也不会报错，静默跳过

mkdir -p src/api
mkdir -p src/stores/modules
mkdir -p src/views

同时需要创建 src/utils/request.ts（API 模板里引用了它）：
<code>
// src/utils/request.ts
import axios from 'axios';

const request = axios.create({
baseURL: import.meta.env.VITE_API_BASE_URL,
timeout: 10000,
});

// 响应拦截器：直接返回 data
request.interceptors.response.use(
(response) => response.data,
(error) => Promise.reject(error)
);

export default request;
</code>

# 第六步：执行脚本生成模块

pnpm gen
![alt text](<screenshots/Screenshot 2026-07-29 145016.png>)

# 第七步：验证生成的文件

在src/views内部新生成了一个新的文件夹product 里面有新生成的index.vue
以及在api/中生成的product.ts

# 第八步：将生成的路由注册到 Vue Router

打开 src/router/index.ts，在 routes 数组中新增一个路由：
<code>
// ========== 新增：自动生成的 product 路由 ==========
{
path: '/product',
name: 'Product',
component: () => import('@/views/product/index.vue'),
},
</code>

# 第九步：在首页添加导航链接

打开views/Home.vue 在导航区添加 /product 的链接
<router-link to="/product">去产品页</router-link>

# 第十步：验证完整流程

pnpm dev

# 真正作用：大量的模块只需要在终端输入pnpm gen输入多次 输入多次模块名，就可以省去大量时间。并且这个脚本“目录分层规范”变成了一条自动化生产线。 新人入职第一天跑一遍 pnpm gen product，生成的文件结构跟团队老员工的一模一样，不需要有人口头告诉他“你要在 api 下建文件、还要按这个格式写”————让机器帮你执行规范，而不是靠人脑记

---

# DEMO 6 : GitHub Actions CI 流水线

git push 代码到 GitHub 时，GitHub 自动拉取代码 → 安装依赖 → 代码校验（ESLint） → 执行测试（Vitest） → 打包构建。任何一步失败，流水线标红，阻止代码合并。

# 第一步：在项目中安装 Vitest（测试框架）

pnpm add -D vitest @vue/test-utils jsdom @vitest/coverage-v8
:
vitest：测试运行器（Vite 原生集成，启动极快）
@vue/test-utils：Vue 组件测试工具库，用于挂载和交互 Vue 组件
jsdom：在 Node 环境里模拟浏览器 DOM API（如 document、window），让组件测试能在 Node 中运行
@vitest/coverage-v8：测试覆盖率统计工具（V8 引擎原生支持）

# 第二步：写一个简单的单元测试（验证用）

<code>
// src/utils/__tests__/math.test.ts
import { describe, it, expect } from 'vitest';

// 一个简单的加法函数（直接写在测试里，不用单独建文件）
function add(a: number, b: number): number {
return a + b;
}

describe('add 函数', () => {
it('1 + 2 应该等于 3', () => {
expect(add(1, 2)).toBe(3);
});

it('-1 + 1 应该等于 0', () => {
expect(add(-1, 1)).toBe(0);
});
});
</code>

# 第三步：在 package.json 中添加测试命令(加两行就行)

"test": "vitest run",
"test:coverage": "vitest run --coverage"

# 第四步：本地验证测试能跑通

pnpm test

预期结果：
![alt text](<screenshots/Screenshot 2026-07-30 101217.png>)
如果显示 Test Files 1 passed，说明测试跑通了。如果没有输出或报错，检查是否安装了 vitest，以及 **tests** 目录是否在 src/utils/ 下

# 第五步：在 GitHub 上创建仓库并推送代码

这一步先确认你已经把代码推到 GitHub 了：
git remote -v
然后把代码推送上去，确保 GitHub 仓库里有你的代码。

# 第六步：创建 GitHub Actions 流水线配置文件

创建 .github/workflows/ci.yml：
<code>

name: CI 流水线

<!-- # 触发条件：push 到 main 分支，或任何 pull_request -->

on:
push:
branches: [main]
pull_request:
branches: [main]

<!-- # 流水线要执行的任务列表 -->

jobs:
build-and-test: # 运行环境：最新 Ubuntu
runs-on: ubuntu-latest

<!-- # 任务步骤 -->

steps:

<!-- # 1. 拉取代码 -->

- name: 检出代码
  uses: actions/checkout@v4

<!-- # 2. 安装 pnpm -->

- name: 安装 pnpm
  uses: pnpm/action-setup@v3
  with:
  version: 8

<!-- # 3. 安装 Node.js -->

- name: 安装 Node.js
  uses: actions/setup-node@v4
  with:
  node-version: '18'
  cache: 'pnpm'

<!-- # 4. 安装依赖 -->

- name: 安装依赖
  run: pnpm install

<!-- # 5. 代码规范检查（ESLint + Prettier） -->

- name: 代码规范检查
  run: pnpm lint

<!-- # 6. 单元测试 -->

- name: 单元测试
  run: pnpm test

<!-- # 7. 打包构建 -->

- name: 构建项目
  run: pnpm build

</code>
提交并推送:
git add .github/workflows/ci.yml
git commit -m "feat: 添加 GitHub Actions CI 流水线"
git push

# 第七步：观察流水线执行结果

打开你的 GitHub 仓库页面

点击 Actions 标签页

你会看到 CI 流水线 正在运行（黄色圆点表示运行中）

点击进去，可以看到每一步的执行日志
