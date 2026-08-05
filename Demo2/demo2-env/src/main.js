import { createApp } from 'vue';
import App from './App.vue';
import router from '../router/index.ts';
// import {createPinia} from 'pinia';
import { reportWebVitals } from './utils/performanceReporter.ts';

const app = createApp(App);
app.use(router);
app.mount('#app');

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