const CACHE = 'de-mayo-bible-v13-repaired';
const CORE = [
  './', './index.html', './styles.css?v=13', './app.js?v=13',
  './bible-data.js?v=13', './manifest.webmanifest?v=13',
  './icon-192.png?v=13', './icon-512.png',
  './data/devotionals.js?v=13', './data/exhortations.js?v=13',
  './data/bible-studies.js?v=13', './data/kids-lessons.js?v=13',
  './data/prayers.js?v=13'
];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const request = event.request;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith(
    fetch(request).then(response => {
      if (response && response.ok) {
        const copy = response.clone();
        caches.open(CACHE).then(cache => cache.put(request, copy));
      }
      return response;
    }).catch(async () => {
      const cached = await caches.match(request, { ignoreSearch: true });
      if (cached) return cached;
      if (request.mode === 'navigate') return caches.match('./index.html');
      return Response.error();
    })
  );
});
