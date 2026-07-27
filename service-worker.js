const CACHE='de-mayo-bible-v15-web';
const ASSETS=['./','./index.html','./styles.css','./app.js','./bible-data.js','./manifest.webmanifest','./icon-192.png','./icon-512.png','./data/devotionals.js','./data/exhortations.js','./data/bible-studies.js','./data/kids-lessons.js','./data/prayers.js','./images/david.svg','./images/helping.svg','./images/storm.svg','./images/sheep.svg','./images/daniel.svg','./images/samaritan.svg'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  event.respondWith(
    fetch(event.request).then(response=>{
      const copy=response.clone();
      caches.open(CACHE).then(cache=>cache.put(event.request,copy));
      return response;
    }).catch(()=>caches.match(event.request).then(cached=>cached||caches.match('./index.html')))
  );
});
