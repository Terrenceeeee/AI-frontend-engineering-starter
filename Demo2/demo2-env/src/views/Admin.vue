<template>
  <div style="padding: 40px;">
    <h1>🔐 管理后台</h1>
    <p>这是管理页，体积 ~2KB</p>
    <router-link to="/">去首页</router-link>
    <router-link to="/user">去用户页</router-link>
  </div>
</template>

<script setup lang="ts">
// 这里写逻辑
console.log('管理页加载了');
</script>

<style scoped></style>