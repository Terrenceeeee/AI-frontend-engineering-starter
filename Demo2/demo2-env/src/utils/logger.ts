// src/utils/logger.ts

import type { LogEntry, LoggerOptions, PaymentError } from '@/types/logger';

// ==================== 配置 ====================

const DEFAULT_OPTIONS: Required<LoggerOptions> = {
  maxLogs: 50,
  storageKey: 'error_logs',
};

// ==================== 状态 ====================

/** 内存缓存（避免频繁读取 localStorage） */
let logCache: LogEntry[] = [];

// ==================== 私有工具函数 ====================

/**
 * 从 localStorage 加载日志
 */
function loadFromStorage(storageKey: string): LogEntry[] {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // 简单校验：确保每条记录都有必要的字段
      const isValid = parsed.every(
        (item) =>
          item &&
          typeof item === 'object' &&
          typeof item.time === 'string' &&
          typeof item.url === 'string' &&
          typeof item.msg === 'string'
      );
      if (isValid) {
        return parsed as LogEntry[];
      }
    }
    return [];
  } catch {
    return [];
  }
}

/**
 * 保存到 localStorage
 */
function saveToStorage(storageKey: string, logs: LogEntry[]): void {
  try {
    localStorage.setItem(storageKey, JSON.stringify(logs));
  } catch {
    // localStorage 已满或不可用，静默失败
    console.warn('[logger] 写入 localStorage 失败，请检查存储空间');
  }
}

/**
 * 将任意错误对象转换为可序列化的格式
 */
function normalizeError(error: unknown): Record<string, unknown> | string {
  if (error === null || error === undefined) {
    return 'null or undefined';
  }

  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  if (typeof error === 'object') {
    try {
      // 尝试序列化，如果失败则返回字符串表示
      return JSON.parse(JSON.stringify(error));
    } catch {
      return String(error);
    }
  }

  return String(error);
}

// ==================== 公开 API ====================

/**
 * 记录错误日志
 *
 * @param msg 错误描述
 * @param data 附加数据
 * @param options 配置选项
 *
 * @example
 * ```ts
 * try {
 *   await payOrder();
 * } catch (e) {
 *   logError('支付失败', e);
 * }
 * ```
 */
export function logError(msg: string, data?: unknown, options?: LoggerOptions): void {
  const { maxLogs, storageKey } = { ...DEFAULT_OPTIONS, ...options };

  // 初始化缓存（如果为空）
  if (logCache.length === 0) {
    logCache = loadFromStorage(storageKey);
  }

  // 构建日志条目
  const entry: LogEntry = {
    time: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent,
    msg,
    data: normalizeError(data),
  };

  // 追加并限制数量
  logCache.push(entry);
  if (logCache.length > maxLogs) {
    logCache = logCache.slice(-maxLogs);
  }

  // 持久化
  saveToStorage(storageKey, logCache);

  // 控制台输出（方便开发调试）
  console.error(`[logger] ${msg}`, data);
}

/**
 * 导出所有日志为格式化 JSON 字符串
 *
 * @param storageKey 自定义存储 key
 * @returns 格式化的 JSON 字符串
 *
 * @example
 * ```ts
 * const logs = exportLogs();
 * console.log(logs);
 * ```
 */
export function exportLogs(storageKey?: string): string {
  const key = storageKey || DEFAULT_OPTIONS.storageKey;
  const raw = localStorage.getItem(key);

  if (!raw) {
    return '暂无日志';
  }

  try {
    const parsed = JSON.parse(raw);
    return JSON.stringify(parsed, null, 2);
  } catch {
    // 不是合法 JSON，直接返回原始字符串
    return raw;
  }
}

/**
 * 清除所有日志
 *
 * @param storageKey 自定义存储 key
 */
export function clearLogs(storageKey?: string): void {
  const key = storageKey || DEFAULT_OPTIONS.storageKey;
  logCache = [];
  localStorage.removeItem(key);
  console.log('[logger] 日志已清除');
}

/**
 * 获取当前日志条数
 *
 * @param storageKey 自定义存储 key
 * @returns 日志条数
 */
export function getLogCount(storageKey?: string): number {
  const key = storageKey || DEFAULT_OPTIONS.storageKey;
  const raw = localStorage.getItem(key);

  if (!raw) return 0;

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.length : 0;
  } catch {
    return 0;
  }
}

/**
 * 判断是否为支付错误（类型守卫）
 *
 * @param error 待判断的错误对象
 * @returns 是否为 PaymentError
 */
export function isPaymentError(error: unknown): error is PaymentError {
  if (!error || typeof error !== 'object') {
    return false;
  }
  const maybe = error as Record<string, unknown>;
  return typeof maybe.code === 'string' && typeof maybe.message === 'string';
}
