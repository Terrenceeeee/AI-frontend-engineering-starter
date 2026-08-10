// src/types/logger.d.ts

/**
 * 单条日志记录的结构
 */
export interface LogEntry {
  /** ISO 8601 格式的时间戳 */
  time: string;
  /** 发生错误时的页面 URL */
  url: string;
  /** 浏览器 User-Agent */
  userAgent: string;
  /** 错误描述信息 */
  msg: string;
  /** 附加数据（错误对象、业务上下文等） */
  data?: Record<string, unknown> | string | number | boolean | null; //存放额外上下文；支持对象、字符串、数字、布尔、null多种类型  
  // Record<string, unknown> 代表任意键值对象；? 表示该属性可以不存在
}

/**
 * 日志工具配置选项
 */
export interface LoggerOptions {
  /** 最大存储条数，默认 50 */
  maxLogs?: number;
  /** localStorage 存储 key，默认 'error_logs' */
  storageKey?: string;
}

/**
 * 支付错误的结构（业务错误示例）
 */
export interface PaymentError {
  code: string;
  message: string;
  stack?: string;
  orderId?: string;
  userId?: string;
  timestamp?: string;
}