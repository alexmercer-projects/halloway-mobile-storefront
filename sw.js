// Service worker: keeps the whole shop available offline.
const VERSION = 'halloway-v1';
const PRECACHE = [
  './',
  'index.html',
  'manifest.webmanifest',
  'css/styles.css',
  'js/app.js',
  'js/art.js',
  'js/catalog.js',
  'js/pricing.js',
  'js/store.js',
  'data/products.js',
  'fonts/Gloock.woff2',
  'fonts/Hanken.woff2',
  'fonts/DMMono-400.woff2',
  'fonts/DMMono-500.woff2',
  'icons/icon.svg',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-maskable-512.png',
  'icons/apple-touch-icon.png',
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(VERSION).then(cache => cache.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(key => key.startsWith('halloway-') && key !== VERSION).map(key => caches.delete(key))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (request.mode === 'navigate') {
    // Network first for the page so updates show up, cached shell when offline.
    event.respondWith(fetch(request).then(response => {
      const copy = response.clone();
      caches.open(VERSION).then(cache => cache.put('index.html', copy));
      return response;
    }).catch(() => caches.match('index.html', { ignoreSearch: true })));
    return;
  }
  event.respondWith(caches.match(request, { ignoreSearch: true }).then(hit => hit || fetch(request).then(response => {
    if (response.ok && response.type === 'basic') {
      const copy = response.clone();
      caches.open(VERSION).then(cache => cache.put(request, copy));
    }
    return response;
  })));
});
