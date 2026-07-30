<template>
  <div style="padding: 20px; font-family: 'Courier New', monospace;">
    <h1 style="color: #42b883;">🌍 Vite 分包验证 Demo</h1>
    <p>当前环境：<strong>{{ mode }}</strong></p>

    <nav style="margin: 20px 0; padding: 12px; background: #f5f5f5; border-radius: 6px;">
      <router-link to="/" style="margin-right: 20px;">🏠 首页</router-link>
      <router-link to="/user" style="margin-right: 20px;">👤 用户中心</router-link>
      <router-link to="/admin">🔐 管理后台</router-link>
    </nav>

    <hr />

    <!-- 路由出口：当前页面的内容会渲染在这里 -->
    <router-view />
  </div>
</template>

<script setup>
console.log('App.vue 加载了（主入口）');
const mode = import.meta.env.MODE
</script>