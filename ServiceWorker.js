const cacheName = "DefaultCompany-HyperRacing-1.0";
const contentToCache = [
    "Build/Build.loader.js",
    "Build/Build.framework.js.unityweb",
    "Build/Build.data.unityweb",
    "Build/Build.wasm.unityweb",
    "TemplateData/style.css"

];

self.addEventListener('install', function (e) {
    console.log('[Service Worker] Install');
    
    e.waitUntil((async function () {
      const cache = await caches.open(cacheName);
      console.log('[Service Worker] Caching all: app shell and content');
      await cache.addAll(contentToCache);
    })());
});

// Unity WebGL 기본 캐싱 Service Worker - GET 요청만 캐시
self.addEventListener('fetch', (event) => {
  // ❗️오류 방지: POST, PATCH 등은 캐시하지 않고 무시
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.open('unity-cache').then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        // 캐시된 응답이 있으면 반환
        if (cachedResponse) return cachedResponse;

        // 없다면 네트워크 요청 → 응답 캐시하고 반환
        return fetch(event.request).then((networkResponse) => {
          cache.put(event.request, networkResponse.clone()); // ✅ GET만 처리
          return networkResponse;
        }).catch((error) => {
          // 오프라인 또는 네트워크 실패 시 fallback 처리 가능
          console.error('[ServiceWorker] Fetch failed:', error);
          throw error;
        });
      });
    })
  );
});
