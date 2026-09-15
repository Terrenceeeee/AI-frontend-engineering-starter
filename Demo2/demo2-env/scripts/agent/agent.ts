// scripts/agent/agent.ts
import OpenAI from 'openai';
import { createToolMap, toolsToOpenAIFormat } from './executor.js';
import { runAgentLoop } from './loop.js';
import type { AgentConfig, AgentStep, ChatMessage } from './types.js';

/**
 * 创建 Agent 实例
 */
export async function runAgent(userTask: string, config: AgentConfig): Promise<AgentStep[]> {
  const {
    systemPrompt,
    tools,
    maxSteps = 15,
    model = 'deepseek-chat',
    temperature = 0.3,
    dryRun = false,
  } = config;

  // 1. 初始化 LLM 客户端
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error('❌ 请设置环境变量 DEEPSEEK_API_KEY');
  }
  const client = new OpenAI({
    apiKey,
    baseURL: 'https://api.deepseek.com',
    timeout: 60_000,
    maxRetries: 2,
  });

  // 2. 初始化消息历史（Memory）
  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userTask },
  ];

  // 3. 转换工具格式
  const openaiTools = toolsToOpenAIFormat(tools);
  const toolMap = createToolMap(tools);

  console.log('\n' + '='.repeat(60));
  console.log('🤖 Agent 开始执行');
  console.log('='.repeat(60));
  console.log(`任务: ${userTask}\n`);
  if (dryRun) {
    process.env.AGENT_DRY_RUN = '1';
    console.log('模式: dry-run（不会真实写入文件）\n');
  } else {
    delete process.env.AGENT_DRY_RUN;
  }

  const steps = await runAgentLoop({
    client,
    model,
    messages,
    openaiTools,
    toolMap,
    maxSteps,
    temperature,
  });

  console.log('\n' + '='.repeat(60));
  console.log(`🎉 Agent 执行完成，共 ${steps.length} 步`);
  console.log('='.repeat(60));

  return steps;
}
