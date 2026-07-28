<template>
  <div style="padding: 40px; font-family: 'Courier New', monospace; max-width: 900px; margin: 0 auto">
    <h1 style="color: #42b883">🌍 Vite 环境变量验证</h1>

    <hr style="margin: 24px 0" />

    <h2>📋 环境变量列表</h2>
    <table border="1" cellpadding="12" style="border-collapse: collapse; width: 100%; font-size: 14px">
      <thead style="background: #f5f5f5">
        <tr>
          <th style="text-align: left">变量名</th>
          <th style="text-align: left">当前值</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><code>import.meta.env.MODE</code></td>
          <td>
            <strong style="color: #42b883">{{ env.MODE }}</strong>
          </td>
        </tr>
        <tr>
          <td><code>import.meta.env.COMMAND</code></td>
          <td>
            <strong style="color: #42b883">{{ env.COMMAND }}</strong>
          </td>
        </tr>
        <tr>
          <td><code>import.meta.env.DEV</code></td>
          <td>
            <strong style="color: #42b883">{{ String(env.DEV) }}</strong>
          </td>
        </tr>
        <tr>
          <td><code>import.meta.env.PROD</code></td>
          <td>
            <strong style="color: #42b883">{{ String(env.PROD) }}</strong>
          </td>
        </tr>
        <tr>
          <td><code>import.meta.env.VITE_API_BASE_URL</code></td>
          <td>
            <strong style="color: #42b883">{{ env.VITE_API_BASE_URL }}</strong>
          </td>
        </tr>
        <tr>
          <td><code>import.meta.env.VITE_ENABLE_DEBUG</code></td>
          <td>
            <strong style="color: #42b883">{{ String(env.VITE_ENABLE_DEBUG) }}</strong>
          </td>
        </tr>
        <tr>
          <td><code>import.meta.env.VITE_APP_TITLE</code></td>
          <td>
            <strong style="color: #42b883">{{ env.VITE_APP_TITLE }}</strong>
          </td>
        </tr>
        <tr style="background: #fff3cd">
          <td><code style="background: #fff3cd">import.meta.env.DATABASE_PASSWORD</code></td>
          <td>
            <strong style="color: red">{{ String(env.DATABASE_PASSWORD) }}</strong>
          </td>
        </tr>
      </tbody>
    </table>

    <div style="
        margin-top: 24px;
        padding: 16px 20px;
        background: #f0f9ff;
        border-left: 4px solid #42b883;
        border-radius: 4px;
      ">
      <p style="margin: 0; font-weight: bold">📌 验证要点：</p>
      <ul style="margin-top: 8px">
        <li>只有 <code>VITE_</code> 开头的变量会暴露给前端（安全隔离）</li>
        <li>
          <code>DATABASE_PASSWORD</code> 应为
          <span style="color: red; font-weight: bold">undefined</span>（红色显示）
        </li>
        <li><code>MODE</code> 会随启动命令变化</li>
        <li>
          <code>COMMAND</code> 表示当前执行的是 <code>serve</code>（开发）还是
          <code>build</code>（构建）
        </li>
      </ul>
    </div>

    <div style="margin-top: 16px; padding: 16px 20px; background: #f5f5f5; border-radius: 4px">
      <p style="margin: 0; font-size: 13px; color: #666">
        ⚡ 当前运行在：<strong>{{ env.MODE }}</strong> 模式 （<code>pnpm {{ env.COMMAND === 'serve' ? 'dev' : 'build' }}</code>）
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

// // ❌ 故意用双引号（违反 singleQuote 规则）
// const message = "Hello World";

// // ❌ 故意不加分号（违反 semi 规则）
// const foo = 'bar'

// // ❌ 故意用 4 空格缩进（违反 indent 规则）
// const baz = "qux"

// // ❌ 故意用 console.log（触发 no-console 警告）
// console.log('这段代码会被拦截');

const env = computed(() => ({
  MODE: import.meta.env.MODE,
  COMMAND: import.meta.env.COMMAND,
  DEV: import.meta.env.DEV,
  PROD: import.meta.env.PROD,
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  VITE_ENABLE_DEBUG: import.meta.env.VITE_ENABLE_DEBUG,
  VITE_APP_TITLE: import.meta.env.VITE_APP_TITLE,
  VITE_DATABASE_PASSWORD: import.meta.env.DATABASE_PASSWORD,
}));
</script>
