<template>
  <div style="padding: 40px;">
    <h1>🏠首页</h1>
    <p>这是首页 体积2kb</p>
    <router-link to="/user">去用户页面</router-link>
    <router-link to="/admin">去管理员页面</router-link>
    <router-link to="/product">去产品页</router-link>
  </div>

</template>

<script setup lang="ts">
// 这里写逻辑
console.log('首页加载了');
</script>

<style scoped></style>