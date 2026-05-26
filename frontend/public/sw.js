const CACHE_NAME = 'dodos-electro-store-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/dodos-logo.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
    return;
  }

  if (url.pathname.startsWith('/src/')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
      .catch(() => fetch(event.request))
  );
});