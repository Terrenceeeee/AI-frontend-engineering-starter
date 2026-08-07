import { createApp } from 'vue';
import App from './App.vue';
import router from '../router/index.ts';
// import {createPinia} from 'pinia';
import { reportWebVitals } from './utils/performanceReporter.ts';

const app = createApp(App);
app.use(router);
app.mount('#app');

// ========== vConsole 调试钩子 ==========
// 条件：开发模式 或 URL 中有 ?debug=1
const isDev = import.meta.env.MODE === 'development';
const hasDebugParam = window.location.search.includes('debug=1');

if (isDev || hasDebugParam) {
  // 动态导入 vConsole（仅在需要时加载，减少首屏体积）
  import('vconsole').then(({ default: VConsole }) => {
    // 如果已经有 vConsole 实例，不重复创建
    if (!window.vConsole) {
      window.vConsole = new VConsole();
      console.log('[vConsole] 调试面板已开启');
    }
  });
}

// ✅ 只在生产环境启用性能监控（减少开发环境的噪音） pnpm build pnpm preview才会显示
if (import.meta.env.PROD) {
  reportWebVitals();
}
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('[SW] 注册成功:', registration);
      })
      .catch((error) => {
        console.log('[SW] 注册失败:', error);
      });
  });
}

