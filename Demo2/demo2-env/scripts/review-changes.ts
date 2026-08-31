// scripts/review-changes.ts
import { execSync } from 'child_process';
import { callAI } from './ai-review.ts'; // 复用你现有的 AI 调用函数

// 三种模式，通过参数控制
const mode = process.argv[2] || 'staged'; // staged | unstaged | all

let diff = '';

if (mode === 'staged') {
  // 只审查已暂存的文件（git add 过的）
  diff = execSync('git diff --cached', { encoding: 'utf-8' });
} else if (mode === 'unstaged') {
  // 只审查未暂存的文件（修改了但没 add）
  diff = execSync('git diff', { encoding: 'utf-8' });
} else {
  // 审查所有改动（包括已暂存和未暂存）
  diff = execSync('git diff HEAD', { encoding: 'utf-8' });
}

if (!diff.trim()) {
  console.log('✅ 没有检测到任何改动');
  process.exit(0);
}

// 获取改动的文件列表（用于上下文中）
let fileCommand = 'git diff HEAD --name-only';
if (mode === 'staged') {
  fileCommand = 'git diff --cached --name-only';
} else if (mode === 'unstaged') {
  fileCommand = 'git diff --name-only';
}
const changedFiles = execSync(fileCommand, { encoding: 'utf-8' }).split('\n').filter(Boolean);

// 构建 Prompt
const prompt = `
【AI Code Review 请求】

## 本次改动的文件
${changedFiles.map((f) => `- ${f}`).join('\n')}

## 全部代码 Diff
\`\`\`diff
${diff}
\`\`\`

请评估本次所有改动的风险，给出 Review 意见。
`;

const review = await callAI(prompt);
console.log(review);
