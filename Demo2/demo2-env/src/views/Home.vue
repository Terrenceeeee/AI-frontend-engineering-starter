<template>
  <div style="padding: 40px; font-family: 'Courier New', monospace;">
    <h1 style="color: #42b883;">🌍 Vite 分包验证 Demo</h1>
    <p>当前环境：<strong>{{ mode }}</strong></p>

    <nav
      style="margin: 20px 0; padding: 12px; background: #f5f5f5; border-radius: 6px; display: flex; gap: 20px; align-items: center; flex-wrap: wrap;">
      <router-link to="/">🏠 首页</router-link>
      <router-link to="/user">👤 用户中心</router-link>
      <router-link to="/admin">🔐 管理后台</router-link>
      <router-link to="/product">🛍️ 产品页</router-link>
    </nav>

    <hr />

    <section
      style="margin-top: 20px; padding: 16px; background: #1e1e1e; color: #d4d4d4; border-radius: 8px; max-height: 400px; overflow-y: auto; font-size: 13px;">
      <h1 style="margin-top: 0; color: #42b883;">🌍 请求池并发控制 Demo</h1>
      <button style="padding: 12px 24px; font-size: 16px; cursor: pointer;" @click="sendRequests">
        🚀 发送 20 个并发请求
      </button>
      <button style="padding: 12px 24px; font-size: 16px; cursor: pointer; margin-left: 12px;" @click="clearLogs">
        🗑️ 清空日志
      </button>
      <div v-for="(log, index) in logs" :key="index"
        style="padding: 2px 0; border-bottom: 1px solid #333; margin-top: 12px;">
        {{ log }}
      </div>
    </section>

    <div style="margin-top: 20px; display: flex; gap: 12px; flex-wrap: wrap;">
      <button
        style="padding: 12px 24px; font-size: 16px; cursor: pointer; background: #f0ad4e; border: none; border-radius: 4px; color: white;"
        @click="testRetry">
        🔄 测试重试 (前2次失败，第3次成功)
      </button>
      <button style="padding: 12px 24px; font-size: 16px; cursor: pointer;" @click="resetTest">
        🔄 重置状态
      </button>
    </div>

    <section style="margin-top: 30px; padding: 24px; background: #f5f5f5; border-radius: 8px;">
      <h1 style="margin-top: 0; color: #42b883;">🌍 Whistle Mock 测试 Demo</h1>
      <button
        style="padding: 12px 24px; font-size: 16px; cursor: pointer; background: #42b883; border: none; border-radius: 4px; color: white;"
        @click="fetchUserInfo">
        📡 请求用户信息
      </button>
      <div style="margin-top: 20px; padding: 16px; background: #1e1e1e; border-radius: 8px;">
        <h4>返回结果：</h4>
        <pre
          style="color: #d4d4d4; padding: 12px; border-radius: 4px; overflow-x: auto; margin: 0;">{{ responseData }}</pre>
      </div>
    </section>

    <section style="margin-top: 30px; padding: 24px; background: #fff; border-radius: 8px; border: 1px solid #e5e7eb;">
      <h1 style="margin-top: 0; color: #42b883;">🌍 WebSocket 双向通信 Demo</h1>
      <WebSocketDemo />
    </section>

    <section style="margin-top: 30px; padding: 24px; background: #fff; border-radius: 8px; border: 1px solid #e5e7eb;">
      <h1 style="margin-top: 0; color: #42b883;">📋 Demo 18：远程日志回捞系统</h1>
      <div style="margin: 20px 0; display: flex; gap: 12px; flex-wrap: wrap;">
        <button @click="handleSimulatePayment"
          style="padding: 12px 24px; background: #42b883; color: white; border: none; border-radius: 4px; cursor: pointer;">
          💳 模拟支付（会随机失败）
        </button>
        <button @click="handleExportLogs"
          style="padding: 12px 24px; background: #f0ad4e; color: white; border: none; border-radius: 4px; cursor: pointer;">
          📤 导出日志
        </button>
        <button @click="handleClearLogs"
          style="padding: 12px 24px; background: #d9534f; color: white; border: none; border-radius: 4px; cursor: pointer;">
          🗑️ 清除日志
        </button>
      </div>

      <div style="font-size: 14px; color: #666; margin-bottom: 12px;">
        📌 当前日志条数：<strong>{{ logCount }}</strong>
      </div>

      <div
        style="padding: 16px; background: #1e1e1e; color: #d4d4d4; border-radius: 6px; font-size: 13px; max-height: 400px; overflow-y: auto;">
        <pre style="margin: 0; white-space: pre-wrap; word-break: break-all;">{{ displayContent }}</pre>
      </div>
    </section>

    <section style="margin-top: 30px; padding: 24px; background: #fff; border-radius: 8px; border: 1px solid #e5e7eb;">
      <h1 style="margin-top: 0; color: #42b883;">🌍 Demo 19：线上隐藏调试入口</h1>
      <LogoDebugTrigger :click-count="5" :timeout="2000" @trigger="onDebugTrigger" @load-success="onDebugLoadSuccess"
        @load-error="onDebugLoadError" />
      <p style="color: #888; font-size: 14px; margin-top: 8px;">
        提示：连续点击上方 Logo 5 次，会加载 vConsole 调试面板
      </p>
      <div
        style="padding: 16px; background: #1e1e1e; color: #d4d4d4; border-radius: 6px; font-size: 13px; min-height: 100px; margin-top: 16px;">
        <pre style="margin: 0; white-space: pre-wrap; word-break: break-all;">{{ displayContent }}</pre>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { requestPool } from '@/utils/requestPool';
