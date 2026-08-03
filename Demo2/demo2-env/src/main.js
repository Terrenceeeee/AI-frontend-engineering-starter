import { createApp } from 'vue';
import App from './App.vue';
import router from '../router';
// import {createPinia} from 'pinia';
import { reportWebVitals } from './utils/performanceReporter';

const app = createApp(App);
app.use(router);
app.mount('#app');

// ✅ 只在生产环境启用性能监控（减少开发环境的噪音）
if (import.meta.env.PROD) {
  reportWebVitals();
}