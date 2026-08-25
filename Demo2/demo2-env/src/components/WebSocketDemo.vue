<template>
  <div style="padding: 20px; border: 1px solid #ddd; border-radius: 8px; margin: 20px 0">
    <h3>📡 WebSocket 实时推送 Demo</h3>

    <div style="margin: 12px 0">
      <button :disabled="connected" style="padding: 6px 16px; cursor: pointer" @click="connect">
        🔗 连接
      </button>
      <button
        :disabled="!connected"
        style="padding: 6px 16px; margin-left: 8px; cursor: pointer"
        @click="disconnect"
      >
        ❌ 断开
      </button>
      <button style="padding: 6px 16px; margin-left: 8px; cursor: pointer" @click="clearMessages">
        🗑️ 清空消息
      </button>
      <span style="margin-left: 16px; font-size: 14px">
        状态:
        <strong :style="{ color: connected ? '#42b883' : '#ff6b6b' }">
          {{ connected ? '✅ 已连接' : '❌ 未连接' }}
        </strong>
      </span>
      <span style="margin-left: 16px; font-size: 14px; color: #666">
        消息数: {{ messages.length }}
      </span>
    </div>

    <div
      style="
        max-height: 300px;
        overflow-y: auto;
        background: #1e1e1e;
        color: #d4d4d4;
        padding: 12px;
        border-radius: 6px;
        font-size: 13px;
        font-family: 'Courier New', monospace;
      "
    >
      <div
        v-for="(msg, idx) in messages"
        :key="idx"
        style="padding: 4px 0; border-bottom: 1px solid #333"
      >
        <span style="color: #888">[{{ msg.time }}]</span>
        <span :style="{ color: msg.type === 'recv' ? '#4ec9b0' : '#dcdcaa' }">
          {{ msg.type === 'recv' ? '⬅️ 收到' : '➡️ 发送' }}
        </span>
        {{ msg.content }}
      </div>
    </div>

    <div style="margin-top: 12px; display: flex; gap: 8px">
      <input
        v-model="inputMessage"
        placeholder="输入消息..."
        style="flex: 1; padding: 6px 12px; border: 1px solid #ddd; border-radius: 4px"
        @keyup.enter="sendMessage"
      />
      <button
        :disabled="!connected"
        style="padding: 6px 16px; cursor: pointer"
        @click="sendMessage"
      >
        📤 发送
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue';

const messages = ref<{ time: string; type: string; content: string }[]>([]);
const connected = ref(false);
const inputMessage = ref('');
let ws: WebSocket | null = null;

const addMessage = (type: string, content: string) => {
  const now = new Date();
  const time = now.toLocaleTimeString();
  messages.value.push({ time, type, content });
};

const connect = () => {
  if (ws && ws.readyState === WebSocket.OPEN) return;

  // 使用公共 WebSocket 测试服务（会回显你发的任何消息）
  ws = new WebSocket('wss://echo.websocket.org');

  ws.onopen = () => {
    connected.value = true;
    addMessage('sys', '🔗 连接已建立');
  };

  ws.onmessage = (event) => {
    addMessage('recv', event.data);
  };

  ws.onclose = () => {
    connected.value = false;
    addMessage('sys', '🔌 连接已断开');
    ws = null;
  };

  ws.onerror = () => {
    addMessage('sys', '❌ 连接出错，请检查网络');
  };
};

const disconnect = () => {
  if (ws) {
    ws.close();
    ws = null;
    connected.value = false;
  }
};

const sendMessage = () => {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    alert('请先连接 WebSocket');
    return;
  }
  const msg = inputMessage.value.trim();
  if (!msg) return;

  ws.send(msg);
  addMessage('send', msg);
  inputMessage.value = '';
};

const clearMessages = () => {
  messages.value = [];
};

// 组件销毁时自动断开 WebSocket 连接
onUnmounted(() => {
  disconnect();
});
</script>
