// scripts/agent/loop.ts
import type OpenAI from 'openai';
import { createRuntimeState, executeTool } from './executor.js';
import type { AgentStep, ChatMessage, ToolMap } from './types.js';

interface AgentLoopOptions {
  client: OpenAI;
  model: string;
  messages: ChatMessage[];
  openaiTools: OpenAI.Chat.ChatCompletionTool[];
  toolMap: ToolMap;
  maxSteps: number;
  temperature: number;
}

export async function runAgentLoop(options: AgentLoopOptions): Promise<AgentStep[]> {
  const { client, model, messages, openaiTools, toolMap, maxSteps, temperature } = options;
  const steps: AgentStep[] = [];
  const runtimeState = createRuntimeState();
  let completed = false;

  for (let i = 1; i <= maxSteps; i++) {
    console.log(`\n--- 第 ${i}/${maxSteps} 步 ---`);

    const response = await client.chat.completions.create({
      model,
      messages,
      tools: openaiTools.length > 0 ? openaiTools : undefined,
      temperature,
    });

    const assistantMessage = response.choices[0]?.message;
    if (!assistantMessage) {
      steps.push({
        step: i,
        isFinal: true,
        finalAnswer: '模型没有返回消息，Agent 已停止。',
      });
      completed = true;
      break;
    }

    messages.push(assistantMessage);

    if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
      console.log(`🧠 AI 回复: ${assistantMessage.content || '（调用工具）'}`);

      for (const toolCall of assistantMessage.tool_calls) {
        if (toolCall.type !== 'function') continue;

        const toolName = toolCall.function.name;
        const parsedArgs = parseToolArguments(toolCall.function.arguments);

        if (!parsedArgs.ok) {
          const content = `❌ 工具参数不是合法 JSON：${parsedArgs.error}。请重新生成 ${toolName} 的参数。`;
          messages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content,
          });
          steps.push({
            step: i,
            thought: assistantMessage.content || undefined,
            toolCall: { name: toolName, args: {} },
            toolResult: content,
          });
          continue;
        }

        const toolResult = await executeTool(toolName, parsedArgs.args, toolMap, runtimeState);

        steps.push({
          step: i,
          thought: assistantMessage.content || undefined,
          toolCall: { name: toolName, args: parsedArgs.args },
          toolResult,
        });

        messages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: toolResult,
        });
      }

      continue;
    }

    completed = true;
    console.log(`\n✅ AI 最终回答:\n${assistantMessage.content}`);
    steps.push({
      step: i,
      isFinal: true,
      finalAnswer: assistantMessage.content || '',
    });
    break;
  }

  if (!completed) {
    const finalAnswer = `Agent 已达到最大执行步数 ${maxSteps}，任务可能未完成。请检查上方工具调用记录后继续处理。`;
    console.log(`\n⚠️ ${finalAnswer}`);
    steps.push({
      step: maxSteps,
      isFinal: true,
      finalAnswer,
    });
  }

  return steps;
}

function parseToolArguments(
  raw: string
): { ok: true; args: Record<string, unknown> } | { ok: false; error: string } {
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return { ok: false, error: '参数必须是 JSON object' };
    }
    return { ok: true, args: parsed as Record<string, unknown> };
  } catch (error) {
    return { ok: false, error: (error as Error).message };
  }
}
