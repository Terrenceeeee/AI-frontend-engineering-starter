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
  console.log('   .pnpm 目录内容（前6个）:', items.join(', '));
} else {
  console.log('❌ 未检测到 .pnpm 目录，当前可能不是 pnpm 项目');
}

// 验证 node_modules 顶层只有声明过的依赖
const nodeModulesDir = path.join(process.cwd(), 'node_modules');
const topLevelDeps = fs.readdirSync(nodeModulesDir).filter(name => !name.startsWith('.'));
console.log('   node_modules 顶层依赖:', topLevelDeps.join(', '));
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