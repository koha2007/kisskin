const CACHE_NAME = 'kisskin-cache-v4';
const OFFLINE_URL = '/offline.html';

const PRECACHE_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // kisskin.pages.dev → kissinskin.net 리다이렉트 (서비스워커 레벨)
  const url = new URL(event.request.url);
  if (url.hostname === 'kisskin.pages.dev' && !url.pathname.startsWith('/api/')) {
    url.hostname = 'kissinskin.net';
    event.respondWith(Response.redirect(url.toString(), 301));
    return;
  }

  // API 요청은 서비스 워커가 개입하지 않음 — Cloudflare Pages Functions로 직접 전달
  if (event.request.url.includes('/api/')) {
    return;
  }

  // SPA 라우팅: navigate 요청은 index.html로 폴백
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(async () => {
          const cached = await caches.match('/');
          if (cached) return cached;
          return caches.match(OFFLINE_URL);
        })
    );
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(event.request);
        if (cached) return cached;
        return new Response('오프라인', { status: 503 });
      })
  );
});
