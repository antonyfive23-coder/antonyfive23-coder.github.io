// AquaControl Pro — Service Worker v3
const CACHE = 'aquapro-v3';

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c =>
      c.addAll(['./','./index.html','./manifest.json']).catch(()=>{})
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // No interceptar Firebase
  if(e.request.url.includes('firebase') ||
     e.request.url.includes('googleapis') ||
     e.request.url.includes('gstatic')) return;
  e.respondWith(
    fetch(e.request).then(res => {
      if(res && res.status === 200 && res.type !== 'opaque'){
        caches.open(CACHE).then(c => c.put(e.request, res.clone()));
      }
      return res;
    }).catch(() =>
      caches.match(e.request).then(cached =>
        cached || (e.request.mode === 'navigate' ? caches.match('./index.html') : new Response('Sin conexión',{status:503}))
      )
    )
  );
});

