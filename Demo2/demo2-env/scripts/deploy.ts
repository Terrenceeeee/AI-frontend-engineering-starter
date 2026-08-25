#!/usr/bin/env ts-node
// scripts/deploy.ts
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = path.join(__dirname, '../dist');
const BACKUP_DIR = path.join(__dirname, '../backups');

// 1. 校验dist文件夹存在
if (!fs.existsSync(DIST_DIR)) {
  console.error('❌ dist 目录不存在，请先执行 pnpm build');
  process.exit(1);
}

// 2. 创建备份目录（递归创建）
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// 3. 生成时间戳版本号，替换冒号小数点避免路径非法字符
const version = new Date().toISOString().replace(/[:.]/g, '-');
const backupPath = path.join(BACKUP_DIR, `dist-${version}`);

console.log(`📦 备份当前版本到: ${backupPath}`);
fs.cpSync(DIST_DIR, backupPath, { recursive: true });

// 4. 复制产物到部署目录
const DEPLOY_DIR = path.join(__dirname, '../deploy');
if (!fs.existsSync(DEPLOY_DIR)) {
  fs.mkdirSync(DEPLOY_DIR, { recursive: true });
}

console.log('📤 上传新版本到部署目录...');
fs.cpSync(DIST_DIR, DEPLOY_DIR, { recursive: true });

// 5. 模拟重载Nginx
console.log('🔄 模拟重载 Nginx...');

// 6. 冒烟测试
console.log('🧪 执行冒烟测试...');
try {
  const result = execSync('curl -s -o /dev/null -w "%{http_code}" http://localhost:5173', {
    timeout: 5000,
  })
    .toString()
    .trim();

  if (result === '200') {
    console.log('✅ 冒烟测试通过！首页可访问');
  } else {
    console.log(`⚠️ 冒烟测试异常：HTTP ${result}`);
  }
} catch (error) {
  console.log('⚠️ 冒烟测试失败（开发服务器未启动，请先 pnpm dev）');
}

console.log(`\n🎉 部署完成！版本号: ${version}`);
console.log(`📌 备份位置: ${backupPath}`);
console.log(`📌 回滚命令: cp -r ${backupPath}/* ${DIST_DIR}/`);
