// scripts/agent/types.ts
// 导入OpenAI类型定义，只引入类型，不引入运行时代码
import type OpenAI from 'openai';

/**
 * 工具的定义
 */
export interface AgentTool {
  /** 工具名称，必须是英文，AI 会用它来调用 */
  name: string;

  /** 工具描述，AI 根据这个决定什么时候用这个工具 */
  description: string;

  /** 参数定义，使用 JSON Schema 格式 */
  parameters: {
    // JSON Schema 根固定为object，代表参数是一个对象
    type: 'object';
    // properties：描述每个参数字段
    // Record<string, {...}> 键是参数名字，值是该参数的schema描述
    properties: Record<
      string,
      {
        type: string; // 参数类型 string / number / boolean
        description: string; // 参数含义，给LLM看
        enum?: string[]; // 可选：枚举，限定只能取数组内的值
      }
    >;
    // required：必填参数名称数组，告诉大模型哪些参数不能省略
    required: string[];
  };

  /** 实际执行函数：当AI选择调用这个工具时，就执行这个函数 */
  // args：AI生成的入参对象；返回可以是同步string，或者Promise<string>异步结果
  execute: (args: Record<string, unknown>) => Promise<string> | string;
}

/**
 * Agent 的每一步记录
 * 用来保存Agent循环中每一轮的完整信息，对应截图里的AgentStep
 */
export interface AgentStep {
  /** 第几步，从1开始计数 */
  step: number;

  /** AI 的思考过程（文本），可选。记录模型的内部想法 */
  thought?: string;

  /** AI 决定调用的工具，可选；当模型决定调用工具时才有这个字段 */
  toolCall?: {
    name: string; // 要调用的工具名字，匹配AgentTool.name
    args: Record<string, unknown>; // AI生成的工具入参
  };

  /** 工具执行完成后的返回结果，可选；调用完工具才会填充 */
  toolResult?: string;

  /** 是否是最终回答，可选。true代表Agent结束循环，不再调用工具 */
  isFinal?: boolean;

  /** 最终回答内容，可选；当isFinal=true时，存放给用户的答案 */
  finalAnswer?: string;
}

/**
 * Agent 配置
 * 初始化智能体时传入的全部配置项
 */
export interface AgentConfig {
  /** 系统提示词，给LLM设定角色、规则、任务 */
  systemPrompt: string;

  /** 可用工具列表，存放所有AgentTool */
  tools: AgentTool[];

  /** 最大循环步数（防止无限循环），兜底保护，可选，默认可以设置一个数字比如10 */
  maxSteps?: number;

  /** 模型名称，例如 gpt-4o，可选 */
  model?: string;

  /** 温度参数，控制模型随机性 0~2；越低越严谨，越高越有创造性，可选 */
  temperature?: number;
}

/** OpenAI 消息类型别名（方便使用） */
// 直接复用OpenAI SDK自带的消息类型，ChatCompletionMessageParam就是对话消息（用户消息/AI消息）
export type ChatMessage = OpenAI.Chat.ChatCompletionMessageParam;
