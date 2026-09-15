// scripts/agent/executor.ts
import { normalizeProjectPath, stringifyToolResult } from './guard.js';
import type { AgentRuntimeState, AgentTool, ToolMap } from './types.js';

const TOOL_OUTPUT_LIMITS: Record<string, number> = {
  read_file: 9000,
  git_diff: 12000,
  run_lint: 8000,
  fix_lint: 8000,
  run_test: 8000,
  run_typecheck: 6000,
  run_format_check: 6000,
  run_build: 8000,
  query_impact: 6000,
};

/**
 * 执行工具调用
 * @param toolName 工具名称
 * @param args 工具参数
 * @returns 执行结果字符串
 */
export async function executeTool(
  toolName: string,
  args: Record<string, unknown>,
  toolMap: ToolMap,
  state: AgentRuntimeState
): Promise<string> {
  // 打印日志：控制台输出，方便调试Agent每一步
  console.log(`\n🔧 [工具调用] ${toolName}`);
  console.log(`   参数: ${JSON.stringify(args, null, 2)}`);

  // 根据工具名称，从Map里取出对应的工具定义（read_file / run_lint …）
  const tool = toolMap.get(toolName);
  if (!tool) {
    const error = `❌ 工具不存在: ${toolName}`;
    console.log(`   ${error}`);
    return error;
  }

  try {
    const guardMessage = guardToolCall(toolName, args, state);
    if (guardMessage) {
      console.log(`   ${guardMessage}`);
      return guardMessage;
    }

    // 执行工具的execute函数，await等待执行完成
    const result = await tool.execute(args);
    const normalized = typeof result === 'string' ? result : stringifyToolResult(result);
    const maxLength = TOOL_OUTPUT_LIMITS[toolName] || 6000;
    const truncated =
      normalized.length > maxLength
        ? `${normalized.slice(0, Math.floor(maxLength * 0.65))}\n...（工具结果过长，保留开头和结尾）...\n${normalized.slice(-Math.floor(maxLength * 0.35))}`
        : normalized;

    if (!normalized.startsWith('❌')) {
      updateRuntimeState(toolName, args, state);
    }

    // 打印简短预览
    console.log(`   ✅ 执行完成: ${truncated.slice(0, 200)}...`);
    return truncated;
  } catch (error) {
    // 捕获工具内部异常，包装成错误信息返回给LLM
    const err = error as Error;
    const errorMsg = `❌ 工具执行失败: ${err.message}`;
    console.log(`   ${errorMsg}`);
    return errorMsg;
  }
}

/**
 * 将我们自定义的AgentTool数组，转换成OpenAI Function Calling 标准JSON结构
 * 专门给OpenAI接口请求用
 */
export function toolsToOpenAIFormat(tools: AgentTool[]) {
  // 映射为OpenAI SDK要求的function工具格式
  return tools.map((tool) => ({
    type: 'function' as const,
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters,
    },
  }));
}

export function createToolMap(tools: AgentTool[]): ToolMap {
  return new Map(tools.map((tool) => [tool.name, tool]));
}

export function createRuntimeState(): AgentRuntimeState {
  return {
    readFiles: new Set<string>(),
    writeCounts: new Map<string, number>(),
  };
}

function guardToolCall(
  toolName: string,
  args: Record<string, unknown>,
  state: AgentRuntimeState
): string | null {
  if (toolName !== 'write_file') {
    return null;
  }

  const filePath = args.filePath as string | undefined;
  if (!filePath) {
    return '❌ write_file 缺少 filePath 参数。';
  }

  const normalizedFilePath = normalizeProjectPath(filePath);
  if (!state.readFiles.has(normalizedFilePath)) {
    return `❌ 写入被拒绝：必须先 read_file 读取 ${filePath} 后才能 write_file。`;
  }

  const writeCount = state.writeCounts.get(normalizedFilePath) || 0;
  if (writeCount >= 2) {
    return `❌ 写入被拒绝：${filePath} 已被修改 ${writeCount} 次，避免 Agent 反复覆盖。`;
  }

  return null;
}

function updateRuntimeState(
  toolName: string,
  args: Record<string, unknown>,
  state: AgentRuntimeState
): void {
  const filePath = args.filePath as string | undefined;
  if (!filePath) return;
  const normalizedFilePath = normalizeProjectPath(filePath);

  if (toolName === 'read_file') {
    state.readFiles.add(normalizedFilePath);
  }

  if (toolName === 'write_file') {
    state.writeCounts.set(normalizedFilePath, (state.writeCounts.get(normalizedFilePath) || 0) + 1);
  }
}
