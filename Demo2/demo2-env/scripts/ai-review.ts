// scripts/ai-review.ts

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================
// 类型定义
// ============================================================

interface GraphImpact {
  filePath: string;
  upstream: string[];
  testedBy: string[];
  description: string;
}

interface KnowledgeGraph {
  impactIndex: Record<string, GraphImpact>;
}

interface ImpactResult {
  functionName: string;
  upstream: string[];
  testedBy: string[];
  description: string;
}

interface ChangedFileDiff {
  file: string;
  diff: string;
}

// ============================================================
// 1. 获取本次改动的文件
// ============================================================
function getChangedFiles(): string[] {
  try {
    const output = execSync('git diff HEAD~1 --name-only', { encoding: 'utf-8' });
    return output.split('\n').filter(Boolean);
  } catch {
    return [];
  }
}

// ============================================================
// 2. 获取改动文件的 Diff
// ============================================================
function getDiff(file: string): string {
  try {
    return execSync(`git diff HEAD~1 -- ${file}`, { encoding: 'utf-8' });
  } catch {
    return '';
  }
}

// ============================================================
// 3. 加载知识图谱
// ============================================================
function loadGraph(): KnowledgeGraph {
  const graphPath = path.resolve(__dirname, '../knowledge-graph.json');
  if (!fs.existsSync(graphPath)) {
    console.error('❌ 请先运行 pnpm graph 生成知识图谱');
    process.exit(1);
  }
  const raw = fs.readFileSync(graphPath, 'utf-8');
  return JSON.parse(raw) as KnowledgeGraph;
}

// ============================================================
// 4. 查询影响范围
// ============================================================
function queryImpact(graph: KnowledgeGraph, filePath: string): ImpactResult[] {
  const results: ImpactResult[] = [];
  const { impactIndex } = graph;

  for (const [functionName, info] of Object.entries(impactIndex)) {
    if (info.filePath === filePath) {
      results.push({
        functionName,
        upstream: info.upstream || [],
        testedBy: info.testedBy || [],
        description: info.description || '',
      });
    }
  }

  return results;
}

// ============================================================
// 5. 生成 AI Prompt
// ============================================================
function generatePrompt(
  changedFiles: string[],
  diffs: ChangedFileDiff[],
  impacts: ImpactResult[]
): string {
  let prompt = '【AI Code Review 请求】\n\n';
  prompt += '## 本次 Commit 改动的文件：\n';
  for (const file of changedFiles) {
    prompt += `- ${file}\n`;
  }

  prompt += '\n## 知识图谱 - 影响范围分析：\n';
  if (impacts.length === 0) {
    prompt += '- 未在知识图谱中找到相关影响信息（该文件可能不涉及核心函数）\n';
  } else {
    for (const impact of impacts) {
      prompt += `\n### ${impact.functionName}\n`;
      prompt += `- 描述：${impact.description}\n`;
      prompt += `- 被调用方：${impact.upstream.join(' → ') || '（无）'}\n`;
      prompt += `- 测试覆盖：${impact.testedBy.length > 0 ? impact.testedBy.join(', ') : '❌ 无测试'}\n`;
      if (impact.testedBy.length === 0) {
        prompt += '- ⚠️ 建议：该函数无测试覆盖，请手动回归验证\n';
      }
      if (impact.upstream.length > 3) {
        prompt += `- ⚠️ 该函数被 ${impact.upstream.length} 个地方引用，修改需谨慎\n`;
      }
    }
  }

  prompt += '\n## 代码 Diff：\n';
  for (const { file, diff } of diffs) {
    if (diff) {
      prompt += `\n### ${file}\n\`\`\`diff\n${diff}\n\`\`\`\n`;
    }
  }

  prompt += '\n请评估本次改动的风险，并给出具体的 Review 意见。';
  prompt += '\n格式要求：';
  prompt += '\n1. 风险等级（高/中/低）';
  prompt += '\n2. 影响范围摘要';
  prompt += '\n3. 具体的 Review 建议';
  prompt += '\n4. 如果有潜在 Bug，请明确指出';
  prompt += '\n5. 给出是否建议合并的结论';

  return prompt;
}