import { fetchWithRetry, resetAttemptCount } from '@/api/testApi';
import WebSocketDemo from '@/components/WebSocketDemo.vue';
import LogoDebugTrigger from '@/components/LogoDebugTrigger.vue';
import { logError, exportLogs, getLogCount, clearLogs, isPaymentError } from '@/utils/logger';
import type { PaymentError } from '@/types/logger.d';

const mode = import.meta.env.MODE;
const logs = ref<string[]>([]);
const responseData = ref('等待请求...');
const displayContent = ref<string>('等待操作...');
const logCount = ref<number>(0);

const addLog = (msg: string) => {
  logs.value.push(`[${new Date().toLocaleTimeString()}] ${msg}`);
};

const sendRequests = () => {
  logs.value = [];
  addLog('🚀 开始发送 20 个并发请求...');
  addLog('📌 最大并发数: 6，超出部分将排队等待');

  const promises: Promise<void>[] = [];
  for (let i = 1; i <= 20; i++) {
    const requestFn = () => {
      const delay = 1000 + Math.random() * 2000;
      return new Promise<{ id: number; delay: number }>((resolve) => {
        setTimeout(() => {
          resolve({ id: i, delay });
        }, delay);
      }).then((result) => {
        addLog(`✅ 请求 #${result.id} 完成 (耗时 ${result.delay.toFixed(0)}ms)`);
      });
    };

    promises.push(requestPool.request(requestFn));
  }

  Promise.all(promises).then(() => {
    addLog('🎉 所有请求已完成！');
  });
};

const testRetry = async () => {
  addLog('🔁 开始测试重试...');
  try {
    const result = await fetchWithRetry();
    addLog(`✅ 请求成功: ${result.data}`);
  } catch (error) {
    addLog(`❌ 请求失败: ${(error as Error).message}`);
  }
};

const resetTest = () => {
  resetAttemptCount();
  addLog('🔄 已重置计数器');
};

const clearLogs = () => {
  logs.value = [];
};

const fetchUserInfo = async () => {
  responseData.value = '⏳ 加载中...';
  try {
    const res = await fetch('https://api.example.com/user/info');
    const data = await res.json();
    responseData.value = JSON.stringify(data, null, 2);
  } catch (error) {
    responseData.value = `❌ 请求失败：${error}`;
  }
};

function updateLogCount(): void {
  logCount.value = getLogCount();
}

function generateOrderId(): string {
  return 'ORD-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
}

function randomDelay(min: number, max: number): Promise<void> {
  const delay = Math.random() * (max - min) + min;
  return new Promise((resolve) => setTimeout(resolve, delay));
}

async function handleSimulatePayment(): Promise<void> {
  displayContent.value = '⏳ 支付处理中...';

  try {
    await randomDelay(500, 1200);
    const isSuccess = Math.random() > 0.7;

    if (!isSuccess) {
      const errorTypes: PaymentError[] = [
        { code: 'INSUFFICIENT_BALANCE', message: '余额不足，请充值后再试' },
        { code: 'TIMEOUT', message: '支付超时，请稍后重试' },
        { code: 'NETWORK_ERROR', message: '网络异常，请检查网络连接' },
        { code: 'RISK_CONTROL', message: '交易被风控拦截，请联系客服' },
      ];

      const randomError = errorTypes[Math.floor(Math.random() * errorTypes.length)];
      const orderId = generateOrderId();
      const error = new Error(randomError.message);
      Object.assign(error, {
        code: randomError.code,
        orderId,
        userId: 'USER-1001',
        timestamp: new Date().toISOString(),
      });

      throw error;
    }

    displayContent.value = '✅ 支付成功！订单号：' + generateOrderId();
  } catch (error) {
    const errorData: Record<string, unknown> = {
      orderId: 'ORD-UNKNOWN',
      userId: 'USER-1001',
      timestamp: new Date().toISOString(),
    };

    if (isPaymentError(error)) {
      errorData.code = error.code;
      errorData.message = error.message;
      errorData.orderId = error.orderId || 'ORD-UNKNOWN';
    } else if (error instanceof Error) {
      errorData.message = error.message;
      errorData.stack = error.stack;
    } else {
      errorData.raw = String(error);
    }

    logError('支付失败', errorData);
    const errorMsg = error instanceof Error ? error.message : String(error);
    displayContent.value = `❌ 支付失败：${errorMsg}\n\n📋 日志已记录到 localStorage，点击"导出日志"查看详情`;
  } finally {
    updateLogCount();
  }
}

function handleExportLogs(): void {
  const logsText = exportLogs();
  displayContent.value = `📤 导出的日志：\n\n${logsText}`;
}

function handleClearLogs(): void {
  clearLogs();
  displayContent.value = '✅ 日志已清除';
  updateLogCount();
}

function onDebugTrigger(): void {
  displayContent.value = '🔧 正在加载 vConsole...';
}

function onDebugLoadSuccess(): void {
  displayContent.value = '✅ vConsole 调试面板已开启！\n\n点击页面右下角的绿色按钮，查看控制台、网络请求、DOM 结构等调试信息。';
}

function onDebugLoadError(error: string): void {
  displayContent.value = `❌ vConsole 加载失败：${error}\n\n请检查网络连接后重试。`;
}

onMounted(() => {
  updateLogCount();
});
</script>

<style scoped>
button {
  font-family: 'Courier New', monospace;
}
</style>