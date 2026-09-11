// scripts/agent/executor.ts
// 导入工具Map：工具名字映射到工具对象
import { toolMap } from './tools.js';

/**
 * 执行工具调用
 * @param toolName 工具名称
 * @param args 工具参数
 * @returns 执行结果字符串
 */
export async function executeTool(
  toolName: string,
  args: Record<string, unknown>
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
    // 执行工具的execute函数，await等待执行完成
    const result = await tool.execute(args);
    // 截断超长返回内容，防止LLM上下文爆掉
    const truncated =
      result.length > 3000 ? result.slice(0, 3000) + '\n...(结果过长已截断)' : result;
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
export function toolsToOpenAIFormat() {
  // 取出全部工具
  const tools = Array.from(toolMap.values());
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
