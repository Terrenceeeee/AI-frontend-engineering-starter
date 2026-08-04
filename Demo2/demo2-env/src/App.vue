<template>
  <div style="padding: 40px; font-family: 'Courier New', monospace;">
    <h1 style="color: #42b883;">🌍 请求池并发控制 Demo</h1>

    <button @click="sendRequests" style="padding: 12px 24px; font-size: 16px; cursor: pointer;">
      🚀 发送 20 个并发请求
    </button>
    <button @click="clearLogs" style="padding: 12px 24px; font-size: 16px; cursor: pointer; margin-left: 12px;">
      🗑️ 清空日志
    </button>

    <div
      style="margin-top: 20px; padding: 16px; background: #1e1e1e; color: #d4d4d4; border-radius: 8px; max-height: 400px; overflow-y: auto; font-size: 13px;">
      <div v-for="(log, index) in logs" :key="index" style="padding: 2px 0; border-bottom: 1px solid #333;">
        {{ log }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { requestPool } from '@/utils/requestPool';

const logs = ref < string[] > ([]);

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
      // 模拟一个耗时 1-3 秒的请求
      const delay = 1000 + Math.random() * 2000;
      return new Promise < { id: number; delay: number } > ((resolve) => {
        setTimeout(() => {
          resolve({ id: i, delay });
        }, delay);
      }).then((result) => {
        addLog(`✅ 请求 #${result.id} 完成 (耗时 ${result.delay.toFixed(0)}ms)`);
      });
    };

    // 通过请求池执行
    const promise = requestPool.request(requestFn);
    promises.push(promise);
  }

  Promise.all(promises).then(() => {
    addLog('🎉 所有请求已完成！');
  });
};

const clearLogs = () => {
  logs.value = [];
};
</script>