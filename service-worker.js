/* De Mayo Bible Ministry | Version 51 PWA */
const CACHE = 'de-mayo-bible-v56-stability-fix';
const OFFLINE_URL = './index.html';
const ASSETS = [
  './','./index.html','./styles.css','./app.js','./bible-data.js',
  './manifest.webmanifest','./icon-192.png','./icon-512.png',
  './icon-maskable-192.png','./icon-maskable-512.png','./apple-touch-icon.png','./social-preview.png',
  './data/tagalog-bible-loader.js','./data/devotionals.js','./data/exhortations.js','./data/bible-studies.js',
  './data/kids-lessons.js','./data/prayers.js','./data/v20-tools.js'
];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).then(response => {
      const copy=response.clone(); caches.open(CACHE).then(c=>c.put(event.request,copy)); return response;
    }).catch(() => caches.match(event.request).then(r => r || caches.match(OFFLINE_URL))));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    if (response && response.status === 200 && response.type !== 'opaque') {
      const copy=response.clone(); caches.open(CACHE).then(c=>c.put(event.request,copy));
    }
    return response;
  })));
});
