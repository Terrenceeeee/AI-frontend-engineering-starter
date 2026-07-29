<template>
  <div style="padding: 40px;">
    <h1>👤 用户中心</h1>
    <p>这是用户页，体积 ~2KB</p>
    <router-link to="/">去首页</router-link>
    <router-link to="admin">去管理页</router-link>
  </div>
</template>

<script setup lang="ts">
// 这里写逻辑
console.log('用户页加载了');
</script>

<style scoped></style>