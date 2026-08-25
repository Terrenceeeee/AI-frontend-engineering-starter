// sw.js
// 注意：这个文件在项目根目录，构建时会被复制到 dist/ 目录

const CACHE_NAME = 'demo-cache-v1';

// 需要缓存的资源列表
const urlsToCache = [
  '/',
  '/index.html',
  // Vite 构建后的具体 JS/CSS 文件名是动态的（带 hash），
  // 在实际项目中可以通过构建工具（如 Workbox）自动注入。
  // 这里为了演示简单，我们在 install 事件中动态缓存所有资源。
];

// 1. 安装 Service Worker
// sw脚本首次被浏览器下载解析完成后，浏览器自动触发 install 生命周期
self.addEventListener('install', (event) => {
  console.log('[Service Worker] 安装中...');
  // event.waitUntil()：告诉浏览器【等待内部异步操作全部完成】，再结束install阶段
  // 如果不包裹，浏览器可能提前终止sw，缓存操作中途失败
  event.waitUntil(
    // 打开指定名称的缓存存储空间，不存在则自动创建
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] 缓存资源...');
        // 批量请求清单内所有资源，并存入缓存；任意一个资源加载失败，整体失败
        // 添加 / 和 /index.html
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('[Service Worker] 安装完成');
        // 强制新 Service Worker 立即激活
        // self.skipWaiting()：强制跳过等待阶段，新sw立即进入activate激活状态
        // 不调用的话：新sw会处于waiting，等待所有旧页面关闭后才激活
        return self.skipWaiting();
      })
  );
});

// ===================== 2. Service Worker 激活事件 =====================
// install成功、执行完skipWaiting后，浏览器触发 activate
// 作用：清理过期缓存、接管页面
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] 激活中...');

  event.waitUntil(
    // 获取当前浏览器存在的所有缓存名称列表
    caches
      .keys()
      .then((cacheNames) => {
        // 删除旧的缓存（如果有多个版本）
        // Promise.all 并行执行所有删除操作
        return Promise.all(
          cacheNames.map((cacheName) => {
            // 和当前缓存版本对比，删除所有旧版本缓存
            if (cacheName !== CACHE_NAME) {
              console.log(`[Service Worker] 删除旧缓存: ${cacheName}`);
              // self.clients.claim()：让当前激活的sw，立刻接管所有已打开的页面

              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[Service Worker] 激活完成');
        // 控制所有客户端（页面）
        return self.clients.claim();
      })
  );
});

// ===================== 3. 全局请求拦截 fetch 事件 =====================
// 页面发起任意网络请求（img/fetch/axios/css/js）时，浏览器触发fetch事件
self.addEventListener('fetch', (event) => {
  //fetch () = 去网上拿东西  fetch 事件 = 有人要去网上拿东西，被 service worker 拦住，可以插手处理
  // 解析请求完整URL，方便判断域名、路径
  const requestUrl = new URL(event.request.url);
  // 规则1：非同源请求（CDN、第三方接口），不经过缓存逻辑，直接放行走网络
  // 只处理同源的 GET 请求
  if (requestUrl.origin !== self.location.origin) {
    // 非同源请求（如 CDN）不做缓存，直接走网络
    event.respondWith(fetch(event.request));
    return;
  }
  // 规则2：只缓存GET请求，POST/PUT/DELETE等写操作不缓存
  if (event.request.method !== 'GET') {
    event.respondWith(fetch(event.request));
    return;
  }

  console.log(`[Service Worker] 拦截请求: ${event.request.url}`);
  // 自定义本次请求的响应逻辑：缓存优先策略（Cache-First）
  event.respondWith(
    // 在缓存中查找匹配当前请求的资源
    caches.match(event.request).then((cachedResponse) => {
      // 如果缓存命中，直接返回缓存
      if (cachedResponse) {
        console.log(`[Service Worker] ✅ 命中缓存: ${event.request.url}`);
        return cachedResponse;
      }

      // ❌ 缓存未命中：发起真实网络请求
      console.log(`[Service Worker] 缓存未命中，请求网络: ${event.request.url}`);
      return fetch(event.request)
        .then((response) => {
          // 仅缓存HTTP状态200的成功响应，404/500等错误不存入缓存
          if (response.status === 200) {
            // ⚠️ Response对象是流，只能读取一次！必须clone一份副本存入缓存
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              // 将 请求-响应 键值对存入缓存
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          // 网络请求失败，返回一个备用页面（可选）
          console.error(`[Service Worker] ❌ 网络请求失败: ${event.request.url}`);
          // 如果是 HTML 请求，返回 index.html
          if (event.request.headers.get('accept')?.includes('text/html')) {
            return caches.match('/');
          }
          // 其他请求返回 404
          return new Response('Not Found', { status: 404 });
        });
    })
  );
});
