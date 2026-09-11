// scripts/agent/agent.ts
import OpenAI from 'openai';
import { executeTool, toolsToOpenAIFormat } from './executor.js';
import type { AgentConfig, AgentStep, ChatMessage } from './types.js';

/**
 * 创建 Agent 实例
 */
export async function runAgent(userTask: string, config: AgentConfig): Promise<AgentStep[]> {
  const {
    systemPrompt,
    tools: _tools,
    maxSteps = 15,
    model = 'deepseek-chat',
    temperature = 0.3,
  } = config;

  // 1. 初始化 LLM 客户端
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error('❌ 请设置环境变量 DEEPSEEK_API_KEY');
  }
  const client = new OpenAI({
    apiKey,
    baseURL: 'https://api.deepseek.com',
  });

  // 2. 初始化消息历史（Memory）
  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userTask },
  ];

  // 3. 转换工具格式
  const openaiTools = toolsToOpenAIFormat();

  // 4. 记录每一步
  const steps: AgentStep[] = [];

  console.log('\n' + '='.repeat(60));
  console.log('🤖 Agent 开始执行');
  console.log('='.repeat(60));
  console.log(`任务: ${userTask}\n`);

  // 5. 核心循环
  for (let i = 1; i <= maxSteps; i++) {
    console.log(`\n--- 第 ${i}/${maxSteps} 步 ---`);

    // 5.1 调用 LLM
    const response = await client.chat.completions.create({
      model,
      messages,
      tools: openaiTools.length > 0 ? openaiTools : undefined,
      temperature,
    });

    const choice = response.choices[0];
    const assistantMessage = choice.message;

    // 5.2 把 AI 的回复加入历史（Memory）
    messages.push(assistantMessage);

    // 5.3 判断：AI 是想调用工具，还是想给最终回答？
    if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
      // ========== 情况 A：AI 要调用工具 ==========
      console.log(`🧠 AI 思考: ${assistantMessage.content || '（无文字思考）'}`);

      for (const toolCall of assistantMessage.tool_calls) {
        if (toolCall.type !== 'function') {
          continue;
        }

        const toolName = toolCall.function.name;
        const toolArgs = JSON.parse(toolCall.function.arguments);

        // 执行工具
        const toolResult = await executeTool(toolName, toolArgs);

        // 记录步骤
        steps.push({
          step: i,
          thought: assistantMessage.content || undefined,
          toolCall: { name: toolName, args: toolArgs },
          toolResult,
        });

        // 把工具执行结果反馈给 AI（关键！）
        messages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: toolResult,
        });
      }
      // 继续下一轮循环
      continue;
    }

    // ========== 情况 B：AI 给出最终回答 ==========
    console.log(`\n✅ AI 最终回答:\n${assistantMessage.content}`);
    steps.push({
      step: i,
      isFinal: true,
      finalAnswer: assistantMessage.content || '',
    });
    break;
  }

  console.log('\n' + '='.repeat(60));
  console.log(`🎉 Agent 执行完成，共 ${steps.length} 步`);
  console.log('='.repeat(60));

  return steps;
}
