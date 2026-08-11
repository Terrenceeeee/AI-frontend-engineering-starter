import { defineConfig } from 'vite';
import {resolve} from 'path';
import vue from '@vitejs/plugin-vue';
import fs from 'fs';
import path from 'path';

// ============================================================
// 这部分 console.log 全部保留，不动
// ============================================================
console.log('\n========== Vite 配置文件加载（pnpm 环境）==========');
console.log('当前命令:', process.argv[2]);
console.log('当前工作目录:', process.cwd());

const pnpmDir = path.join(process.cwd(), 'node_modules', '.pnpm');
if (fs.existsSync(pnpmDir)) {
  console.log('✅ 检测到 pnpm 的 .pnpm 目录（严格隔离模式）');
  const items = fs.readdirSync(pnpmDir).slice(0, 6);
  console.log('   .pnpm 目录内容（前6个）:', items.join(', '));
} else {
  console.log('❌ 未检测到 .pnpm 目录，当前可能不是 pnpm 项目');
}

const nodeModulesDir = path.join(process.cwd(), 'node_modules');
const topLevelDeps = fs.readdirSync(nodeModulesDir).filter(name => !name.startsWith('.'));
console.log('   node_modules 顶层依赖:', topLevelDeps.join(', '));
console.log('==================================================\n');

// ============================================================
// 核心配置：保留所有原有配置，只新增 resolve 和 build.rollupOptions
// ============================================================
export default defineConfig(({ command, mode }) => {
  console.log('>> defineConfig 接收到的 command:', command);
  console.log('>> defineConfig 接收到的 mode:', mode);
  console.log('>> 将加载 .env.' + mode + ' 文件');

  return {
    plugins: [vue()],
    
    // ✅ 新增：路径别名（让 @ 指向 src/）
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },

    server: {
      port: 5173,
      open: true,
    },
    base: process.env.VITE_BASE_PATH || '/',
    // base: mode === 'production' 
    //   ? 'https://cdn.example.com/demo2-env/'  // 生产环境走 CDN
    //   : '/',                                   // 开发环境走相对路径    需要cdn的时候把它打开 不用的话就用相对路径 '/'
    alias: {
      '@': resolve(__dirname, 'src')
    },
    build: {
      // ✅ 保留原有的 sourcemap
      sourcemap: true,
      // ✅ 新增：Rollup 打包配置
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('vue') || id.includes('vue-router')) {
              return 'vue-vendor';
            }
          },
          chunkFileNames: 'assets/[name]-[hash].js',
        },
      },
    },
  };
});
