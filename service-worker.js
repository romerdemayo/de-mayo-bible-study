const CACHE='de-mayo-bible-v16';
const ASSETS=["./", "./index.html", "./styles.css", "./app.js", "./bible-data.js", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./data/devotionals.js", "./data/exhortations.js", "./data/bible-studies.js", "./data/kids-lessons.js", "./data/prayers.js", "./images/abraham.svg", "./images/baby-moses.svg", "./images/creation.svg", "./images/daniel.svg", "./images/david.svg", "./images/elijah-widow.svg", "./images/esther.svg", "./images/five-thousand.svg", "./images/helping.svg", "./images/jericho.svg", "./images/jonah.svg", "./images/joseph.svg", "./images/noah.svg", "./images/pentecost.svg", "./images/red-sea.svg", "./images/ruth.svg", "./images/samaritan.svg", "./images/samuel.svg", "./images/sheep.svg", "./images/storm.svg"];
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
