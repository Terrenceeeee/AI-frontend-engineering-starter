#!/usr/bin/env ts-node
// scripts/rollback.ts

import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = path.join(__dirname, '../dist');
const BACKUP_DIR = path.join(__dirname, '../backups');

// 1. 检查备份目录
if (!fs.existsSync(BACKUP_DIR)) {
  console.error('❌ 没有找到备份目录');
  process.exit(1);
}

// 2. 列出所有备份版本
const backups = fs
  .readdirSync(BACKUP_DIR)
  .filter((name) => name.startsWith('dist-'))
  .sort()
  .reverse();

if (backups.length === 0) {
  console.error('❌ 没有找到任何备份版本');
  process.exit(1);
}

console.log('📋 可用的备份版本：');
backups.forEach((name, index) => {
  console.log(`  ${index + 1}. ${name}`);
});

// 3. 让用户选择回滚到哪个版本
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('\n请选择要回滚到的版本编号（输入数字）：', (answer) => {
  const index = parseInt(answer.trim()) - 1;

  if (isNaN(index) || index < 0 || index >= backups.length) {
    console.error('❌ 无效的选择');
    rl.close();
    process.exit(1);
  }

  const selectedVersion = backups[index];
  const backupPath = path.join(BACKUP_DIR, selectedVersion);

  // 4. 确认回滚
  console.log(`\n⚠️ 即将回滚到: ${selectedVersion}`);
  console.log(' 当前 dist 将被完全替换');

  rl.question('确认继续？(y/N)：', (confirm) => {
    if (confirm.toLowerCase() !== 'y') {
      console.log('👋 已取消回滚');
      rl.close();
      return;
    }

    // 5. 执行回滚：删除当前 dist，复制备份到 dist
    console.log(`🔄 正在回滚到 ${selectedVersion}...`);

    if (fs.existsSync(DIST_DIR)) {
      fs.rmSync(DIST_DIR, { recursive: true, force: true });
    }
    fs.cpSync(backupPath, DIST_DIR, { recursive: true });

    console.log(`✅ 回滚完成！当前版本: ${selectedVersion}`);
    rl.close();
  });
});
