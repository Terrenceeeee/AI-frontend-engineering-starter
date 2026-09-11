// scripts/agent/main.ts
import { runAgent } from './agent.js';
import { allTools } from './tools.js';

/** System Prompt：定义 Agent 的角色和行为规则 */
const SYSTEM_PROMPT = `你是一个资深前端工程师 Agent，负责自动修复代码问题。

## 你的能力
你可以调用以下工具：
- read_file: 读取文件内容
- write_file: 写入文件内容（用于修复代码）
- run_lint: 运行 ESLint 检查
- fix_lint: 自动修复 ESLint 格式问题
- run_test: 运行单元测试
- query_impact: 查询知识图谱影响范围
- git_diff: 查看 Git 改动

## 工作流程
1. 先调用 git_diff 查看当前改动
2. 如果有改动，调用 read_file 查看相关文件
3. 调用 run_lint 或 run_test 检查问题
4. 如果发现问题，尝试修复（fix_lint 或 write_file）
5. 修复后再次验证（run_lint 或 run_test）
6. 确认修复成功后，输出最终总结

## 重要规则
- 每次修复后必须验证，不能只改不验
- 如果同一个问题修复 3 次仍然失败，停止并报告
- 不要修改 src/ 和 scripts/ 之外的文件
- 最终回答要包含：做了什么、验证结果、是否成功

## 输出格式
最终回答用 Markdown 格式，包含：
- 📋 任务总结
- 🔧 执行的步骤
- ✅ 验证结果
`;

async function main() {
  const task = process.argv.slice(2).join(' ') || '检查当前代码改动，修复发现的 ESLint 问题';

  try {
    const steps = await runAgent(task, {
      systemPrompt: SYSTEM_PROMPT,
      tools: allTools,
      maxSteps: 15,
      temperature: 0.3,
    });

    // 输出最终报告
    const finalStep = steps.find((s) => s.isFinal);
    if (finalStep) {
      console.log('\n' + '='.repeat(60));
      console.log('📋 最终报告');
      console.log('='.repeat(60));
      console.log(finalStep.finalAnswer);
    }
  } catch (error) {
    console.error('❌ Agent 执行失败:', (error as Error).message);
    process.exit(1);
  }
}

main();
