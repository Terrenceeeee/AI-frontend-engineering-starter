// src/utils/retry.ts

// 1. 定义一个类型守卫，检查错误是否具有类似 Axios 错误的特征
function isAxiosError(error: unknown): error is {
  response?: { status: number };
  code?: string;
  message?: string;
} {
  return typeof error === 'object' && error !== null;
}

export interface RetryOptions {
  maxRetries?: number; // 最大重试次数，默认 3
  baseDelay?: number; // 基础延迟（毫秒），默认 500
  maxDelay?: number; // 最大延迟上限（毫秒），默认 10000
  // ⭐ 这里把 any 改成了 unknown
  shouldRetry?: (error: unknown) => boolean;
}

/**
 * 指数退避重试
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelay = 500,
    maxDelay = 10000,
    // 默认的重试判断逻辑
    shouldRetry = (error: unknown) => {
      // 如果不是对象类型，直接不重试
      if (!isAxiosError(error)) return false;

      // 只有 5xx 错误才重试（服务端错误）
      if (error.response?.status && error.response.status >= 500) return true;
      // 网络超时错误（Axios 的 ECONNABORTED）
      if (error.code === 'ECONNABORTED') return true;
      // 其他包含 timeout 关键字的错误
      if (error.message?.includes('timeout')) return true;

      return false;
    },
  } = options;

  // ⭐ lastError 也改为 unknown
  let lastError: unknown = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 1) {
        console.log(`[重试] 第 ${attempt - 1} 次重试...`);
      }
      return await fn();
    } catch (error) {
      lastError = error;

      // 判断是否需要重试
      if (!shouldRetry(error)) {
        console.log('[重试] 错误类型不支持重试，直接抛出');
        throw error;
      }

      if (attempt === maxRetries) {
        console.log(`[重试] 已达最大重试次数 ${maxRetries}，停止重试`);
        throw error;
      }

      // 计算退避延迟：2^(attempt-1) * baseDelay
      const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);
      console.log(`[重试] ${delay}ms 后重试 (尝试 ${attempt}/${maxRetries})`);

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}
