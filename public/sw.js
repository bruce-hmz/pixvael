// Pixvael Service Worker
// 策略:页面 network-first(离线回退缓存),同源静态资源 cache-first + 后台更新。
// 不缓存跨域请求(GA 等)。开发环境不注册(见 ServiceWorkerRegistration)。
const CACHE = 'pixvael-v1';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    // 页面:优先网络(保证内容最新),失败时回退缓存(离线可用)
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() =>
          caches
            .match(request)
            .then((cached) => cached || caches.match('/')),
        ),
    );
    return;
  }

  // 静态资源(JS/CSS/图片/字体):cache-first,命中时后台刷新缓存
  event.respondWith(
    caches.match(request).then((cached) => {
      const refresh = fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);
      return cached || refresh;
    }),
  );
});
