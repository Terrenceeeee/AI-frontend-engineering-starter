# 1. pnpm 和npm的不同点

# 图为在Git bash中 分别创建两个不同的依赖（npm pnpm）创建的相同的vue文件

![未加载成功](<./screenshots/Screenshot 2026-07-27 093856.png>)
其显示出的pnpm与npm所依赖的node_modules大小几乎一致 原因是二者的vue项目目前都是空的 依赖包数量少 体积小
如果创建了n个npm项目 那么内存就会成为n倍 而同样的情况下 pnpm的所占内存不变

# 查询inode等node_modules 目录内容 都是输入 ls -la node_modules/

# 如果vue和pnpm系统分区相同 那么他们的inode是相同的 反之一定不相同

# 相同则说明确实证明是硬链接，不是复制 这极大地省下了巨大的内存空间

# 2.Vite 多环境配置与 mode 运行时验证

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