// ============================================================
// 6. 调用 AI API
// ============================================================
async function callAI(prompt: string): Promise<string> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    console.error('❌ 请设置环境变量 DEEPSEEK_API_KEY');
    console.error('   - 在本地：在终端执行 export DEEPSEEK_API_KEY=sk-xxx');
    console.error('   - 在 GitHub：在仓库 Settings → Secrets → Actions 中添加 DEEPSEEK_API_KEY');
    process.exit(1);
  }

  const client = new OpenAI({
    apiKey: apiKey,
    baseURL: 'https://api.deepseek.com',
  });

  const response = await client.chat.completions.create({
    model: 'deepseek-chat',
    messages: [
      {
        role: 'system',
        content: `你是一个资深前端工程师，负责 Code Review。
请基于影响范围分析，给出准确的 Review 意见。
格式要求：
1. 风险等级（高/中/低）
2. 影响范围摘要
3. 具体的 Review 建议
4. 如果有潜在 Bug，请明确指出
5. 给出是否建议合并的结论`,
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.3,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('AI 返回内容为空');
  }
  return content;
}

// ============================================================
// 7. 主函数
// ============================================================
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const isPR = args.includes('--pr');

  console.log('🔍 开始 AI Code Review...\n');

  const changedFiles = getChangedFiles();
  if (changedFiles.length === 0) {
    console.log('ℹ️ 没有检测到文件改动');
    return;
  }

  console.log('📁 改动的文件：');
  changedFiles.forEach((f) => console.log(`  - ${f}`));

  const diffs: ChangedFileDiff[] = changedFiles.map((file) => ({
    file,
    diff: getDiff(file),
  }));

  const graph = loadGraph();

  const impacts: ImpactResult[] = [];
  for (const file of changedFiles) {
    const result = queryImpact(graph, file);
    impacts.push(...result);
  }

  console.log('\n📊 影响范围查询结果：');
  if (impacts.length === 0) {
    console.log(' ℹ️ 未找到相关影响信息');
  } else {
    for (const impact of impacts) {
      console.log(`\n  ${impact.functionName}:`);
      console.log(`    被调用方: ${impact.upstream.join(', ') || '无'}`);
      console.log(`    测试覆盖: ${impact.testedBy.length > 0 ? '✅' : '❌'}`);
    }
  }

  const prompt = generatePrompt(changedFiles, diffs, impacts);

  console.log('\n' + '='.repeat(60));
  console.log('🤖 正在调用 AI 进行 Review...');
  console.log('='.repeat(60));

  try {
    const review = await callAI(prompt);

    if (isPR) {
      // ✅ PR 模式：写入文件
      fs.writeFileSync('ai-review-result.md', review);
      console.log('✅ AI Review 报告已生成: ai-review-result.md');
    } else {
      // ✅ 本地模式：打印到控制台
      console.log('\n' + '='.repeat(60));
      console.log('📋 AI Code Review 报告');
      console.log('='.repeat(60));
      console.log('\n' + review + '\n');
      console.log('='.repeat(60));

      const reportPath = path.resolve(__dirname, '../ai-review-report.txt');
      fs.writeFileSync(reportPath, review);
      console.log(`\n✅ 报告已保存至: ${reportPath}`);
    }
  } catch (err) {
    const error = err as Error;
    console.error('❌ AI 调用失败:', error.message);
    console.log('\n💡 可以手动复制以下 Prompt 发给 AI：');
    console.log('='.repeat(60));
    console.log(prompt);
    console.log('='.repeat(60));
  }
}

main().catch((err) => {
  const error = err as Error;
  console.error('❌ 执行失败:', error.message);
  process.exit(1);
});
