# 一. pnpm 和npm的不同点

# 图为在Git bash中 分别创建两个不同的依赖（npm pnpm）创建的相同的vue文件

![未加载成功](<./screenshots/Screenshot 2026-07-27 093856.png>)
其显示出的pnpm与npm所依赖的node_modules大小几乎一致 原因是二者的vue项目目前都是空的 依赖包数量少 体积小
如果创建了n个npm项目 那么内存就会成为n倍 而同样的情况下 pnpm的所占内存不变

# 查询inode等node_modules 目录内容 都是输入 ls -la node_modules/

# 如果vue和pnpm系统分区相同 那么他们的inode是相同的 反之一定不相同

# 相同则说明确实证明是硬链接，不是复制 这极大地省下了巨大的内存空间

# 二.Vite 多环境配置与 mode 运行时验证

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

# 添加的代码部分作用

拓展工具：fs+path 是为了做路径处理、本地文件读写，绝大多数用来配置路径别名、本地 https 证书

console.log('当前命令:', process.argv[2]); // 'serve' 或 'build' process.argv[]是node函数内置数组，记录终端启动的整条命令

<!-- pnpm dev → 这里打印serve
pnpm build → 这里打印build -->

console.log('当前工作目录:', process.cwd()); //获取你执行命令的文件夹路径（项目根目录）

# 二、核心：检测是否为 pnpm 项目（最关键）

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

# 三、ESLint + Prettier + Husky + lint-staged 全流程卡点实战 （直接在Demo2内操作）

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
