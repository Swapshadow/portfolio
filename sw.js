const CACHE_NAME = 'cyber-watch-v1';
const BASE = '/portfolio';
const ASSETS = [
  `${BASE}/`, `${BASE}/index.html`, `${BASE}/veille.html`, `${BASE}/hackzone.html`,
  `${BASE}/style.css`, `${BASE}/script.js`, `${BASE}/assets/favicon.png`,
  `${BASE}/assets/favicon.png`
];
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => Promise.allSettled(ASSETS.map((u) => cache.add(u)))));
  self.skipWaiting();
});
self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (url.origin !== location.origin) return;
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => caches.match(request).then((r) => r || caches.match(`${BASE}/veille.html`))));
    return;
  }
  event.respondWith(caches.match(request).then((cached) => cached || fetch(request).then((res) => { const clone = res.clone(); caches.open(CACHE_NAME).then((c) => c.put(request, clone)); return res; })));
});
