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
    console.log('[Service Worker] Caching static Unity files only');
    await cache.addAll(contentToCache);
  })());
});

const shouldBypassCache = (url, method) => {
  return (
    method !== 'GET' || // POST, PATCH 등은 무조건 제외
    url.includes("firestore.googleapis.com") ||
    url.includes("worldtimeapi.org") ||
    url.includes("/api/") || 
    url.endsWith(".html")
  );
};

self.addEventListener('fetch', (event) => {
  const url = event.request.url;
  const method = event.request.method;

  if (shouldBypassCache(url, method)) {
    return;
  }

  event.respondWith(
    caches.open(cacheName).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;

        return fetch(event.request).then((networkResponse) => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        }).catch((error) => {
          console.error('[ServiceWorker] Fetch failed:', error);
          throw error;
        });
      });
    })
  );
});
