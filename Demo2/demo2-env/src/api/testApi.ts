// src/api/testApi.ts
import { retryWithBackoff } from '@/utils/retry';

// 模拟一个会失败的请求
// 前 2 次失败，第 3 次成功
let attemptCount = 0;


export function mockUnstableApi(): Promise<{ success: boolean; data: string }> {
  return new Promise((resolve, reject) => {
    attemptCount++;
    console.log(`[API] 第 ${attemptCount} 次调用`);

    // 前 2 次返回 500 错误
    if (attemptCount < 3) {
      const error = new Error('服务器内部错误 (500)');
      (error as Error & { response: { status: number } }).response = { status: 500 };
      reject(error);
    } else {
      // 第 3 次成功
      resolve({ success: true, data: '请求成功！' });
    }
  });
}

// 重置计数器
export function resetAttemptCount() {
  attemptCount = 0;
}

// 包装请求，应用重试策略
export function fetchWithRetry() {
  return retryWithBackoff(
    () => mockUnstableApi(),
    {
      maxRetries: 3,
      baseDelay: 500,
    }
  );
}