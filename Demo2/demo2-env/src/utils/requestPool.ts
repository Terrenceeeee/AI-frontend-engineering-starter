// src/utils/requestPool.ts

/**
 * 请求池：控制并发请求数量，防止浏览器因并发过多崩溃
 * 浏览器对同一域名的并发连接数有限制（HTTP/1.1 约 6 个）
 */
export class RequestPool {
  // 最大允许并发请求数量
  private limit: number;
  // 当前正在执行中的请求数量
  private running: number;
  // 请求等待队列：存放等待被唤醒的resolve函数
  private queue: Array<() => void>;

  /**
   * 构造函数，初始化请求池
   * @param limit 最大并发上限，默认6，匹配浏览器HTTP1.1域名并发限制
   */
  constructor(limit = 6) {
    this.limit = limit; // 最大并发数
    this.running = 0; // 当前正在运行的请求数，初始0
    this.queue = []; // 等待队列，存放等待执行的任务放行函数
  }

  /**
   * 执行请求
   * @param fn 返回 Promise 的请求函数（如 () => axios.get('/api')）
   * @returns 请求结果
   */
  async request<T>(fn: () => Promise<T>): Promise<T> {
    // 1. 判断：当前运行请求 ≥ 最大并发上限，需要排队
    if (this.running >= this.limit) {
      // 创建Promise，把resolve函数存入队列，暂停当前请求，等待唤醒
      await new Promise<void>((resolve) => {
        this.queue.push(resolve);
      });
      // 代码阻塞在这里，直到队列前面某个任务执行完成调用resolve()
    }

    // 2. 获取到并发名额，运行计数+1
    this.running++;
    console.log(`[请求池] 当前并发数: ${this.running}/${this.limit}`);

    try {
      // 3. 真正发起网络请求，等待接口返回
      const result = await fn();
      return result;
    } finally {
      // 4. 无论请求成功、报错，都会进入finally，释放并发名额
      this.running--;
      console.log(`[请求池] 释放并发，剩余: ${this.running}/${this.limit}`);

      // 5. 如果队列还有排队任务，取出队首任务，唤醒它执行
      if (this.queue.length > 0) {
        // 取出队列第一个等待的resolve
        const next = this.queue.shift();
        if (next) {
          next(); // 调用resolve，上面await的Promise完成，继续执行下一个请求
        }
      }
    }
  }
}

// 导出全局单例：整个项目共用同一个请求池，统一管控全局接口并发
export const requestPool = new RequestPool(6);

// AI Review 测试：这个改动会被 AI 审查
